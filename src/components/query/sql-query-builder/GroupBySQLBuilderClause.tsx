import React, { useMemo, useCallback } from 'react';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { InlineLabel, Select, ActionMeta } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { timeIntervals } from './types';

interface PropertyOption {
  id: string;
  name: string;
}

interface GroupBySQLBuilderClauseProps {
  availablePropertiesForGrouping: PropertyOption[];
  groupByTags: string[];
  groupByTime: string;
  label: string;
  updateQuery: (fields: Partial<{ groupByTags: string[]; groupByTime: string }>) => void;
}

export const GroupBySQLBuilderClause: React.FC<GroupBySQLBuilderClauseProps> = ({
  availablePropertiesForGrouping,
  groupByTags,
  groupByTime,
  label,
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
        <EditorField label="" width={10}>
          <InlineLabel
            width="auto"
            tooltip="Select one or more columns to group your query by"
            style={{ color: '#rgb(110, 159, 255)', fontWeight: 'bold' }}
          >
            {label || 'GROUP BY'}
          </InlineLabel>
        </EditorField>

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
          <EditorField label="" width={20}>
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
