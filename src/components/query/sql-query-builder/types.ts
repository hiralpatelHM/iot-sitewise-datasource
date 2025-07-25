import { SelectableValue } from '@grafana/data';

export interface SqlQueryBuilderProps {
  builderState: any;
  onChange: (query: any) => void;
}

export interface SelectField {
  column: string;
  aggregation?: string;
  alias?: string;
  functionArg?: string;
  functionArgValue?: string;
}

export interface WhereCondition {
  column: string;
  operator: string;
  value: string;
  value2?: string; // For BETWEEN operator
  logicalOperator?: 'AND' | 'OR';
  operator2?: string; // For BETWEEN operator
}

export interface OrderByField {
  column: string;
  direction: 'ASC' | 'DESC';
}

export interface SitewiseQueryState {
  selectedAssetModel?: string;
  selectedAssets: string[];
  selectFields: SelectField[];
  whereConditions: WhereCondition[];
  groupByTime?: string;
  groupByTags: string[];
  orderByFields: OrderByField[];
  limit?: number;
  timezone: string;
  rawSQL: string;
}

export const defaultSitewiseQueryState: SitewiseQueryState = {
  selectedAssetModel: '',
  selectedAssets: [],
  selectFields: [{ column: '', aggregation: '', alias: '' }],
  whereConditions: [{ column: '', operator: '', value: '', logicalOperator: 'AND' }],
  groupByTime: '',
  groupByTags: [],
  orderByFields: [{ column: '', direction: 'ASC' }],
  limit: 1000,
  timezone: 'UTC',
  rawSQL: '',
};

// AssetModels and Assets
export interface AssetProperty {
  id: string;
  name: string;
  dataType: 'STRING' | 'INTEGER' | 'DOUBLE' | 'BOOLEAN' | 'TIMESTAMP';
  alias?: string;
}

export interface AssetModel {
  id: string;
  name: string;
  properties: AssetProperty[];
}

export interface Asset {
  id: string;
  name: string;
  modelId: string;
  hierarchy: string[];
  tags: Record<string, string>;
}

export const mockAssetModels: AssetModel[] = [
  {
    id: 'asset',
    name: 'asset',
    properties: [
      { id: 'asset_id', name: 'asset_id', dataType: 'DOUBLE' },
      { id: 'asset_name', name: 'asset_name', dataType: 'STRING' },
      { id: 'asset_description', name: 'asset_description', dataType: 'STRING' },
      { id: 'asset_model_id', name: 'asset_model_id', dataType: 'STRING' },
      { id: 'parent_asset_id', name: 'parent_asset_id', dataType: 'STRING' },
      { id: 'asset_external_id', name: 'asset_external_id', dataType: 'STRING' },
      { id: 'asset_model_external_id', name: 'asset_model_external_id', dataType: 'STRING' },
    ],
  },
  {
    id: 'asset_property',
    name: 'asset_property',
    properties: [
      { id: 'asset_id', name: 'asset_id', dataType: 'STRING' },
      { id: 'property_id', name: 'property_id', dataType: 'STRING' },
      { id: 'property_name', name: 'property_name', dataType: 'STRING' },
      { id: 'property_alias', name: 'property_alias', dataType: 'STRING' },
      { id: 'property_external_id', name: 'property_external_id', dataType: 'STRING' },
      { id: 'asset_composite_model_id', name: 'asset_composite_model_id', dataType: 'STRING' },
      { id: 'property_type', name: 'property_type', dataType: 'STRING' },
      { id: 'property_data_type', name: 'property_data_type', dataType: 'STRING' },
      { id: 'int_attribute_value', name: 'int_attribute_value', dataType: 'INTEGER' },
      { id: 'double_attribute_value', name: 'double_attribute_value', dataType: 'DOUBLE' },
      { id: 'boolean_attribute_value', name: 'boolean_attribute_value', dataType: 'BOOLEAN' },
      { id: 'string_attribute_value', name: 'string_attribute_value', dataType: 'STRING' },
    ],
  },
  {
    id: 'raw_time_series',
    name: 'raw_time_series',
    properties: [
      { id: 'property_id', name: 'property_id', dataType: 'STRING' },
      { id: 'asset_id', name: 'asset_id', dataType: 'STRING' },
      { id: 'property_alias', name: 'property_alias', dataType: 'STRING' },
      { id: 'event_timestamp', name: 'event_timestamp', dataType: 'TIMESTAMP' },
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
      { id: 'property_id', name: 'property_id', dataType: 'STRING' },
      { id: 'asset_id', name: 'asset_id', dataType: 'STRING' },
      { id: 'property_alias', name: 'property_alias', dataType: 'STRING' },
      { id: 'event_timestamp', name: 'event_timestamp', dataType: 'TIMESTAMP' },
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
      { id: 'asset_id', name: 'asset_id', dataType: 'STRING' },
      { id: 'property_id', name: 'property_id', dataType: 'STRING' },
      { id: 'property_alias', name: 'property_alias', dataType: 'STRING' },
      { id: 'event_timestamp', name: 'event_timestamp', dataType: 'TIMESTAMP' },
      { id: 'quality', name: 'quality', dataType: 'STRING' },
      { id: 'resolution', name: 'resolution', dataType: 'STRING' },
      { id: 'sum_value', name: 'sum_value', dataType: 'DOUBLE' },
      { id: 'count_value', name: 'count_value', dataType: 'INTEGER' },
      { id: 'average_value', name: 'average_value', dataType: 'DOUBLE' },
      { id: 'maximum_value', name: 'maximum_value', dataType: 'DOUBLE' },
      { id: 'minimum_value', name: 'minimum_value', dataType: 'DOUBLE' },
      { id: 'stdev_value', name: 'stdev_value', dataType: 'DOUBLE' },
    ],
  },
];

