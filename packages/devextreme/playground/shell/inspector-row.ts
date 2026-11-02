// One key/value line of the inspector. `ltr` keeps ISO values and code
// readable inside an RTL page.
export interface InspectorRow {
  label: string;
  value: string;
  tone?: 'accent' | 'ok' | 'muted';
  ltr?: boolean;
}
