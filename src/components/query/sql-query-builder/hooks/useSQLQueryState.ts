// hooks/useSQLQueryState.ts
import { useState, useEffect, useCallback } from 'react';
import { SitewiseQueryState, AssetProperty, mockAssetModels, timeIntervalProperty } from '../types';
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

  useEffect(() => {
    onChange(queryState);
  }, [queryState, onChange]);

  useEffect(() => {
    const validateAndSetPreview = async () => {
      const errors = validateQuery(queryState);
      const generatedSql = await generateQueryPreview(queryState);

      setPreview(generatedSql);
      setValidationErrors(errors);
    };

    validateAndSetPreview();
  }, [queryState]);

  const updateQuery = useCallback(
    async (newState: Partial<SitewiseQueryState>) => {
      const updatedStateBeforeSQL = { ...queryState, ...newState };
      const rawSQL = await generateQueryPreview(updatedStateBeforeSQL);
      setQueryState({ ...updatedStateBeforeSQL, rawSQL });
    },
    [queryState]
  );

  const selectedModel = mockAssetModels.find((model) => model.id === queryState.selectedAssetModel);
  const availableProperties = selectedModel?.properties || [];
  const availablePropertiesForGrouping: AssetProperty[] = [timeIntervalProperty, ...availableProperties];

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
