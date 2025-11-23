export interface BenchmarkResult {
  name: string;
  duration: number;
  timestamp: number;
}

export interface LayoutMeasurement {
  width: number;
  height: number;
  lineCount: number;
  timestamp: number;
}

export interface BenchmarkStatistics {
  average: number;
  min: number;
  max: number;
  median: number;
  count: number;
}

export interface LayoutStatistics {
  averageWidth: number;
  averageHeight: number;
  averageLineCount: number;
  maxWidth: number;
  maxHeight: number;
  count: number;
}

export interface ComponentPerformanceMetrics {
  renderTimes: BenchmarkResult[];
  layoutMeasurements: LayoutMeasurement[];
  renderStats: BenchmarkStatistics;
  layoutStats: LayoutStatistics;
}

export interface PerformanceMetrics {
  nitro: ComponentPerformanceMetrics;
  rn: ComponentPerformanceMetrics;
}

/**
 * Measures the execution time of a function
 */
export function measureExecutionTime<T>(
  fn: () => T,
  name?: string,
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  if (name) {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Measures async execution time
 */
export async function measureAsyncExecutionTime<T>(
  fn: () => Promise<T>,
  name?: string,
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  if (name) {
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Collects multiple benchmark results and calculates statistics
 */
export function collectBenchmarkResults(
  results: BenchmarkResult[],
): BenchmarkStatistics {
  if (results.length === 0) {
    return { average: 0, min: 0, max: 0, median: 0, count: 0 };
  }

  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  const sum = durations.reduce((acc, val) => acc + val, 0);
  const average = sum / durations.length;
  const min = durations[0];
  const max = durations[durations.length - 1];
  const median =
    durations.length % 2 === 0
      ? (durations[durations.length / 2 - 1] +
          durations[durations.length / 2]) /
        2
      : durations[Math.floor(durations.length / 2)];

  return { average, min, max, median, count: results.length };
}

/**
 * Creates a performance metrics object from benchmark results
 */
export function collectLayoutStats(
  measurements: LayoutMeasurement[],
): LayoutStatistics {
  if (measurements.length === 0) {
    return {
      averageWidth: 0,
      averageHeight: 0,
      averageLineCount: 0,
      maxWidth: 0,
      maxHeight: 0,
      count: 0,
    };
  }

  const sums = measurements.reduce(
    (acc, measurement) => {
      acc.width += measurement.width;
      acc.height += measurement.height;
      acc.lines += measurement.lineCount;
      acc.maxWidth = Math.max(acc.maxWidth, measurement.width);
      acc.maxHeight = Math.max(acc.maxHeight, measurement.height);
      return acc;
    },
    { width: 0, height: 0, lines: 0, maxWidth: 0, maxHeight: 0 },
  );

  return {
    averageWidth: sums.width / measurements.length,
    averageHeight: sums.height / measurements.length,
    averageLineCount: sums.lines / measurements.length,
    maxWidth: sums.maxWidth,
    maxHeight: sums.maxHeight,
    count: measurements.length,
  };
}

export function createPerformanceMetrics(
  nitroRenderTimes: BenchmarkResult[],
  rnRenderTimes: BenchmarkResult[],
  nitroLayoutMeasurements: LayoutMeasurement[],
  rnLayoutMeasurements: LayoutMeasurement[],
): PerformanceMetrics {
  return {
    nitro: {
      renderTimes: nitroRenderTimes,
      layoutMeasurements: nitroLayoutMeasurements,
      renderStats: collectBenchmarkResults(nitroRenderTimes),
      layoutStats: collectLayoutStats(nitroLayoutMeasurements),
    },
    rn: {
      renderTimes: rnRenderTimes,
      layoutMeasurements: rnLayoutMeasurements,
      renderStats: collectBenchmarkResults(rnRenderTimes),
      layoutStats: collectLayoutStats(rnLayoutMeasurements),
    },
  };
}

/**
 * Formats a duration in milliseconds to a readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`;
  }
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Gets memory usage if available (browser/DevTools)
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  limit: number;
  available: boolean;
} {
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      available: true,
    };
  }
  return { used: 0, total: 0, limit: 0, available: false };
}

/**
 * Formats memory size in bytes to a readable string
 */
export function formatMemorySize(bytes: number): string {
  const abs = Math.abs(bytes);
  if (abs === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(abs) / Math.log(k));
  return `${(abs / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Runs a benchmark multiple times and collects results
 */
export async function runBenchmark(
  fn: () => void | Promise<void>,
  iterations: number = 10,
  name?: string,
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    results.push({
      name: name || `benchmark-${i}`,
      duration: end - start,
      timestamp: Date.now(),
    });
  }

  return results;
}
