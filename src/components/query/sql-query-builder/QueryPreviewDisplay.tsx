import { Alert } from '@grafana/ui';
import React from 'react';

interface Props {
  preview: string;
  errors: string[];
}

export const QueryPreviewDisplay: React.FC<Props> = ({ preview, errors }) => {
  const hasErrors = errors.length > 0;
  const severity = hasErrors ? 'error' : 'info';

  return (
    <div style={{ marginTop: '1rem' }}>
      <Alert title={hasErrors ? 'Query Errors & Preview' : 'Query Preview'} severity={severity}>
        {hasErrors && (
          <ul style={{ margin: 0, paddingLeft: '1.2em', marginBottom: '0.5em' }}>
            {errors.map((err, idx) => (
              <li key={idx} style={{ fontSize: '12px' }}>
                {err}
              </li>
            ))}
          </ul>
        )}
        <pre style={{ background: 'transparent', border: 'none', fontSize: '12px', margin: 0 }}>{preview}</pre>
      </Alert>
    </div>
  );
};
