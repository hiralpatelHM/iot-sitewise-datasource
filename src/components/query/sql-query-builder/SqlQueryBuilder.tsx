import React, { useEffect, useRef, useState } from 'react';
import { Alert } from '@grafana/ui';
import { EditorRows } from '@grafana/plugin-ui';
import {
  SitewiseQueryState,
  SqlQueryBuilderProps,
  AssetProperty,
  mockAssetModels,
  timeIntervalProperty,
} from './types';
import { FromSQLBuilder } from './FromSQLBuilderClause';
import { SelectSQLBuilderClause } from './SelectSQLBuilderClause';
import { WhereSQLBuilderClause } from './WhereSQLBuilderClause';
import { GroupBySQLBuilderClause } from './GroupBySQLBuilderClause';
import { LimitSQLBuilderClause } from './LimitSQLBuilderClause';
import { OrderBySQLBuilderClause } from './OrderBySQLBuilderClause';

export function SqlQueryBuilder({ query, onChange }: SqlQueryBuilderProps) {
  const [queryState, setQueryState] = useState<SitewiseQueryState>(query);
  const queryStateRef = useRef(queryState);
  useEffect(() => {
    queryStateRef.current = queryState;
    onChange(queryState);
  }, [queryState, onChange]);

  const selectedModel = mockAssetModels.find((model) => model.id === queryState.selectedAssetModel);
  const availableProperties = selectedModel?.properties || [];
  const availablePropertiesForGrouping: AssetProperty[] = [timeIntervalProperty, ...availableProperties];

  const updateQuery = async (newState: Partial<SitewiseQueryState>) => {
    const updatedState = { ...queryStateRef.current, ...newState };
    const rawSQL = await generateQueryPreview(updatedState);
    setQueryState({ ...updatedState, rawSQL });
  };

  const generateQueryPreview = async (updatedState: SitewiseQueryState): Promise<string> => {
    console.log('😃 ~ generateQueryPreview ~ updatedState:', updatedState);
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

    if (updatedState.orderByFields && updatedState.orderByFields.length > 0) {
      const orderByParts = updatedState.orderByFields
        .filter((f) => f.column)
        .map((f) => `${f.column} ${f.direction}`)
        .join(', ');

      if (orderByParts) {
        preview += `\nORDER BY ${orderByParts}`;
      }
    }

    if (updatedState.limit) {
      preview += `\nLIMIT ${updatedState.limit}`;
    }

    return preview;
  };

  return (
    <div className="gf-form-group">
      <EditorRows>
        {/* FROM Section */}
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
        <GroupBySQLBuilderClause
          availablePropertiesForGrouping={availablePropertiesForGrouping} // array of { id, name }
          groupByTags={queryState.groupByTags}
          groupByTime={queryState.groupByTime || ''}
          updateQuery={updateQuery}
        />

        {/* ORDER BY Section */}
        <OrderBySQLBuilderClause
          orderByFields={queryState.orderByFields}
          updateQuery={updateQuery}
          availableProperties={availableProperties}
        />

        {/* LIMIT Section */}
        <LimitSQLBuilderClause limit={queryState.limit} updateQuery={updateQuery} />

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
      </EditorRows>

      {/* Query Preview */}
      <Alert title="Query Preview" severity="info">
        <pre style={{ background: 'transparent', border: 'none', fontSize: '12px' }}>{queryState.rawSQL}</pre>
      </Alert>
    </div>
  );
}
