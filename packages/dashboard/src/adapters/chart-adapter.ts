/**
 * Chart-ready series for memory / performance (prepare for Chart.js, ECharts, etc.).
 */
export type ChartPoint = {
  x: string | number;
  y: number;
};

export type ChartSeries = {
  id: string;
  label: string;
  points: ChartPoint[];
  color?: string;
};

export type ChartMountOptions = {
  type: "line" | "bar";
  series: ChartSeries[];
};

export type ChartRenderer = (
  container: HTMLElement,
  options: ChartMountOptions,
) => () => void;

/** CSS-only bars until a chart library is wired in. */
export const chartRendererPlaceholder: ChartRenderer = (
  container,
  options,
) => {
  container.dataset.chartSeries = options.series.map((s) => s.id).join(",");
  return () => undefined;
};

export function memorySeriesFromHistory(
  history: Array<{ label: string; usedMB: number }>,
): ChartSeries {
  return {
    id: "heap-used",
    label: "Heap used (MB)",
    color: "#22c55e",
    points: history.map((h) => ({ x: h.label, y: h.usedMB })),
  };
}

export function mountDurationSeries(
  records: Array<{ name: string; mountDurationMs: number | null }>,
): ChartSeries {
  return {
    id: "mount-duration",
    label: "Mount time (ms)",
    color: "#8b5cf6",
    points: records
      .filter((r) => r.mountDurationMs !== null)
      .map((r) => ({
        x: r.name,
        y: r.mountDurationMs as number,
      })),
  };
}
