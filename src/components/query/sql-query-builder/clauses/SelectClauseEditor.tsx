import React from 'react';
import { Select, Input, IconButton, Tooltip } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { allFunctions, isCastFunction, isDateFunction, SelectField } from '../types';
import { StyledLabel } from '../StyledLabel';

interface SelectClauseEditorProps {
  selectFields: SelectField[];
  updateQuery: (updatedFields: Partial<{ selectFields: SelectField[] }>) => void;
  availableProperties: Array<{ id: string; name: string }>;
}

export const SelectClauseEditor: React.FC<SelectClauseEditorProps> = ({
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
      {selectFields.map((field, index) => {
        const functionArgs = isDateFunction(field.aggregation)
          ? ['DAY', 'MONTH', 'YEAR']
          : isCastFunction(field.aggregation)
            ? ['BOOLEAN', 'INTEGER', 'INT', 'TIMESTAMP']
            : [];

        const functionArgOptions = functionArgs.map((v) => ({ label: v, value: v }));

        return (
          <EditorRow key={index}>
            <EditorFieldGroup>
              <StyledLabel text={index === 0 ? 'SELECT' : ''} width={15} tooltip={index === 0} />
              <EditorField label="" width={30}>
                <Select
                  options={availableProperties.map((prop) => ({ label: prop.name, value: prop.id }))}
                  value={field.column ? { label: field.column, value: field.column } : null}
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
                  onChange={(option) =>
                    updateSelectField(index, {
                      aggregation: option?.value || '',
                      functionArg: '',
                      functionArgValue: '',
                    })
                  }
                  placeholder="No function"
                />
              </EditorField>
              {functionArgs.length > 0 && (
                <EditorField label="" width={20}>
                  <Select
                    options={functionArgOptions}
                    value={field.functionArg ? { label: field.functionArg, value: field.functionArg } : null}
                    onChange={(option) => updateSelectField(index, { functionArg: option?.value || '' })}
                    placeholder="Arg type"
                  />
                </EditorField>
              )}

              {isDateFunction(field.aggregation) && (
                <EditorField label="" width={20}>
                  <Input
                    value={field.functionArgValue || ''}
                    onChange={(e) => updateSelectField(index, { functionArgValue: e.currentTarget.value })}
                    placeholder="Enter interval value"
                  />
                </EditorField>
              )}
              <EditorField label="" width={30}>
                <Input
                  value={field.alias}
                  onChange={(e) => updateSelectField(index, { alias: e.currentTarget.value })}
                  placeholder="Optional alias"
                />
              </EditorField>
              <EditorField label="" width={15}>
                <div>
                  {index === selectFields.length - 1 && (
                    <Tooltip content="Add field">
                      <IconButton name="plus" onClick={addSelectField} aria-label="Add field" />
                    </Tooltip>
                  )}
                  {selectFields.length > 1 && (
                    <Tooltip content="Remove field">
                      <IconButton name="minus" onClick={() => removeSelectField(index)} aria-label="Remove field" />
                    </Tooltip>
                  )}
                </div>
              </EditorField>
            </EditorFieldGroup>
          </EditorRow>
        );
      })}
    </>
  );
};
