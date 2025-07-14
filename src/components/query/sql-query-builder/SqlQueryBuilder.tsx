import React, { useState } from 'react';
import { Select, Input, IconButton, Tooltip, Alert } from '@grafana/ui';
import { QueryType } from 'types';
import { EditorField, EditorFieldGroup, EditorRow, EditorRows } from '@grafana/plugin-ui';

interface SqlQueryBuilderProps {
  query: any;
  onChange: (query: any) => void;
  datasource: any;
}

// Mock SiteWise data structures
interface AssetModel {
  id: string;
  name: string;
  properties: AssetProperty[];
}

interface Asset {
  id: string;
  name: string;
  modelId: string;
  hierarchy: string[];
  tags: Record<string, string>;
}

interface AssetProperty {
  id: string;
  name: string;
  dataType: 'STRING' | 'INTEGER' | 'DOUBLE' | 'BOOLEAN' | 'STRUCT';
  alias?: string;
}

// Mock data - replace with actual SiteWise API calls
const mockAssetModels: AssetModel[] = [
  {
    id: 'asset',
    name: 'asset',
    properties: [
      { id: 'asset_id', name: 'asset_id', dataType: 'DOUBLE' },
      { id: 'asset_name', name: 'asset_name', dataType: 'STRING' },
      { id: 'asset_description', name: 'asset_description', dataType: 'STRING' },
      { id: 'asset_model_id', name: 'asset_model_id', dataType: 'DOUBLE' },
    ],
  },
  {
    id: 'asset_property',
    name: 'asset_property',
    properties: [
      { id: 'property_id', name: 'property_id', dataType: 'DOUBLE' },
      { id: 'asset_id', name: 'asset_id', dataType: 'DOUBLE' },
      { id: 'asset_composite_model_id', name: 'asset_composite_model_id', dataType: 'DOUBLE' },
      { id: 'property_name', name: 'property_name', dataType: 'BOOLEAN' },
      { id: 'property_alias', name: 'property_alias', dataType: 'BOOLEAN' },
    ],
  },
  {
    id: 'raw_time_series',
    name: 'raw_time_series',
    properties: [
      { id: 'property_id', name: 'property_id', dataType: 'DOUBLE' },
      { id: 'asset_id', name: 'asset_id', dataType: 'DOUBLE' },
      { id: 'property_alias', name: 'property_alias', dataType: 'STRING' },
      { id: 'event_timestamp', name: 'event_timestamp', dataType: 'DOUBLE' },
      { id: 'quality', name: 'quality', dataType: 'STRING' },
      { id: 'boolean_value', name: 'boolean_value', dataType: 'BOOLEAN' },
      { id: 'int_value', name: 'int_value', dataType: 'INTEGER' },
      { id: 'double_value', name: 'double_value', dataType: 'DOUBLE' },
      { id: 'string_value', name: 'string_value', dataType: 'STRING' },
    ],
  },
  {
    id: 'latest_value_time_series',
    name: 'latest_value_time_series',
    properties: [
      { id: 'property_id', name: 'property_id', dataType: 'DOUBLE' },
      { id: 'asset_id', name: 'asset_id', dataType: 'DOUBLE' },
      { id: 'property_alias', name: 'property_alias', dataType: 'STRING' },
      { id: 'event_timestamp', name: 'event_timestamp', dataType: 'DOUBLE' },
      { id: 'quality', name: 'quality', dataType: 'STRING' },
      { id: 'boolean_value', name: 'boolean_value', dataType: 'BOOLEAN' },
      { id: 'int_value', name: 'int_value', dataType: 'INTEGER' },
      { id: 'double_value', name: 'double_value', dataType: 'DOUBLE' },
      { id: 'string_value', name: 'string_value', dataType: 'STRING' },
    ],
  },
  {
    id: 'precomputed_aggregates',
    name: 'precomputed_aggregates',
    properties: [
      { id: 'rpm-1', name: 'RPM', dataType: 'DOUBLE' },
      { id: 'torque-1', name: 'Torque', dataType: 'DOUBLE' },
      { id: 'vibration-1', name: 'Vibration', dataType: 'DOUBLE' },
      { id: 'efficiency-1', name: 'Efficiency', dataType: 'DOUBLE' },
    ],
  },
];

