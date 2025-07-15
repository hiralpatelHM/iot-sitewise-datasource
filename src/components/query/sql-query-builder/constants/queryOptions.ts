export const whereOperators = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
  { label: '>=', value: '>=' },
  { label: '<=', value: '<=' },
  { label: 'IS', value: 'IS' },
  { label: 'IS NOT', value: 'IS_NOT' },
  { label: 'CONTAINS', value: 'CONTAINS' },
];

export const aggregationFunctions = [
  { label: 'avg()', value: 'AVERAGE', group: 'Aggregations' },
  { label: 'sum()', value: 'SUM', group: 'Aggregations' },
  { label: 'min()', value: 'MINIMUM', group: 'Aggregations' },
  { label: 'max()', value: 'MAXIMUM', group: 'Aggregations' },
  { label: 'count()', value: 'COUNT', group: 'Aggregations' },
  { label: 'stddev()', value: 'STANDARD_DEVIATION', group: 'Aggregations' },
  { label: 'first()', value: 'FIRST', group: 'Selectors' },
  { label: 'last()', value: 'LAST', group: 'Selectors' },
  { label: 'difference()', value: 'DIFFERENCE', group: 'Transformations' },
  { label: 'derivative()', value: 'DERIVATIVE', group: 'Transformations' },
  { label: 'alias()', value: 'ALIAS', group: 'Transformations' },
];

export const timeIntervals = [
  { label: '1s', value: '1s' },
  { label: '5s', value: '5s' },
  { label: '10s', value: '10s' },
  { label: '30s', value: '30s' },
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '10m', value: '10m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30m' },
  { label: '1h', value: '1h' },
  { label: '2h', value: '2h' },
  { label: '6h', value: '6h' },
  { label: '12h', value: '12h' },
  { label: '1d', value: '1d' },
];

// const timezones = [
//   { label: 'UTC', value: 'UTC' },
//   { label: 'America/New_York', value: 'America/New_York' },
//   { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
//   { label: 'Europe/London', value: 'Europe/London' },
//   { label: 'Europe/Paris', value: 'Europe/Paris' },
//   { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
//   { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
// ];
