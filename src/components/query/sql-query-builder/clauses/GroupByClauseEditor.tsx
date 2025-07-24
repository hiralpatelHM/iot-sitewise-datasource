import React, { useMemo, useCallback } from 'react';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { Select, ActionMeta } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { timeIntervals } from '../types';
import { StyledLabel } from '../StyledLabel';

interface PropertyOption {
  id: string;
  name: string;
}

interface GroupByClauseEditorProps {
  availablePropertiesForGrouping: PropertyOption[];
  groupByTags: string[];
  groupByTime: string;
  updateQuery: (fields: Partial<{ groupByTags: string[]; groupByTime: string }>) => void;
}

export const GroupByClauseEditor: React.FC<GroupByClauseEditorProps> = ({
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
    (options: SelectableValue<string> | Array<SelectableValue<string>>, _meta?: ActionMeta) => {
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
        <EditorField label="" width={30}>
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
              options={timeIntervals}
              value={
                timeIntervals.find((ti) => ti.value === groupByTime) || {
                  label: '1s',
                  value: '1s',
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
