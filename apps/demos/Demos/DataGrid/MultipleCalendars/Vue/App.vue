<template>
  <div>
    <div class="options">
      <span>Calendar</span>
      <DxSelectBox
        :items="calendars"
        :value="calendar"
        :input-attr="{ 'aria-label': 'Calendar' }"
        value-expr="id"
        display-expr="text"
        @value-changed="onCalendarChanged"
      />
    </div>
    <DxDataGrid
      :data-source="orders"
      key-expr="ID"
      :show-borders="true"
    >
      <DxEditing mode="cell" :allow-updating="true" />
      <DxColumn data-field="ProductName" caption="Product" />
      <DxColumn
        data-field="OrderDate"
        data-type="date"
        :format="dateFormat"
        :editor-options="editorOptions"
      />
      <DxColumn data-field="Amount" format="currency" />
    </DxDataGrid>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import DxDataGrid, { DxColumn, DxEditing } from 'devextreme-vue/data-grid';
import DxSelectBox from 'devextreme-vue/select-box';
import { orders } from './data';

const calendar = ref('gregorian');

const calendars = [
  { id: 'gregorian', text: 'Gregorian' },
  { id: 'persian', text: 'Persian (Jalali)' },
  { id: 'hijri', text: 'Hijri (tabular)' },
  { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
];

const dateFormat = computed(() => ({ type: 'shortdate', calendar: calendar.value }));
const editorOptions = computed(() => ({ calendar: calendar.value }));

function onCalendarChanged(e) {
  calendar.value = e.value;
}
</script>
<style>
.options {
  margin-bottom: 20px;
  max-width: 260px;
}

.options > span {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
</style>
