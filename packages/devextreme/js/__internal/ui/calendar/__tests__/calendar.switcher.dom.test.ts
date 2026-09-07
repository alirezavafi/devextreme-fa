/* eslint-disable spellcheck/spell-checker */
import {
  beforeEach, describe, expect, it,
} from '@jest/globals';
import Calendar from '@ts/ui/calendar/calendar';
import DateBox from '@ts/ui/date_box/date_box';

describe('Calendar in-picker switcher dropdown DOM', () => {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let host: HTMLDivElement;

  beforeEach(() => {
    document.body.innerHTML = '';
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  it('the SelectBox dropdown content carries dx-inner-overlay', async () => {
    // eslint-disable-next-line no-new
    new Calendar(host, {
      value: new Date(2024, 2, 20),
      calendar: 'persian',
      calendarSwitcher: true,
    });
    await new Promise(process.nextTick);

    const switcher = host.querySelector('.dx-calendar-switcher-select');
    expect(switcher).not.toBeNull();

    const calendarInstance = Calendar.getInstance(host);
    const selectBox = (calendarInstance)._switcherSelectBox;
    expect(selectBox).toBeTruthy();
    selectBox.option('opened', true);
    await new Promise(process.nextTick);

    const innerOverlayContent = document.body.querySelector(
      '.dx-overlay-content.dx-inner-overlay',
    );
    expect(innerOverlayContent).not.toBeNull();
  });

  it('clicking inside the in-picker SelectBox dropdown does not close the parent DateBox popup', async () => {
    // eslint-disable-next-line no-new
    new DateBox(host, {
      value: new Date(2024, 2, 20),
      pickerType: 'calendar',
      calendar: 'persian',
      calendarSwitcher: true,
    });
    await new Promise(process.nextTick);

    const dateBoxInstance = DateBox.getInstance(host);
    expect(dateBoxInstance).toBeTruthy();
    dateBoxInstance.open();
    await new Promise(process.nextTick);

    expect(dateBoxInstance.option('opened')).toBe(true);

    // Locate the embedded Calendar widget rendered into the DateBox popup
    // content, then its switcher SelectBox.
    const calendarHost = document.body.querySelector('.dx-calendar') as HTMLElement;
    expect(calendarHost).not.toBeNull();
    const calendarInstance = Calendar.getInstance(calendarHost);
    expect(calendarInstance).toBeTruthy();
    const selectBox = calendarInstance._switcherSelectBox;
    expect(selectBox).toBeTruthy();

    // 1) Click the SelectBox input itself: the input lives inside the Calendar
    //    widget which is inside the DateBox popup content, so it should not
    //    register as an outside click.
    const sbInput = calendarHost.querySelector(
      '.dx-calendar-switcher-select .dx-texteditor-input',
    ) as HTMLElement;
    expect(sbInput).not.toBeNull();
    const inputEvent = new MouseEvent('dxpointerdown', { bubbles: true, cancelable: true });
    sbInput.dispatchEvent(inputEvent);
    await new Promise(process.nextTick);
    expect(dateBoxInstance.option('opened')).toBe(true);

    // 2) Open the SelectBox dropdown and click an item inside it. The dropdown
    //    overlay is rendered into <body> with dx-inner-overlay, so a click in
    //    it must not close the parent popup either.
    selectBox.option('opened', true);
    await new Promise(process.nextTick);

    const sbOverlay = document.body.querySelector(
      '.dx-overlay-content.dx-inner-overlay',
    ) as HTMLElement;
    expect(sbOverlay).not.toBeNull();

    const overlayEvent = new MouseEvent('dxpointerdown', { bubbles: true, cancelable: true });
    sbOverlay.dispatchEvent(overlayEvent);
    await new Promise(process.nextTick);
    expect(dateBoxInstance.option('opened')).toBe(true);
  });
});
