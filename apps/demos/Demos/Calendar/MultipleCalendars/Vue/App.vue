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
    <div class="calendar-container">
      <DxCalendar
        :value="date"
        :calendar="calendar"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import DxCalendar from 'devextreme-vue/calendar';
import DxSelectBox from 'devextreme-vue/select-box';

const date = new Date(2024, 2, 20);
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
.options {
  margin-bottom: 20px;
  max-width: 260px;
}

.options > span {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.calendar-container {
  display: inline-block;
}
</style>
