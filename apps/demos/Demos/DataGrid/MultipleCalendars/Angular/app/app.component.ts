import { bootstrapApplication } from '@angular/platform-browser';
import { Component, enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { DxDataGridModule, DxSelectBoxModule } from 'devextreme-angular';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

let modulePrefix = '';
// @ts-ignore
if (window && window.config?.packageConfigPaths) {
  modulePrefix = '/app';
}

const orders = [
  { ID: 1, ProductName: 'SuperLCD 42', OrderDate: new Date(2024, 2, 20), Amount: 18200 },
  { ID: 2, ProductName: 'DesktopLED 21', OrderDate: new Date(2024, 3, 10), Amount: 2870 },
  { ID: 3, ProductName: 'SuperPlasma 50', OrderDate: new Date(2024, 5, 1), Amount: 16100 },
  { ID: 4, ProductName: 'HD Video Player', OrderDate: new Date(2024, 8, 7), Amount: 3370 },
  { ID: 5, ProductName: 'SuperHD Video Player', OrderDate: new Date(2024, 11, 24), Amount: 8230 },
  { ID: 6, ProductName: 'Projector PlusHD', OrderDate: new Date(2025, 0, 15), Amount: 4980 },
];

@Component({
  selector: 'demo-app',
  templateUrl: `.${modulePrefix}/app.component.html`,
  styleUrls: [`.${modulePrefix}/app.component.css`],
  imports: [
    DxDataGridModule,
    DxSelectBoxModule,
  ],
})

export class AppComponent {
  orders = orders;

  calendar = 'gregorian';

  dateFormat: Record<string, string> = { type: 'shortdate', calendar: 'gregorian' };

  editorOptions: Record<string, string> = { calendar: 'gregorian' };

  calendars = [
    { id: 'gregorian', text: 'Gregorian' },
    { id: 'persian', text: 'Persian (Jalali)' },
    { id: 'hijri', text: 'Hijri (tabular)' },
    { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
  ];

  onCalendarChanged(e): void {
    this.calendar = e.value;
    this.dateFormat = { type: 'shortdate', calendar: e.value };
    this.editorOptions = { calendar: e.value };
  }
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
  ],
});
