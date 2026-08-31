<template>
  <div class="comparator">
    <!-- Navigation de la période active -->
    <div class="comparator__trigger">
      <button
        type="button"
        class="fr-btn fr-btn--secondary fr-icon-arrow-left-s-line"
        aria-label="Période précédente"
        @click="shiftPeriod(-1)"
      />

      <button
        type="button"
        class="fr-btn fr-btn--tertiary-no-outline fr-icon-calendar-line fr-btn--sm comparator__period-button"
        @click="togglePicker"
      >
        <span>{{ currentPeriodLabel }}</span>

        <span class="fr-icon-arrow-down-s-line" aria-hidden="true" />
      </button>

      <button
        type="button"
        class="fr-btn fr-btn--secondary fr-icon-arrow-right-s-line"
        aria-label="Période suivante"
        @click="shiftPeriod(1)"
      />
    </div>

    <!-- Sélecteur de période -->
    <div v-if="isPickerOpen" class="comparator__picker" role="dialog" aria-label="Sélection d'une période">
      <!-- Comparaison entre deux périodes -->
      <div v-if="props.isCompare" class="comparator__periods">
        <div class="comparator__period">
          <span class="fr-label fr-mb-1v"> Comparer </span>

          <span class="comparator__period-value comparator__period-value--disabled">
            {{ referenceLabel }}
          </span>
        </div>

        <div class="comparator__period">
          <span class="fr-label fr-mb-1v"> Avec </span>

          <span class="comparator__period-value">
            {{ draftRangeLabel }}
          </span>
        </div>
      </div>

      <div
        class="comparator__body"
        :class="{
          'comparator__body--single': !props.isCompare,
        }"
      >
        <!-- Choix de la période -->
        <fieldset class="comparator__options">
          <legend class="fr-sr-only">Type de période</legend>

          <label v-for="option in periodOptions" :key="option.value" class="comparator__radio">
            <input v-model="draftUnit" type="radio" name="period" :value="option.value" />

            <span>{{ option.label }}</span>
          </label>
        </fieldset>

        <!-- Calendrier -->
        <div class="comparator__calendar">
          <div class="comparator__calendar-nav">
            <button
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-left-s-line"
              aria-label="Mois précédent"
              @click="goToPreviousMonth"
            />

            <span class="comparator__calendar-title">
              {{ monthLabel }}
            </span>

            <button
              type="button"
              class="fr-btn fr-btn--tertiary-no-outline fr-icon-arrow-right-s-line"
              aria-label="Mois suivant"
              @click="goToNextMonth"
            />
          </div>

          <div class="comparator__weekdays">
            <span v-for="day in weekdays" :key="day">
              {{ day }}
            </span>
          </div>

          <div class="comparator__calendar-grid">
            <button
              v-for="cell in calendarCells"
              :key="cell.date.toISOString()"
              type="button"
              class="comparator__calendar-cell"
              :class="{
                'comparator__calendar-cell--in-range': isInRange(cell.date),
                'comparator__calendar-cell--range-start': isRangeStart(cell.date),
                'comparator__calendar-cell--range-end': isRangeEnd(cell.date),
              }"
              :aria-label="formatFull(cell.date)"
              @click="selectDay(cell.date)"
            >
              <span
                class="comparator__calendar-day"
                :class="{
                  'comparator__calendar-day--outside': !cell.isCurrentMonth,
                  'comparator__calendar-day--edge': isRangeStart(cell.date) || isRangeEnd(cell.date),
                }"
              >
                {{ cell.date.getDate() }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="comparator__footer">
        <button type="button" class="fr-btn fr-btn--secondary" @click="cancel">Annuler</button>

        <button type="button" class="fr-btn" @click="validate">Valider</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

import dayjs, { type Dayjs } from "dayjs";

import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/fr";

dayjs.extend(isoWeek);
dayjs.locale("fr");

/* ==========================================================================
 * Types
 * ========================================================================== */

type Unit = "day" | "week" | "month" | "year";

interface DateRange {
  start: Date;
  end: Date;
}

interface CalendarCell {
  date: Date;
  isCurrentMonth: boolean;
}

interface PeriodOption {
  value: Unit;
  label: string;
}

interface ValidatePayload {
  comparePeriod: Unit;
  compareRange: DateRange;
}

/* ==========================================================================
 * Props et événements
 * ========================================================================== */

const props = withDefaults(
  defineProps<{
    unit?: Unit;
    isCompare?: boolean;
    baseDate: Date;
  }>(),
  {
    unit: "week",
    isCompare: false,
  },
);

const emit = defineEmits<{
  (event: "validate", payload: ValidatePayload): void;
}>();

/* ==========================================================================
 * Constantes
 * ========================================================================== */

const weekdays = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

const months = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const unitLabels: Record<Unit, string> = {
  day: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
  year: "Cette année",
};

/**
 * Les choix dépendent du mode :
 *
 * - mode simple : toutes les unités sont disponibles ;
 * - mode comparaison : uniquement semaine et mois.
 */
const periodOptions = computed<PeriodOption[]>(() => {
  if (props.isCompare) {
    return [
      {
        value: "week",
        label: "Semaine",
      },
      {
        value: "month",
        label: "Mois",
      },
    ];
  }

  return [
    {
      value: "week",
      label: "Semaine",
    },
    {
      value: "month",
      label: "Mois",
    },
  ];
});

/* ==========================================================================
 * État local
 * ========================================================================== */

const isPickerOpen = ref(false);

const selectedUnit = ref<Unit>(props.unit);

const draftUnit = ref<Unit>(props.unit);

const committedDate = ref<Dayjs>(dayjs(props.baseDate));

const draftDate = ref<Dayjs>(dayjs(props.baseDate));

const calendarMonth = ref<Dayjs>(dayjs(props.baseDate).startOf("month"));

/* ==========================================================================
 * Fonctions Day.js
 * ========================================================================== */

function getPeriodRange(unit: Unit, date: Dayjs): DateRange {
  switch (unit) {
    case "day":
      return {
        start: date.startOf("day").toDate(),
        end: date.endOf("day").toDate(),
      };

    case "month":
      return {
        start: date.startOf("month").toDate(),
        end: date.endOf("month").toDate(),
      };

    case "year":
      return {
        start: date.startOf("year").toDate(),
        end: date.endOf("year").toDate(),
      };

    case "week":
    default:
      return {
        start: date.startOf("isoWeek").toDate(),
        end: date.endOf("isoWeek").toDate(),
      };
  }
}

function shiftDate(unit: Unit, date: Dayjs, offset: number): Dayjs {
  switch (unit) {
    case "day":
      return date.add(offset, "day");

    case "month":
      return date.add(offset, "month");

    case "year":
      return date.add(offset, "year");

    case "week":
    default:
      return date.add(offset, "week");
  }
}

/* ==========================================================================
 * Fonctions de formatage
 * ========================================================================== */

function formatShort(date: Date | Dayjs): string {
  return dayjs(date).format("DD/MM");
}

function formatFull(date: Date | Dayjs): string {
  return dayjs(date).format("DD/MM/YYYY");
}

function formatRangeLabel(range: DateRange): string {
  const start = dayjs(range.start);
  const end = dayjs(range.end);

  const isDay = start.isSame(start.startOf("day"), "millisecond") && end.isSame(start.endOf("day"), "millisecond");

  if (isDay) {
    return formatFull(start);
  }

  const isMonth = start.isSame(start.startOf("month"), "day") && end.isSame(start.endOf("month"), "day");

  if (isMonth) {
    return `${months[start.month()]} ${start.year()}`;
  }

  const isYear = start.isSame(start.startOf("year"), "day") && end.isSame(start.endOf("year"), "day");

  if (isYear) {
    return String(start.year());
  }

  const isWeek = start.isSame(start.startOf("isoWeek"), "day") && end.isSame(start.endOf("isoWeek"), "day");

  if (isWeek) {
    return `S${start.isoWeek()} - ${formatShort(start)} au ${formatFull(end)}`;
  }

  return `${formatShort(start)} au ${formatFull(end)}`;
}

function formatPeriodLabel(unit: Unit, range: DateRange): string {
  const start = dayjs(range.start);
  const today = dayjs();

  switch (unit) {
    case "day":
      return start.isSame(today, "day") ? unitLabels.day : formatFull(start);

    case "week": {
      const isCurrentWeek = start.isoWeek() === today.isoWeek() && start.isoWeekYear() === today.isoWeekYear();

      return isCurrentWeek ? unitLabels.week : `Semaine ${start.isoWeek()}`;
    }

    case "month": {
      const isCurrentMonth = start.isSame(today, "month");

      return isCurrentMonth ? unitLabels.month : `${months[start.month()]} ${start.year()}`;
    }

    case "year":
      return start.isSame(today, "year") ? unitLabels.year : String(start.year());
  }
}

/* ==========================================================================
 * Calendrier
 * ========================================================================== */

function buildCalendar(monthDate: Dayjs): CalendarCell[] {
  const firstDayOfMonth = monthDate.startOf("month");

  const offset = firstDayOfMonth.isoWeekday() - 1;

  const firstCellDate = firstDayOfMonth.subtract(offset, "day").startOf("day");

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = firstCellDate.add(index, "day");

    return {
      date: cellDate.toDate(),
      isCurrentMonth: cellDate.month() === monthDate.month(),
    };
  });
}

