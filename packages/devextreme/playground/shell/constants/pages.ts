// The site's pages, in nav order. `labelKey` and `summaryKey` are i18n keys.
export const Pages = {
  home: { href: './showcase.html', labelKey: 'nav.home', summaryKey: 'summary.home' },
  calendar: { href: './calendar.html', labelKey: 'nav.calendar', summaryKey: 'summary.calendar' },
  dateBox: { href: './date-box.html', labelKey: 'nav.dateBox', summaryKey: 'summary.dateBox' },
  dateRangeBox: { href: './date-range-box.html', labelKey: 'nav.dateRangeBox', summaryKey: 'summary.dateRangeBox' },
  dataGrid: { href: './data-grid.html', labelKey: 'nav.dataGrid', summaryKey: 'summary.dataGrid' },
  pivotGrid: { href: './pivot-grid.html', labelKey: 'nav.pivotGrid', summaryKey: 'summary.pivotGrid' },
  scheduler: { href: './scheduler.html', labelKey: 'nav.scheduler', summaryKey: 'summary.scheduler' },
  vizChat: { href: './viz-chat-multi.html', labelKey: 'nav.vizChat', summaryKey: 'summary.vizChat' },
  gantt: { href: './gantt-multi-calendar.html', labelKey: 'nav.gantt', summaryKey: 'summary.gantt' },
  all: { href: './calendar-multi.html', labelKey: 'nav.all', summaryKey: 'summary.all' },
} as const;

export type PageId = keyof typeof Pages;

export const PAGE_ID_LIST = Object.keys(Pages) as PageId[];
