<template>
  <div>
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
        <div class="dx-field-label">Rollers picker</div>
        <div class="dx-field-value">
          <DxDateBox
            :value="date"
            :calendar="calendar"
            :input-attr="{ 'aria-label': 'Date' }"
            picker-type="rollers"
          />
        </div>
      </div>
      <div class="dx-field">
        <div class="dx-field-label">Calendar grid picker</div>
        <div class="dx-field-value">
          <DxDateBox
            :value="date"
            :calendar="calendar"
            :input-attr="{ 'aria-label': 'Date' }"
            picker-type="calendar"
          />
        </div>
      </div>
      <div class="dx-field">
        <div class="dx-field-label">Typed input (mask)</div>
        <div class="dx-field-value">
          <DxDateBox
            :value="date"
            :calendar="calendar"
            :use-mask-behavior="true"
            :input-attr="{ 'aria-label': 'Date' }"
            picker-type="calendar"
            display-format="yyyy/MM/dd"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import DxDateBox from 'devextreme-vue/date-box';
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
.dx-fieldset {
  min-height: 500px;
}
</style>
