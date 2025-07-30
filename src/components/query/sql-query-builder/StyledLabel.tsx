import React from 'react';
import { EditorField } from '@grafana/plugin-ui';
import { InlineLabel } from '@grafana/ui';
import clsx from 'clsx';
import { tooltipMessages } from './types';

interface StyledLabelProps {
  text: string;
  width?: number;
  color?: string; // e.g. "#6e9fff" or Tailwind class like "text-green-500"
  tooltip?: boolean;
  bold?: boolean;
  fontSize?: string; // e.g. "14px"
  className?: string;
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
  const isTailwindColor = color.startsWith('text-');

  const style: React.CSSProperties = {
    color: isTailwindColor ? undefined : color,
    fontWeight: bold ? 'bold' : undefined,
    fontSize,
  };

  const combinedClassName = clsx(isTailwindColor && color, bold && 'font-bold', className);

  const tooltipText = tooltip ? tooltipMessages[text] : undefined;

  return (
    <EditorField label="" width={width}>
      <InlineLabel width="auto" style={style} tooltip={tooltipText} className={combinedClassName}>
        {text}
      </InlineLabel>
    </EditorField>
  );
};
