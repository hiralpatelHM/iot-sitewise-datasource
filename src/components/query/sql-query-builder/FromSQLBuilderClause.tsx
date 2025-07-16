import React from 'react';
import { Select } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';

interface FromSQLBuilderProps {
  assetModels: Array<{ id: string; name: string }>;
  selectedModelId: string;
  updateQuery: (updatedFields: Partial<{ selectedAssetModel: string }>) => void;
}

export const FromSQLBuilder: React.FC<FromSQLBuilderProps> = ({ assetModels, selectedModelId, updateQuery }) => {
  console.log('FromSQLBuilder Props:', { assetModels, selectedModelId });
  return (
    <EditorRow>
      <EditorFieldGroup>
        <EditorField label="From" width={40}>
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
            onChange={(option) => updateQuery({ selectedAssetModel: option?.value || '' })}
            placeholder="Select model..."
          />
        </EditorField>
      </EditorFieldGroup>
    </EditorRow>
  );
};
