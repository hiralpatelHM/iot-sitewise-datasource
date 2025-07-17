// LimitSQLBuilderClause.tsx
import React from 'react';
import { Input } from '@grafana/ui';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { StyledLabel } from './StyledLabel';

interface LimitSQLBuilderClauseProps {
  limit?: number;
  updateQuery: (newState: { limit: number }) => void;
}

export const LimitSQLBuilderClause: React.FC<LimitSQLBuilderClauseProps> = ({ limit, updateQuery }) => {
  return (
    <EditorRow>
      <EditorFieldGroup>
        <StyledLabel text="LIMIT" width={15} tooltip />
        <EditorField label="" width={30}>
          <Input
            type="number"
            value={limit}
            onChange={(e) => updateQuery({ limit: parseInt(e.currentTarget.value, 10) || 1000 })}
          />
        </EditorField>
      </EditorFieldGroup>
    </EditorRow>
  );
};
