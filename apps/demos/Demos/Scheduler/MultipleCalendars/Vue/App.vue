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
    <DxScheduler
      :data-source="data"
      :calendar="calendar"
      :views="views"
      :current-date="currentDate"
      :start-day-hour="8"
      :end-day-hour="18"
      :height="600"
      current-view="month"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import DxScheduler from 'devextreme-vue/scheduler';
import DxSelectBox from 'devextreme-vue/select-box';
import { data } from './data';

const currentDate = new Date(2024, 2, 25);
const views = ['week', 'month'];
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
</style>
