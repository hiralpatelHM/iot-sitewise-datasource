import React from 'react';
import { Select, Input, IconButton, Tooltip, InlineLabel } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { allFunctions, SelectField } from './types';

interface SelectSQLBuilderClauseProps {
  selectFields: SelectField[];
  updateQuery: (updatedFields: Partial<{ selectFields: SelectField[] }>) => void;
  availableProperties: Array<{ id: string; name: string }>;
}

export const SelectSQLBuilderClause: React.FC<SelectSQLBuilderClauseProps> = ({
  selectFields,
  updateQuery,
  availableProperties,
}) => {
  const addSelectField = () => {
    const newFields = [...selectFields, { column: '', aggregation: '', alias: '' }];
    updateQuery({ selectFields: newFields });
  };

  const removeSelectField = (index: number) => {
    if (selectFields.length > 1) {
      const newFields = selectFields.filter((_, i) => i !== index);
      updateQuery({ selectFields: newFields });
    }
  };

  const updateSelectField = (index: number, field: Partial<SelectField>) => {
    const newFields = [...selectFields];
    newFields[index] = { ...newFields[index], ...field };
    updateQuery({ selectFields: newFields });
  };

  return (
    <>
      {selectFields.map((field, index) => (
        <EditorRow key={index}>
          <EditorFieldGroup>
            {index === 0 && (
              <EditorField label="" width={10}>
                <InlineLabel width="auto" style={{ color: '#rgb(110, 159, 255)', fontWeight: 'bold' }}>
                  SELECT
                </InlineLabel>
              </EditorField>
            )}
            <EditorField label="" width={30}>
              <Select
                options={availableProperties.map((prop) => ({ label: prop.name, value: prop.id }))}
                value={field.column}
                onChange={(option) => updateSelectField(index, { column: option?.value || '' })}
                placeholder="Select column..."
              />
            </EditorField>
            <EditorField label="" width={30}>
              <Select
                options={allFunctions.map((func) => ({
                  label: func.label === 'Raw Values' ? func.label : `${func.group}: ${func.label}`,
                  value: func.value,
                }))}
                value={field.aggregation}
                onChange={(option) => updateSelectField(index, { aggregation: option?.value || '' })}
                placeholder="No function"
              />
            </EditorField>
            <EditorField label="" width={25}>
              <Input
                value={field.alias}
                onChange={(e) => updateSelectField(index, { alias: e.currentTarget.value })}
                placeholder="Optional alias"
              />
            </EditorField>
            <EditorField label="" width={15}>
              <div>
                <Tooltip content="Add field">
                  <IconButton name="plus" onClick={addSelectField} aria-label="Add field" />
                </Tooltip>
                {selectFields.length > 1 && (
                  <Tooltip content="Remove field">
                    <IconButton name="minus" onClick={() => removeSelectField(index)} aria-label="Remove field" />
                  </Tooltip>
                )}
              </div>
            </EditorField>
          </EditorFieldGroup>
        </EditorRow>
      ))}
    </>
  );
};
