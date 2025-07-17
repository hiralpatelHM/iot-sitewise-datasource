import React from 'react';
import { EditorField } from '@grafana/plugin-ui';
import { InlineLabel } from '@grafana/ui';
import clsx from 'clsx';
import { tooltipMessages } from './types';

interface StyledLabelProps {
  text: string;
  width?: number;
  color?: string; // e.g. "#6e9fff" or tailwind class like "text-green-500"
  tooltip?: boolean;
  bold?: boolean;
  fontSize?: string; // e.g. "14px"
  className?: string; // optional className override
}

export const StyledLabel: React.FC<StyledLabelProps> = ({
  text,
  width = 10,
  color = '#6e9fff',
  tooltip = false,
  bold = true,
  fontSize,
  className,
}) => {
  const style: React.CSSProperties = {
    color: color.startsWith('text-') ? undefined : color,
    fontWeight: bold ? 'bold' : undefined,
    fontSize,
  };

  const combinedClassName = clsx(
    color.startsWith('text-') ? color : undefined, // allow Tailwind color if passed
    bold && 'font-bold',
    className
  );

  return (
    <EditorField label="" width={width}>
      <InlineLabel
        width="auto"
        style={style}
        {...(tooltip ? { tooltip: tooltipMessages[text] } : {})}
        className={combinedClassName}
      >
        {text}
      </InlineLabel>
    </EditorField>
  );
};
