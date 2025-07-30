import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@grafana/ui';
import { css } from '@emotion/css';
import { getSelectableTemplateVariables } from 'variables';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const wrapperClass = css`
  position: relative;
`;

const suggestionListClass = css`
  position: absolute;
  z-index: 10;
  background: var(--page-bg, #121212);
  margin-top: 4px;
  width: 100%;
  max-height: 152px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  border: 1px solid var(--panel-border-color, #444);
  border-radius: 4px;
`;

const suggestionItemClass = css`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  &:hover {
    background-color: var(--input-hover-bg, #2a2a2a);
  }
`;

export const VariableSuggestInput: React.FC<Props> = ({ value = '', onChange, placeholder }) => {
  const [allVars, setAllVars] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const vars = getSelectableTemplateVariables().map((v) => v.value.replace(/\$\{|\}/g, ''));
    setAllVars(vars);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.currentTarget.value;
    onChange(inputVal);

    const matchStart = inputVal.lastIndexOf('$');
    if (matchStart !== -1) {
      const currentWord = inputVal.slice(matchStart + 1);
      const matched = allVars.filter((v) => v.startsWith(currentWord));
      setSuggestions(matched);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertSuggestion = (suggestion: string) => {
    const matchStart = value.lastIndexOf('$');
    if (matchStart !== -1) {
      const before = value.substring(0, matchStart);
      const replaced = `${before}\${${suggestion}}`;
      onChange(replaced);
      setShowSuggestions(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className={wrapperClass}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder || 'Enter value or $variable'}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className={suggestionListClass}>
          {suggestions.map((s) => (
            <li key={s} className={suggestionItemClass} onMouseDown={() => insertSuggestion(s)}>
              ${s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
