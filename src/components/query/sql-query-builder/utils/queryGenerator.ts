import {
  SitewiseQueryState,
  mockAssetModels,
  HavingCondition,
  SelectField,
  WhereCondition,
  isFunctionOfType,
} from '../types';

// -- Helpers --
const quote = (val: any): string | undefined =>
  typeof val === 'string' && val.trim() !== '' && !val.startsWith('$') ? `'${val}'` : val;

const buildSelectClause = (fields: SelectField[], properties: any[]): string => {
  const clauses = fields
    .filter(({ column }) => column)
    .map((field) => {
      const base = properties.find((p) => p.id === field.column)?.name || field.column;
      const { aggregation, functionArg, functionArgValue, functionArgValue2, alias } = field || '';

      let expr = base;

      if (!aggregation) {
        return alias ? `${expr} AS "${alias}"` : expr;
      }

      switch (true) {
        case isFunctionOfType(aggregation, 'date'):
          expr = `${aggregation}(${functionArg ?? '1d'}, ${functionArgValue ?? '0'}, ${base})`;
          break;
        case isFunctionOfType(aggregation, 'math') || isFunctionOfType(aggregation, 'coalesce'):
          expr = `${aggregation}(${base}, ${functionArgValue ?? '0'})`;
          break;
        case isFunctionOfType(aggregation, 'str'):
          expr =
            aggregation === 'STR_REPLACE'
              ? `${aggregation}(${base}, '${functionArgValue}', '${functionArgValue2}')`
              : `${aggregation}(${base}, ${functionArgValue}, ${functionArgValue2})`;
          break;
        case isFunctionOfType(aggregation, 'concat'):
          expr = `${aggregation}(${base},${functionArg})`;
          break;
        case isFunctionOfType(aggregation, 'cast'):
          expr = `CAST(${base} AS ${functionArg})`;
          break;
        case isFunctionOfType(aggregation, 'now'):
          expr = 'NOW()';
          break;
        default:
          expr = `${aggregation}(${base})`;
      }

      return alias ? `${expr} AS "${alias}"` : expr;
    });

  return `SELECT ${clauses.length ? clauses.join(', ') : '*'}`;
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

  const parts = validConditions.map((c) => `${c.aggregation}(${c.column}) ${c.operator} ${Number(c.value)}`);

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
