package sitewise

import (
	"context"
	"encoding/json"
	"time"

	"github.com/patrickmn/go-cache"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/iot-sitewise-datasource/pkg/models"
	"github.com/grafana/iot-sitewise-datasource/pkg/resource"
	"github.com/grafana/iot-sitewise-datasource/pkg/sitewise/client"
	"github.com/grafana/iot-sitewise-datasource/pkg/sitewise/framer"
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

	backend.Logger.Info("frameResponse: frames generated", "count", len(frames))

	// Step 2: apply transformation for JSON fields
	backend.Logger.Info("frameResponse: applying parseJSONFields transformation")
	parsedFrames := ParseJSONFields(frames)
	backend.Logger.Info("*******************frameResponse: JSON parsing completed", "frames", len(parsedFrames))

	// Step 3: return parsed result
	return parsedFrames, nil
}

func FindFieldByName(fields []*data.Field, name string) *data.Field {
	for _, f := range fields {
		if f.Name == name {
			return f
		}
	}
	return nil
}

// parseJSONFields takes frames with JSON string in the "value" field,
// extracts all keys from that JSON, and creates new real fields.
func ParseJSONFields(frames data.Frames) data.Frames {
	newFrames := data.Frames{}

	for _, frame := range frames {
		fieldNames := []string{}
		for _, f := range frame.Fields {
			fieldNames = append(fieldNames, f.Name)
		}
		backend.Logger.Info("parseJSONFields: checking frame fields", "field_names", fieldNames)

		newFields := []*data.Field{}
		jsonParsed := false

		for _, field := range frame.Fields {
			// Always keep existing fields
			newFields = append(newFields, field)

			if field.Type() != data.FieldTypeString {
				continue
			}

			for i := 0; i < field.Len(); i++ {
				strVal, ok := field.At(i).(string)
				if !ok || strVal == "" {
					continue
				}

				var parsed map[string]interface{}
				if err := json.Unmarshal([]byte(strVal), &parsed); err != nil {
					continue
				}

				backend.Logger.Info("parseJSONFields: found JSON field", "field_name", field.Name)
				jsonParsed = true

				// Create correctly typed slices for each JSON key
				jsonFields := map[string]*data.Field{}

				for key, val := range parsed {
					switch val.(type) {
					case float64:
						jsonFields[key] = data.NewField(key, nil, make([]float64, field.Len()))
					case string:
						jsonFields[key] = data.NewField(key, nil, make([]string, field.Len()))
					case bool:
						jsonFields[key] = data.NewField(key, nil, make([]bool, field.Len()))
					default:
						// skip arrays or nested maps here to keep things simple
						continue
					}
				}

				// Fill the fields with values
				for j := 0; j < field.Len(); j++ {
					strVal, ok := field.At(j).(string)
					if !ok {
						continue
					}
					var parsedVal map[string]interface{}
					if err := json.Unmarshal([]byte(strVal), &parsedVal); err != nil {
						continue
					}
					for key, val := range parsedVal {
						if f, ok := jsonFields[key]; ok {
							switch v := val.(type) {
							case float64:
								f.Set(j, v)
							case string:
								f.Set(j, v)
							case bool:
								f.Set(j, v)
							}
						}
					}
				}

				// Append typed JSON fields
				for _, jf := range jsonFields {
					newFields = append(newFields, jf)
				}

				break
			}
		}

		newFrame := data.NewFrame(frame.Name, newFields...)
		newFrame.Meta = frame.Meta
		newFrames = append(newFrames, newFrame)

		if jsonParsed {
			backend.Logger.Info("parseJSONFields: transformed frame", "frame_name", frame.Name)
		} else {
			backend.Logger.Info("parseJSONFields: no JSON fields found in frame")
		}
	}

	backend.Logger.Info("ParseJSONFields: completed", "frame_count", len(newFrames))
	return newFrames
}
