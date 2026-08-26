import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import isoWeek from "dayjs/plugin/isoWeek";
import type { Unit, DateRange } from "@/types/tableau-de-bord.ts";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(isoWeek);

export function getWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = d.getTime();
  d.setUTCMonth(0, 1);
  if (d.getUTCDay() !== 4) {
    d.setUTCMonth(0, 1 + ((4 - d.getUTCDay() + 7) % 7));
  }
  return 1 + Math.round((firstThursday - d.getTime()) / (7 * 24 * 3600 * 1000));
}

export function formatPeriodLabel(unit: Unit, date: Date, long: boolean = true): string {
  const now = new Date();
  switch (unit) {
    case "day":
      return date.toDateString() === now.toDateString() ? "aujourd'hui" : date.toLocaleDateString("fr-FR");
    case "week": {
      const currentWeek = getWeek(now);
      const selectedWeek = getWeek(date);
      if (currentWeek === selectedWeek && now.getFullYear() === date.getFullYear()) {
        return "cette semaine";
      }
      return `la semaine ${selectedWeek} en ${date.getFullYear()}`;
    }
    case "month":
      if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
        return "ce mois";
      }
      if (long) return "en " + date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
      else return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    case "year":
      return date.getFullYear() === now.getFullYear() ? "cette année" : String(date.getFullYear());
  }
}

export function formatDateTableau(date: string | Date): string {
  const d = dayjs(date);
  if (d.isToday()) return `Auj. ${d.format("HH:mm")}`;
  if (d.isYesterday()) return `Hier ${d.format("HH:mm")}`;
  return d.format("DD/MM/YYYY");
}

export function formatDateControle(date: string | Date): string {
  return dayjs(date).format("DD/MM/YYYY");
}

export function formatStartOfDay(date: Date): string {
  return dayjs(date).startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS");
}

export function formatEndOfDay(date: Date): string {
  return dayjs(date).endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS");
}

export function currentWeekRange(): DateRange {
  const now = dayjs();
  return { from: now.startOf("isoWeek").toDate(), to: now.endOf("isoWeek").toDate() };
}

export function currentMonthRange(): DateRange {
  const now = dayjs();
  return { from: now.startOf("month").toDate(), to: now.endOf("month").toDate() };
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
