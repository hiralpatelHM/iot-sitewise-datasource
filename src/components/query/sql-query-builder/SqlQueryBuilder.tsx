import React, { useState } from 'react';
import { Select, Input, IconButton, Tooltip, Alert } from '@grafana/ui';
import { QueryType } from 'types';
import { EditorField, EditorFieldGroup, EditorRow, EditorRows } from '@grafana/plugin-ui';
import {
  SitewiseQueryState,
  SqlQueryBuilderProps,
  WhereCondition,
  AssetProperty,
  mockAssetModels,
  timeIntervalProperty,
  whereOperators,
  timeIntervals,
} from './types';
import { FromSQLBuilder } from './FromSQLBuilderClause';
import { SelectSQLBuilderClause } from './SelectSQLBuilderClause';

export function SqlQueryBuilder({ query, onChange, datasource }: SqlQueryBuilderProps) {
  const [queryState, setQueryState] = useState<SitewiseQueryState>({
    selectedAssetModel: query.assetModel || '',
    selectedAssets: query.assets || [],
    selectFields: query.selectFields || [{ column: '', aggregation: '', alias: '' }],
    whereConditions: query.whereConditions || [{ column: '', operator: '', value: '', logicalOperator: 'AND' }],
    groupByTime: query.groupByTime || '',
    groupByTags: query.groupByTags || [],
    orderBy: query.orderBy === 'ASC' || query.orderBy === 'DESC' ? query.orderBy : 'ASC',
    limit: query.limit || 1000,
    timezone: query.timezone || 'UTC',
    rawQueryMode: false,
  });

  const selectedModel = mockAssetModels.find((model) => model.id === queryState.selectedAssetModel);
  const availableProperties = selectedModel?.properties || [];
  const availablePropertiesForGrouping: AssetProperty[] = [timeIntervalProperty, ...availableProperties];

  const updateQuery = (newState: Partial<SitewiseQueryState>) => {
    const updatedState = { ...queryState, ...newState };
    setQueryState(updatedState);
    const newQuery = {
      ...query,
      queryType: QueryType.ExecuteQuery,
      assetModel: updatedState.selectedAssetModel || '',
      assets: updatedState.selectedAssets,
      selectFields: updatedState.selectFields,
      whereConditions: updatedState.whereConditions,
      groupByTime: updatedState.groupByTime,
      groupByTags: updatedState.groupByTags,
      orderBy: updatedState.orderBy,
      limit: updatedState.limit,
      timezone: updatedState.timezone,
    };
    onChange(newQuery);
  };

  const addWhereCondition = () => {
    const newConditions = [
      ...queryState.whereConditions,
      { column: '', operator: '=', value: '', logicalOperator: 'AND' as const },
    ];
    updateQuery({ whereConditions: newConditions });
  };

  const removeWhereCondition = (index: number) => {
    const newConditions = queryState.whereConditions.filter((_, i) => i !== index);
    updateQuery({ whereConditions: newConditions });
  };

  const updateWhereCondition = (index: number, condition: Partial<WhereCondition>) => {
    const newConditions = [...queryState.whereConditions];
    newConditions[index] = { ...newConditions[index], ...condition };
    updateQuery({ whereConditions: newConditions });
  };

  const generateQueryPreview = () => {
    console.log('Generating query preview with state:', queryState);
    if (!queryState.selectedAssetModel) {
      return 'Select an asset model to build your query';
    }

    const selectedProperties = queryState.selectFields
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

    let preview = `Query: select ${selectedProperties.join(', ')} from ${queryState.selectedAssetModel}`;

    if (queryState.whereConditions.length > 0) {
      const conditions = queryState.whereConditions
        .filter((c) => c.column && c.value)
        .map((c, i) => {
          const condition = `${c.column} ${c.operator} "${c.value}"`;
          return i === 0 ? condition : `${c.logicalOperator} ${condition}`;
        });
      preview += `\nWHERE ${conditions.join(' ')}`;
    }

    if (queryState.groupByTags.length > 0) {
      preview += `\nGROUP BY ${queryState.groupByTags.map((tag) => `tag.${tag}`).join(', ')}`;
      if (queryState.groupByTime) {
        preview += `, time(${queryState.groupByTime})`;
      }
    }

    preview += `\nORDER BY time ${queryState.orderBy}`;

    if (queryState.limit) {
      preview += `\nLIMIT ${queryState.limit}`;
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
        <EditorRow>
          <EditorFieldGroup>
            {queryState.whereConditions.map((condition, index) => (
              <>
                {index > 0 && (
                  <EditorField key={`operator-${index}`} label="" width={15}>
                    <Select
                      options={[
                        { label: 'AND', value: 'AND' },
                        { label: 'OR', value: 'OR' },
                      ]}
                      value={condition.logicalOperator}
                      onChange={(option) =>
                        updateWhereCondition(index, {
                          logicalOperator: option?.value as 'AND' | 'OR',
                        })
                      }
                    />
                  </EditorField>
                )}
                <EditorField key={`field-${index}`} label={index === 0 ? 'Field' : ''} width={30}>
                  <Select
                    options={[
                      ...availableProperties.map((prop) => ({
                        label: prop.name,
                        value: prop.id,
                      })),
                    ]}
                    value={condition.column}
                    onChange={(option) => updateWhereCondition(index, { column: option?.value || '' })}
                    placeholder="Select field..."
                  />
                </EditorField>
                <EditorField key={`op-${index}`} label={index === 0 ? 'Operator' : ''} width={15}>
                  <Select
                    options={whereOperators}
                    value={condition.operator}
                    onChange={(option) => updateWhereCondition(index, { operator: option?.value || '=' })}
                  />
                </EditorField>
                <EditorField key={`value-${index}`} label={index === 0 ? 'Value' : ''} width={30}>
                  <Input
                    value={condition.value}
                    onChange={(e) => updateWhereCondition(index, { value: e.currentTarget.value })}
                    placeholder="Enter value..."
                  />
                </EditorField>

                <EditorField key={`action-${index}`} label={index === 0 ? 'Actions' : ''} width={10}>
                  <div>
                    <Tooltip content="Add condition">
                      <IconButton name="plus" onClick={addWhereCondition} aria-label="Add condition" />
                    </Tooltip>
                    {queryState.whereConditions.length > 1 && (
                      <Tooltip content="Remove condition">
                        <IconButton
                          name="minus"
                          onClick={() => removeWhereCondition(index)}
                          aria-label="Remove condition"
                        />
                      </Tooltip>
                    )}
                  </div>
                </EditorField>
              </>
            ))}
          </EditorFieldGroup>
        </EditorRow>

        {/* GROUP BY Section */}
        <EditorRow>
          <EditorFieldGroup>
            <EditorField label="Group By" width={30}>
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
                placeholder="Select properties..."
                isMulti
              />
            </EditorField>

            {Array.isArray(queryState.groupByTags) && queryState.groupByTags.includes('timeInterval') && (
              <EditorField label="Time Interval" width={20}>
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
            <EditorField label="Order By" width={25}>
              <Select
                options={[
                  { label: 'Ascending', value: 'ASC' },
                  { label: 'Descending', value: 'DESC' },
                ]}
                value={queryState.orderBy}
                onChange={(option) => updateQuery({ orderBy: option?.value as 'ASC' | 'DESC' })}
              />
            </EditorField>

            <EditorField label="Limit" width={25}>
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
        <pre style={{ background: 'transparent', border: 'none', fontSize: '12px' }}>{generateQueryPreview()}</pre>
      </Alert>
    </div>
  );
}
