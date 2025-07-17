import React, { useEffect, useRef, useState } from 'react';
import { Select, Input, Alert, InlineLabel } from '@grafana/ui';
// import { QueryType } from 'types';
import { EditorField, EditorFieldGroup, EditorRow, EditorRows } from '@grafana/plugin-ui';
import {
  SitewiseQueryState,
  SqlQueryBuilderProps,
  AssetProperty,
  mockAssetModels,
  timeIntervalProperty,
  timeIntervals,
} from './types';
import { FromSQLBuilder } from './FromSQLBuilderClause';
import { SelectSQLBuilderClause } from './SelectSQLBuilderClause';
import { WhereSQLBuilderClause } from './WhereSQLBuilderClause';
// import { GroupBySQLBuilderClause } from './GroupBySQLBuilderClause';

export function SqlQueryBuilder({ query, onChange }: SqlQueryBuilderProps) {
  const [queryState, setQueryState] = useState<SitewiseQueryState>(query);
  const queryStateRef = useRef(queryState);
  useEffect(() => {
    queryStateRef.current = queryState;
    onChange(queryState);
  }, [queryState]);

  const selectedModel = mockAssetModels.find((model) => model.id === queryState.selectedAssetModel);
  const availableProperties = selectedModel?.properties || [];
  const availablePropertiesForGrouping: AssetProperty[] = [timeIntervalProperty, ...availableProperties];

  const updateQuery = async (newState: Partial<SitewiseQueryState>) => {
    const updatedState = { ...queryStateRef.current, ...newState };
    const rawSQL = await generateQueryPreview(updatedState);
    setQueryState({ ...updatedState, rawSQL });
  };

  const generateQueryPreview = async (updatedState: SitewiseQueryState): Promise<string> => {
    if (!updatedState.selectedAssetModel) {
      return 'Select an asset model to build your query';
    }

    const selectedProperties = updatedState.selectFields
      .filter((field) => field.column)
      .map((field) => {
        const property = availableProperties.find((p) => p.id === field.column);
        let name = property?.name || field.column;
        if (field.aggregation) {
          name = `${field.aggregation}(${name})`;
        }
        if (field.alias) {
          name += ` AS ${field.alias}`;
        }
        return name;
      });

    let preview = `SELECT ${selectedProperties.join(', ')} FROM ${updatedState.selectedAssetModel}`;

    if (updatedState.whereConditions.length > 0) {
      const conditions = updatedState.whereConditions
        .filter((c) => c.column && c.value)
        .map((c, i) => {
          const isVariable = c.value.startsWith('$');
          const value = isVariable ? c.value : `${c.value}`;
          const condition = `${c.column} ${c.operator} "${value}"`;
          return i === 0 ? condition : `${c.logicalOperator} ${condition}`;
        });
      preview += `\nWHERE ${conditions.join(' ')}`;
    }

    if (updatedState.groupByTags.length > 0) {
      preview += `\nGROUP BY ${updatedState.groupByTags.map((tag) => `${tag}`).join(', ')}`;
      if (updatedState.groupByTime) {
        preview += `, time(${updatedState.groupByTime})`;
      }
    }

    preview += `\nORDER BY time ${updatedState.orderBy}`;

    if (updatedState.limit) {
      preview += `\nLIMIT ${updatedState.limit}`;
    }

    return preview;
  };

  return (
    <div className="gf-form-group">
      {/* FROM Section */}
      <EditorRows>
        <FromSQLBuilder
          assetModels={mockAssetModels}
          selectedModelId={queryState.selectedAssetModel || ''}
          updateQuery={updateQuery}
        />

        {/* SELECT Section */}
        <SelectSQLBuilderClause
          selectFields={queryState.selectFields}
          updateQuery={updateQuery}
          availableProperties={availableProperties}
        />
        {/* WHERE Section */}
        <WhereSQLBuilderClause
          whereConditions={queryState.whereConditions}
          updateQuery={updateQuery}
          availableProperties={availableProperties}
        />

        {/* GROUP BY Section */}
        {/* <GroupBySQLBuilderClause
        availablePropertiesForGrouping={availablePropertiesForGrouping} // array of { id, name }
        groupByTags={queryState.groupByTags}
        groupByTime={queryState.groupByTime || ''}
        updateQuery={updateQuery}
      /> */}
        <EditorRow>
          <EditorFieldGroup>
            <EditorField label="" width={10}>
              <InlineLabel width="auto" style={{ color: '#rgb(110, 159, 255)', fontWeight: 'bold' }}>
                GROUP BY
              </InlineLabel>
            </EditorField>
            <EditorField label="" width={30}>
              <Select
                options={availablePropertiesForGrouping.map((prop) => ({
                  label: prop.name,
                  value: prop.id,
                }))}
                value={queryState.groupByTags}
                onChange={(options) =>
                  updateQuery({
                    groupByTags: options?.map((opt: any) => opt.value) || [],
                  })
                }
                placeholder="Select column..."
                isMulti
              />
            </EditorField>

            {Array.isArray(queryState.groupByTags) && queryState.groupByTags.includes('timeInterval') && (
              <EditorField label="" width={20}>
                <Select
                  options={[{ label: 'No grouping', value: '' }, ...timeIntervals]}
                  value={queryState.groupByTime}
                  onChange={(option) => updateQuery({ groupByTime: option?.value || '' })}
                  placeholder="Select interval..."
                />
              </EditorField>
            )}
          </EditorFieldGroup>
        </EditorRow>

        {/* OUTPUT OPTIONS Section */}
        <EditorRow>
          <EditorFieldGroup>
            <EditorField label="" width={10}>
              <InlineLabel width="auto" style={{ color: '#rgb(110, 159, 255)', fontWeight: 'bold' }}>
                ORDER BY
              </InlineLabel>
            </EditorField>
            <EditorField label="" width={25}>
              <Select
                options={[
                  { label: 'Ascending', value: 'ASC' },
                  { label: 'Descending', value: 'DESC' },
                ]}
                value={queryState.orderBy}
                onChange={(option) => updateQuery({ orderBy: option?.value as 'ASC' | 'DESC' })}
              />
            </EditorField>
            <EditorField label="" width={8}>
              <InlineLabel width="auto" style={{ color: '#rgb(110, 159, 255)', fontWeight: 'bold' }}>
                LIMIT
              </InlineLabel>
            </EditorField>

            <EditorField label="" width={25}>
              <Input
                type="number"
                value={queryState.limit}
                onChange={(e) => updateQuery({ limit: parseInt(e.currentTarget.value, 10) || 1000 })}
              />
            </EditorField>

            {/* <EditorField
                    label="Timezone"
                    width={30}
                >
                    <Select
                    options={timezones}
                    value={queryState.timezone}
                    onChange={(option) => updateQuery({ timezone: option?.value || 'UTC' })}
                    />
                </EditorField> */}
          </EditorFieldGroup>
        </EditorRow>
      </EditorRows>

      {/* Query Preview */}
      <Alert title="Query Preview" severity="info">
        <pre style={{ background: 'transparent', border: 'none', fontSize: '12px' }}>{queryState.rawSQL}</pre>
      </Alert>
    </div>
  );
}
