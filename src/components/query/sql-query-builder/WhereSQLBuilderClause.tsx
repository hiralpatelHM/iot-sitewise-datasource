import React from 'react';
import { Select, IconButton, Tooltip } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { WhereCondition, whereOperators } from './types';
import { VariableSuggestInput } from './VariableInputWithSuggestions';
import { StyledLabel } from './StyledLabel';

interface WhereSQLBuilderClauseProps {
  whereConditions: WhereCondition[];
  updateQuery: (updatedFields: Partial<{ whereConditions: WhereCondition[] }>) => void;
  availableProperties: Array<{ id: string; name: string }>;
}

export const WhereSQLBuilderClause: React.FC<WhereSQLBuilderClauseProps> = ({
  whereConditions,
  updateQuery,
  availableProperties,
}) => {
  const addWhereCondition = () => {
    const newConditions = [
      ...whereConditions,
      { column: '', operator: '=', value: '', logicalOperator: 'AND' as const },
    ];
    updateQuery({ whereConditions: newConditions });
  };

  const removeWhereCondition = (index: number) => {
    const newConditions = whereConditions.filter((_, i) => i !== index);
    updateQuery({ whereConditions: newConditions });
  };

  const updateWhereCondition = (index: number, condition: Partial<WhereCondition>) => {
    const newConditions = [...whereConditions];
    newConditions[index] = { ...newConditions[index], ...condition };
    updateQuery({ whereConditions: newConditions });
  };

  return (
    <>
      {whereConditions.map((condition, index) => (
        <EditorRow key={index}>
          <EditorFieldGroup>
            <StyledLabel text={index === 0 ? 'WHERE' : ''} width={15} tooltip={index === 0} />
            <EditorField label="" width={25}>
              <Select
                options={availableProperties.map((prop) => ({
                  label: prop.name,
                  value: prop.id,
                }))}
                value={condition.column}
                onChange={(option) => updateWhereCondition(index, { column: option?.value || '' })}
                placeholder="Select column..."
              />
            </EditorField>

            <EditorField label="" width={15}>
              <Select
                options={whereOperators}
                value={condition.operator}
                onChange={(option) => updateWhereCondition(index, { operator: option?.value || '=' })}
              />
            </EditorField>
            <EditorField label="" width={25}>
              <VariableSuggestInput
                value={condition.value}
                onChange={(val) => updateWhereCondition(index, { value: val })}
              />
            </EditorField>
            {index < whereConditions.length - 1 && (
              <EditorField label={''} width={15}>
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
            <EditorField label="" width={10}>
              <div>
                <Tooltip content="Add condition">
                  <IconButton name="plus" onClick={addWhereCondition} aria-label="Add condition" />
                </Tooltip>
                {whereConditions.length > 1 && (
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
          </EditorFieldGroup>
        </EditorRow>
      ))}
    </>
  );
};
