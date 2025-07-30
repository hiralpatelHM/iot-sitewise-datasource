import React from 'react';
import { Alert } from '@grafana/ui';

interface Props {
  preview: string;
  errors: string[];
}

const containerStyle: React.CSSProperties = {
  marginTop: '1rem',
};

const errorListStyle: React.CSSProperties = {
  paddingLeft: '1.2em',
  margin: 0,
  marginBottom: '0.5em',
};

const errorItemStyle: React.CSSProperties = {
  fontSize: 12,
};

const previewStyle: React.CSSProperties = {
  fontSize: 12,
  padding: 0,
  margin: 0,
  backgroundColor: 'transparent',
  border: 'none',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
};

export const QueryPreviewDisplay: React.FC<Props> = ({ preview, errors }) => {
  const hasErrors = errors.length > 0;
  const title = hasErrors ? 'Query Errors & Preview' : 'Query Preview';
  const severity = hasErrors ? 'error' : 'info';

  return (
    <div style={containerStyle}>
      <Alert title={title} severity={severity}>
        {hasErrors && (
          <ul style={errorListStyle}>
            {errors.map((error, index) => (
              <li key={index} style={errorItemStyle}>
                {error}
              </li>
            ))}
          </ul>
        )}
        <pre style={previewStyle}>{preview}</pre>
      </Alert>
    </div>
  );
};
