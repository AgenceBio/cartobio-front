import * as XLSX from "xlsx";
import { formatStartOfDay, formatEndOfDay, currentWeekRange, currentMonthRange } from "@/utils/date.formatters";
import type { PageResult, DateRange } from "@/types/tableau-de-bord";

export function useTelechargements() {
  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadJson(data: unknown, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    downloadBlob(blob, filename);
  }

  function downloadXlsx(rows: Record<string, unknown>[], filename: string, sheetName: string) {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  }

  async function fetchAllPages<T>(
    fetchFn: (page: number, from: string, to: string, limit?: number) => Promise<PageResult<T>>,
    fromIso: string,
    toIso: string,
    limit = 500,
  ): Promise<T[]> {
    const first = await fetchFn(1, fromIso, toIso, limit);
    const rows = [...first.data];
    const pageCount = Math.ceil(first.meta.total / first.meta.limit);
    for (let page = 2; page <= pageCount; page++) {
      const next = await fetchFn(page, fromIso, toIso, limit);
      rows.push(...next.data);
    }
    return rows;
  }

  async function downloadRangeAsXlsx<T>(
    fetchFn: (page: number, from: string, to: string, limit?: number) => Promise<PageResult<T>>,
    mapFn: (data: T[]) => Record<string, unknown>[],
    range: DateRange,
    filename: string,
    sheetName: string,
  ) {
    const rows = mapFn(await fetchAllPages(fetchFn, formatStartOfDay(range.from), formatEndOfDay(range.to), 500));
    downloadXlsx(rows, filename, sheetName);
  }

  function downloadCanvasPng(
    container: HTMLElement | null,
    filename: string,
    legend?: { label: string; color: string }[],
  ) {
    const canvas = container?.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const legendHeight = legend?.length ? legend.length * 24 + 12 : 0;
    const output = document.createElement("canvas");
    output.width = canvas.width;
    output.height = canvas.height + legendHeight;
    const context = output.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, output.width, output.height);
    context.drawImage(canvas, 0, 0);

    if (legend?.length) {
      context.font = "14px Arial, sans-serif";
      context.textBaseline = "middle";
      legend.forEach((entry, i) => {
        const y = canvas.height + 12 + i * 24;
        context.fillStyle = entry.color;
        context.fillRect(0, y + 5, 14, 14);
        context.fillStyle = "#161616";
        context.fillText(entry.label, 22, y + 12);
      });
    }

    output.toBlob((blob) => {
      if (blob) downloadBlob(blob, filename);
    }, "image/png");
  }

  function downloadComparisonPng(
    compareContainer: HTMLElement | null,
    currentContainer: HTMLElement | null,
    compareLabel: string,
    currentLabel: string,
    legend?: { label: string; color: string }[],
  ) {
    const compareCanvas = compareContainer?.querySelector("canvas");
    const currentCanvas = currentContainer?.querySelector("canvas");
    if (!(compareCanvas instanceof HTMLCanvasElement) || !(currentCanvas instanceof HTMLCanvasElement)) return;

    const padding = 32;
    const titleHeight = 48;
    const legendHeight = legend?.length ? legend.length * 24 + 12 : 0;
    const output = document.createElement("canvas");
    output.width = compareCanvas.width + currentCanvas.width + padding * 3;
    output.height = Math.max(compareCanvas.height, currentCanvas.height) + titleHeight + padding * 2 + legendHeight;
    const context = output.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, output.width, output.height);
    context.fillStyle = "#161616";
    context.font = "bold 16px Arial, sans-serif";
    context.fillText(compareLabel, padding, padding);
    context.fillText(currentLabel, compareCanvas.width + padding * 2, padding);
    context.drawImage(compareCanvas, padding, titleHeight + padding);
    context.drawImage(currentCanvas, compareCanvas.width + padding * 2, titleHeight + padding);

    if (legend?.length) {
      context.font = "14px Arial, sans-serif";
      context.textBaseline = "middle";
      const legendY = output.height - legendHeight;
      legend.forEach((entry, i) => {
        const y = legendY + i * 24;
        context.fillStyle = entry.color;
        context.fillRect(padding, y + 5, 14, 14);
        context.fillStyle = "#161616";
        context.fillText(entry.label, padding + 22, y + 12);
      });
    }

    output.toBlob((blob) => {
      if (blob) downloadBlob(blob, "comparaison-bilan-envois.png");
    }, "image/png");
  }

  return {
    downloadBlob,
    downloadJson,
    downloadXlsx,
    fetchAllPages,
    downloadRangeAsXlsx,
    downloadCanvasPng,
    downloadComparisonPng,
    currentWeekRange,
    currentMonthRange,
  };
}
