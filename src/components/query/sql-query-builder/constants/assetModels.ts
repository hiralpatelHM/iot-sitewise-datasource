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
