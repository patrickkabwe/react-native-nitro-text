import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  htmlSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginTop: 8,
  },

  // Headers
  mainTitle: {
    fontSize: 25,
    padding: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    backgroundColor: 'red',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    alignSelf: 'flex-start',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
    fontFamily: 'Chivo Mono',
  },

  // Basic text styles
  basicText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },

  // Rich text styles
  richText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 26,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  // Custom font styles
  customFontExample: {
    fontSize: 18,
    fontFamily: 'Tourney',
    color: '#2c3e50',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9b59b6',
    marginTop: 8,
  },
  customFontMixed: {
    fontSize: 16,
    fontFamily: 'Tourney',
    color: '#495057',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    lineHeight: 24,
  },
  customFontBold: {
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  customFontItalic: {
    fontStyle: 'italic',
    color: '#9b59b6',
  },
  customFontNested: {
    fontSize: 16,
    color: '#495057',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  italic: {
    fontStyle: 'italic',
    color: '#6f42c1',
  },
  highlight: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  underline: {
    textDecorationLine: 'underline line-through',
    textDecorationStyle: 'dashed',
    textDecorationColor: '#000000',
    textAlign: 'auto',
  },
  colorful: {
    color: '#e83e8c',
  },
  large: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  small: {
    fontSize: 12,
    color: '#6c757d',
  },

  // Layout measurement
  measuredText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196f3',
    borderStyle: 'dashed',
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1976d2',
  },

  // Line limiting
  limitedText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    backgroundColor: '#fff8e1',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },

  // Mixed content
  mixedContent: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 26,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  rnText: {
    backgroundColor: '#ffeaa7',
    padding: 8,
    borderRadius: 4,
    fontSize: 15,
    color: '#2d3436',
  },
  nested: {
    fontWeight: 'bold',
    color: '#0984e3',
  },
  nestedContainer: {
    backgroundColor: '#ddd6fe',
    padding: 8,
    borderRadius: 4,
  },
  rnNested: {
    fontStyle: 'italic',
    color: '#7c3aed',
    fontWeight: 'bold',
  },

  // Code syntax
  codeBlock: {
    fontSize: 14,
    fontFamily: 'ui-monospace',
    backgroundColor: '#1e1e1e',
    color: '#d4d4d4',
    padding: 16,
    borderRadius: 8,
    lineHeight: 20,
  },

  codeKeyword: {
    color: '#569cd6',
    fontWeight: 'bold',
  },
  codeString: {
    color: '#ce9178',
  },
  codeFunction: {
    color: '#dcdcaa',
  },
  codeTag: {
    color: '#4ec9b0',
  },
  codeAttribute: {
    color: '#9cdcfe',
  },
  codeValue: {
    color: '#ce9178',
  },

  // Performance comparison
  comparisonContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  comparisonItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    // marginBottom: 12,
    textAlign: 'center',
  },
  performanceText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 22,
  },

  // Footer
  footer: {
    // alignItems: 'center',
    // paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    // paddingBottom: 60,
    backgroundColor: 'blue',
  },
  footerText: {
    textTransform: 'uppercase',
    // fontSize: 16,
    fontStyle: 'italic',
    backgroundColor: 'red',
    textAlign: 'center',
    marginBottom: 1,
    letterSpacing: 10,
    // alignSelf: 'flex-start',
    // width: '100%',
    // height: '100%',
  },
  tabScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  tabText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Performance benchmark styles
  benchmarkButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    minHeight: 44,
  },
  benchmarkButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  benchmarkPreview: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 16,
  },
  benchmarkText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 8,
  },
  benchmarkResults: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginTop: 16,
  },
  benchmarkTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 4,
  },
  metricSubValue: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  comparisonCard: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    marginTop: 12,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0056b3',
    textAlign: 'center',
  },
  listItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});

