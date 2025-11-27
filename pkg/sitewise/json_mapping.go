package sitewise

import (
	"context"
	"encoding/json"
	"strings"

	"github.com/aws/aws-sdk-go-v2/service/iotsitewise"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/iot-sitewise-datasource/pkg/models"
	"github.com/grafana/iot-sitewise-datasource/pkg/sitewise/client"
)

func BuildPropertyNameMap(ctx context.Context, sw client.SitewiseAPIClient, assetID string) map[string]string {
	propertyNameMap := map[string]string{}
	if assetID != "" {

		assetResp, err := sw.DescribeAsset(ctx, &iotsitewise.DescribeAssetInput{
			AssetId: aws.String(assetID),
		})
		if err != nil {
			backend.Logger.Warn("DescribeAsset failed", "err", err)
		} else {
			modelID := aws.StringValue(assetResp.AssetModelId)
			backend.Logger.Info("DescribeAsset → modelID", "modelID", modelID)

			if modelID != "" {
				modelResp, err := sw.DescribeAssetModel(ctx, &iotsitewise.DescribeAssetModelInput{
					AssetModelId: aws.String(modelID),
				})
				if err != nil {
					backend.Logger.Warn("DescribeAssetModel failed", "err", err)
				} else {
					for _, prop := range modelResp.AssetModelProperties {
						if prop.Id != nil && prop.Name != nil {
							propertyNameMap[*prop.Id] = *prop.Name
						}
					}
				}
			}
		}

	}

	if len(propertyNameMap) == 0 {
		backend.Logger.Warn("frameResponse: propertyNameMap EMPTY (fallback to propertyId)")
	}

	return propertyNameMap
}

func isRequireJSONParsing(query models.BaseQuery) bool {
	switch query.QueryType {
	case models.QueryTypePropertyValueHistory,
		models.QueryTypePropertyAggregate,
		models.QueryTypePropertyValue:
		return true
	default:
		return false
	}
}

func ParseJSONFields(
	ctx context.Context,
	frames data.Frames,
	sw client.SitewiseAPIClient,
	assetID string,
) data.Frames {
	backend.Logger.Info("ParseJSONFields: starting JSON parsing", "assetID", assetID)

	// Build property name map once
	propertyNameMap := BuildPropertyNameMap(ctx, sw, assetID)
	newFrames := data.Frames{}

	for _, frame := range frames {
		newFields := make([]*data.Field, 0, len(frame.Fields))
		jsonParsed := false

		for _, field := range frame.Fields {
			newFields = append(newFields, field)

			if field.Type() != data.FieldTypeString || field.Len() == 0 {
				continue
			}

			rowCount := field.Len()
			jsonFields := map[string]*data.Field{}

			// Parse every row directly (no separate “detect keys” loop)
			for r := 0; r < rowCount; r++ {
				rawStr, _ := field.At(r).(string)
				if rawStr == "" {
					continue
				}

				var obj map[string]interface{}
				if err := json.Unmarshal([]byte(rawStr), &obj); err != nil {
					backend.Logger.Warn("ParseJSONFields: corrupted JSON, skipping row", "err", err, "frame", frame.Name, "row", r)
					continue
				}
				jsonParsed = true

				// Required fields check
				for _, req := range []string{"timestamp", "prediction", "prediction_reason"} {
					if _, ok := obj[req]; !ok {
						backend.Logger.Warn("ParseJSONFields: missing required field", "field", req, "frame", frame.Name, "row", r)
					}
				}

				// Fill simple fields
				for key, val := range obj {
					if key == "diagnostics" || key == "timestamp" {
						continue
					}
					switch v := val.(type) {
					case float64:
						if _, exists := jsonFields[key]; !exists {
							jsonFields[key] = data.NewField(key, nil, make([]float64, rowCount))
						}
						jsonFields[key].Set(r, v)
					case string:
						if _, exists := jsonFields[key]; !exists {
							jsonFields[key] = data.NewField(key, nil, make([]string, rowCount))
						}
						jsonFields[key].Set(r, v)
					case bool:
						if _, exists := jsonFields[key]; !exists {
							jsonFields[key] = data.NewField(key, nil, make([]bool, rowCount))
						}
						jsonFields[key].Set(r, v)
					}
				}

				// Top-level anomaly_score
				if v, ok := obj["anomaly_score"].(float64); ok {
					if _, exists := jsonFields["anomaly_score"]; !exists {
						jsonFields["anomaly_score"] = data.NewField("anomaly_score", nil, make([]float64, rowCount))
					}
					jsonFields["anomaly_score"].Set(r, v)
				}

				// Diagnostics handling
				if diagArr, ok := obj["diagnostics"].([]interface{}); ok {
					contribValues := map[string]float64{}
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
						propertyID := parts[1]
						readable := propertyID
						if mapped, ok := propertyNameMap[propertyID]; ok {
							readable = mapped
						}
						fieldName := "contrib_" + readable

						if _, exists := jsonFields[fieldName]; !exists {
							jsonFields[fieldName] = data.NewField(fieldName, nil, make([]float64, rowCount))
						}
						if v, ok := diagObj["value"].(float64); ok {
							contribValues[fieldName] = v
						}

						if av, ok := diagObj["anomaly_score"].(float64); ok {
							diagField := "diag_anomaly_" + readable
							if _, exists := jsonFields[diagField]; !exists {
								jsonFields[diagField] = data.NewField(diagField, nil, make([]float64, rowCount))
							}
							jsonFields[diagField].Set(r, av)
						}
					}
					// Normalize contributions
					total := 0.0
					for _, v := range contribValues {
						total += v
					}
					if total > 0 {
						for fieldName, rawValue := range contribValues {
							jsonFields[fieldName].Set(r, (rawValue/total)*100.0)
						}
					}
				}
			}

			// Append parsed JSON fields
			for _, f := range jsonFields {
				newFields = append(newFields, f)
			}
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
