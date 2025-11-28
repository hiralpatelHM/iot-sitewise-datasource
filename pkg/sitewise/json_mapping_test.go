package sitewise

import (
	"context"
	"errors"
	"testing"

	"github.com/aws/aws-sdk-go-v2/service/iotsitewise"
	iotsitewisetypes "github.com/aws/aws-sdk-go-v2/service/iotsitewise/types"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

type fakeSitewiseClient struct {
	DescribeAssetOut *iotsitewise.DescribeAssetOutput
	DescribeAssetErr error
	DescribeModelOut *iotsitewise.DescribeAssetModelOutput
	DescribeModelErr error
}

func (f *fakeSitewiseClient) maybeDescribeAsset(ctx context.Context, in *iotsitewise.DescribeAssetInput) (*iotsitewise.DescribeAssetOutput, error) {
	if f.DescribeAssetOut == nil && f.DescribeAssetErr == nil {
		return nil, errors.New("no asset")
	}
	return f.DescribeAssetOut, f.DescribeAssetErr
}

func (f *fakeSitewiseClient) maybeDescribeModel(ctx context.Context, in *iotsitewise.DescribeAssetModelInput) (*iotsitewise.DescribeAssetModelOutput, error) {
	if f.DescribeModelOut == nil && f.DescribeModelErr == nil {
		return nil, errors.New("no model")
	}
	return f.DescribeModelOut, f.DescribeModelErr
}

func (f *fakeSitewiseClient) BatchGetAssetPropertyAggregates(ctx context.Context, in *iotsitewise.BatchGetAssetPropertyAggregatesInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.BatchGetAssetPropertyAggregatesOutput, error) {
	return &iotsitewise.BatchGetAssetPropertyAggregatesOutput{}, nil
}

func (f *fakeSitewiseClient) BatchGetAssetPropertyValue(ctx context.Context, in *iotsitewise.BatchGetAssetPropertyValueInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.BatchGetAssetPropertyValueOutput, error) {
	return &iotsitewise.BatchGetAssetPropertyValueOutput{}, nil
}

func (f *fakeSitewiseClient) BatchGetAssetPropertyValueHistory(ctx context.Context, in *iotsitewise.BatchGetAssetPropertyValueHistoryInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.BatchGetAssetPropertyValueHistoryOutput, error) {
	return &iotsitewise.BatchGetAssetPropertyValueHistoryOutput{}, nil
}

func (f *fakeSitewiseClient) DescribeAsset(ctx context.Context, in *iotsitewise.DescribeAssetInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.DescribeAssetOutput, error) {
	return f.maybeDescribeAsset(ctx, in)
}

func (f *fakeSitewiseClient) DescribeAssetModel(ctx context.Context, in *iotsitewise.DescribeAssetModelInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.DescribeAssetModelOutput, error) {
	return f.maybeDescribeModel(ctx, in)
}

func (f *fakeSitewiseClient) ExecuteQuery(ctx context.Context, in *iotsitewise.ExecuteQueryInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.ExecuteQueryOutput, error) {
	return &iotsitewise.ExecuteQueryOutput{}, nil
}

func (f *fakeSitewiseClient) GetAssetPropertyAggregates(ctx context.Context, in *iotsitewise.GetAssetPropertyAggregatesInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.GetAssetPropertyAggregatesOutput, error) {
	return &iotsitewise.GetAssetPropertyAggregatesOutput{}, nil
}

func (f *fakeSitewiseClient) GetAssetPropertyValueHistory(ctx context.Context, in *iotsitewise.GetAssetPropertyValueHistoryInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.GetAssetPropertyValueHistoryOutput, error) {
	return &iotsitewise.GetAssetPropertyValueHistoryOutput{}, nil
}

func (f *fakeSitewiseClient) GetInterpolatedAssetPropertyValues(ctx context.Context, in *iotsitewise.GetInterpolatedAssetPropertyValuesInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.GetInterpolatedAssetPropertyValuesOutput, error) {
	return &iotsitewise.GetInterpolatedAssetPropertyValuesOutput{}, nil
}

func (f *fakeSitewiseClient) ListAssets(ctx context.Context, in *iotsitewise.ListAssetsInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.ListAssetsOutput, error) {
	return &iotsitewise.ListAssetsOutput{}, nil
}

func (f *fakeSitewiseClient) ListAssetModels(ctx context.Context, in *iotsitewise.ListAssetModelsInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.ListAssetModelsOutput, error) {
	return &iotsitewise.ListAssetModelsOutput{}, nil
}

func (f *fakeSitewiseClient) ListAssetProperties(ctx context.Context, in *iotsitewise.ListAssetPropertiesInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.ListAssetPropertiesOutput, error) {
	return &iotsitewise.ListAssetPropertiesOutput{}, nil
}

func (f *fakeSitewiseClient) ListAssociatedAssets(ctx context.Context, in *iotsitewise.ListAssociatedAssetsInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.ListAssociatedAssetsOutput, error) {
	return &iotsitewise.ListAssociatedAssetsOutput{}, nil
}

func (f *fakeSitewiseClient) ListTimeSeries(ctx context.Context, in *iotsitewise.ListTimeSeriesInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.ListTimeSeriesOutput, error) {
	return &iotsitewise.ListTimeSeriesOutput{}, nil
}

func (f *fakeSitewiseClient) DescribeAssetProperty(ctx context.Context, in *iotsitewise.DescribeAssetPropertyInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.DescribeAssetPropertyOutput, error) {
	return &iotsitewise.DescribeAssetPropertyOutput{
		AssetProperty: &iotsitewisetypes.Property{
			Id:   aws.String("fake"),
			Name: aws.String("fake"),
		},
	}, nil
}

func (f *fakeSitewiseClient) DescribeTimeSeries(ctx context.Context, in *iotsitewise.DescribeTimeSeriesInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.DescribeTimeSeriesOutput, error) {
	return &iotsitewise.DescribeTimeSeriesOutput{}, nil
}

func (f *fakeSitewiseClient) GetAssetPropertyValue(ctx context.Context, in *iotsitewise.GetAssetPropertyValueInput, optFns ...func(*iotsitewise.Options)) (*iotsitewise.GetAssetPropertyValueOutput, error) {
	return &iotsitewise.GetAssetPropertyValueOutput{}, nil
}

func (f *fakeSitewiseClient) BatchGetAssetPropertyValueHistoryPageAggregation(ctx context.Context, req *iotsitewise.BatchGetAssetPropertyValueHistoryInput, maxPages int, maxResults int) (*iotsitewise.BatchGetAssetPropertyValueHistoryOutput, error) {
	return &iotsitewise.BatchGetAssetPropertyValueHistoryOutput{}, nil
}

func (f *fakeSitewiseClient) GetAssetPropertyValueHistoryPageAggregation(ctx context.Context, req *iotsitewise.GetAssetPropertyValueHistoryInput, maxPages int, maxResults int) (*iotsitewise.GetAssetPropertyValueHistoryOutput, error) {
	return &iotsitewise.GetAssetPropertyValueHistoryOutput{}, nil
}

func (f *fakeSitewiseClient) GetAssetPropertyAggregatesPageAggregation(ctx context.Context, req *iotsitewise.GetAssetPropertyAggregatesInput, maxPages int, maxResults int) (*iotsitewise.GetAssetPropertyAggregatesOutput, error) {
	return &iotsitewise.GetAssetPropertyAggregatesOutput{}, nil
}

func (f *fakeSitewiseClient) BatchGetAssetPropertyAggregatesPageAggregation(ctx context.Context, req *iotsitewise.BatchGetAssetPropertyAggregatesInput, maxPages int, maxResults int) (*iotsitewise.BatchGetAssetPropertyAggregatesOutput, error) {
	return &iotsitewise.BatchGetAssetPropertyAggregatesOutput{}, nil
}

func (f *fakeSitewiseClient) GetInterpolatedAssetPropertyValuesPageAggregation(ctx context.Context, req *iotsitewise.GetInterpolatedAssetPropertyValuesInput, maxPages int, maxResults int) (*iotsitewise.GetInterpolatedAssetPropertyValuesOutput, error) {
	return &iotsitewise.GetInterpolatedAssetPropertyValuesOutput{}, nil
}

func fieldNamesOfFrame(f *data.Frame) []string {
	names := make([]string, 0, len(f.Fields))
	for _, fld := range f.Fields {
		if fld == nil {
			names = append(names, "<nil>")
			continue
		}
		names = append(names, fld.Name)
	}
	return names
}

func hasField(frame *data.Frame, name string) bool {
	for _, f := range frame.Fields {
		if f != nil && f.Name == name {
			return true
		}
	}
	return false
}

func TestParseJSONFields_SimpleNumericAndDiagnostic(t *testing.T) {
	ctx := context.Background()

	js := `{
        "timestamp":"2025-11-13T06:42:21.549955Z",
        "prediction":0,
        "prediction_reason":"NO_ANOMALY_DETECTED",
        "anomaly_score":0.4312,
        "some_value": 12.34,
        "flag": true,
        "diagnostics": [
            {"name":"root\\prop-1","value":45.8,"anomaly_score":0.1},
            {"name":"root\\prop-2","value":54.2}
        ]
    }`

	stringField := data.NewField("value", nil, []string{js})
	frame := data.NewFrame("TestFrame", stringField)
	frames := data.Frames{frame}

	var swClient fakeSitewiseClient
	out := ParseJSONFields(ctx, frames, &swClient, "")

	if len(out) != 1 {
		t.Fatalf("expected 1 output frame, got %d", len(out))
	}
	of := out[0]

	if hasField(of, "timestamp") || hasField(of, "Timestamp") {
		t.Fatalf("timestamp field should be skipped but found in %v", fieldNamesOfFrame(of))
	}
	if !hasField(of, "anomaly_score") {
		t.Fatalf("expected anomaly_score field, fields: %v", fieldNamesOfFrame(of))
	}
	if !hasField(of, "some_value") {
		t.Fatalf("expected some_value field, fields: %v", fieldNamesOfFrame(of))
	}
	if !hasField(of, "flag") {
		t.Fatalf("expected flag field, fields: %v", fieldNamesOfFrame(of))
	}
	if !hasField(of, "contrib_prop-1") {
		t.Fatalf("expected contrib_prop-1, fields: %v", fieldNamesOfFrame(of))
	}
	if !hasField(of, "contrib_prop-2") {
		t.Fatalf("expected contrib_prop-2, fields: %v", fieldNamesOfFrame(of))
	}
	if !hasField(of, "diag_anomaly_prop-1") {
		t.Fatalf("expected diag_anomaly_prop-1, fields: %v", fieldNamesOfFrame(of))
	}
}

func TestParseJSONFields_WithAssetNameMapping(t *testing.T) {
	ctx := context.Background()

	modelOut := &iotsitewise.DescribeAssetModelOutput{
		AssetModelProperties: []iotsitewisetypes.AssetModelProperty{
			{Id: aws.String("prop-1"), Name: aws.String("pressure")},
			{Id: aws.String("prop-2"), Name: aws.String("temperature")},
		},
	}
	assetOut := &iotsitewise.DescribeAssetOutput{
		AssetModelId: aws.String("model-123"),
	}
	sw := &fakeSitewiseClient{
		DescribeAssetOut: assetOut,
		DescribeModelOut: modelOut,
	}

	js := `{
        "timestamp":"2025-11-13T06:42:21.549955Z",
        "prediction":1,
        "prediction_reason":"ANOMALY_DETECTED",
        "anomaly_score":0.97,
        "diagnostics":[
            {"name":"x\\prop-1","value":10,"anomaly_score":0.11},
            {"name":"x\\prop-2","value":90,"anomaly_score":0.89}
        ]
    }`

	frame := data.NewFrame("MappedFrame", data.NewField("value", nil, []string{js}))
	in := data.Frames{frame}

	out := ParseJSONFields(ctx, in, sw, "anAssetID")

	if len(out) != 1 {
		t.Fatalf("expected 1 output frame, got %d", len(out))
	}
	of := out[0]

	if !hasField(of, "contrib_pressure") {
		t.Fatalf("expected contrib_pressure field, got: %v", fieldNamesOfFrame(of))
	}
	if !hasField(of, "contrib_temperature") {
		t.Fatalf("expected contrib_temperature field, got: %v", fieldNamesOfFrame(of))
	}
	if !hasField(of, "diag_anomaly_pressure") || !hasField(of, "diag_anomaly_temperature") {
		t.Fatalf("expected diag_anomaly_* fields, got: %v", fieldNamesOfFrame(of))
	}
}

func TestParseJSONFields_CorruptedJSONAndMissingFields(t *testing.T) {
	ctx := context.Background()
	corrupt := `{"invalid":`
	missingReq := `{"some":"value"}`

	frame := data.NewFrame("BadFrame", data.NewField("value", nil, []string{corrupt, missingReq}))
	in := data.Frames{frame}
	var sw fakeSitewiseClient
	out := ParseJSONFields(ctx, in, &sw, "")

	if len(out) != 1 {
		t.Fatalf("expected 1 output frame despite bad rows, got %d", len(out))
	}
	of := out[0]

	if len(of.Fields) == 0 {
		t.Fatalf("expected at least one field in output frame, got none")
	}
	for _, forbidden := range []string{"anomaly_score", "contrib_foo", "timestamp"} {
		if hasField(of, forbidden) {
			t.Fatalf("did not expect field %s in output, fields: %v", forbidden, fieldNamesOfFrame(of))
		}
	}
}
