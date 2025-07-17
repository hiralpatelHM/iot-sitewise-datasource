import React from 'react';
import { InlineLabel, Select } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';

interface FromSQLBuilderProps {
  assetModels: Array<{ id: string; name: string }>;
  selectedModelId: string;
  updateQuery: (
    updatedFields: Partial<{
      selectedAssetModel: string;
      selectFields: Array<{ column: string; aggregation: string; alias: string }>;
      whereConditions: Array<{ column: string; operator: string; value: string; logicalOperator: 'AND' | 'OR' }>;
    }>
  ) => void;
}

export const FromSQLBuilder: React.FC<FromSQLBuilderProps> = ({ assetModels, selectedModelId, updateQuery }) => {
  return (
    <EditorRow>
      <EditorFieldGroup>
        <EditorField label="" width={10}>
          <InlineLabel width="auto" style={{ color: '#rgb(110, 159, 255)', fontWeight: 'bold' }}>
            FROM
          </InlineLabel>
        </EditorField>
        <EditorField label="" width={40}>
          <Select
            options={assetModels.map((model) => ({
              label: model.name,
              value: model.id,
            }))}
            value={
              selectedModelId
                ? {
                    label: assetModels.find((m) => m.id === selectedModelId)?.name || '',
                    value: selectedModelId,
                  }
                : null
            }
            onChange={(option) =>
              updateQuery({
                selectedAssetModel: option?.value || '',
                selectFields: [{ column: '', aggregation: '', alias: '' }],
                whereConditions: [{ column: '', operator: '', value: '', logicalOperator: 'AND' }],
              })
            }
            placeholder="Select model..."
          />
        </EditorField>
      </EditorFieldGroup>
    </EditorRow>
  );
};
