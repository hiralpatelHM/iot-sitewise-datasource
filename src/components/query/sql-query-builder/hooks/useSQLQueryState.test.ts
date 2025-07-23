import { renderHook, act, waitFor } from '@testing-library/react';
import { useSQLQueryState } from './useSQLQueryState';
import * as validateModule from '../utils/validateQuery';
import * as generatorModule from '../utils/queryGenerator';
import { SitewiseQueryState, mockAssetModels, timeIntervalProperty, defaultSitewiseQueryState } from '../types';

// Mocks
jest.mock('../utils/validateQuery', () => ({
  validateQuery: jest.fn(),
}));

jest.mock('../utils/queryGenerator', () => ({
  generateQueryPreview: jest.fn(),
}));

// Constants
const mockPreview = 'SELECT column FROM asset;';
const mockErrors = ['Missing WHERE condition'];

const mockQuery: SitewiseQueryState = {
  ...defaultSitewiseQueryState,
  selectedAssetModel: 'asset',
  selectedAssets: ['asset-1'],
  selectFields: [{ column: 'asset_name', aggregation: '', alias: 'name' }],
  whereConditions: [{ column: 'asset_id', operator: '=', value: '123' }],
  groupByTime: '1m',
  groupByTags: ['department'],
  orderByFields: [{ column: 'asset_name', direction: 'ASC' }],
  limit: 500,
  timezone: 'UTC',
  rawSQL: '',
};

describe('useSQLQueryState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validateModule.validateQuery as jest.Mock).mockReturnValue(mockErrors);
    (generatorModule.generateQueryPreview as jest.Mock).mockResolvedValue(mockPreview);
  });

  it('initializes with full query state', async () => {
    const onChange = jest.fn();

    const { result } = renderHook(() => useSQLQueryState({ initialQuery: mockQuery, onChange }));

    expect(result.current.queryState).toEqual(mockQuery);

    await waitFor(() => {
      expect(result.current.preview).toBe(mockPreview);
      expect(result.current.validationErrors).toEqual(mockErrors);
    });
  });

  it('updates query state and triggers validation + preview', async () => {
    const onChange = jest.fn();
    (generatorModule.generateQueryPreview as jest.Mock).mockResolvedValue('MOCK_PREVIEW');
    (validateModule.validateQuery as jest.Mock).mockReturnValue(['MOCK_ERROR']);

    const { result } = renderHook(() => useSQLQueryState({ initialQuery: mockQuery, onChange }));

    await act(async () => {
      result.current.setQueryState((prev) => ({
        ...prev,
        limit: 200,
      }));
    });

    await waitFor(() => {
      expect(result.current.preview).toBe('MOCK_PREVIEW');
      expect(result.current.validationErrors).toEqual(['MOCK_ERROR']);
    });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ limit: 200 }));
  });

  it('merges partial state in updateQuery and regenerates SQL', async () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useSQLQueryState({ initialQuery: mockQuery, onChange }));

    await act(async () => {
      await result.current.updateQuery({ timezone: 'Asia/Tokyo' });
    });

    expect(result.current.queryState.timezone).toBe('Asia/Tokyo');
    expect(result.current.queryState.rawSQL).toBe(mockPreview);
  });

  it('computes selectedModel and availablePropertiesForGrouping correctly', () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useSQLQueryState({ initialQuery: mockQuery, onChange }));

    const selectedModel = mockAssetModels.find((m) => m.id === 'asset');

    expect(result.current.selectedModel).toEqual(selectedModel);
    expect(result.current.availableProperties).toEqual(selectedModel?.properties);
    expect(result.current.availablePropertiesForGrouping).toEqual([
      timeIntervalProperty,
      ...(selectedModel?.properties ?? []),
    ]);
  });

  it('can update deeply nested fields like selectFields', async () => {
    const onChange = jest.fn();
    const { result } = renderHook(() => useSQLQueryState({ initialQuery: mockQuery, onChange }));

    await act(async () => {
      await result.current.updateQuery({
        selectFields: [{ column: 'asset_description', alias: 'desc' }],
      });
    });

    expect(result.current.queryState.selectFields).toEqual([{ column: 'asset_description', alias: 'desc' }]);
    expect(result.current.queryState.rawSQL).toBe(mockPreview);
  });
});
