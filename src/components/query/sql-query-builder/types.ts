export interface SqlQueryBuilderProps {
  query: any;
  onChange: (query: any) => void;
  datasource: any;
}

export interface SelectField {
  column: string;
  aggregation?: string;
  alias?: string;
}

export interface WhereCondition {
  column: string;
  operator: string;
  value: string;
  logicalOperator: 'AND' | 'OR';
}

export interface SitewiseQueryState {
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
