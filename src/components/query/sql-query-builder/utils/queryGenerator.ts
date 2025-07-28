import {
  SitewiseQueryState,
  isCastFunction,
  isDateFunction,
  isNowFunction,
  mockAssetModels,
  HavingCondition,
  SelectField,
  WhereCondition,
} from '../types';

// -- Helpers --
const quote = (val: any): string => (typeof val === 'string' && !val.startsWith('$') ? `'${val}'` : val);

const buildSelectClause = (fields: SelectField[], properties: any[]): string => {
  const parts = fields
    .filter((field) => field.column)
    .map((field) => {
      const prop = properties.find((p) => p.id === field.column);
      const base = prop?.name || field.column || 'unknown';
      let expr = base;

      if (isDateFunction(field.aggregation)) {
        const interval = field.functionArg ?? '1d';
        const offset = field.functionArgValue ?? '0';
        expr = `${field.aggregation}(${interval}, ${offset}, ${base})`;
      } else if (isCastFunction(field.aggregation) && field.functionArg) {
        expr = `CAST(${base} AS ${field.functionArg})`;
      } else if (isNowFunction(field.aggregation)) {
        expr = `NOW()`;
      } else if (field.aggregation) {
        expr = `${field.aggregation}(${base})`;
      }

      if (field.alias) {
        expr += ` AS "${field.alias}"`;
      }

      return expr;
    });

  return `SELECT ${parts.length > 0 ? parts.join(', ') : '*'}`;
};

const buildWhereClause = (conditions: WhereCondition[] = []): string => {
  const parts = conditions
    .filter((c) => c.column && c.operator && c.value !== undefined && c.value !== null)
    .map((c, i, arr) => {
      const val1 = quote(c.value);
      const val2 = quote(c.value2);
      const condition =
        c.operator === 'BETWEEN' && c.value2
          ? `${c.column} ${c.operator} ${val1} ${c.operator2} ${val2}`
          : `${c.column} ${c.operator} ${val1}`;
      const logic = i < arr.length - 1 ? `${c.logicalOperator ?? 'AND'}` : '';
      return `${condition} ${logic}`;
    });

  return parts.length > 0 ? `WHERE ${parts.join(' ')}` : '';
};

const buildGroupByClause = (tags: string[] = [], time?: string): string => {
  if (!tags.length && !time) {
    return '';
  }
  const parts = [...tags];
  if (time) {
    parts.push(`time(${time})`);
  }
  return `GROUP BY ${parts.join(', ')}`;
};

const buildHavingClause = (conditions: HavingCondition[] = []): string => {
  const validConditions = conditions.filter((c) => c.column?.trim() && c.aggregation?.trim() && c.operator?.trim());

  if (!validConditions.length) {
    return '';
  }

  const parts = validConditions.map((c) => `${c.aggregation}(${c.column}) ${c.operator} ${quote(c.value)}`);

  return (
    'HAVING ' +
    parts.map((expr, i) => (i === 0 ? expr : `${validConditions[i - 1].logicalOperator ?? 'AND'} ${expr}`)).join(' ')
  );
};

const buildOrderByClause = (fields: Array<{ column: string; direction: string }> = []): string => {
  const parts = fields.filter((f) => f.column && f.direction).map((f) => `${f.column} ${f.direction}`);
  return parts.length ? `ORDER BY ${parts.join(', ')}` : '';
};

const buildLimitClause = (limit: number | undefined): string => `LIMIT ${typeof limit === 'number' ? limit : 100}`;

// -- Main --
export const generateQueryPreview = async (queryState: SitewiseQueryState): Promise<string> => {
  if (!queryState.selectedAssetModel) {
    return 'Select an asset model to build your query';
  }

  const model = mockAssetModels.find((m) => m.id === queryState.selectedAssetModel);
  const properties = model?.properties || [];

  const selectClause = buildSelectClause(queryState.selectFields ?? [], properties);
  const whereClause = buildWhereClause(queryState.whereConditions ?? []);
  const groupByClause = buildGroupByClause(queryState.groupByTags ?? [], queryState.groupByTime);
  const havingClause = buildHavingClause(queryState.havingConditions ?? []);
  const orderByClause = buildOrderByClause(queryState.orderByFields ?? []);
  const limitClause = buildLimitClause(queryState.limit);

  return [
    selectClause,
    `FROM ${queryState.selectedAssetModel}`,
    whereClause,
    groupByClause,
    havingClause,
    orderByClause,
    limitClause,
  ]
    .filter(Boolean)
    .join('\n');
};
