import type { DemoState } from './demo-state';
import type { EventLog } from './event-log';
import type { WidgetBag } from './widget-bag';

// What a page's build() receives on every (re)build.
export interface PageContext {
  state: DemoState;
  rtl: boolean;
  log: EventLog;
  widgets: WidgetBag;
  // Disposes the page's widgets and builds them again with the same state, for
  // options a widget cannot change at runtime.
  rebuild: () => void;
}
