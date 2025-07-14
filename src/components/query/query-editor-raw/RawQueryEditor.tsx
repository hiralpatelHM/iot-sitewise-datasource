import React, { useState } from 'react';
import { CodeEditor, IconButton } from '@grafana/ui';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from 'SitewiseDataSource';
import { SitewiseQuery, SitewiseOptions } from 'types';
import { SitewiseCompletionProvider } from 'language/autoComplete';
import { css } from '@emotion/css';
import { SqlQueryBuilder } from '../sql-query-builder/SqlQueryBuilder';
// import { SQLBuilder } from './SQLBuilder'; // Import your SQLBuilder component

type Props = QueryEditorProps<DataSource, SitewiseQuery, SitewiseOptions>;

export function RawQueryEditor(props: Props) {
  const { onChange, query, datasource } = props;
  const [mode, setMode] = useState<'raw' | 'builder'>('builder');

  // Handler for toggling editor mode
  const toggleMode = () => {
    setMode((prev) => (prev === 'raw' ? 'builder' : 'raw'));
  };

  return (
    <div>
      {/* Toggle Button */}
      <div
        className={css`
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-bottom: 8px;
        `}
      >
        {/* <Switch
    label={mode === 'raw' ? 'Raw SQL Editor' : 'SQL Builder'}
    checked={mode === 'builder'}
    onChange={toggleMode}
  /> */}
        <IconButton
          name="pen"
          tooltip={mode === 'builder' ? 'Switch to Builder' : 'Switch to Raw Editor'}
          onClick={toggleMode}
        />
      </div>

      {/* Conditional rendering of editors */}
      {mode === 'raw' ? (
        <CodeEditor
          language="sql"
          showLineNumbers
          showMiniMap={false}
          value={query.rawSQL || datasource.defaultQuery}
          onSave={(text) => onChange({ ...query, rawSQL: text })}
          onBlur={(text) => onChange({ ...query, rawSQL: text })}
          onBeforeEditorMount={(monaco) => {
            if (SitewiseCompletionProvider.monaco === null) {
              SitewiseCompletionProvider.monaco = monaco;
              monaco.languages.registerCompletionItemProvider('sql', SitewiseCompletionProvider);
            }
          }}
          height={'200px'}
        />
      ) : (
        <div>
          <SqlQueryBuilder query={query} onChange={onChange} datasource={datasource} />
        </div>
      )}
    </div>
  );
}
