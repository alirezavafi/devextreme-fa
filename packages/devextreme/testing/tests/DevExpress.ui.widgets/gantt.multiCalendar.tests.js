import $ from 'jquery';

import 'ui/gantt_multi_calendar';

import 'generic_light.css!';

const GANTT_CLASS = 'dx-gantt';
const MC_CLASS = 'dx-gantt-mc';
const VIEW_CLASS = 'dx-gantt-view';
const TREELIST_WRAPPER_CLASS = 'dx-gantt-treelist-wrapper';

// March 2024 falls in Persian year 1403 (Farvardin starts ~2024-03-20).
const TASKS = [
    { id: 1, parentId: null, title: 'A', start: new Date(2024, 2, 20), end: new Date(2024, 3, 5), progress: 50 },
    { id: 2, parentId: null, title: 'B', start: new Date(2024, 3, 10), end: new Date(2024, 4, 1), progress: 20 },
    { id: 3, parentId: null, title: 'C', start: new Date(2024, 4, 5), end: new Date(2024, 4, 20), progress: 0 },
    { id: 4, parentId: null, title: 'M', start: new Date(2024, 4, 25), end: new Date(2024, 4, 25), progress: 0 },
];
const DEPENDENCIES = [
    { id: 'd1', predecessorId: 1, successorId: 2, type: 0 },
];

function createGantt(options) {
    const $el = $('#gantt').dxGanttMultiCalendar($.extend({
        tasks: { dataSource: TASKS.map((t) => ({ ...t })) },
        dependencies: { dataSource: DEPENDENCIES.map((d) => ({ ...d })) },
        scaleType: 'months',
        height: 400,
    }, options));
    return $el.dxGanttMultiCalendar('instance');
}

function bottomTierLabels($el) {
    const tiers = $el.find(`.${VIEW_CLASS} > .dx-gantt-header > .dx-gantt-tsa`);
    return tiers.eq(tiers.length - 1).find('.dx-gantt-si').map((_, c) => $(c).text()).get();
}

function dispatchMouse(target, type, clientX, clientY) {
    target.dispatchEvent(new MouseEvent(type, {
        clientX, clientY, button: 0, bubbles: true,
    }));
}

function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

QUnit.testStart(function() {
    $('#qunit-fixture').html('<div id="gantt" style="width: 900px;"></div>');
});

QUnit.module('rendering', {
    beforeEach() { this.clock = sinon.useFakeTimers(); },
    afterEach() { this.clock.restore(); },
}, () => {
    QUnit.test('renders the themed root, tree list and timeline', function(assert) {
        const $el = $('#gantt');
        createGantt();
        this.clock.tick(50);

        assert.ok($el.hasClass(GANTT_CLASS), 'has dx-gantt');
        assert.ok($el.hasClass(MC_CLASS), 'has dx-gantt-mc');
        assert.equal($el.find(`.${TREELIST_WRAPPER_CLASS}`).length, 1, 'tree list wrapper rendered');
        assert.equal($el.find(`.${VIEW_CLASS}`).length, 1, 'timeline view rendered');
        assert.ok($el.find('.dx-gantt-header').length >= 1, 'header rendered');
    });

    QUnit.test('renders task bars, a milestone, handles and a dependency connector', function(assert) {
        const $el = $('#gantt');
        createGantt();
        this.clock.tick(50);

        assert.equal($el.find('.dx-gantt-taskWrapper').length, 3, 'three task bars (milestone excluded)');
        assert.equal($el.find('.dx-gantt-milestone').length, 1, 'one milestone');
        assert.equal($el.find('.dx-gantt-dep-handle').length, 6, 'two dependency handles per bar');
        assert.ok($el.find('.dx-gantt-dependency').length >= 1, 'a dependency connector is rendered');
    });
});

