package sitewise

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/iotsitewise"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/iot-sitewise-datasource/pkg/models"
	"github.com/grafana/iot-sitewise-datasource/pkg/resource"
	"github.com/grafana/iot-sitewise-datasource/pkg/sitewise/client"
	"github.com/grafana/iot-sitewise-datasource/pkg/sitewise/framer"
	"github.com/patrickmn/go-cache"
)

// cacheDuration is a constant that defines how long to keep cached elements before they are refreshed
const cacheDuration = time.Minute * 5

// cacheCleanupInterval is the interval at which the internal cache is cleaned / garbage collected
const cacheCleanupInterval = time.Minute * 10

var GetCache = func() func() *cache.Cache {
	var gCache = cache.New(cacheDuration, cacheCleanupInterval) // max size not supported
	return func() *cache.Cache {
		return gCache
	}
}()

func frameResponse(ctx context.Context, query models.BaseQuery, data framer.Framer, sw client.SitewiseAPIClient) (data.Frames, error) {
	cp := resource.NewCachingResourceProvider(resource.NewSitewiseResources(sw), GetCache())
	rp := resource.NewQueryResourceProvider(cp, query)
	frames, err := data.Frames(ctx, rp)
	if err != nil {
		return nil, err
	}
	if requiresJSONParsing(query, frames) {
		return ParseJSONFields(ctx, query, sw, frames), nil
	}
	return frames, nil
}

func requiresJSONParsing(query models.BaseQuery, frames data.Frames) bool {

	switch query.QueryType {
	case models.QueryTypePropertyValueHistory,
		models.QueryTypePropertyAggregate,
		models.QueryTypePropertyValue:
	default:
		return false
	}

	if len(frames) == 0 {
		return false
	}

	first := frames[0]
	for _, field := range first.Fields {
		if field.Type() != data.FieldTypeString || field.Len() == 0 {
			continue
		}

		raw, ok := field.At(0).(string)
		if !ok || raw == "" {
			continue
		}

		if strings.HasPrefix(raw, "{") && strings.Contains(raw, "diagnostics") {
			return true
		}
	}

	return false
}

func ParseJSONFields(
	ctx context.Context,
	query models.BaseQuery,
	sw client.SitewiseAPIClient,
	frames data.Frames,
) data.Frames {

	// ------------------------------------------------------------
	// Load asset property names ONCE (not inside loops)
	// ------------------------------------------------------------
	propertyNameMap := map[string]string{}

	if len(query.AssetIds) > 0 {
		assetID := strings.TrimSpace(query.AssetIds[0])

		if assetID != "" {
			asset, err := sw.DescribeAsset(ctx, &iotsitewise.DescribeAssetInput{
				AssetId: aws.String(assetID),
			})
			if err == nil && asset.AssetModelId != nil {
				modelID := aws.StringValue(asset.AssetModelId)

				model, err := sw.DescribeAssetModel(ctx, &iotsitewise.DescribeAssetModelInput{
					AssetModelId: aws.String(modelID),
				})
				if err == nil {
					for _, p := range model.AssetModelProperties {
						if p.Id != nil && p.Name != nil {
							propertyNameMap[*p.Id] = *p.Name
						}
					}
				}
			}
		}
	}

	// ------------------------------------------------------------
	// Now parse frames (much cleaner)
	// ------------------------------------------------------------
	newFrames := data.Frames{}

	for _, frame := range frames {
		fields := append([]*data.Field{}, frame.Fields...)
		jsonParsed := false

		for _, f := range frame.Fields {

			rowCount := f.Len()

			// Use first row to find keys
			var firstObj map[string]interface{}
			raw0, _ := f.At(0).(string)
			_ = json.Unmarshal([]byte(raw0), &firstObj)

			jsonParsed = true

			jsonFields := map[string]*data.Field{}

			// Create fields based on first row
			for k, v := range firstObj {
				if k == "timestamp" || k == "diagnostics" {
					continue
				}

				switch v.(type) {
				case float64:
					jsonFields[k] = data.NewField(k, nil, make([]float64, rowCount))
				case string:
					jsonFields[k] = data.NewField(k, nil, make([]string, rowCount))
				case bool:
					jsonFields[k] = data.NewField(k, nil, make([]bool, rowCount))
				}
			}

			// Parse rows
			for i := 0; i < rowCount; i++ {
				rawStr, _ := f.At(i).(string)
				if rawStr == "" {
					continue
				}

				var obj map[string]interface{}
				if json.Unmarshal([]byte(rawStr), &obj) != nil {
					continue
				}

				// Simple fields
				for k, v := range obj {
					if fld, ok := jsonFields[k]; ok {
						fld.Set(i, v)
					}
				}

				// Diagnostics → contrib fields
				diagArr, ok := obj["diagnostics"].([]interface{})
				if !ok {
					continue
				}

				contrib := map[string]float64{}

				for _, item := range diagArr {
					diagObj, ok := item.(map[string]interface{})
					if !ok {
						continue
					}

					rawName, _ := diagObj["name"].(string)
					parts := strings.Split(rawName, "\\")
					if len(parts) < 2 {
						continue
					}

					propID := parts[len(parts)-1]
					propName := propertyNameMap[propID]
					if propName == "" {
						propName = propID
					}

					fieldName := "contrib_" + propName

					if _, exists := jsonFields[fieldName]; !exists {
						jsonFields[fieldName] = data.NewField(fieldName, nil, make([]float64, rowCount))
					}

					if v, ok := diagObj["value"].(float64); ok {
						contrib[fieldName] = v
					}
				}

				// Normalize %
				total := 0.0
				for _, v := range contrib {
					total += v
				}

				if total > 0 {
					for name, v := range contrib {
						jsonFields[name].Set(i, (v/total)*100.0)
					}
				}
			}

			// Add fields to frame
			for _, fld := range jsonFields {
				fields = append(fields, fld)
			}

			break // only one JSON field
		}

		outFrame := data.NewFrame(frame.Name, fields...)
		outFrame.Meta = frame.Meta

		newFrames = append(newFrames, outFrame)

		if jsonParsed {
			backend.Logger.Info("Parsed JSON in frame", "frame", frame.Name)
		}
	}

	return newFrames
}
