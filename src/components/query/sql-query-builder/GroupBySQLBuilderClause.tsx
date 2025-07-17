import React, { useMemo, useCallback } from 'react';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { Select, ActionMeta } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { timeIntervals } from './types';
import { StyledLabel } from './StyledLabel';

interface PropertyOption {
  id: string;
  name: string;
}

interface GroupBySQLBuilderClauseProps {
  availablePropertiesForGrouping: PropertyOption[];
  groupByTags: string[];
  groupByTime: string;
  updateQuery: (fields: Partial<{ groupByTags: string[]; groupByTime: string }>) => void;
}

export const GroupBySQLBuilderClause: React.FC<GroupBySQLBuilderClauseProps> = ({
  availablePropertiesForGrouping,
  groupByTags,
  groupByTime,
  updateQuery,
}) => {
  // Memoized list of available GROUP BY columns
  const groupByOptions: Array<SelectableValue<string>> = useMemo(
    () =>
      availablePropertiesForGrouping.map(({ id, name }) => ({
        value: id,
        label: name,
      })),
    [availablePropertiesForGrouping]
  );

  // Memoized currently selected GROUP BY columns
  const selectedGroupByOptions: Array<SelectableValue<string>> = useMemo(
    () =>
      groupByTags.map((tag) => {
        return groupByOptions.find((opt) => opt.value === tag) || { value: tag, label: tag };
      }),
    [groupByTags, groupByOptions]
  );

  const handleGroupByTagsChange = useCallback(
    (options: SelectableValue<string> | SelectableValue<string>[], _meta?: ActionMeta) => {
      let tags: string[] = [];

      if (Array.isArray(options)) {
        tags = options.map((opt) => opt.value).filter(Boolean) as string[];
      } else if (options?.value) {
        tags = [options.value];
      }

      const nextState: Partial<{ groupByTags: string[]; groupByTime: string }> = {
        groupByTags: tags,
      };

      if (!tags.includes('timeInterval')) {
        nextState.groupByTime = '';
      }

      updateQuery(nextState);
    },
    [updateQuery]
  );

  // Handle changes to GROUP BY timeInterval (single-select)
  const handleGroupByTimeChange = useCallback(
    (option: SelectableValue<string> | null, _meta?: ActionMeta) => {
      updateQuery({ groupByTime: option?.value || '' });
    },
    [updateQuery]
  );

  return (
    <EditorRow>
      <EditorFieldGroup>
        <StyledLabel text={'GROUP BY'} width={15} tooltip />
        <EditorField label="" width={25}>
          <Select
            options={groupByOptions}
            value={selectedGroupByOptions}
            onChange={handleGroupByTagsChange}
            isMulti
            placeholder="Select column(s)..."
          />
        </EditorField>

        {groupByTags.includes('timeInterval') && (
          <EditorField label="" width={15}>
            <Select
              options={[{ label: 'No grouping', value: '' }, ...timeIntervals]}
              value={
                timeIntervals.find((ti) => ti.value === groupByTime) || {
                  label: 'No grouping',
                  value: '',
                }
              }
              onChange={handleGroupByTimeChange}
              placeholder="Select interval..."
            />
          </EditorField>
        )}
      </EditorFieldGroup>
    </EditorRow>
  );
};
