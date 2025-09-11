import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NitroText } from 'react-native-nitro-text';

export default function App() {
  const [layoutInfo, setLayoutInfo] = useState<string>('');

  const handleLayout = (event: any) => {
    const { height, width } = event.nativeEvent.layout;
    setLayoutInfo(`Layout: ${Math.round(width)}×${Math.round(height)}px`);
  };

  const handleTextLayout = (event: any) => {
    const { lines } = event.nativeEvent;
    console.log('lines', lines);
    // setLayoutInfo(`Lines: ${lines.length}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.section}>
        <NitroText style={styles.mainTitle}>🚀 NitroText Showcase</NitroText>
        <NitroText style={styles.subtitle}>
          High-performance selectable text with native rendering
        </NitroText>
      </View>

      {/* Basic Usage */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Basic Usage</NitroText>
        <NitroText style={styles.basicText}>
          This is a simple NitroText component with native performance. Try
          selecting this text to see the smooth selection behavior!
        </NitroText>
      </View>

      {/* Rich Text Formatting */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Rich Text Formatting</NitroText>
        <NitroText style={styles.richText}>
          Welcome to the world of{' '}
          <NitroText style={styles.bold}>bold text</NitroText>,{' '}
          <NitroText style={styles.italic}>beautiful italics</NitroText>, and{' '}
          <NitroText style={styles.highlight}>highlighted content</NitroText>.
          {'\n\n'}
          You can combine multiple styles:{' '}
          <NitroText style={[styles.bold, styles.underline, styles.colorful]}>
            Bold, underlined, and colorful!
          </NitroText>
          {'\n\n'}
          Different font sizes work seamlessly:{' '}
          <NitroText style={styles.large}>Large text</NitroText> mixed with{' '}
          <NitroText style={styles.small}>small text</NitroText> in the same
          paragraph.
        </NitroText>
      </View>

      {/* Layout Measurement */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Layout Measurement</NitroText>
        <NitroText
          style={styles.measuredText}
          onLayout={handleLayout}
          onTextLayout={handleTextLayout}
        >
          This text demonstrates layout measurement capabilities. The component
          can measure its dimensions and report back to JavaScript.
          {'\n\n'}
          <NitroText style={styles.infoText}>
            {layoutInfo || 'Measuring...'}
          </NitroText>
        </NitroText>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layout Measurement</Text>
        <Text
          style={styles.measuredText}
          onLayout={handleLayout}
          onTextLayout={handleTextLayout}
        >
          This text demonstrates layout measurement capabilities. The component
          can measure its dimensions and report back to JavaScript.
          {'\n\n'}
          <Text style={styles.infoText}>
            {layoutInfo || 'Measuring...'}
          </Text>
        </Text>
      </View>

      {/* Line Limiting */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Line Limiting</NitroText>
        <NitroText style={styles.description}>Two lines maximum:</NitroText>
        <NitroText style={styles.limitedText} numberOfLines={2}>
          This is a very long text that would normally span multiple lines, but
          we're limiting it to just two lines. The text will be truncated with
          an ellipsis when it exceeds the specified number of lines. This is
          useful for creating consistent layouts in lists or cards where you
          need predictable text heights.
        </NitroText>
      </View>

      {/* Mixed Content */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Mixed Content</NitroText>
        <NitroText style={styles.mixedContent}>
          NitroText can seamlessly integrate with React Native's Text component:
          {'\n\n'}
          <Text style={styles.rnText}>
            This is a React Native Text component{' '}
            <NitroText style={styles.nested}>with nested NitroText</NitroText>{' '}
            inside it.
          </Text>
          {'\n\n'}And vice versa - NitroText can contain:{'\n'}
          <NitroText style={styles.nestedContainer}>
            Regular text with{' '}
            <Text style={styles.rnNested}>RN Text nested inside</Text>{' '}
            NitroText.
          </NitroText>
        </NitroText>
      </View>

      {/* Code Example */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Code Syntax</NitroText>
        <NitroText style={styles.codeBlock}>
          <NitroText style={styles.codeKeyword}>import</NitroText>{' '}
          <NitroText style={styles.codeString}>{'{ NitroText }'}</NitroText>{' '}
          <NitroText style={styles.codeKeyword}>from</NitroText>{' '}
          <NitroText style={styles.codeString}>
            'react-native-nitro-text'
          </NitroText>
          ;{'\n\n'}
          <NitroText style={styles.codeKeyword}>const</NitroText>{' '}
          <NitroText style={styles.codeFunction}>MyComponent</NitroText> = ()
          =&gt; {'{'}
          {'\n'}
          {'  '}
          <NitroText style={styles.codeKeyword}>return</NitroText> ({'\n'}
          {'    '}
          <NitroText style={styles.codeTag}>{'<NitroText '}</NitroText>
          <NitroText style={styles.codeAttribute}>style</NitroText>=
          <NitroText style={styles.codeValue}>{'{'}</NitroText>
          <NitroText style={styles.codeValue}>styles.text</NitroText>
          <NitroText style={styles.codeValue}>{'}'}</NitroText>
          <NitroText style={styles.codeTag}>{'>'}</NitroText>
          {'\n'}
          {'      '}Hello World!{'\n'}
          {'    '}
          <NitroText style={styles.codeTag}>{'</NitroText>'}</NitroText>
          {'\n'}
          {'  '});{'\n'}
          {'};'}
        </NitroText>
      </View>

      {/* Performance Comparison */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Performance Benefits</NitroText>
        <View style={styles.comparisonContainer}>
          <View style={styles.comparisonItem}>
            <NitroText style={styles.comparisonLabel}>NitroText</NitroText>
            <NitroText style={styles.performanceText}>
              ⚡ Native rendering{'\n'}
              🎯 Optimized selection{'\n'}
              📱 Better memory usage{'\n'}
              🚀 Smooth scrolling
            </NitroText>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>Standard Text</Text>
            <Text style={styles.performanceText}>
              📝 JavaScript bridge{'\n'}
              🐌 Standard selection{'\n'}
              💾 More memory overhead{'\n'}
              📱 Standard performance
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      {/* Bug when applying alignItems: 'center' NitroText disappears */}
      <View style={[styles.section, styles.footer]}>
        <NitroText style={styles.footerText} lineBreakStrategyIOS="hangul-word" maxFontSizeMultiplier={1.5}>
          Built with ❤️
        </NitroText>
        <Text style={styles.footerText} lineBreakStrategyIOS="hangul-word" maxFontSizeMultiplier={1.5}>
          Built with ❤️
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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

  // Headers
  mainTitle: {
    fontSize: 25,
    padding: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    // marginBottom: 8,
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
    textDecorationLine: 'underline',
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
    borderRadius: 4,
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
    fontFamily: 'Menlo, Monaco, monospace',
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
});
