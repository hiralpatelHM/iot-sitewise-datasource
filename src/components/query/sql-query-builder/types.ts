import { SelectableValue } from '@grafana/data';

export interface SqlQueryBuilderProps {
  query: any;
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
  value2?: string;
  logicalOperator: 'AND' | 'OR';
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
  dataType: 'STRING' | 'INTEGER' | 'DOUBLE' | 'BOOLEAN' | 'STRUCT';
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

export const mockAssets: Asset[] = [
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
  { label: 'IS NULL', value: 'IS NULL' },
  { label: 'IS NOT NULL', value: 'IS NOT NULL' },
  { label: 'IS NAN', value: 'IS NAN' },
  { label: 'IS NOT NAN', value: 'IS NOT NAN' },
];

export const aggregationFunctions = [
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

export const timeIntervals: Array<SelectableValue<string>> = [
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
  { group: 'String', label: 'CONCAT', value: 'CONCAT' },
  { group: 'String', label: 'SUBSTR', value: 'SUBSTR' },
  { group: 'String', label: 'UPPER', value: 'UPPER' },
  { group: 'String', label: 'LOWER', value: 'LOWER' },
  { group: 'String', label: 'TRIM', value: 'TRIM' },
  { group: 'String', label: 'LTRIM', value: 'LTRIM' },
  { group: 'String', label: 'RTRIM', value: 'RTRIM' },
  { group: 'String', label: 'STR_REPLACE', value: 'STR_REPLACE' },
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
  { group: 'Null', label: 'COALESCE', value: 'COALESCE' },
];

export const DATE_FUNCTIONS = ['DATE_ADD', 'DATE_SUB', 'TIMESTAMP_ADD', 'TIMESTAMP_SUB'];

export function isDateFunction(funcName?: string): boolean {
  return funcName ? DATE_FUNCTIONS.includes(funcName) : false;
}

export function isCastFunction(funcName?: string): boolean {
  return funcName === 'CAST';
}

// tooltipMessages.ts
export const tooltipMessages: Record<string, string> = {
  FROM: 'Select the source table or measurement to query data from.',
  SELECT: 'Choose the fields or columns you want to retrieve in the result.',
  WHERE: 'Filter rows based on specific conditions.',
  'GROUP BY': 'Select one or more columns to group your query by',
  'ORDER BY': 'Sort the result set by one or more columns.',
  LIMIT: 'Restrict the number of records returned by the query.',
};
