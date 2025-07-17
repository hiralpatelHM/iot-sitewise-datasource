import React from 'react';
import { EditorField, EditorFieldGroup, EditorRow } from '@grafana/plugin-ui';
import { InlineLabel, Select } from '@grafana/ui';
import { timeIntervals } from './types';

interface GroupBySQLBuilderClauseProps {
  availablePropertiesForGrouping: Array<{ id: string; name: string }>;
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
  const handleGroupByChange = (options: any) => {
    const values = options?.map((opt: any) => opt.value) || [];
    updateQuery({ groupByTags: values });

    // Optional: Reset time interval if timeInterval is deselected
    if (!values.includes('timeInterval')) {
      updateQuery({ groupByTime: '' });
    }
  };

  return (
    <EditorRow>
      <EditorFieldGroup>
        <EditorField label="" width={10}>
          <InlineLabel width="auto" style={{ color: '#rgb(110, 159, 255)', fontWeight: 'bold' }}>
            GROUP BY
          </InlineLabel>
        </EditorField>
        <EditorField label="" width={30}>
          <Select
            options={availablePropertiesForGrouping.map((prop) => ({
              label: prop.name,
              value: prop.id,
            }))}
            value={availablePropertiesForGrouping
              .filter((prop) => groupByTags.includes(prop.id))
              .map((prop) => ({ label: prop.name, value: prop.id }))}
            onChange={handleGroupByChange}
            placeholder="Select column..."
            isMulti
          />
        </EditorField>

        {Array.isArray(groupByTags) && groupByTags.includes('timeInterval') && (
          <EditorField label="" width={20}>
            <Select
              options={[{ label: 'No grouping', value: '' }, ...timeIntervals]}
              value={timeIntervals.find((ti) => ti.value === groupByTime)}
              onChange={(option) =>
                updateQuery({
                  groupByTime: option?.value || '',
                })
              }
              placeholder="Select interval..."
            />
          </EditorField>
        )}
      </EditorFieldGroup>
    </EditorRow>
  );
};
