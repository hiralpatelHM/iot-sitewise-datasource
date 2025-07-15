import React, { useState } from 'react';
import { Select, Input, IconButton, Tooltip, Alert } from '@grafana/ui';
import { QueryType } from 'types';
import { EditorField, EditorFieldGroup, EditorRow, EditorRows } from '@grafana/plugin-ui';
import { SqlQueryBuilderProps } from './types';
import { AssetProperty, mockAssetModels, mockAssets } from './constants/assetModels';
import { timeIntervalProperty } from './constants/fields';
import { whereOperators, aggregationFunctions, timeIntervals } from './constants/queryOptions';

interface SelectField {
  column: string;
  aggregation?: string;
  alias?: string;
}

interface WhereCondition {
  column: string;
  operator: string;
  value: string;
  logicalOperator: 'AND' | 'OR';
}

interface SitewiseQueryState {
  selectedAssetModel?: string;
  selectedAssets: string[];
  selectFields: SelectField[];
  whereConditions: WhereCondition[];
  groupByTime?: string;
  groupByTags: string[];
  orderBy: 'ASC' | 'DESC';
  limit?: number;
  timezone: string;
  rawQueryMode: boolean;
}

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
  const availableAssets = mockAssets.filter((asset) => asset.modelId === queryState.selectedAssetModel);
  const availableProperties = selectedModel?.properties || [];
  const availablePropertiesForGrouping: AssetProperty[] = [timeIntervalProperty, ...availableProperties];

  // Get all unique tag keys from selected assets
  const availableTagKeys = Array.from(
    new Set(
      availableAssets
        .filter((asset) => queryState.selectedAssets.includes(asset.id))
        .flatMap((asset) => Object.keys(asset.tags))
    )
  );

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

  const addSelectField = () => {
    const newFields = [...queryState.selectFields, { column: '', aggregation: '', alias: '' }];
    updateQuery({ selectFields: newFields });
  };

  const removeSelectField = (index: number) => {
    if (queryState.selectFields.length > 1) {
      const newFields = queryState.selectFields.filter((_, i) => i !== index);
      updateQuery({ selectFields: newFields });
    }
  };

  const updateSelectField = (index: number, field: Partial<SelectField>) => {
    const newFields = [...queryState.selectFields];
    newFields[index] = { ...newFields[index], ...field };
    updateQuery({ selectFields: newFields });
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
        <EditorRow>
          <EditorFieldGroup>
            <EditorField label="From" width={40}>
              <Select
                options={mockAssetModels.map((model) => ({
                  label: model.name,
                  value: model.id,
                }))}
                value={queryState.selectedAssetModel}
                onChange={(option) =>
                  updateQuery({
                    selectedAssetModel: option?.value || '',
                  })
                }
                placeholder="Select model..."
              />
            </EditorField>
          </EditorFieldGroup>
        </EditorRow>

        {/* SELECT Section */}
        {queryState.selectFields.map((field, index) => (
          <EditorRow key={index}>
            <EditorFieldGroup>
              <EditorField label={index === 0 ? 'Select' : ''} width={30}>
                <Select
                  options={availableProperties.map((prop) => ({
                    label: `${prop.name}`,
                    value: prop.id,
                  }))}
                  value={field.column}
                  onChange={(option) => updateSelectField(index, { column: option?.value || '' })}
                  placeholder="Select property..."
                />
              </EditorField>

              <EditorField label={index === 0 ? 'Function' : ''} width={30}>
                <Select
                  options={[
                    { label: 'Raw Values', value: '' },
                    ...aggregationFunctions.map((func) => ({
                      label: `${func.group}: ${func.label}`,
                      value: func.value,
                    })),
                  ]}
                  value={field.aggregation}
                  onChange={(option) => updateSelectField(index, { aggregation: option?.value || '' })}
                  placeholder="No function"
                />
              </EditorField>

              <EditorField label={index === 0 ? 'Alias' : ''} width={25}>
                <Input
                  value={field.alias}
                  onChange={(e) => updateSelectField(index, { alias: e.currentTarget.value })}
                  placeholder="Optional alias"
                />
              </EditorField>

              <EditorField label={index === 0 ? 'Actions' : ''} width={15}>
                <div>
                  <Tooltip content="Add field">
                    <IconButton name="plus" onClick={addSelectField} aria-label="Add field" />
                  </Tooltip>
                  {queryState.selectFields.length > 1 && (
                    <Tooltip content="Remove field">
                      <IconButton name="minus" onClick={() => removeSelectField(index)} aria-label="Remove field" />
                    </Tooltip>
                  )}
                </div>
              </EditorField>
            </EditorFieldGroup>
          </EditorRow>
        ))}

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
                      ...availableTagKeys.map((tag) => ({
                        label: `tag.${tag}`,
                        value: `tag.${tag}`,
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
                onChange={(e) => updateQuery({ limit: parseInt(e.currentTarget.value) || 1000 })}
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
