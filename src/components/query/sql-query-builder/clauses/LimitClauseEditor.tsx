import React from 'react';
import { Input } from '@grafana/ui';
import { EditorField, EditorFieldGroup } from '@grafana/plugin-ui';
import { StyledLabel } from '../StyledLabel';

interface LimitClauseEditorProps {
  limit?: number;
  updateQuery: (newState: { limit?: number }) => void;
}

export const LimitClauseEditor: React.FC<LimitClauseEditorProps> = ({ limit, updateQuery }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value.trim();
    const parsed = parseInt(value, 10);

    if (value === '') {
      updateQuery({ limit: undefined }); // Let fallback logic apply
    } else if (!isNaN(parsed)) {
      updateQuery({ limit: parsed });
    }
  };

  return (
    <EditorFieldGroup>
      <StyledLabel text="LIMIT" width={15} tooltip />
      <EditorField label="" width={30}>
        <Input type="number" min={1} placeholder="Defaults to 100" value={limit ?? ''} onChange={handleChange} />
      </EditorField>
    </EditorFieldGroup>
  );
};
