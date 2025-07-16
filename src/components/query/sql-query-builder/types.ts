export interface AssetModel {
  id: string;
  name: string;
  properties: AssetProperty[];
}

export interface AssetProperty {
  id: string;
  name: string;
  dataType: 'STRING' | 'INTEGER' | 'DOUBLE' | 'BOOLEAN' | 'STRUCT';
  alias?: string;
}

export interface SelectField {
  column: string;
  aggregation: string;
  alias: string;
}

export interface SitewiseQueryState {
  selectedAssetModel: string;
  selectedAssets: string[];
  selectFields: SelectField[];
  whereConditions: WhereCondition[];
  groupByTime: string;
  groupByTags: string[];
  orderBy: 'ASC' | 'DESC';
  limit: number;
  timezone: string;
  rawQueryMode: boolean;
}

export interface WhereCondition {
  column: string;
  operator: string;
  value: string;
  logicalOperator: 'AND' | 'OR';
}

export const allFunctions: Array<{
  group: string;
  label: string;
  value: string;
}> = [
  { group: 'Aggregate', label: 'Raw Values', value: '' },
  { group: 'Aggregate', label: 'AVG', value: 'AVG' },
  { group: 'Aggregate', label: 'SUM', value: 'SUM' },
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
  { group: 'DateTime', label: 'YEAR', value: 'YEAR' },
  { group: 'DateTime', label: 'MONTH', value: 'MONTH' },
  { group: 'DateTime', label: 'DAY', value: 'DAY' },
  { group: 'DateTime', label: 'HOUR', value: 'HOUR' },
  { group: 'DateTime', label: 'MINUTE', value: 'MINUTE' },
  { group: 'DateTime', label: 'SECOND', value: 'SECOND' },
  { group: 'DateTime', label: 'TIMEZONE_HOUR', value: 'TIMEZONE_HOUR' },
  { group: 'DateTime', label: 'TIMEZONE_MINUTE', value: 'TIMEZONE_MINUTE' },
  { group: 'Null', label: 'COALESCE', value: 'COALESCE' },
];

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
