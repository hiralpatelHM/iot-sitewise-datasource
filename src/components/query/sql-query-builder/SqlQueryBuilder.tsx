import React from 'react'; // No need for useEffect, useRef, useState directly in component
import { EditorRows } from '@grafana/plugin-ui';
import { SqlQueryBuilderProps, mockAssetModels } from './types';
import { FromClauseEditor } from './clause/FromClauseEditor';
import { SelectClauseEditor } from './clause/SelectClauseEditor';
import { WhereClauseEditor } from './clause/WhereClauseEditor';
import { GroupBySQLBuilderClause } from './GroupBySQLBuilderClause';
import { LimitSQLBuilderClause } from './LimitSQLBuilderClause';
import { OrderBySQLBuilderClause } from './OrderBySQLBuilderClause';
import { QueryPreviewDisplay } from './QueryPreviewDisplay';
import { useSQLQueryState } from './hooks/useSQLQueryState';

export function SqlQueryBuilder({ query, onChange }: SqlQueryBuilderProps) {
  const { queryState, preview, validationErrors, updateQuery, availableProperties, availablePropertiesForGrouping } =
    useSQLQueryState({
      initialQuery: query,
      onChange: onChange,
    });

  return (
    <div className="gf-form-group">
      <EditorRows>
        {/* FROM Section */}
        <FromClauseEditor
          assetModels={mockAssetModels}
          selectedModelId={queryState.selectedAssetModel || ''}
          updateQuery={updateQuery}
        />

        {/* SELECT Section */}
        <SelectClauseEditor
          selectFields={queryState.selectFields}
          updateQuery={updateQuery}
          availableProperties={availableProperties}
        />

        {/* WHERE Section */}
        <WhereClauseEditor
          whereConditions={queryState.whereConditions}
          updateQuery={updateQuery}
          availableProperties={availableProperties}
        />

        {/* GROUP BY Section */}
        <GroupBySQLBuilderClause
          availablePropertiesForGrouping={availablePropertiesForGrouping}
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

        {/* Timezone (if needed, uncomment and connect to queryState.timezone) */}
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
      <QueryPreviewDisplay preview={preview} errors={validationErrors} />
    </div>
  );
}
