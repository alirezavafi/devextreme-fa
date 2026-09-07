import { bootstrapApplication } from '@angular/platform-browser';
import { Component, enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { DxCalendarModule, DxSelectBoxModule } from 'devextreme-angular';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

let modulePrefix = '';
// @ts-ignore
if (window && window.config?.packageConfigPaths) {
  modulePrefix = '/app';
}

@Component({
  selector: 'demo-app',
  templateUrl: `.${modulePrefix}/app.component.html`,
  styleUrls: [`.${modulePrefix}/app.component.css`],
  imports: [
    DxCalendarModule,
    DxSelectBoxModule,
  ],
})

export class AppComponent {
  date: Date = new Date(2024, 2, 20);

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
