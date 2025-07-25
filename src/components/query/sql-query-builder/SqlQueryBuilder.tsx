import React from 'react'; // No need for useEffect, useRef, useState directly in component
import { EditorRows, EditorRow } from '@grafana/plugin-ui';
import { SqlQueryBuilderProps, mockAssetModels } from './types';
import { FromClauseEditor } from './clauses/FromClauseEditor';
import { SelectClauseEditor } from './clauses/SelectClauseEditor';
import { WhereClauseEditor } from './clauses/WhereClauseEditor';
import { GroupByClauseEditor } from './clauses/GroupByClauseEditor';
import { LimitClauseEditor } from './clauses/LimitClauseEditor';
import { OrderByClauseEditor } from './clauses/OrderByClauseEditor';
import { QueryPreviewDisplay } from './QueryPreviewDisplay';
import { useSQLQueryState } from './hooks/useSQLQueryState';

export function SqlQueryBuilder({ builderState, onChange }: SqlQueryBuilderProps) {
  const { queryState, preview, validationErrors, updateQuery, availableProperties, availablePropertiesForGrouping } =
    useSQLQueryState({
      initialQuery: builderState,
      onChange: onChange,
    });

  return (
    <div className="gf-form-group">
      <EditorRows>
        <EditorRow>
          {/* FROM Section */}
          <FromClauseEditor
            assetModels={mockAssetModels}
            selectedModelId={queryState.selectedAssetModel || ''}
            updateQuery={updateQuery}
          />

          {/* Limit Clause */}
          <LimitClauseEditor limit={queryState.limit} updateQuery={updateQuery} />
        </EditorRow>

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
        <GroupByClauseEditor
          availablePropertiesForGrouping={availablePropertiesForGrouping}
          groupByTags={queryState.groupByTags}
          groupByTime={queryState.groupByTime || ''}
          updateQuery={updateQuery}
        />

        {/* ORDER BY Section */}
        <OrderByClauseEditor
          orderByFields={queryState.orderByFields}
          updateQuery={updateQuery}
          availableProperties={availableProperties}
        />

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
