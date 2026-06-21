import { bootstrapApplication } from '@angular/platform-browser';
import { Component, enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { DxSchedulerModule, DxSelectBoxModule } from 'devextreme-angular';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

let modulePrefix = '';
// @ts-ignore
if (window && window.config?.packageConfigPaths) {
  modulePrefix = '/app';
}

const data = [
  { text: 'Website Re-Design Plan', startDate: new Date(2024, 2, 20, 9, 30), endDate: new Date(2024, 2, 20, 11, 30) },
  { text: 'Book Flights to San Fran', startDate: new Date(2024, 2, 21, 12, 0), endDate: new Date(2024, 2, 21, 13, 0) },
  { text: 'Install New Router', startDate: new Date(2024, 2, 22, 14, 30), endDate: new Date(2024, 2, 22, 15, 30) },
  { text: 'Approve Personal Computer Upgrade Plan', startDate: new Date(2024, 2, 25, 10, 0), endDate: new Date(2024, 2, 25, 11, 0) },
  { text: 'Final Budget Review', startDate: new Date(2024, 2, 27, 12, 0), endDate: new Date(2024, 2, 27, 13, 35) },
  {
    text: 'Monthly Team Sync',
    startDate: new Date(2024, 2, 28, 9, 0),
    endDate: new Date(2024, 2, 28, 10, 0),
    recurrenceRule: 'FREQ=MONTHLY;BYMONTHDAY=28',
  },
];

@Component({
  selector: 'demo-app',
  templateUrl: `.${modulePrefix}/app.component.html`,
  styleUrls: [`.${modulePrefix}/app.component.css`],
  imports: [
    DxSchedulerModule,
    DxSelectBoxModule,
  ],
})

export class AppComponent {
  appointments = data;

  currentDate: Date = new Date(2024, 2, 25);

  views = ['week', 'month'];

  calendar = 'gregorian';

  calendars = [
    { id: 'gregorian', text: 'Gregorian' },
    { id: 'persian', text: 'Persian (Jalali)' },
    { id: 'hijri', text: 'Hijri (tabular)' },
    { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
  ];
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
  ],
});
