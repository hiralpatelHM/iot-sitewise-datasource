import { SitewiseQueryState, isCastFunction, isDateFunction, isNowFunction, mockAssetModels } from '../types';

export const generateQueryPreview = async (queryState: SitewiseQueryState): Promise<string> => {
  const selectedModelForPreview = mockAssetModels.find((model) => model.id === queryState.selectedAssetModel);
  const availablePropertiesForPreview = selectedModelForPreview?.properties || [];

  if (!queryState.selectedAssetModel) {
    return 'Select an asset model to build your query';
  }

  const selectedProperties =
    queryState.selectFields
      ?.filter((field) => !!field?.column)
      .map((field) => {
        const property = availablePropertiesForPreview.find((p) => p.id === field.column);
        const baseName = property?.name || field.column || 'unknown';
        let name = baseName;

        if (isDateFunction(field.aggregation)) {
          const interval = field.functionArg ?? '1d';
          const offset = field.functionArgValue ?? '0';
          name = `${field.aggregation}(${interval}, ${offset}, ${baseName})`;
        } else if (isCastFunction(field.aggregation) && field.functionArg) {
          name = `CAST(${baseName} AS ${field.functionArg})`;
        } else if (isNowFunction(field.aggregation)) {
          name = `NOW()`;
        } else if (field.aggregation) {
          name = `${field.aggregation}(${baseName})`;
        }
        if (field.alias) {
          name += ` AS "${field.alias}"`;
        }
        return name;
      }) ?? [];

  let sqlPreview = `SELECT ${
    selectedProperties.length > 0 ? selectedProperties.join(', ') : '*'
  } FROM ${queryState.selectedAssetModel}`;
  if (queryState.whereConditions && queryState.whereConditions.length > 0) {
    const conditions = queryState.whereConditions
      .filter((c) => c.column && c.operator && c.value !== undefined && c.value !== null)
      .map((c, i, arr) => {
        const [value, value2] = [c.value, c.value2].map((v) => (v?.startsWith?.('$') ? v : `'${v}'`));
        const condition =
          c.operator === 'BETWEEN' && c.value2
            ? `${c.column} ${c.operator} ${value} ${c.operator2} ${value2}`
            : `${c.column} ${c.operator} ${value}`;
        const logicalOp = i < arr.length - 1 ? `${c.logicalOperator ?? 'AND'}` : '';
        return `${condition} ${logicalOp} `;
      });
    if (conditions.length > 0) {
      sqlPreview += `\nWHERE ${conditions.join('')}`;
    }
  }

  if (queryState.groupByTags && queryState.groupByTags.length > 0) {
    let groupByParts = queryState.groupByTags.map((tag) => `${tag}`).join(', ');
    if (queryState.groupByTime) {
      groupByParts += groupByParts ? `, time(${queryState.groupByTime})` : `time(${queryState.groupByTime})`;
    }
    sqlPreview += `\nGROUP BY ${groupByParts}`;
  }

  if (queryState.orderByFields && queryState.orderByFields.length > 0) {
    const orderByParts = queryState.orderByFields
      .filter((f) => f.column && f.direction)
      .map((f) => `${f.column} ${f.direction}`)
      .join(', ');

    if (orderByParts) {
      sqlPreview += `\nORDER BY ${orderByParts}`;
    }
  }

  sqlPreview += `\nLIMIT ${typeof queryState.limit === 'number' ? queryState.limit : 100}`;

  return sqlPreview;
};
