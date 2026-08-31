import * as XLSX from "xlsx";
import { formatStartOfDay, formatEndOfDay, currentWeekRange, currentMonthRange } from "@/utils/date.formatters";
import type { PageResult, DateRange } from "@/types/tableau-de-bord";

export interface LegendEntry {
  label: string;
  color: string;
}

type XlsxRow = Record<string, string | number | null | undefined>;

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

  function downloadXlsx(rows: XlsxRow[], filename: string, sheetName: string, columns?: string[]) {
    const worksheet = rows.length
      ? XLSX.utils.json_to_sheet(rows, columns?.length ? { header: columns } : undefined)
      : XLSX.utils.aoa_to_sheet([columns ?? []]);

    const header = columns?.length ? columns : Object.keys(rows[0] ?? {});
    if (header.length) {
      worksheet["!cols"] = header.map((titre) => ({ wch: Math.max(titre.length + 2, 14) }));
    }

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
    mapFn: (data: T[]) => XlsxRow[],
    range: DateRange,
    filename: string,
    sheetName: string,
    columns?: string[],
  ) {
    const rows = mapFn(await fetchAllPages(fetchFn, formatStartOfDay(range.from), formatEndOfDay(range.to), 500));
    downloadXlsx(rows, filename, sheetName, columns);
  }

  function drawTitle(context: CanvasRenderingContext2D, title: string, x: number, y: number, size = 18) {
    context.fillStyle = "#161616";
    context.font = `bold ${size}px Marianne, sans-serif`;
    context.textBaseline = "top";
    context.fillText(title, x, y);
  }

  function drawLegend(context: CanvasRenderingContext2D, legend: LegendEntry[], x: number, startY: number) {
    context.font = "14px Marianne, sans-serif";
    context.textBaseline = "middle";
    legend.forEach((entry, i) => {
      const y = startY + i * 24;
      context.fillStyle = entry.color;
      context.fillRect(x, y, 14, 14);
      context.fillStyle = "#161616";
      context.fillText(entry.label, x + 22, y + 7);
    });
  }

  function downloadCanvasPng(container: HTMLElement | null, filename: string, legend?: LegendEntry[], title?: string) {
    const canvas = container?.querySelector("canvas");
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const padding = 32;
    const titleHeight = title ? 40 : 0;
    const legendGap = 16;
    const legendHeight = legend?.length ? legendGap + legend.length * 24 : 0;

    const output = document.createElement("canvas");
    output.width = canvas.width + padding * 2;
    output.height = canvas.height + titleHeight + legendHeight + padding * 2;

    const context = output.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, output.width, output.height);

    if (title) drawTitle(context, title, padding, padding);

    context.drawImage(canvas, padding, padding + titleHeight);

    if (legend?.length) {
      drawLegend(context, legend, padding, padding + titleHeight + canvas.height + legendGap);
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
    legend?: LegendEntry[],
    title?: string,
    filename = "comparaison-bilan-envois.png",
  ) {
    const compareCanvas = compareContainer?.querySelector("canvas");
    const currentCanvas = currentContainer?.querySelector("canvas");
    if (!(compareCanvas instanceof HTMLCanvasElement) || !(currentCanvas instanceof HTMLCanvasElement)) return;

    const padding = 32;
    const titleHeight = title ? 48 : 0;
    const labelsHeight = 48;
    const legendGap = 16;
    const legendHeight = legend?.length ? legendGap + legend.length * 24 : 0;

    const output = document.createElement("canvas");
    output.width = compareCanvas.width + currentCanvas.width + padding * 3;
    output.height =
      Math.max(compareCanvas.height, currentCanvas.height) + titleHeight + labelsHeight + padding * 3 + legendHeight;

    const context = output.getContext("2d");
    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, output.width, output.height);

    if (title) drawTitle(context, title, padding, padding, 20);

    const graphsTop = titleHeight + padding;

    context.fillStyle = "#161616";
    context.font = "bold 16px Marianne, sans-serif";
    context.textBaseline = "top";
    context.fillText(compareLabel, padding, graphsTop + padding);
    context.fillText(currentLabel, compareCanvas.width + padding * 2, graphsTop + padding);

    const canvasesTop = graphsTop + labelsHeight + padding;
    context.drawImage(compareCanvas, padding, canvasesTop);
    context.drawImage(currentCanvas, compareCanvas.width + padding * 2, canvasesTop);

    if (legend?.length) {
      drawLegend(context, legend, padding, output.height - legendHeight + legendGap);
    }

    output.toBlob((blob) => {
      if (blob) downloadBlob(blob, filename);
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