QUnit.module('calendar option', {
    beforeEach() { this.clock = sinon.useFakeTimers(); },
    afterEach() { this.clock.restore(); },
}, () => {
    QUnit.test('persian scale labels the header in the persian calendar', function(assert) {
        const $el = $('#gantt');
        createGantt({ calendar: 'persian' });
        this.clock.tick(50);

        const labels = bottomTierLabels($el);
        assert.ok(labels.some((t) => t === 'Far'), `header has a Persian month (got: ${labels.join()})`);
        assert.notOk(labels.some((t) => t === 'Mar'), 'header has no Gregorian month abbreviation');
    });

    QUnit.test('changing the calendar at runtime re-labels and keeps values Gregorian', function(assert) {
        const $el = $('#gantt');
        const inst = createGantt({ calendar: 'gregorian' });
        this.clock.tick(50);
        assert.ok(bottomTierLabels($el).some((t) => t === 'Mar'), 'gregorian baseline');

        inst.option('calendar', 'persian');
        this.clock.tick(50);
        assert.equal(inst.getScaleModel().calendar, 'persian', 'scale model switched');
        assert.ok(bottomTierLabels($el).some((t) => t === 'Far'), 'header relabeled to persian');

        const tasks = inst.option('tasks').dataSource;
        assert.ok(tasks[0].start instanceof Date, 'task start is still a Gregorian Date');
        assert.equal(tasks[0].start.getFullYear(), 2024, 'stored Gregorian year unchanged');
    });
});

QUnit.module('selection', {
    beforeEach() { this.clock = sinon.useFakeTimers(); },
    afterEach() { this.clock.restore(); },
}, () => {
    QUnit.test('selectedRowKey renders a selection band', function(assert) {
        const $el = $('#gantt');
        createGantt({ selectedRowKey: 2 });
        this.clock.tick(50);
        assert.equal($el.find('.dx-gantt-sel').length, 1, 'selection band rendered');
    });
});

QUnit.module('editing', {
    beforeEach() { this.clock = sinon.useFakeTimers(); },
    afterEach() { this.clock.restore(); },
}, () => {
    QUnit.test('dragging a bar body raises onTaskUpdated', function(assert) {
        const $el = $('#gantt');
        let updated = null;
        const inst = createGantt({ onTaskUpdated: (e) => { updated = e; } });
        this.clock.tick(50);

        const bar = $el.find('.dx-gantt-taskWrapper[data-task-id="2"]').get(0);
        const c = center(bar);
        dispatchMouse(bar, 'mousedown', c.x, c.y);
        dispatchMouse(document, 'mousemove', c.x + 120, c.y);
        dispatchMouse(document, 'mouseup', c.x + 120, c.y);

        assert.ok(updated, 'onTaskUpdated fired');
        assert.equal(updated.key, 2, 'for the dragged task');
        inst.dispose();
    });

    QUnit.test('drawing from a handle to another bar inserts a dependency', function(assert) {
        const $el = $('#gantt');
        let inserted = null;
        const inst = createGantt({ onDependencyInserted: (e) => { inserted = e; } });
        this.clock.tick(50);

        const handle = $el.find('.dx-gantt-taskWrapper[data-task-id="2"] .dx-gantt-dep-handle-finish').get(0);
        const hc = center(handle);
        const target = $el.find('.dx-gantt-taskWrapper[data-task-id="3"]').get(0);
        const tc = center(target);

        dispatchMouse(handle, 'mousedown', hc.x, hc.y);
        dispatchMouse(document, 'mousemove', tc.x, tc.y);
        dispatchMouse(document, 'mouseup', tc.x, tc.y);

        assert.ok(inserted, 'onDependencyInserted fired');
        assert.equal(inserted.predecessorId, 2, 'predecessor is the source task');
        assert.equal(inserted.successorId, 3, 'successor is the target task');
        inst.dispose();
    });

    QUnit.test('clicking a connector deletes the dependency', function(assert) {
        const $el = $('#gantt');
        let deleted = null;
        const inst = createGantt({ onDependencyDeleted: (e) => { deleted = e; } });
        this.clock.tick(50);

        const connector = $el.find('.dx-gantt-dependency .dx-gantt-conn-h, .dx-gantt-dependency .dx-gantt-conn-v').get(0);
        dispatchMouse(connector, 'click', 0, 0);

        assert.ok(deleted, 'onDependencyDeleted fired');
        assert.equal(inst.option('dependencies').dataSource.length, 0, 'dependency removed from data source');
        inst.dispose();
    });

    QUnit.test('editing.enabled=false suppresses drag edits', function(assert) {
        const $el = $('#gantt');
        let updated = null;
        const inst = createGantt({ editing: { enabled: false }, onTaskUpdated: (e) => { updated = e; } });
        this.clock.tick(50);

        const bar = $el.find('.dx-gantt-taskWrapper[data-task-id="2"]').get(0);
        const c = center(bar);
        dispatchMouse(bar, 'mousedown', c.x, c.y);
        dispatchMouse(document, 'mousemove', c.x + 120, c.y);
        dispatchMouse(document, 'mouseup', c.x + 120, c.y);

        assert.notOk(updated, 'no edit committed when editing is disabled');
        inst.dispose();
    });
});
