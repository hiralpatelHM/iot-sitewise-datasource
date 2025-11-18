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
	propertyNameMap := map[string]string{}
	var assetID string
	if len(query.AssetIds) > 0 {
		assetID = strings.TrimSpace(query.AssetIds[0])
	}
	if assetID != "" {

		// 1️⃣ Describe Asset (SDK v2)
		assetResp, err := sw.DescribeAsset(ctx, &iotsitewise.DescribeAssetInput{
			AssetId: aws.String(assetID),
		})
		if err != nil {
			backend.Logger.Warn("DescribeAsset failed", "err", err)
		} else {
			modelID := aws.StringValue(assetResp.AssetModelId)
			backend.Logger.Info("DescribeAsset → modelID", "modelID", modelID)

			// 2️⃣ Describe Asset Model
			if modelID != "" {
				modelResp, err := sw.DescribeAssetModel(ctx, &iotsitewise.DescribeAssetModelInput{
					AssetModelId: aws.String(modelID),
				})
				if err != nil {
					backend.Logger.Warn("DescribeAssetModel failed", "err", err)
				} else {
					// 3️⃣ Build propertyId → name map
					for _, prop := range modelResp.AssetModelProperties {
						if prop.Id != nil && prop.Name != nil {
							propertyNameMap[*prop.Id] = *prop.Name
						}
					}

					backend.Logger.Info("propertyNameMap built", "count", len(propertyNameMap))
				}
			}
		}
	}

	if len(propertyNameMap) == 0 {
		backend.Logger.Warn("frameResponse: propertyNameMap EMPTY (fallback to propertyId)")
	}
	parsedFrames := ParseJSONFields(frames, propertyNameMap)
	return parsedFrames, nil
}

// var propertyNameMap = map[string]string{
// 	"b86709fc-13ed-4e62-a5b9-6e4f4a750123": "power",
// 	"b558fa41-5b41-49b6-b87f-550646fdcef8": "torque",
// 	"5962c674-5bf7-4bcc-8c4c-fa3923366baa": "temperature",
// }

func FindFieldByName(fields []*data.Field, name string) *data.Field {
	for _, f := range fields {
		if f.Name == name {
			return f
		}
	}
	return nil
}

func ParseJSONFields(frames data.Frames, propertyNameMap map[string]string) data.Frames {
	newFrames := data.Frames{}
	for _, frame := range frames {
		newFields := []*data.Field{}
		jsonParsed := false

		for _, field := range frame.Fields {

			newFields = append(newFields, field)

			if field.Type() != data.FieldTypeString {
				continue
			}

			rowCount := field.Len()

			// -------------------------
			// STEP 1 → Detect JSON keys
			// -------------------------
			// We inspect the first valid row only.
			var detectedKeys map[string]interface{}

			for r := 0; r < rowCount; r++ {
				rawStr, _ := field.At(r).(string)
				if rawStr == "" {
					continue
				}

				var temp map[string]interface{}
				if json.Unmarshal([]byte(rawStr), &temp) == nil {
					detectedKeys = temp
					break
				}
			}

			if detectedKeys == nil {
				continue
			}

			jsonParsed = true

			// ---------------------------------
			// STEP 2 → Create fields dynamically
			// ---------------------------------
			jsonFields := map[string]*data.Field{}

			for key, val := range detectedKeys {

				// Skip diagnostics – handled later
				if key == "diagnostics" {
					continue
				}

				switch val.(type) {
				case float64:
					jsonFields[key] = data.NewField(key, nil, make([]float64, rowCount))
				case string:
					jsonFields[key] = data.NewField(key, nil, make([]string, rowCount))
				case bool:
					jsonFields[key] = data.NewField(key, nil, make([]bool, rowCount))
				}
			}

			// -------------------------
			// STEP 3 → Row-by-row parse
			// -------------------------
			for r := 0; r < rowCount; r++ {
				rawStr, _ := field.At(r).(string)
				if rawStr == "" {
					continue
				}

				var obj map[string]interface{}
				if json.Unmarshal([]byte(rawStr), &obj) != nil {
					continue
				}

				// ---- Fill simple fields ----
				for key, val := range obj {
					if f, exists := jsonFields[key]; exists {
						switch v := val.(type) {
						case float64:
							f.Set(r, v)
						case string:
							f.Set(r, v)
						case bool:
							f.Set(r, v)
						}
					}
				}

				// -----------------------------
				// STEP 4 → Diagnostics handling
				// -----------------------------
				diagVal, ok := obj["diagnostics"]
				if !ok {
					continue
				}

				diagArr, ok := diagVal.([]interface{})
				if !ok {
					continue
				}
				contribValues := map[string]float64{}

				for _, item := range diagArr {
					backend.Logger.Info("inside diagArr")
					diagObj, ok := item.(map[string]interface{})
					if !ok {
						continue
					}

					rawName, _ := diagObj["name"].(string)
					parts := strings.Split(rawName, "\\")
					if len(parts) < 2 {
						continue
					}

					propertyID := parts[1]

					lookupID := propertyID

					readable := propertyID
					if mapped, ok := propertyNameMap[lookupID]; ok {
						readable = mapped
					}
					fieldName := "contrib_" + readable

					// Create field if missing
					if _, exists := jsonFields[fieldName]; !exists {
						jsonFields[fieldName] = data.NewField(fieldName, nil, make([]float64, rowCount))
					}

					// Set value
					if v, ok := diagObj["value"].(float64); ok {
						contribValues[fieldName] = v
					}
				}
				total := 0.0
				for _, v := range contribValues {
					total += v
				}

				if total > 0 {
					for fieldName, rawValue := range contribValues {
						pct := (rawValue / total) * 100.0
						jsonFields[fieldName].Set(r, pct)
					}
				}
			}

			// -------------------------------------
			// STEP 5 → Append all parsed JSON fields
			// -------------------------------------
			for _, f := range jsonFields {
				newFields = append(newFields, f)
			}

			break // Only handle first string field
		}

		newFrame := data.NewFrame(frame.Name, newFields...)
		newFrame.Meta = frame.Meta
		newFrames = append(newFrames, newFrame)

		if jsonParsed {
			backend.Logger.Info("Parsed JSON in frame", "frame", frame.Name)
		}
	}

	return newFrames
}