// fields
export const timeIntervalProperty: AssetProperty = {
  id: 'timeInterval',
  name: 'Time Interval',
  dataType: 'STRING',
};

// queryOptions
export const whereOperators = [
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: 'LIKE', value: 'LIKE' },
  { label: 'IN', value: 'IN' },
  { label: 'BETWEEN', value: 'BETWEEN' },
  // { label: 'IS NULL', value: 'IS NULL' },
  // { label: 'IS NOT NULL', value: 'IS NOT NULL' },
  // { label: 'IS NAN', value: 'IS NAN' },
  // { label: 'IS NOT NAN', value: 'IS NOT NAN' },
];

export const timeIntervals: Array<SelectableValue<string>> = [
  { label: '1s', value: '1s' },
  { label: '10s', value: '10s' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '10m', value: '10m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
];

export const allFunctions: Array<{
  group: string;
  label: string;
  value: string;
}> = [
  { group: 'Aggregate', label: 'Raw Values', value: '' },
  { group: 'Aggregate', label: 'AVG', value: 'AVG' },
  { group: 'Aggregate', label: 'SUM', value: 'SUM' },
  { group: 'Aggregate', label: 'COUNT', value: 'COUNT' },
  { group: 'Aggregate', label: 'MAX', value: 'MAX' },
  { group: 'Aggregate', label: 'MIN', value: 'MIN' },
  { group: 'Aggregate', label: 'STDDEV', value: 'STDDEV' },
  { group: 'String', label: 'LENGTH', value: 'LENGTH' },
  // { group: 'String', label: 'CONCAT', value: 'CONCAT' },
  { group: 'String', label: 'SUBSTR', value: 'SUBSTR' },
  { group: 'String', label: 'UPPER', value: 'UPPER' },
  { group: 'String', label: 'LOWER', value: 'LOWER' },
  { group: 'String', label: 'TRIM', value: 'TRIM' },
  { group: 'String', label: 'LTRIM', value: 'LTRIM' },
  { group: 'String', label: 'RTRIM', value: 'RTRIM' },
  // { group: 'String', label: 'STR_REPLACE', value: 'STR_REPLACE' },
  { group: 'Math', label: 'POWER', value: 'POWER' },
  { group: 'Math', label: 'ROUND', value: 'ROUND' },
  { group: 'Math', label: 'FLOOR', value: 'FLOOR' },
  { group: 'DateTime', label: 'NOW', value: 'NOW' },
  { group: 'DateTime', label: 'DATE_ADD', value: 'DATE_ADD' },
  { group: 'DateTime', label: 'DATE_SUB', value: 'DATE_SUB' },
  { group: 'DateTime', label: 'TIMESTAMP_ADD', value: 'TIMESTAMP_ADD' },
  { group: 'DateTime', label: 'TIMESTAMP_SUB', value: 'TIMESTAMP_SUB' },
  { group: 'DateTime', label: 'CAST', value: 'CAST' },
  { group: 'DateTime', label: 'TO_DATE', value: 'TO_DATE' },
  { group: 'DateTime', label: 'TO_TIMESTAMP', value: 'TO_TIMESTAMP' },
  { group: 'DateTime', label: 'TO_TIME', value: 'TO_TIME' },
  // { group: 'Null', label: 'COALESCE', value: 'COALESCE' },
];

export const DATE_FUNCTIONS = ['DATE_ADD', 'DATE_SUB', 'TIMESTAMP_ADD', 'TIMESTAMP_SUB'];

export function isDateFunction(funcName?: string): boolean {
  return funcName ? DATE_FUNCTIONS.includes(funcName) : false;
}

export function isCastFunction(funcName?: string): boolean {
  return funcName === 'CAST';
}

export function isNowFunction(funcName?: string): boolean {
  return funcName === 'NOW';
}

// tooltipMessages.ts
export const tooltipMessages: Record<string, string> = {
  FROM: 'Select the view to query data from.',
  SELECT: 'Choose the fields or columns you want to retrieve in the result.',
  WHERE: 'Filter rows based on specific conditions.',
  'GROUP BY': 'Select one or more columns to group your query by',
  'ORDER BY': 'Sort the result set by one or more columns.',
  LIMIT: 'Restrict the number of records returned by the query.',
};