/* ==========================================================================
 * Computed
 * ========================================================================== */

const committedRange = computed<DateRange>(() => getPeriodRange(selectedUnit.value, committedDate.value));

const draftRange = computed<DateRange>(() => getPeriodRange(draftUnit.value, draftDate.value));

const referenceRange = computed<DateRange>(() => getPeriodRange(props.unit, dayjs(props.baseDate)));

const currentPeriodLabel = computed<string>(() => formatPeriodLabel(selectedUnit.value, committedRange.value));

const referenceLabel = computed<string>(() => formatPeriodLabel(props.unit, referenceRange.value));

const draftRangeLabel = computed<string>(() => formatRangeLabel(draftRange.value));

const monthLabel = computed<string>(() => calendarMonth.value.format("MMMM YYYY"));

const calendarCells = computed<CalendarCell[]>(() => buildCalendar(calendarMonth.value));

/* ==========================================================================
 * Émission vers le parent
 * ========================================================================== */

function emitCurrentPeriod(): void {
  emit("validate", {
    comparePeriod: selectedUnit.value,
    compareRange: committedRange.value,
  });
}

/* ==========================================================================
 * Actions utilisateur
 * ========================================================================== */

function shiftPeriod(offset: number): void {
  committedDate.value = shiftDate(selectedUnit.value, committedDate.value, offset);

  draftDate.value = committedDate.value;

  calendarMonth.value = committedDate.value.startOf("month");

  emitCurrentPeriod();
}

