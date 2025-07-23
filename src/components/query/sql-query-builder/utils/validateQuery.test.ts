import { validateQuery } from './validateQuery';
import { SitewiseQueryState, defaultSitewiseQueryState } from '../types';

describe('validateQuery', () => {
  it('should return no errors for a valid query', () => {
    const validQuery: SitewiseQueryState = {
      ...defaultSitewiseQueryState,
      selectedAssetModel: 'asset',
      selectFields: [{ column: 'asset_id' }],
    };

    const errors = validateQuery(validQuery);
    expect(errors).toEqual([]);
  });

  it('should return error if no selectFields', () => {
    const invalidQuery: SitewiseQueryState = {
      ...defaultSitewiseQueryState,
      selectedAssetModel: 'asset',
      selectFields: [],
    };

    const errors = validateQuery(invalidQuery);
    expect(errors).toContain('At least one column must be selected in SELECT clause.');
  });

  it('should return error if selectFields has no valid column', () => {
    const invalidQuery: SitewiseQueryState = {
      ...defaultSitewiseQueryState,
      selectedAssetModel: 'asset',
      selectFields: [{ column: '' }],
    };

    const errors = validateQuery(invalidQuery);
    expect(errors).toContain('At least one column must be selected in SELECT clause.');
  });

  it('should return error if selectedAssetModel is missing', () => {
    const invalidQuery: SitewiseQueryState = {
      ...defaultSitewiseQueryState,
      selectedAssetModel: '',
      selectFields: [{ column: 'asset_id' }],
    };

    const errors = validateQuery(invalidQuery);
    expect(errors).toContain('A source (e.g., asset model or table) must be specified in the FROM clause.');
  });

  it('should return error if a WHERE condition has column but missing operator or value', () => {
    const query: SitewiseQueryState = {
      ...defaultSitewiseQueryState,
      selectedAssetModel: 'asset',
      selectFields: [{ column: 'asset_id' }],
      whereConditions: [{ column: 'asset_name', operator: '', value: '' }],
    };

    const errors = validateQuery(query);
    expect(errors).toContain(
      'Each WHERE condition must include both an operator and a value when a column is selected.'
    );
  });

  it('should ignore WHERE condition if column is not provided', () => {
    const query: SitewiseQueryState = {
      ...defaultSitewiseQueryState,
      selectedAssetModel: 'asset',
      selectFields: [{ column: 'asset_id' }],
      whereConditions: [{ column: '', operator: '', value: '' }],
    };

    const errors = validateQuery(query);
    expect(errors).toEqual([]);
  });
});