const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Factory Floor Sensor 1',
    modelId: 'asset',
    hierarchy: ['Factory', 'Floor 1', 'Zone A'],
    tags: { location: 'Zone A', criticality: 'High', department: 'Production' },
  },
  {
    id: 'asset-2',
    name: 'Factory Floor Sensor 2',
    modelId: 'asset',
    hierarchy: ['Factory', 'Floor 1', 'Zone B'],
    tags: { location: 'Zone B', criticality: 'Medium', department: 'Production' },
  },
  {
    id: 'asset-3',
    name: 'Pressure Monitor A',
    modelId: 'asset_property',
    hierarchy: ['Factory', 'Floor 2', 'Pump Room'],
    tags: { location: 'Pump Room', criticality: 'Critical', department: 'Maintenance' },
  },
  {
    id: 'asset-4',
    name: 'Main Motor Unit',
    modelId: 'raw_time_series',
    hierarchy: ['Factory', 'Floor 1', 'Motor Bay'],
    tags: { location: 'Motor Bay', criticality: 'Critical', department: 'Production' },
  },
];
const timeIntervalProperty: AssetProperty = {
  id: 'timeInterval',
  name: 'Time Interval',
  dataType: 'STRING',
};

// Query builder operators and functions
const whereOperators = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: 'IS', value: 'IS' },
  { label: 'IS NOT', value: 'IS_NOT' },
  { label: 'CONTAINS', value: 'CONTAINS' },
];

const aggregationFunctions = [
  { label: 'avg()', value: 'AVERAGE', group: 'Aggregations' },
  { label: 'sum()', value: 'SUM', group: 'Aggregations' },
  { label: 'min()', value: 'MINIMUM', group: 'Aggregations' },
  { label: 'max()', value: 'MAXIMUM', group: 'Aggregations' },
  { label: 'count()', value: 'COUNT', group: 'Aggregations' },
  { label: 'stddev()', value: 'STANDARD_DEVIATION', group: 'Aggregations' },
  { label: 'first()', value: 'FIRST', group: 'Selectors' },
  { label: 'last()', value: 'LAST', group: 'Selectors' },
  { label: 'difference()', value: 'DIFFERENCE', group: 'Transformations' },
  { label: 'derivative()', value: 'DERIVATIVE', group: 'Transformations' },
  { label: 'alias()', value: 'ALIAS', group: 'Transformations' },
];