function selectDay(date: Date): void {
  draftDate.value = dayjs(date);
}

function goToPreviousMonth(): void {
  calendarMonth.value = calendarMonth.value.subtract(1, "month");
}

function goToNextMonth(): void {
  calendarMonth.value = calendarMonth.value.add(1, "month");
}

function togglePicker(): void {
  if (isPickerOpen.value) {
    isPickerOpen.value = false;
    return;
  }

  draftUnit.value = selectedUnit.value;
  draftDate.value = committedDate.value;

  calendarMonth.value = committedDate.value.startOf("month");

  isPickerOpen.value = true;
}

function cancel(): void {
  isPickerOpen.value = false;

  draftUnit.value = selectedUnit.value;
  draftDate.value = committedDate.value;
}

function validate(): void {
  selectedUnit.value = draftUnit.value;
  committedDate.value = draftDate.value;

  calendarMonth.value = committedDate.value.startOf("month");

  isPickerOpen.value = false;

  emitCurrentPeriod();
}

function isInRange(date: Date): boolean {
  const currentDate = dayjs(date);
  const startDate = dayjs(draftRange.value.start);
  const endDate = dayjs(draftRange.value.end);

  return !currentDate.isBefore(startDate) && !currentDate.isAfter(endDate);
}

function isRangeStart(date: Date): boolean {
  return dayjs(date).isSame(dayjs(draftRange.value.start), "day");
}

function isRangeEnd(date: Date): boolean {
  return dayjs(date).isSame(dayjs(draftRange.value.end), "day");
}

/* ==========================================================================
 * Watchers
 * ========================================================================== */

