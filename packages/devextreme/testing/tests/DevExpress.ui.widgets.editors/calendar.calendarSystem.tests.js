import $ from 'jquery';
import { getRegisteredCalendarTypes, getCalendar } from 'common/core/localization/calendar';

import 'ui/calendar';
import 'ui/date_box';
import 'ui/date_range_box';

const CALENDAR_CAPTION_BUTTON_CLASS = 'dx-calendar-caption-button';
const CALENDAR_SWITCHER_CLASS = 'dx-calendar-switcher';
const CALENDAR_SWITCHER_SELECT_CLASS = 'dx-calendar-switcher-select';
const CALENDAR_HAS_SWITCHER_CLASS = 'dx-calendar-with-switcher';
const TEXTEDITOR_INPUT_CLASS = 'dx-texteditor-input';

// 2013-10-15 is in Persian year 1392.
const PERSIAN_VALUE = new Date(2013, 9, 15);

QUnit.module('Calendar system registry', () => {
    QUnit.test('built-in calendars are registered', function(assert) {
        const types = getRegisteredCalendarTypes();
        assert.notStrictEqual(types.indexOf('gregorian'), -1, 'gregorian');
        assert.notStrictEqual(types.indexOf('persian'), -1, 'persian');
        assert.notStrictEqual(types.indexOf('hijri'), -1, 'hijri');
    });

    QUnit.test('getCalendar falls back to gregorian for unknown type', function(assert) {
        assert.equal(getCalendar('unknown-calendar').type, 'gregorian');
    });
});

QUnit.module('dxCalendar with calendar option', {
    beforeEach: function() {
        this.$element = $('<div>').appendTo('#qunit-fixture');
    },
    afterEach: function() {
        this.$element.remove();
    }
}, () => {
    QUnit.test('navigator caption is rendered in the persian calendar', function(assert) {
        this.$element.dxCalendar({ value: PERSIAN_VALUE, calendar: 'persian' });

        const caption = this.$element.find(`.${CALENDAR_CAPTION_BUTTON_CLASS}`).first().text();

        assert.notStrictEqual(caption.indexOf('1392'), -1, `caption shows the persian year (got: ${caption})`);
        assert.equal(caption.indexOf('2013'), -1, 'caption does not show the gregorian year');
    });

    QUnit.test('gregorian caption is unchanged', function(assert) {
        this.$element.dxCalendar({ value: PERSIAN_VALUE, calendar: 'gregorian' });

        const caption = this.$element.find(`.${CALENDAR_CAPTION_BUTTON_CLASS}`).first().text();

        assert.notStrictEqual(caption.indexOf('2013'), -1, 'caption shows the gregorian year');
    });

    QUnit.test('changing the calendar option re-renders the caption', function(assert) {
        const calendar = this.$element.dxCalendar({ value: PERSIAN_VALUE }).dxCalendar('instance');

        calendar.option('calendar', 'persian');

        const caption = this.$element.find(`.${CALENDAR_CAPTION_BUTTON_CLASS}`).first().text();
        assert.notStrictEqual(caption.indexOf('1392'), -1, 'caption updates to the persian year');
    });
});

QUnit.module('dxDateBox with calendar option', {
    beforeEach: function() {
        this.$element = $('<div>').appendTo('#qunit-fixture');
    },
    afterEach: function() {
        this.$element.remove();
    }
}, () => {
    QUnit.test('input shows the value in the persian calendar', function(assert) {
        this.$element.dxDateBox({
            value: PERSIAN_VALUE,
            calendar: 'persian',
            displayFormat: 'yyyy/MM/dd',
            pickerType: 'rollers',
        });

        const text = this.$element.find(`.${TEXTEDITOR_INPUT_CLASS}`).val();
        assert.notStrictEqual(text.indexOf('1392'), -1, `input shows the persian year (got: ${text})`);
    });

    QUnit.test('gregorian input is unchanged', function(assert) {
        this.$element.dxDateBox({
            value: PERSIAN_VALUE,
            displayFormat: 'yyyy/MM/dd',
            pickerType: 'rollers',
        });

        const text = this.$element.find(`.${TEXTEDITOR_INPUT_CLASS}`).val();
        assert.notStrictEqual(text.indexOf('2013'), -1, 'input shows the gregorian year');
    });
});

function changeSwitcherValue($switcher, value) {
    // The switcher is a dxSelectBox; access its instance via jQuery data and set value.
    const $selectEl = $switcher.find('.dx-selectbox').first();
    const instance = $selectEl.length
        ? $selectEl.dxSelectBox('instance')
        : $switcher.dxSelectBox('instance');
    instance.option('value', value);
}

