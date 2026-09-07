import $ from 'jquery';

import 'ui/data_grid';

import 'generic_light.css!';

// 2013-10-15 is in Persian year 1392.
const PERSIAN_VALUE = new Date(2013, 9, 15);

const DATA = [{ id: 1, orderDate: PERSIAN_VALUE }];

QUnit.testStart(function() {
    $('#qunit-fixture').html('<div id="dataGrid"></div>');
});

QUnit.module('DataGrid date column with calendar format', {
    beforeEach: function() {
        this.clock = sinon.useFakeTimers();
    },
    afterEach: function() {
        this.clock.restore();
    }
}, () => {
    function createGrid(calendar) {
        const $grid = $('#dataGrid').dxDataGrid({
            dataSource: DATA,
            keyExpr: 'id',
            columns: [{
                dataField: 'orderDate',
                dataType: 'date',
                format: { type: 'yyyy', calendar },
                editorOptions: { calendar },
            }],
            editing: { mode: 'cell', allowUpdating: true },
        });

        return $grid.dxDataGrid('instance');
    }

    QUnit.test('date cell is displayed in the persian calendar', function(assert) {
        const grid = createGrid('persian');
        this.clock.tick(30);

        const text = $(grid.getCellElement(0, 0)).text();
        assert.notStrictEqual(text.indexOf('1392'), -1, `cell shows the persian year (got: ${text})`);
        assert.equal(text.indexOf('2013'), -1, 'cell does not show the gregorian year');
    });

    QUnit.test('gregorian date cell is unchanged', function(assert) {
        const grid = createGrid('gregorian');
        this.clock.tick(30);

        const text = $(grid.getCellElement(0, 0)).text();
        assert.notStrictEqual(text.indexOf('2013'), -1, `cell shows the gregorian year (got: ${text})`);
    });

    QUnit.test('inline editor uses the calendar via editorOptions', function(assert) {
        const grid = createGrid('persian');
        this.clock.tick(30);

        grid.editCell(0, 0);
        this.clock.tick(30);

        const $input = $(grid.getCellElement(0, 0)).find('.dx-texteditor-input');
        assert.equal($input.length, 1, 'an editor is rendered');

        const dateBox = $(grid.getCellElement(0, 0)).find('.dx-datebox').dxDateBox('instance');
        assert.equal(dateBox.option('calendar'), 'persian', 'editor receives the persian calendar');
    });

    QUnit.test('stored value remains a gregorian Date (sorting/filtering unaffected)', function(assert) {
        const grid = createGrid('persian');
        this.clock.tick(30);

        const value = grid.cellValue(0, 0);
        assert.ok(value instanceof Date, 'value is a Date');
        assert.equal(value.getFullYear(), 2013, 'value keeps the gregorian year');
    });
});