watch(
  () => props.baseDate,
  (newDate) => {
    committedDate.value = dayjs(newDate);
    draftDate.value = dayjs(newDate);
    calendarMonth.value = dayjs(newDate).startOf("month");

    emitCurrentPeriod();
  },
);

watch(
  () => props.unit,
  (newUnit) => {
    /*
     * Si le parent change l'unité, la nouvelle unité
     * devient immédiatement l'unité sélectionnée.
     */
    selectedUnit.value = newUnit;
    draftUnit.value = newUnit;

    emitCurrentPeriod();
  },
);

/* ==========================================================================
 * Cycle de vie
 * ========================================================================== */

onMounted(() => {
  selectedUnit.value = props.unit;
  draftUnit.value = props.unit;

  committedDate.value = dayjs(props.baseDate);
  draftDate.value = dayjs(props.baseDate);
  calendarMonth.value = dayjs(props.baseDate).startOf("month");

  emitCurrentPeriod();
});
</script>

<style scoped>
.comparator {
  position: relative;
  width: 100%;
  max-width: 100%;
}

.comparator__trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.comparator__period-button {
  min-width: 11rem;
  justify-content: center;
}

.comparator__picker {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 10;
  width: min(32rem, calc(100vw - 2rem));
  padding: 1.25rem;
  background: var(--background-default-grey);
  border: 1px solid var(--border-default-grey);
  border-radius: 0.75rem;
  box-shadow: 0 0.5rem 1.5rem rgb(0 0 0 / 12%);
}

.comparator__periods {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.comparator__period {
  min-width: 0;
}

.comparator__period-value {
  display: block;
  min-height: 2.5rem;
  padding: 0.625rem 0.75rem;
  overflow: hidden;
  border: 1px solid var(--border-default-grey);
  border-radius: 0.5rem;
  color: var(--text-default-grey);
  font-size: 0.875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comparator__period-value--disabled {
  background: var(--background-contrast-grey);
  color: var(--text-disabled-grey);
}

.comparator__body {
  display: grid;
  grid-template-columns: 9rem minmax(0, 1fr);
  gap: 1.25rem;
}

.comparator__body--single {
  grid-template-columns: 8rem minmax(0, 1fr);
}

.comparator__options {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  margin: 0;
  padding: 0;
  border: 0;
}

.comparator__radio {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-default-grey);
  cursor: pointer;
  font-size: 0.875rem;
}

.comparator__radio input {
  width: 1rem;
  height: 1rem;
  margin: 0;
  accent-color: var(--background-action-high-blue-france);
}

.comparator__calendar-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.comparator__calendar-title {
  min-width: 7rem;
  color: var(--text-default-grey);
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  text-transform: capitalize;
}

.comparator__weekdays,
.comparator__calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.comparator__weekdays {
  margin-bottom: 0.25rem;
}

.comparator__weekdays span {
  color: var(--text-mention-grey);
  font-size: 0.7rem;
  text-align: center;
}

.comparator__calendar-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 2rem;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.comparator__calendar-cell--in-range::before {
  position: absolute;
  inset: 0;
  background: var(--background-contrast-blue-france);
  content: "";
}

.comparator__calendar-cell--range-start::before {
  left: 50%;
}

.comparator__calendar-cell--range-end::before {
  right: 50%;
}

.comparator__calendar-day {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  color: var(--text-default-grey);
  font-size: 0.75rem;
}

.comparator__calendar-day--outside {
  color: var(--text-disabled-grey);
}

.comparator__calendar-day--edge {
  background: var(--background-action-high-blue-france);
  color: var(--text-inverted-grey);
}

.comparator__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-default-grey);
}

@media (max-width: 40rem) {
  .comparator__trigger {
    width: 100%;
  }

  .comparator__period-button {
    flex: 1;
    min-width: 0;
  }

  .comparator__picker {
    position: fixed;
    top: auto;
    right: 1rem;
    bottom: 1rem;
    left: 1rem;
    width: auto;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  .comparator__body,
  .comparator__body--single {
    grid-template-columns: 1fr;
  }

  .comparator__options {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 30rem) {
  .comparator__periods {
    grid-template-columns: 1fr;
  }

  .comparator__trigger .fr-btn {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
  }

  .comparator__footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .comparator__footer .fr-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
