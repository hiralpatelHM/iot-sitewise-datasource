import { SitewiseQueryState } from '../types';

export const validateQuery = (state: SitewiseQueryState): string[] => {
  const errors: string[] = [];

  if (!state.selectFields?.length || !state.selectFields.some((field) => field.column)) {
    errors.push('At least one column must be selected in SELECT clause.');
  }

  if (!state.selectedAssetModel) {
    errors.push('A source (e.g., asset model or table) must be specified in the FROM clause.');
  }

  if (
    state.whereConditions?.some(
      (cond) => cond.column && (!cond.operator || cond.value === undefined || cond.value === null)
    )
  ) {
    errors.push('Each WHERE condition must include both an operator and a value when a column is selected.');
  }

  return errors;
};