QUnit.module('dxCalendar in-picker switcher', {
    beforeEach: function() {
        this.$element = $('<div>').appendTo('#qunit-fixture');
    },
    afterEach: function() {
        this.$element.remove();
    }
}, () => {
    QUnit.test('switcher is not rendered by default', function(assert) {
        this.$element.dxCalendar({ value: PERSIAN_VALUE });

        assert.equal(this.$element.find(`.${CALENDAR_SWITCHER_CLASS}`).length, 0, 'no switcher element');
        assert.notOk(this.$element.hasClass(CALENDAR_HAS_SWITCHER_CLASS), 'no with-switcher class');
    });

    QUnit.test('switcher is rendered when calendarSwitcher is true', function(assert) {
        this.$element.dxCalendar({ value: PERSIAN_VALUE, calendarSwitcher: true });

        const $switcher = this.$element.find(`.${CALENDAR_SWITCHER_CLASS}`);
        const $selectBox = $switcher.find(`.${CALENDAR_SWITCHER_SELECT_CLASS}`);
        assert.equal($switcher.length, 1, 'switcher container is rendered');
        assert.equal($selectBox.length, 1, 'selectbox container is rendered');
        assert.ok(this.$element.hasClass(CALENDAR_HAS_SWITCHER_CLASS), 'with-switcher class is added');

        const items = $switcher.find('.dx-selectbox').first().dxSelectBox('option', 'items');
        assert.ok(items.length >= 2, 'an item per registered calendar');
    });

    QUnit.test('switcher reflects the current calendar', function(assert) {
        this.$element.dxCalendar({ value: PERSIAN_VALUE, calendar: 'persian', calendarSwitcher: true });

        const value = this.$element.find('.dx-selectbox').first().dxSelectBox('option', 'value');
        assert.equal(value, 'persian', 'persian is selected');
    });

    QUnit.test('only configured items are listed and order is preserved', function(assert) {
        this.$element.dxCalendar({
            value: PERSIAN_VALUE,
            calendarSwitcher: { items: ['persian', 'gregorian'] },
        });

        const items = this.$element.find('.dx-selectbox').first().dxSelectBox('option', 'items');
        const types = items.map((item) => item.type);
        assert.deepEqual(types, ['persian', 'gregorian'], 'items match the configured list and order');
    });

    QUnit.test('selecting a calendar updates the option and caption', function(assert) {
        const calendar = this.$element.dxCalendar({
            value: PERSIAN_VALUE,
            calendar: 'gregorian',
            calendarSwitcher: true,
        }).dxCalendar('instance');

        changeSwitcherValue(this.$element.find(`.${CALENDAR_SWITCHER_CLASS}`), 'persian');

        assert.equal(calendar.option('calendar'), 'persian', 'calendar option updates');

        const caption = this.$element.find(`.${CALENDAR_CAPTION_BUTTON_CLASS}`).first().text();
        assert.notStrictEqual(caption.indexOf('1392'), -1, 'caption switches to the persian year');
    });

    QUnit.test('changing the calendar option syncs the switcher value', function(assert) {
        const calendar = this.$element.dxCalendar({
            value: PERSIAN_VALUE,
            calendar: 'gregorian',
            calendarSwitcher: true,
        }).dxCalendar('instance');

        calendar.option('calendar', 'persian');

        const value = this.$element.find('.dx-selectbox').first().dxSelectBox('option', 'value');
        assert.equal(value, 'persian', 'switcher value follows the calendar option');
    });

    QUnit.test('toggling calendarSwitcher off removes the control', function(assert) {
        const calendar = this.$element.dxCalendar({
            value: PERSIAN_VALUE,
            calendarSwitcher: true,
        }).dxCalendar('instance');

        calendar.option('calendarSwitcher', false);

        assert.equal(this.$element.find(`.${CALENDAR_SWITCHER_CLASS}`).length, 0, 'switcher removed');
        assert.notOk(this.$element.hasClass(CALENDAR_HAS_SWITCHER_CLASS), 'with-switcher class removed');
    });
});

