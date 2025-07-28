import React from 'react';
import { Select, IconButton, Tooltip } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { HavingCondition } from '../types';
import { VariableSuggestInput } from '../VariableInputWithSuggestions';
import { StyledLabel } from '../StyledLabel';

interface HavingClauseEditorProps {
  havingConditions: HavingCondition[];
  updateQuery: (updatedFields: Partial<{ havingConditions: HavingCondition[] }>) => void;
  availableProperties: Array<{ id: string; name: string }>;
}

const aggregationOptions = ['COUNT', 'SUM', 'AVG', 'MAX', 'MIN'].map((val) => ({ label: val, value: val }));

export const HavingClauseEditor: React.FC<HavingClauseEditorProps> = ({
  havingConditions,
  updateQuery,
  availableProperties,
}) => {
  const columnOptions = availableProperties.map((prop) => ({ label: prop.name, value: prop.id }));
  const operatorOptions = ['=', '!=', '>', '<', '>=', '<='].map((op) => ({ label: op, value: op }));

  const updateCondition = (index: number, key: keyof HavingCondition, value: any) => {
    const updated = [...havingConditions];
    updated[index] = { ...updated[index], [key]: value };
    updateQuery({ havingConditions: updated });
  };

  const addCondition = () => {
    updateQuery({
      havingConditions: [
        ...havingConditions,
        { aggregation: 'SUM', column: '', operator: '>', value: '', logicalOperator: 'AND' },
      ],
    });
  };

  const removeCondition = (index: number) => {
    updateQuery({
      havingConditions: havingConditions.filter((_, i) => i !== index),
    });
  };

  return (
    <>
      {havingConditions.map((cond, index) => (
        <EditorRow key={index}>
          <EditorFieldGroup>
            <StyledLabel text={index === 0 ? 'HAVING' : ''} width={15} tooltip={index === 0} />
            <EditorField label="" width={10}>
              <Select
                options={aggregationOptions}
                value={{ label: cond.aggregation, value: cond.aggregation }}
                onChange={(o) => updateCondition(index, 'aggregation', o?.value)}
              />
            </EditorField>

            <EditorField label="" width={25}>
              <Select
                options={columnOptions}
                value={cond.column ? { label: cond.column, value: cond.column } : null}
                onChange={(o) => updateCondition(index, 'column', o?.value || '')}
                placeholder="Select column..."
              />
            </EditorField>

            <EditorField label="" width={5}>
              <Select
                options={operatorOptions}
                value={{ label: cond.operator, value: cond.operator }}
                onChange={(o) => updateCondition(index, 'operator', o?.value)}
              />
            </EditorField>

            <EditorField label="" width={25}>
              <VariableSuggestInput value={cond.value} onChange={(val) => updateCondition(index, 'value', val)} />
            </EditorField>

            {index < havingConditions.length - 1 && (
              <EditorField label="" width={10}>
                <Select
                  options={[
                    { label: 'AND', value: 'AND' },
                    { label: 'OR', value: 'OR' },
                  ]}
                  value={{ label: cond.logicalOperator || 'AND', value: cond.logicalOperator || 'AND' }}
                  onChange={(o) => updateCondition(index, 'logicalOperator', o?.value)}
                />
              </EditorField>
            )}

            <EditorField label="" width={10}>
              <div>
                {index === havingConditions.length - 1 && (
                  <Tooltip content="Add condition">
                    <IconButton name="plus" onClick={addCondition} aria-label="Add condition" />
                  </Tooltip>
                )}
                {havingConditions.length > 1 && (
                  <Tooltip content="Remove condition">
                    <IconButton name="minus" onClick={() => removeCondition(index)} aria-label="Remove condition" />
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
