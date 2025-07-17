import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const VariableSuggestInput: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const [allVars, setAllVars] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const vars = getTemplateSrv()
      .getVariables()
      .map((v) => v.name);
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
      //   const after = value.substring(matchStart);
      const replaced = before + '${' + suggestion + '}';
      onChange(replaced);
      setShowSuggestions(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder || 'Enter value or $variable'}
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul
          style={{
            position: 'absolute',
            background: 'rgb(17, 18, 23)',
            zIndex: 1000,
            marginTop: 4,
            listStyle: 'none',
            padding: 0,
            width: '100%',
            maxHeight: 152,
            overflowY: 'auto',
          }}
        >
          {suggestions.map((suggestion) => (
            <li
              key={suggestion}
              style={{ padding: 8, cursor: 'pointer' }}
              onMouseDown={() => insertSuggestion(suggestion)} // mouseDown preserves input focus
            >
              ${suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
