import $ from 'jquery';
import fx from 'common/core/animation/fx';
import '__internal/scheduler/m_scheduler';

import 'generic_light.css!';
import { createWrapper } from '../../helpers/scheduler/helpers.js';

QUnit.testStart(function() {
    $('#qunit-fixture').html('<div id="scheduler"></div>');
});

// 2013-10-15 is in Persian year 1392.
const PERSIAN_DATE = new Date(2013, 9, 15);

const moduleConfig = {
    beforeEach: function() {
        fx.off = true;
        this.createInstance = async function(options) {
            const scheduler = await createWrapper(options);
            this.instance = scheduler.instance;
        };
    },
    afterEach: function() {
        fx.off = false;
    }
};

QUnit.module('Integration: Scheduler with calendar option', moduleConfig, function() {
    QUnit.test('navigator caption shows the persian year in day view', async function(assert) {
        await this.createInstance({
            currentDate: PERSIAN_DATE,
            views: ['day'],
            currentView: 'day',
            calendar: 'persian',
        });

        const caption = this.instance.$element().find('.dx-scheduler-navigator-caption').text();
        assert.notStrictEqual(caption.indexOf('1392'), -1, `caption shows the persian year (got: ${caption})`);
        assert.equal(caption.indexOf('2013'), -1, 'caption does not show the gregorian year');
    });

    QUnit.test('gregorian navigator caption is unchanged', async function(assert) {
        await this.createInstance({
            currentDate: PERSIAN_DATE,
            views: ['day'],
            currentView: 'day',
            calendar: 'gregorian',
        });

        const caption = this.instance.$element().find('.dx-scheduler-navigator-caption').text();
        assert.notStrictEqual(caption.indexOf('2013'), -1, `caption shows the gregorian year (got: ${caption})`);
    });

    QUnit.test('month-view caption shows the persian month and year', async function(assert) {
        await this.createInstance({
            currentDate: PERSIAN_DATE,
            views: ['month'],
            currentView: 'month',
            calendar: 'persian',
        });

        const caption = this.instance.$element().find('.dx-scheduler-navigator-caption').text();
        assert.notStrictEqual(caption.indexOf('1392'), -1, `month caption shows the persian year (got: ${caption})`);
    });

    QUnit.test('changing the calendar option re-renders the caption', async function(assert) {
        await this.createInstance({
            currentDate: PERSIAN_DATE,
            views: ['day'],
            currentView: 'day',
            calendar: 'gregorian',
        });

        this.instance.option('calendar', 'persian');

        const caption = this.instance.$element().find('.dx-scheduler-navigator-caption').text();
        assert.notStrictEqual(caption.indexOf('1392'), -1, 'caption updates to the persian year');
    });

    QUnit.test('appointment date stays a gregorian Date', async function(assert) {
        const startDate = new Date(2013, 9, 15, 10);
        const endDate = new Date(2013, 9, 15, 11);

        await this.createInstance({
            currentDate: PERSIAN_DATE,
            views: ['day'],
            currentView: 'day',
            calendar: 'persian',
            dataSource: [{ text: 'Task', startDate, endDate }],
        });

        const stored = this.instance.option('dataSource')[0].startDate;
        assert.equal(stored.getFullYear(), 2013, 'stored start date keeps the gregorian year');
    });
});