QUnit.module('dxDateBox calendar picker switcher', {
    beforeEach: function() {
        this.$element = $('<div>').appendTo('#qunit-fixture');
    },
    afterEach: function() {
        this.$element.remove();
    }
}, () => {
    QUnit.test('switcher appears in the calendar dropdown when enabled', function(assert) {
        const dateBox = this.$element.dxDateBox({
            value: PERSIAN_VALUE,
            pickerType: 'calendar',
            calendar: 'persian',
            calendarSwitcher: true,
            opened: true,
        }).dxDateBox('instance');

        const $content = $(dateBox.content());
        assert.equal($content.find(`.${CALENDAR_SWITCHER_CLASS}`).length, 1, 'switcher rendered inside the picker');
        assert.equal($content.find(`.${CALENDAR_SWITCHER_SELECT_CLASS}`).length, 1, 'selectbox rendered inside the picker');
    });

    QUnit.test('no switcher in the dropdown by default', function(assert) {
        const dateBox = this.$element.dxDateBox({
            value: PERSIAN_VALUE,
            pickerType: 'calendar',
            calendar: 'persian',
            opened: true,
        }).dxDateBox('instance');

        const $content = $(dateBox.content());
        assert.equal($content.find(`.${CALENDAR_SWITCHER_CLASS}`).length, 0, 'no switcher');
    });

    QUnit.test('changing in-picker calendar propagates to the DateBox option', function(assert) {
        const dateBox = this.$element.dxDateBox({
            value: PERSIAN_VALUE,
            pickerType: 'calendar',
            calendar: 'gregorian',
            calendarSwitcher: true,
            opened: true,
        }).dxDateBox('instance');

        const $content = $(dateBox.content());
        changeSwitcherValue($content.find(`.${CALENDAR_SWITCHER_CLASS}`), 'persian');

        assert.equal(dateBox.option('calendar'), 'persian', 'DateBox calendar option mirrors the in-picker change');
    });
});

QUnit.module('dxDateRangeBox with calendar option', {
    beforeEach: function() {
        this.$element = $('<div>').appendTo('#qunit-fixture');
    },
    afterEach: function() {
        this.$element.remove();
    }
}, () => {
    // 2013-10-15 .. 2013-11-04 are both in Persian year 1392.
    const START_VALUE = new Date(2013, 9, 15);
    const END_VALUE = new Date(2013, 10, 4);

    QUnit.test('both inputs show the value in the persian calendar', function(assert) {
        this.$element.dxDateRangeBox({
            value: [START_VALUE, END_VALUE],
            calendar: 'persian',
            displayFormat: 'yyyy/MM/dd',
        });

        const inputs = this.$element.find(`.${TEXTEDITOR_INPUT_CLASS}`);
        assert.notStrictEqual(inputs.eq(0).val().indexOf('1392'), -1, `start input shows the persian year (got: ${inputs.eq(0).val()})`);
        assert.notStrictEqual(inputs.eq(1).val().indexOf('1392'), -1, `end input shows the persian year (got: ${inputs.eq(1).val()})`);
    });

    QUnit.test('gregorian inputs are unchanged', function(assert) {
        this.$element.dxDateRangeBox({
            value: [START_VALUE, END_VALUE],
            calendar: 'gregorian',
            displayFormat: 'yyyy/MM/dd',
        });

        const inputs = this.$element.find(`.${TEXTEDITOR_INPUT_CLASS}`);
        assert.notStrictEqual(inputs.eq(0).val().indexOf('2013'), -1, 'start input shows the gregorian year');
        assert.notStrictEqual(inputs.eq(1).val().indexOf('2013'), -1, 'end input shows the gregorian year');
    });

    QUnit.test('changing the calendar option updates both inputs', function(assert) {
        const rangeBox = this.$element.dxDateRangeBox({
            value: [START_VALUE, END_VALUE],
            displayFormat: 'yyyy/MM/dd',
        }).dxDateRangeBox('instance');

        rangeBox.option('calendar', 'persian');

        const inputs = this.$element.find(`.${TEXTEDITOR_INPUT_CLASS}`);
        assert.notStrictEqual(inputs.eq(0).val().indexOf('1392'), -1, 'start input updates to the persian year');
        assert.notStrictEqual(inputs.eq(1).val().indexOf('1392'), -1, 'end input updates to the persian year');
    });

    QUnit.test('stored value remains an array of gregorian Dates', function(assert) {
        const rangeBox = this.$element.dxDateRangeBox({
            value: [START_VALUE, END_VALUE],
            calendar: 'persian',
        }).dxDateRangeBox('instance');

        const [start, end] = rangeBox.option('value');
        assert.equal(start.getFullYear(), 2013, 'start keeps the gregorian year');
        assert.equal(end.getFullYear(), 2013, 'end keeps the gregorian year');
    });
});
