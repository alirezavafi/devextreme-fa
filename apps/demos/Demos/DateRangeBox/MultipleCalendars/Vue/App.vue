<template>
  <div class="dx-fieldset">
    <div class="dx-field">
      <div class="dx-field-label">Calendar</div>
      <div class="dx-field-value">
        <DxSelectBox
          :items="calendars"
          :value="calendar"
          :input-attr="{ 'aria-label': 'Calendar' }"
          value-expr="id"
          display-expr="text"
          @value-changed="onCalendarChanged"
        />
      </div>
    </div>
    <div class="dx-field">
      <div class="dx-field-label">Date range</div>
      <div class="dx-field-value">
        <DxDateRangeBox
          :value="value"
          :calendar="calendar"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import DxDateRangeBox from 'devextreme-vue/date-range-box';
import DxSelectBox from 'devextreme-vue/select-box';

const value = [new Date(2024, 2, 20), new Date(2024, 3, 10)];
const calendar = ref('gregorian');

const calendars = [
  { id: 'gregorian', text: 'Gregorian' },
  { id: 'persian', text: 'Persian (Jalali)' },
  { id: 'hijri', text: 'Hijri (tabular)' },
  { id: 'hijri-umalqura', text: 'Hijri (Umm al-Qura)' },
];

function onCalendarChanged(e) {
  calendar.value = e.value;
}
</script>
<style>
.dx-fieldset {
  min-height: 400px;
}
</style>
