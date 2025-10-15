import { Switch, Input } from '@grafana/ui';
import React from 'react';

interface BitExtract {
  enabled?: boolean;
  bitIndex?: number;
}

interface BitExtractSectionProps {
  query: {
    bitExtract?: BitExtract;
    [key: string]: any;
  };
  onChange: (query: any) => void;
}

export const BitExtractSection: React.FC<BitExtractSectionProps> = ({ query, onChange }) => {
  const toggleBitExtract = (checked: boolean) => {
    onChange({
      ...query,
      bitExtract: { ...query.bitExtract, enabled: checked },
    });
  };

  const updateBitIndex = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...query,
      bitExtract: { ...query.bitExtract, bitIndex: Number(e.target.value) },
    });
  };

  return (
    <div style={{ marginTop: '8px' }}>
      <Switch
        label="Extract Bit from Integer Property"
        checked={query.bitExtract?.enabled ?? false}
        onChange={(e) => toggleBitExtract(e.currentTarget.checked)}
      />

      {query.bitExtract?.enabled && (
        <Input
          type="number"
          min={0}
          label="Bit Index"
          value={query.bitExtract?.bitIndex ?? 0}
          onChange={updateBitIndex}
          width={12}
        />
      )}
    </div>
  );
};
