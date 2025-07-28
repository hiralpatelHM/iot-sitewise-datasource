// hooks/useSQLQueryState.ts
import { useState, useEffect, useRef } from 'react';
import { isEqual } from 'lodash';
import { SitewiseQueryState, AssetProperty, mockAssetModels } from '../types';
import { validateQuery } from '../utils/validateQuery';
import { generateQueryPreview } from '../utils/queryGenerator';

interface UseSQLQueryStateOptions {
  initialQuery: SitewiseQueryState;
  onChange: (query: SitewiseQueryState) => void;
}

interface UseSQLQueryStateResult {
  queryState: SitewiseQueryState;
  setQueryState: React.Dispatch<React.SetStateAction<SitewiseQueryState>>;
  preview: string;
  validationErrors: string[];
  updateQuery: (newState: Partial<SitewiseQueryState>) => Promise<void>;
  selectedModel: any | undefined;
  availableProperties: AssetProperty[];
  availablePropertiesForGrouping: AssetProperty[];
}

export const useSQLQueryState = ({ initialQuery, onChange }: UseSQLQueryStateOptions): UseSQLQueryStateResult => {
  const [queryState, setQueryState] = useState<SitewiseQueryState>(initialQuery);
  const [preview, setPreview] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const queryStateRef = useRef(queryState);

  useEffect(() => {
    if (!isEqual(queryStateRef.current, queryState)) {
      queryStateRef.current = queryState;
      onChange(queryState);
    }
  }, [queryState, onChange]);

  useEffect(() => {
    let isMounted = true;

    const validateAndGenerate = async () => {
      const errors = validateQuery(queryState);
      const preview = await generateQueryPreview(queryState);

      if (isMounted) {
        setValidationErrors(errors);
        setPreview(preview);
      }
    };

    validateAndGenerate();

    return () => {
      isMounted = false;
    };
  }, [queryState]);

  const updateQuery = async (newState: Partial<SitewiseQueryState>) => {
    const updatedStateBeforeSQL = { ...queryStateRef.current, ...newState };
    const rawSQL = await generateQueryPreview(updatedStateBeforeSQL);
    setQueryState({ ...updatedStateBeforeSQL, rawSQL });
  };

  const selectedModel = mockAssetModels.find((model) => model.id === queryState.selectedAssetModel);
  const availableProperties = selectedModel?.properties || [];
  const availablePropertiesForGrouping = availableProperties.filter((prop) =>
    queryState.selectFields.some((field) => field.column === prop.name)
  );

  return {
    queryState,
    setQueryState,
    preview,
    validationErrors,
    updateQuery,
    selectedModel,
    availableProperties,
    availablePropertiesForGrouping,
  };
};
