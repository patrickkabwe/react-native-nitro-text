import React, {
    useCallback,
    useMemo,
    useRef,
    useState,
  } from 'react';
  import {
    ActivityIndicator,
    FlatList,
    ListRenderItemInfo,
    NativeSyntheticEvent,
    ScrollView,
    Text,
    TextLayoutEvent as RNTextLayoutEvent,
    TouchableOpacity,
    View,
  } from 'react-native';
  import { NitroText } from 'react-native-nitro-text';
  import { styles } from './styles';
  import {
    BenchmarkResult,
    LayoutMeasurement,
    PerformanceMetrics,
    createPerformanceMetrics,
    formatDuration,
    getMemoryUsage,
    formatMemorySize,
  } from '../utils/performance';
  import type { TextLayoutEvent } from 'react-native-nitro-text';
  
  interface BenchmarkState {
    running: boolean;
    results: PerformanceMetrics | null;
    memoryBefore: ReturnType<typeof getMemoryUsage>;
    memoryAfter: ReturnType<typeof getMemoryUsage>;
  }
  
  const BENCHMARK_ITERATIONS = 15;
  const ITERATION_DELAY_MS = 40;
  
  type BenchmarkType = 'simple' | 'rich' | 'large' | 'listRich';
  type ComponentType = 'nitro' | 'rn';
  
  interface BenchmarkCollections {
    render: Record<ComponentType, BenchmarkResult[]>;
    layout: Record<ComponentType, LayoutMeasurement[]>;
  }
  
  type BenchmarkStore = Record<BenchmarkType, BenchmarkCollections>;
  
  const createEmptyBenchmarkCollections = (): BenchmarkCollections => ({
    render: { nitro: [], rn: [] },
    layout: { nitro: [], rn: [] },
  });
  
  const createBenchmarkStore = (): BenchmarkStore => ({
    simple: createEmptyBenchmarkCollections(),
    rich: createEmptyBenchmarkCollections(),
    large: createEmptyBenchmarkCollections(),
    listRich: createEmptyBenchmarkCollections(),
  });
  
  const wait = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));
  
  type LineMetrics = { width: number; height: number };
  
  const summarizeLineDimensions = (
    lines: Array<{ width: number; height: number }>
  ): LineMetrics =>
    lines.reduce<LineMetrics>(
      (acc, line) => ({
        width: Math.max(acc.width, line.width),
        height: acc.height + line.height,
      }),
      { width: 0, height: 0 }
    );
  
  // keep a loose global type so we can call performance.now()
  declare global {
    // eslint-disable-next-line no-var
    var performance: {
      now(): number;
    };
  }
  
  export function PerformanceScreen() {
    const [simpleTextBenchmark, setSimpleTextBenchmark] = useState<BenchmarkState>({
      running: false,
      results: null,
      memoryBefore: getMemoryUsage(),
      memoryAfter: getMemoryUsage(),
    });
    const [richTextBenchmark, setRichTextBenchmark] = useState<BenchmarkState>({
      running: false,
      results: null,
      memoryBefore: getMemoryUsage(),
      memoryAfter: getMemoryUsage(),
    });
    const [largeTextBenchmark, setLargeTextBenchmark] = useState<BenchmarkState>({
      running: false,
      results: null,
      memoryBefore: getMemoryUsage(),
      memoryAfter: getMemoryUsage(),
    });
    const [listRichBenchmark, setListRichBenchmark] = useState<BenchmarkState>({
      running: false,
      results: null,
      memoryBefore: getMemoryUsage(),
      memoryAfter: getMemoryUsage(),
    });
  
    const [simpleRenderKey, setSimpleRenderKey] = useState(0);
    const [richRenderKey, setRichRenderKey] = useState(0);
    const [largeRenderKey, setLargeRenderKey] = useState(0);
    const [listRenderKey, setListRenderKey] = useState(0);
  
    const benchmarkStore = useRef<BenchmarkStore>(createBenchmarkStore());
  
    const activeBenchmarks = useRef<Record<BenchmarkType, boolean>>({
      simple: false,
      rich: false,
      large: false,
      listRich: false,
    });
  
    /**
     * For each benchmark + component we store the timestamp when an iteration starts.
     * When the first layout callback fires, we compute duration and clear the start.
     * This works in both Debug and Release (no React Profiler needed).
     */
    const renderStartTimes = useRef<
      Record<BenchmarkType, Partial<Record<ComponentType, number>>>
    >({
      simple: {},
      rich: {},
      large: {},
      listRich: {},
    });
  
    const markIterationStart = useCallback((benchmark: BenchmarkType) => {
      const now = performance.now();
      renderStartTimes.current[benchmark].nitro = now;
      renderStartTimes.current[benchmark].rn = now;
    }, []);
  
    const recordLayoutMeasurement = useCallback(
      (
        benchmark: BenchmarkType,
        component: ComponentType,
        measurement: LayoutMeasurement
      ) => {
        if (!activeBenchmarks.current[benchmark]) {
          return;
        }
  
        benchmarkStore.current[benchmark].layout[component].push(measurement);
  
        const start = renderStartTimes.current[benchmark][component];
        if (typeof start === 'number') {
          const end = performance.now();
          benchmarkStore.current[benchmark].render[component].push({
            name: `${benchmark}-${component}`,
            duration: end - start,
            timestamp: start,
          });
          delete renderStartTimes.current[benchmark][component];
        }
      },
      []
    );
  
    const recordNitroLayout = useCallback(
      (benchmark: BenchmarkType, layout: TextLayoutEvent) => {
        const { width, height } = summarizeLineDimensions(layout.lines);
        recordLayoutMeasurement(benchmark, 'nitro', {
          width,
          height,
          lineCount: layout.lines.length,
          timestamp: Date.now(),
        });
      },
      [recordLayoutMeasurement]
    );
  
    const recordRNLayout = useCallback(
      (
        benchmark: BenchmarkType,
        event: RNTextLayoutEvent
      ) => {
        const lines = event.nativeEvent.lines ?? [];
        const { width, height } = summarizeLineDimensions(lines);
        recordLayoutMeasurement(benchmark, 'rn', {
          width,
          height,
          lineCount: lines.length,
          timestamp: Date.now(),
        });
      },
      [recordLayoutMeasurement]
    );
  
    const runBenchmarkScenario = useCallback(
      async (
        benchmarkType: BenchmarkType,
        setBenchmarkState: React.Dispatch<React.SetStateAction<BenchmarkState>>,
        bumpRenderKey: React.Dispatch<React.SetStateAction<number>>
      ) => {
        setBenchmarkState((prev) => ({ ...prev, running: true }));
        benchmarkStore.current[benchmarkType] = createEmptyBenchmarkCollections();
        activeBenchmarks.current[benchmarkType] = true;
        const memoryBefore = getMemoryUsage();
  
        try {
          for (let i = 0; i < BENCHMARK_ITERATIONS; i++) {
            markIterationStart(benchmarkType);
            bumpRenderKey((prev) => prev + 1);
            await wait(ITERATION_DELAY_MS);
          }
        } finally {
          activeBenchmarks.current[benchmarkType] = false;
        }
  
        const memoryAfter = getMemoryUsage();
        const snapshot = benchmarkStore.current[benchmarkType];
        const metrics = createPerformanceMetrics(
          [...snapshot.render.nitro],
          [...snapshot.render.rn],
          [...snapshot.layout.nitro],
          [...snapshot.layout.rn]
        );
  
        setBenchmarkState({
          running: false,
          results: metrics,
          memoryBefore,
          memoryAfter,
        });
      },
      [markIterationStart]
    );
  
    const runSimpleTextBenchmark = useCallback(
      () =>
        void runBenchmarkScenario(
          'simple',
          setSimpleTextBenchmark,
          setSimpleRenderKey
        ),
      [runBenchmarkScenario]
    );
  
    const runRichTextBenchmark = useCallback(
      () =>
        void runBenchmarkScenario(
          'rich',
          setRichTextBenchmark,
          setRichRenderKey
        ),
      [runBenchmarkScenario]
    );
  
    const runLargeTextBenchmark = useCallback(
      () =>
        void runBenchmarkScenario(
          'large',
          setLargeTextBenchmark,
          setLargeRenderKey
        ),
      [runBenchmarkScenario]
    );
  
    const runListRichBenchmark = useCallback(
      () =>
        void runBenchmarkScenario(
          'listRich',
          setListRichBenchmark,
          setListRenderKey
        ),
      [runBenchmarkScenario]
    );
  
    const renderBenchmarkResults = (benchmark: BenchmarkState, title: string) => {
      if (!benchmark.results) return null;
  
      const { nitro, rn } = benchmark.results;
  
      const rawMemoryDiff = benchmark.memoryAfter.available
        ? benchmark.memoryAfter.used - benchmark.memoryBefore.used
        : 0;
  
      const memoryDiffLabel = benchmark.memoryAfter.available
        ? `${rawMemoryDiff >= 0 ? '+' : '−'}${formatMemorySize(
            Math.abs(rawMemoryDiff)
          )}`
        : null;
  
      const nitroAvg = nitro.renderStats.average;
      const rnAvg = rn.renderStats.average;
  
      const renderComparisonAvailable =
        nitroAvg > 0 &&
        rnAvg > 0 &&
        nitro.renderStats.count > 0 &&
        rn.renderStats.count > 0;
  
      const diffPercent =
        nitroAvg === 0 || rnAvg === 0 ? 0 : ((nitroAvg - rnAvg) / rnAvg) * 100;
  
      const comparisonText =
        diffPercent === 0
          ? 'about the same speed as'
          : `${Math.abs(diffPercent).toFixed(1)}% ${
              diffPercent < 0 ? 'faster' : 'slower'
            } than`;
  
      const formatDimension = (value: number) => `${value.toFixed(1)}pt`;
      const formatLineCount = (value: number) => value.toFixed(1);
  
      return (
        <View style={styles.benchmarkResults}>
          <NitroText style={styles.benchmarkTitle}>{title} Results</NitroText>
  
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <NitroText style={styles.metricLabel}>NitroText Render</NitroText>
              <NitroText style={styles.metricValue}>
                Avg: {formatDuration(nitro.renderStats.average)}
              </NitroText>
              <NitroText style={styles.metricSubValue}>
                Min: {formatDuration(nitro.renderStats.min)} | Max:{' '}
                {formatDuration(nitro.renderStats.max)}
              </NitroText>
              <NitroText style={styles.metricSubValue}>
                Median: {formatDuration(nitro.renderStats.median)}
              </NitroText>
            </View>
  
            <View style={styles.metricCard}>
              <NitroText style={styles.metricLabel}>RN Text Render</NitroText>
              <NitroText style={styles.metricValue}>
                Avg: {formatDuration(rn.renderStats.average)}
              </NitroText>
              <NitroText style={styles.metricSubValue}>
                Min: {formatDuration(rn.renderStats.min)} | Max:{' '}
                {formatDuration(rn.renderStats.max)}
              </NitroText>
              <NitroText style={styles.metricSubValue}>
                Median: {formatDuration(rn.renderStats.median)}
              </NitroText>
            </View>
          </View>
  
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <NitroText style={styles.metricLabel}>NitroText Layout</NitroText>
              <NitroText style={styles.metricValue}>
                Avg width: {formatDimension(nitro.layoutStats.averageWidth)}
              </NitroText>
              <NitroText style={styles.metricSubValue}>
                Avg height: {formatDimension(nitro.layoutStats.averageHeight)}
              </NitroText>
              <NitroText style={styles.metricSubValue}>
                Lines: {formatLineCount(nitro.layoutStats.averageLineCount)} | Count:{' '}
                {nitro.layoutStats.count}
              </NitroText>
            </View>
  
            <View style={styles.metricCard}>
              <NitroText style={styles.metricLabel}>RN Text Layout</NitroText>
              <NitroText style={styles.metricValue}>
                Avg width: {formatDimension(rn.layoutStats.averageWidth)}
              </NitroText>
              <NitroText style={styles.metricSubValue}>
                Avg height: {formatDimension(rn.layoutStats.averageHeight)}
              </NitroText>
              <NitroText style={styles.metricSubValue}>
                Lines: {formatLineCount(rn.layoutStats.averageLineCount)} | Count:{' '}
                {rn.layoutStats.count}
              </NitroText>
            </View>
          </View>
  
          {benchmark.memoryAfter.available && (
            <View style={styles.metricCard}>
              <NitroText style={styles.metricLabel}>Memory Usage</NitroText>
              <NitroText style={styles.metricValue}>{memoryDiffLabel}</NitroText>
              <NitroText style={styles.metricSubValue}>
                Before: {formatMemorySize(benchmark.memoryBefore.used)} | After:{' '}
                {formatMemorySize(benchmark.memoryAfter.used)}
              </NitroText>
            </View>
          )}
  
          {renderComparisonAvailable && (
            <View style={styles.comparisonCard}>
              <NitroText style={styles.comparisonLabel}>
                Performance Comparison
              </NitroText>
              <NitroText style={styles.comparisonValue}>
                NitroText is {comparisonText} RN Text
              </NitroText>
            </View>
          )}
        </View>
      );
    };
  
    const largeTextContent = useMemo(
      () =>
        Array(200)
          .fill(0)
          .map(
            (_, i) =>
              `This is line ${i + 1} of a large text block. It contains multiple sentences to test rendering performance with substantial content and rich layout behavior. `
          )
          .join(''),
      []
    );
  
    // Fair rich-list data: heavy, nested, realistic
    const richListData = useMemo(
      () =>
        Array.from({ length: 200 }).map((_, i) => ({
          id: String(i),
          title: `Item ${i + 1}`,
          description:
            'NitroText supports nested styles, inline highlights, and complex formatting without building a deep React tree.',
        })),
      []
    );
  
  const handleNitroListLayout = useCallback(
    (layout: TextLayoutEvent) => recordNitroLayout('listRich', layout),
    [recordNitroLayout]
  );

  const renderNitroListItem = useCallback(
    ({ item }: ListRenderItemInfo<(typeof richListData)[number]>) => (
      <View style={styles.listItem}>
        <NitroText
          style={styles.listTitle}
          onTextLayout={handleNitroListLayout}
          >
          {item.title}{' '}
          <NitroText style={styles.bold}>bold</NitroText>{' '}
          <NitroText style={styles.highlight}>highlight</NitroText>
        </NitroText>
          <NitroText style={styles.listDescription}>{item.description}</NitroText>
      </View>
    ),
    [handleNitroListLayout]
  );
  
  const handleRNListLayout = useCallback(
    (e: RNTextLayoutEvent) => recordRNLayout('listRich', e),
    [recordRNLayout]
  );

  const renderRNListItem = useCallback(
    ({ item }: ListRenderItemInfo<(typeof richListData)[number]>) => (
      <View style={styles.listItem}>
        <Text
          style={styles.listTitle}
          onTextLayout={handleRNListLayout}
        >
          {item.title}{' '}
          <Text style={styles.bold}>bold</Text>{' '}
          <Text style={styles.highlight}>highlight</Text>
        </Text>
        <Text style={styles.listDescription}>{item.description}</Text>
      </View>
    ),
    [handleRNListLayout]
  );
  
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <NitroText style={styles.mainTitle}>⚡ Performance Benchmarks</NitroText>
          <NitroText style={styles.subtitle}>
            Compare NitroText performance against React Native Text in realistic
            scenarios
          </NitroText>
        </View>
  
        {/* Simple Text Benchmark (baseline – RN is expected to be slightly faster) */}
        <View style={styles.section}>
          <NitroText style={styles.sectionTitle}>Simple Text Benchmark</NitroText>
          <NitroText style={styles.description}>
            Baseline comparison for a single plain string. NitroText has more
            features, so RN Text will often be slightly faster here.
          </NitroText>
  
          <TouchableOpacity
            style={styles.benchmarkButton}
            onPress={runSimpleTextBenchmark}
            disabled={simpleTextBenchmark.running}
          >
            {simpleTextBenchmark.running ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.benchmarkButtonText}>Run Benchmark</Text>
            )}
          </TouchableOpacity>
  
          <View style={styles.benchmarkPreview} key={`simple-${simpleRenderKey}`}>
            <NitroText
              style={styles.benchmarkText}
              onTextLayout={(layout) => recordNitroLayout('simple', layout)}
            >
              This is a simple NitroText component for performance testing.
            </NitroText>
            <Text
              style={styles.benchmarkText}
              onTextLayout={(event) => recordRNLayout('simple', event)}
            >
              This is a simple RN Text component for performance testing.
            </Text>
          </View>
  
          {renderBenchmarkResults(simpleTextBenchmark, 'Simple Text')}
        </View>
  
        {/* Rich Text Benchmark – nested spans */}
        <View style={styles.section}>
          <NitroText style={styles.sectionTitle}>Rich Text Benchmark</NitroText>
          <NitroText style={styles.description}>
            Measures performance with nested components and rich inline formatting –
            this is where NitroText is designed to shine.
          </NitroText>
  
          <TouchableOpacity
            style={styles.benchmarkButton}
            onPress={runRichTextBenchmark}
            disabled={richTextBenchmark.running}
          >
            {richTextBenchmark.running ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.benchmarkButtonText}>Run Benchmark</Text>
            )}
          </TouchableOpacity>
  
          <View style={styles.benchmarkPreview} key={`rich-${richRenderKey}`}>
            <NitroText
              style={styles.benchmarkText}
              onTextLayout={(layout) => recordNitroLayout('rich', layout)}
            >
              Welcome to{' '}
              <NitroText style={styles.bold}>bold text</NitroText>,{' '}
              <NitroText style={styles.italic}>beautiful italics</NitroText>, and{' '}
              <NitroText style={styles.highlight}>highlighted content</NitroText> in
              a single NitroText tree.
            </NitroText>
  
            <Text
              style={styles.benchmarkText}
              onTextLayout={(event) => recordRNLayout('rich', event)}
            >
              Welcome to <Text style={styles.bold}>bold text</Text>,{' '}
              <Text style={styles.italic}>beautiful italics</Text>, and{' '}
              <Text style={styles.highlight}>highlighted content</Text> built as a
              nested React Text tree.
            </Text>
          </View>
  
          {renderBenchmarkResults(richTextBenchmark, 'Rich Text')}
        </View>
  
        {/* Large Text Benchmark – big paragraph */}
        <View style={styles.section}>
          <NitroText style={styles.sectionTitle}>Large Text Benchmark</NitroText>
          <NitroText style={styles.description}>
            Stress-test with a large block of text content to observe layout and
            render scalability.
          </NitroText>
  
          <TouchableOpacity
            style={styles.benchmarkButton}
            onPress={runLargeTextBenchmark}
            disabled={largeTextBenchmark.running}
          >
            {largeTextBenchmark.running ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.benchmarkButtonText}>Run Benchmark</Text>
            )}
          </TouchableOpacity>
  
          <ScrollView
            style={[styles.benchmarkPreview, { height: 120 }]}
            key={`large-${largeRenderKey}`}
          >
            <NitroText
              style={styles.benchmarkText}
              onTextLayout={(layout) => recordNitroLayout('large', layout)}
            >
              {largeTextContent}
            </NitroText>
            <Text
              style={styles.benchmarkText}
              onTextLayout={(event) => recordRNLayout('large', event)}
            >
              {largeTextContent}
            </Text>
          </ScrollView>
  
          {renderBenchmarkResults(largeTextBenchmark, 'Large Text')}
        </View>
  
        {/* Rich List Benchmark – realistic UI scenario */}
        <View style={styles.section}>
          <NitroText style={styles.sectionTitle}>Rich List Benchmark</NitroText>
          <NitroText style={styles.description}>
            Real-world scenario: a scrollable list of rich text items (200 rows)
            rendered with NitroText vs nested RN Text trees.
          </NitroText>
  
          <TouchableOpacity
            style={styles.benchmarkButton}
            onPress={runListRichBenchmark}
            disabled={listRichBenchmark.running}
          >
            {listRichBenchmark.running ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.benchmarkButtonText}>Run Benchmark</Text>
            )}
          </TouchableOpacity>
  
          <View
            style={[styles.benchmarkPreview, { height: 320, flexDirection: 'row' }]}
            key={`list-${listRenderKey}`}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <NitroText style={styles.metricLabel}>NitroText List</NitroText>
              <FlatList
                data={richListData}
                keyExtractor={(item) => item.id}
                renderItem={renderNitroListItem}
                scrollEnabled={false}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <NitroText style={styles.metricLabel}>RN Text List</NitroText>
              <FlatList
                data={richListData}
                keyExtractor={(item) => item.id}
                renderItem={renderRNListItem}
                scrollEnabled={false}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>
          </View>
  
          {renderBenchmarkResults(listRichBenchmark, 'Rich List')}
        </View>
      </ScrollView>
    );
  }
  