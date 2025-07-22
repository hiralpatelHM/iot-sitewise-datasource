import { SitewiseQueryState, mockAssetModels } from '../types';

export const generateQueryPreview = async (queryState: SitewiseQueryState): Promise<string> => {
  const selectedModelForPreview = mockAssetModels.find((model) => model.id === queryState.selectedAssetModel);
  const availablePropertiesForPreview = selectedModelForPreview?.properties || [];

  if (!queryState.selectedAssetModel) {
    return 'Select an asset model to build your query';
  }

  const selectedProperties = queryState.selectFields
    .filter((field) => field.column)
    .map((field) => {
      const property = availablePropertiesForPreview.find((p) => p.id === field.column);
      let name = property?.name || field.column;
      if (field.aggregation) {
        name = `${field.aggregation}(${name})`;
      }
      if (field.alias) {
        name += ` AS ${field.alias}`;
      }
      return name;
    });

  let sqlPreview = `SELECT ${
    selectedProperties.length > 0 ? selectedProperties.join(', ') : '*'
  } FROM ${queryState.selectedAssetModel}`;

  if (queryState.whereConditions && queryState.whereConditions.length > 0) {
    const conditions = queryState.whereConditions
      .filter((c) => c.column && c.operator && c.value !== undefined && c.value !== null)
      .map((c, i) => {
        const isVariable = typeof c.value === 'string' && c.value.startsWith('$');
        const value = isVariable ? c.value : `'${c.value}'`;
        const condition = `${c.column} ${c.operator} ${value}`;
        return i === 0 ? condition : `${c.logicalOperator || 'AND'} ${condition}`;
      });
    if (conditions.length > 0) {
      sqlPreview += `\nWHERE ${conditions.join(' ')}`;
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

  if (queryState.limit) {
    sqlPreview += `\nLIMIT ${queryState.limit}`;
  }

  return sqlPreview;
};
