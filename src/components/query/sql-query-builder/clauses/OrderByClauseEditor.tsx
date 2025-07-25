import React from 'react';
import { Select, IconButton, Tooltip } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { StyledLabel } from '../StyledLabel';

interface OrderByField {
  column: string;
  direction: 'ASC' | 'DESC';
}

interface OrderByClauseEditorProps {
  orderByFields: OrderByField[];
  updateQuery: (update: Partial<{ orderByFields: OrderByField[] }>) => void;
  availableProperties: Array<{ id: string; name: string }>;
}

export const OrderByClauseEditor: React.FC<OrderByClauseEditorProps> = ({
  orderByFields,
  updateQuery,
  availableProperties,
}) => {
  const addOrderByField = () => {
    updateQuery({ orderByFields: [...orderByFields, { column: '', direction: 'ASC' }] });
  };

  const removeOrderByField = (index: number) => {
    const newFields = orderByFields.filter((_, i) => i !== index);
    updateQuery({ orderByFields: newFields });
  };

  const updateOrderByField = (index: number, field: Partial<OrderByField>) => {
    const newFields = [...orderByFields];
    newFields[index] = { ...newFields[index], ...field };
    updateQuery({ orderByFields: newFields });
  };

  return (
    <>
      {orderByFields.map((field, index) => (
        <EditorRow key={index}>
          <EditorFieldGroup>
            <StyledLabel text={index === 0 ? 'ORDER BY' : ''} width={15} tooltip={index === 0} />

            <EditorField label="" width={30}>
              <Select
                options={availableProperties.map((prop) => ({
                  label: prop.name,
                  value: prop.id,
                }))}
                value={field.column ? { label: field.column, value: field.column } : null}
                onChange={(option) => updateOrderByField(index, { column: option?.value || '' })}
                placeholder="Select column..."
              />
            </EditorField>

            {field.column ? (
              <EditorField label="" width={30}>
                <Select
                  options={[
                    { label: 'Ascending', value: 'ASC' },
                    { label: 'Descending', value: 'DESC' },
                  ]}
                  value={field.direction}
                  onChange={(option) =>
                    updateOrderByField(index, { direction: (option?.value as 'ASC' | 'DESC') || 'ASC' })
                  }
                  placeholder="Direction"
                />
              </EditorField>
            ) : null}

            <EditorField label="" width={15}>
              <div>
                <Tooltip content="Add ORDER BY field">
                  <IconButton name="plus" onClick={addOrderByField} aria-label="Add order by field" />
                </Tooltip>
                {orderByFields.length > 1 && (
                  <Tooltip content="Remove ORDER BY field">
                    <IconButton
                      name="minus"
                      onClick={() => removeOrderByField(index)}
                      aria-label="Remove order by field"
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
