import { generateQueryPreview } from './queryGenerator';
import { SitewiseQueryState } from '../types';

describe('generateQueryPreview', () => {
  it('returns message when asset model is not selected', async () => {
    const query: SitewiseQueryState = {
      selectedAssetModel: '',
      selectedAssets: [],
      selectFields: [],
      whereConditions: [],
      groupByTags: [],
      orderByFields: [],
      timezone: 'Asia/Tokyo',
      rawSQL: '',
    };

    const preview = await generateQueryPreview(query);
    expect(preview).toBe('Select an asset model to build your query');
  });

  it('generates minimal SELECT query', async () => {
    const query: SitewiseQueryState = {
      selectedAssetModel: 'model-1',
      selectedAssets: [],
      selectFields: [{ column: 'prop-1', aggregation: '', alias: '' }],
      whereConditions: [],
      groupByTags: [],
      orderByFields: [],
      timezone: 'Asia/Tokyo',
      rawSQL: '',
    };

    const preview = await generateQueryPreview(query);
    expect(preview).toContain('SELECT');
    expect(preview).toContain('FROM model-1');
  });

  it('includes WHERE clause with logical operator', async () => {
    const query: SitewiseQueryState = {
      selectedAssetModel: 'model-1',
      selectedAssets: [],
      selectFields: [{ column: 'prop-1', aggregation: '', alias: '' }],
      whereConditions: [
        { column: 'prop-1', operator: '=', value: '100', logicalOperator: 'AND' },
        { column: 'prop-2', operator: '!=', value: '200' },
      ],
      groupByTags: [],
      orderByFields: [],
      timezone: 'Asia/Tokyo',
      rawSQL: '',
    };

    const preview = await generateQueryPreview(query);
    expect(preview).toContain("WHERE prop-1 = '100' AND prop-2 != '200'");
  });

  it('includes aggregation and alias in SELECT', async () => {
    const query: SitewiseQueryState = {
      selectedAssetModel: 'model-1',
      selectedAssets: [],
      selectFields: [
        { column: 'prop-1', aggregation: 'AVG', alias: 'avg1' },
        { column: 'prop-2', aggregation: 'MAX', alias: '' },
      ],
      whereConditions: [],
      groupByTags: [],
      orderByFields: [],
      timezone: 'Asia/Tokyo',
      rawSQL: '',
    };

    const preview = await generateQueryPreview(query);
    expect(preview).toContain('AVG(');
    expect(preview).toContain('AS "avg1"');
    expect(preview).toContain('MAX(');
  });

  it('includes GROUP BY and ORDER BY clauses', async () => {
    const query: SitewiseQueryState = {
      selectedAssetModel: 'model-1',
      selectedAssets: [],
      selectFields: [{ column: 'prop-1', aggregation: '', alias: '' }],
      whereConditions: [],
      groupByTags: ['prop-1'],
      groupByTime: '1h',
      orderByFields: [{ column: 'prop-1', direction: 'DESC' }],
      timezone: 'Asia/Tokyo',
      rawSQL: '',
    };

    const preview = await generateQueryPreview(query);
    expect(preview).toContain('GROUP BY prop-1, time(1h)');
    expect(preview).toContain('ORDER BY prop-1 DESC');
  });

  it('includes LIMIT clause', async () => {
    const query: SitewiseQueryState = {
      selectedAssetModel: 'model-1',
      selectedAssets: [],
      selectFields: [{ column: 'prop-1', aggregation: '', alias: '' }],
      whereConditions: [],
      groupByTags: [],
      orderByFields: [],
      limit: 10,
      timezone: 'Asia/Tokyo',
      rawSQL: '',
    };

    const preview = await generateQueryPreview(query);
    expect(preview).toContain('LIMIT 10');
  });

  it('handles CAST, NOW and DATE_BIN functions', async () => {
    const query: SitewiseQueryState = {
      selectedAssetModel: 'model-1',
      selectedAssets: [],
      selectFields: [
        {
          column: 'prop-1',
          aggregation: 'CAST',
          functionArg: 'DOUBLE',
        },
        {
          column: 'prop-2',
          aggregation: 'NOW',
          functionArg: '',
        },
        {
          column: 'prop-3',
          aggregation: 'DATE_ADD',
          functionArg: '1d',
          functionArgValue: '0',
        },
      ],
      whereConditions: [],
      groupByTags: [],
      orderByFields: [],
      timezone: 'Asia/Tokyo',
      rawSQL: '',
    };

    const preview = await generateQueryPreview(query);
    expect(preview).toContain('CAST(prop-1 AS DOUBLE)');
    expect(preview).toContain('NOW()');
    expect(preview).toContain('DATE_ADD(1d, 0, prop-3)');
  });
});