const timeIntervals = [
  { label: '1s', value: '1s' },
  { label: '5s', value: '5s' },
  { label: '10s', value: '10s' },
  { label: '30s', value: '30s' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '10m', value: '10m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '2h', value: '2h' },
  { label: '6h', value: '6h' },
  { label: '12h', value: '12h' },
  { label: '1d', value: '1d' },
];

// const timezones = [
//   { label: 'UTC', value: 'UTC' },
//   { label: 'America/New_York', value: 'America/New_York' },
//   { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
//   { label: 'Europe/London', value: 'Europe/London' },
//   { label: 'Europe/Paris', value: 'Europe/Paris' },
//   { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
//   { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
// ];

interface SelectField {
  column: string;
  aggregation?: string;
  alias?: string;
}

interface WhereCondition {
  column: string;
  operator: string;
  value: string;
  logicalOperator: 'AND' | 'OR';
}

interface SitewiseQueryState {
  selectedAssetModel?: string;
  selectedAssets: string[];
  selectFields: SelectField[];
  whereConditions: WhereCondition[];
  groupByTime?: string;
  groupByTags: string[];
  orderBy: 'ASC' | 'DESC';
  limit?: number;
  timezone: string;
  rawQueryMode: boolean;
}

export function SqlQueryBuilder({ query, onChange, datasource }: SqlQueryBuilderProps) {
  const [queryState, setQueryState] = useState<SitewiseQueryState>({
    selectedAssetModel: query.assetModel || '',
    selectedAssets: query.assets || [],
    selectFields: query.selectFields || [{ column: '', aggregation: '', alias: '' }],
    whereConditions: query.whereConditions || [{ column: '', operator: '', value: '', logicalOperator: 'AND' }],
    groupByTime: query.groupByTime || '',
    groupByTags: query.groupByTags || [],
    orderBy: query.orderBy === 'ASC' || query.orderBy === 'DESC' ? query.orderBy : 'ASC',
    limit: query.limit || 1000,
    timezone: query.timezone || 'UTC',
    rawQueryMode: false,
  });

  const selectedModel = mockAssetModels.find((model) => model.id === queryState.selectedAssetModel);
  const availableAssets = mockAssets.filter((asset) => asset.modelId === queryState.selectedAssetModel);
  const availableProperties = selectedModel?.properties || [];
  const availablePropertiesForGrouping: AssetProperty[] = [timeIntervalProperty, ...availableProperties];

  // Get all unique tag keys from selected assets
  const availableTagKeys = Array.from(
    new Set(
      availableAssets
        .filter((asset) => queryState.selectedAssets.includes(asset.id))
        .flatMap((asset) => Object.keys(asset.tags))
    )
  );

  const updateQuery = (newState: Partial<SitewiseQueryState>) => {
    const updatedState = { ...queryState, ...newState };
    setQueryState(updatedState);

    const newQuery = {
      ...query,
      queryType: QueryType.ExecuteQuery,
      assetModel: updatedState.selectedAssetModel || '',
      assets: updatedState.selectedAssets,
      selectFields: updatedState.selectFields,
      whereConditions: updatedState.whereConditions,
      groupByTime: updatedState.groupByTime,
      groupByTags: updatedState.groupByTags,
      orderBy: updatedState.orderBy,
      limit: updatedState.limit,
      timezone: updatedState.timezone,
    };

    onChange(newQuery);
  };

  const addSelectField = () => {
    const newFields = [...queryState.selectFields, { column: '', aggregation: '', alias: '' }];
    updateQuery({ selectFields: newFields });
  };

  const removeSelectField = (index: number) => {
    if (queryState.selectFields.length > 1) {
      const newFields = queryState.selectFields.filter((_, i) => i !== index);
      updateQuery({ selectFields: newFields });
    }
  };

  const updateSelectField = (index: number, field: Partial<SelectField>) => {
    const newFields = [...queryState.selectFields];
    newFields[index] = { ...newFields[index], ...field };
    updateQuery({ selectFields: newFields });
  };

  const addWhereCondition = () => {
    const newConditions = [
      ...queryState.whereConditions,
      { column: '', operator: '=', value: '', logicalOperator: 'AND' as const },
    ];
    updateQuery({ whereConditions: newConditions });
  };

  const removeWhereCondition = (index: number) => {
    const newConditions = queryState.whereConditions.filter((_, i) => i !== index);
    updateQuery({ whereConditions: newConditions });
  };

  const updateWhereCondition = (index: number, condition: Partial<WhereCondition>) => {
    const newConditions = [...queryState.whereConditions];
    newConditions[index] = { ...newConditions[index], ...condition };
    updateQuery({ whereConditions: newConditions });
  };

  const generateQueryPreview = () => {
    console.log('Generating query preview with state:', queryState);
    if (!queryState.selectedAssetModel) {
      return 'Select an asset model to build your query';
    }

    const selectedProperties = queryState.selectFields
      .filter((field) => field.column)
      .map((field) => {
        const property = availableProperties.find((p) => p.id === field.column);
        let name = property?.name || field.column;
        if (field.aggregation) {
          name = `${field.aggregation}(${name})`;
        }
        if (field.alias) {
          name += ` AS ${field.alias}`;
        }
        return name;
      });

    let preview = `Query: select ${selectedProperties.join(', ')} from ${queryState.selectedAssetModel}`;

    if (queryState.whereConditions.length > 0) {
      const conditions = queryState.whereConditions
        .filter((c) => c.column && c.value)
        .map((c, i) => {
          const condition = `${c.column} ${c.operator} "${c.value}"`;
          return i === 0 ? condition : `${c.logicalOperator} ${condition}`;
        });
      preview += `\nWHERE ${conditions.join(' ')}`;
    }

    if (queryState.groupByTags.length > 0) {
      preview += `\nGROUP BY ${queryState.groupByTags.map((tag) => `tag.${tag}`).join(', ')}`;
      if (queryState.groupByTime) {
        preview += `, time(${queryState.groupByTime})`;
      }
    }

    preview += `\nORDER BY time ${queryState.orderBy}`;

    if (queryState.limit) {
      preview += `\nLIMIT ${queryState.limit}`;
    }

    return preview;
  };

  return (
    <div className="gf-form-group">
      {/* FROM Section */}
      <EditorRows>
        <EditorRow>
          <EditorFieldGroup>
            <EditorField label="From" width={40}>
              <Select
                options={mockAssetModels.map((model) => ({
                  label: model.name,
                  value: model.id,
                }))}
                value={queryState.selectedAssetModel}
                onChange={(option) =>
                  updateQuery({
                    selectedAssetModel: option?.value || '',
                  })
                }
                placeholder="Select model..."
              />
            </EditorField>
          </EditorFieldGroup>
        </EditorRow>

        {/* SELECT Section */}
        {queryState.selectFields.map((field, index) => (
          <EditorRow key={index}>
            <EditorFieldGroup>
              <EditorField label={index === 0 ? 'Select' : ''} width={30}>
                <Select
                  options={availableProperties.map((prop) => ({
                    label: `${prop.name}`,
                    value: prop.id,
                  }))}
                  value={field.column}
                  onChange={(option) => updateSelectField(index, { column: option?.value || '' })}
                  placeholder="Select property..."
                />
              </EditorField>

              <EditorField label={index === 0 ? 'Function' : ''} width={30}>
                <Select
                  options={[
                    { label: 'Raw Values', value: '' },
                    ...aggregationFunctions.map((func) => ({
                      label: `${func.group}: ${func.label}`,
                      value: func.value,
                    })),
                  ]}
                  value={field.aggregation}
                  onChange={(option) => updateSelectField(index, { aggregation: option?.value || '' })}
                  placeholder="No function"
                />
              </EditorField>

              <EditorField label={index === 0 ? 'Alias' : ''} width={25}>
                <Input
                  value={field.alias}
                  onChange={(e) => updateSelectField(index, { alias: e.currentTarget.value })}
                  placeholder="Optional alias"
                />
              </EditorField>

              <EditorField label={index === 0 ? 'Actions' : ''} width={15}>
                <div>
                  <Tooltip content="Add field">
                    <IconButton name="plus" onClick={addSelectField} aria-label="Add field" />
                  </Tooltip>
                  {queryState.selectFields.length > 1 && (
                    <Tooltip content="Remove field">
                      <IconButton name="minus" onClick={() => removeSelectField(index)} aria-label="Remove field" />
                    </Tooltip>
                  )}
                </div>
              </EditorField>
            </EditorFieldGroup>
          </EditorRow>
        ))}

        {/* WHERE Section */}
        <EditorRow>
          <EditorFieldGroup>
            {queryState.whereConditions.map((condition, index) => (
              <>
                {index > 0 && (
                  <EditorField key={`operator-${index}`} label="" width={15}>
                    <Select
                      options={[
                        { label: 'AND', value: 'AND' },
                        { label: 'OR', value: 'OR' },
                      ]}
                      value={condition.logicalOperator}
                      onChange={(option) =>
                        updateWhereCondition(index, {
                          logicalOperator: option?.value as 'AND' | 'OR',
                        })
                      }
                    />
                  </EditorField>
                )}
                <EditorField key={`field-${index}`} label={index === 0 ? 'Field' : ''} width={30}>
                  <Select
                    options={[
                      ...availableProperties.map((prop) => ({
                        label: prop.name,
                        value: prop.id,
                      })),
                      ...availableTagKeys.map((tag) => ({
                        label: `tag.${tag}`,
                        value: `tag.${tag}`,
                      })),
                    ]}
                    value={condition.column}
                    onChange={(option) => updateWhereCondition(index, { column: option?.value || '' })}
                    placeholder="Select field..."
                  />
                </EditorField>
                <EditorField key={`op-${index}`} label={index === 0 ? 'Operator' : ''} width={15}>
                  <Select
                    options={whereOperators}
                    value={condition.operator}
                    onChange={(option) => updateWhereCondition(index, { operator: option?.value || '=' })}
                  />
                </EditorField>
                <EditorField key={`value-${index}`} label={index === 0 ? 'Value' : ''} width={30}>
                  <Input
                    value={condition.value}
                    onChange={(e) => updateWhereCondition(index, { value: e.currentTarget.value })}
                    placeholder="Enter value..."
                  />
                </EditorField>

                <EditorField key={`action-${index}`} label={index === 0 ? 'Actions' : ''} width={10}>
                  <div>
                    <Tooltip content="Add condition">
                      <IconButton name="plus" onClick={addWhereCondition} aria-label="Add condition" />
                    </Tooltip>
                    {queryState.whereConditions.length > 1 && (
                      <Tooltip content="Remove condition">
                        <IconButton
                          name="minus"
                          onClick={() => removeWhereCondition(index)}
                          aria-label="Remove condition"
                        />
                      </Tooltip>
                    )}
                  </div>
                </EditorField>
              </>
            ))}
          </EditorFieldGroup>
        </EditorRow>

        {/* GROUP BY Section */}
        <EditorRow>
          <EditorFieldGroup>
            <EditorField label="Group By" width={30}>
              <Select
                options={availablePropertiesForGrouping.map((prop) => ({
                  label: prop.name,
                  value: prop.id,
                }))}
                value={queryState.groupByTags}
                onChange={(options) =>
                  updateQuery({
                    groupByTags: options?.map((opt: any) => opt.value) || [],
                  })
                }
                placeholder="Select properties..."
                isMulti
              />
            </EditorField>

            {Array.isArray(queryState.groupByTags) && queryState.groupByTags.includes('timeInterval') && (
              <EditorField label="Time Interval" width={20}>
                <Select
                  options={[{ label: 'No grouping', value: '' }, ...timeIntervals]}
                  value={queryState.groupByTime}
                  onChange={(option) => updateQuery({ groupByTime: option?.value || '' })}
                  placeholder="Select interval..."
                />
              </EditorField>
            )}
          </EditorFieldGroup>
        </EditorRow>

        {/* OUTPUT OPTIONS Section */}
        <EditorRow>
          <EditorFieldGroup>
            <EditorField label="Order By" width={25}>
              <Select
                options={[
                  { label: 'Ascending', value: 'ASC' },
                  { label: 'Descending', value: 'DESC' },
                ]}
                value={queryState.orderBy}
                onChange={(option) => updateQuery({ orderBy: option?.value as 'ASC' | 'DESC' })}
              />
            </EditorField>

            <EditorField label="Limit" width={25}>
              <Input
                type="number"
                value={queryState.limit}
                onChange={(e) => updateQuery({ limit: parseInt(e.currentTarget.value) || 1000 })}
              />
            </EditorField>

            {/* <EditorField
                    label="Timezone"
                    width={30}
                >
                    <Select
                    options={timezones}
                    value={queryState.timezone}
                    onChange={(option) => updateQuery({ timezone: option?.value || 'UTC' })}
                    />
                </EditorField> */}
          </EditorFieldGroup>
        </EditorRow>
      </EditorRows>

      {/* Query Preview */}
      <Alert title="Query Preview" severity="info">
        <pre style={{ background: 'transparent', border: 'none', fontSize: '12px' }}>{generateQueryPreview()}</pre>
      </Alert>
    </div>
  );
}
