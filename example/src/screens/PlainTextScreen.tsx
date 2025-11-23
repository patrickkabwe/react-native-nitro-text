import React, { useLayoutEffect, useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NitroText } from 'react-native-nitro-text';
import { styles } from './styles';
import { NitroModules } from 'react-native-nitro-modules';

export function PlainTextScreen() {
  const menus = useMemo(
    () => [
      { title: 'Ask ChatGPT', action: () => console.log('Ask ChatGPT') },
      { title: 'Paste', action: () => console.log('Paste') },
    ],
    [],
  );

  useLayoutEffect(() => {
    StatusBar.setBarStyle('dark-content');
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.section}>
        <NitroText
          style={styles.mainTitle}
          selectable={false}
          onPressIn={() => console.log('onPressIn')}
          onPressOut={() => console.log('onPressOut')}
          onLongPress={() => console.log('onLongPress')}
          onPress={() => console.log('onPress')}
        >
          🚀 NitroText Plain Text {NitroModules.buildType}
        </NitroText>
        <NitroText style={styles.subtitle}>
          High-performance selectable text with native rendering
        </NitroText>
        <Text style={styles.subtitle} selectable>
          High-performance selectable text with native rendering
        </Text>
      </View>

      {/* Basic Usage */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Basic Usage</NitroText>
        <NitroText style={styles.basicText} selectable>
          This is a simple NitroText component with native performance. Try
          selecting this text to see the smooth selection behavior!
        </NitroText>
      </View>

      {/* Nested NitroText wth numberOfLines (does not work currently it only renders the first line nested text doesn't render) */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>
          Nested NitroText with numberOfLines (NitroText)
        </NitroText>
        <NitroText style={styles.basicText} numberOfLines={2}>
          This is a simple NitroText component with native performance.{' '}
          <NitroText style={styles.bold}>
            Try selecting this text to see the smooth selection behavior!
          </NitroText>
        </NitroText>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Nested NitroText with numberOfLines (RN Text)
        </Text>
        <Text style={styles.basicText} numberOfLines={2}>
          This is a simple NitroText component with native performance.{' '}
          <Text style={styles.bold}>
            Try selecting this text to see the smooth selection behavior!
          </Text>
        </Text>
      </View>

      {/* Rich Text Formatting */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Rich Text Formatting</NitroText>
        <NitroText selectable menus={menus} style={styles.richText}>
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

      {/* Rich Text Formatting using RN Text */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rich Text Formatting(RN Text)</Text>
        <Text style={styles.richText}>
          Welcome to the world of <Text style={styles.bold}>bold text</Text>,{' '}
          <Text style={styles.italic}>beautiful italics</Text>, and{' '}
          <Text style={styles.highlight}>highlighted content</Text>.{'\n\n'}
          You can combine multiple styles:{' '}
          <Text style={[styles.bold, styles.underline, styles.colorful]}>
            Bold, underlined, and colorful!
          </Text>
          {'\n\n'}
          Different font sizes work seamlessly:{' '}
          <Text style={styles.large}>Large text</Text> mixed with{' '}
          <Text style={styles.small}>small text</Text> in the same paragraph.
        </Text>
      </View>

      {/* Mixed Content */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Mixed Content</NitroText>
        <NitroText style={styles.mixedContent}>
          NitroText can seamlessly integrate with React Native's Text component:
          {'\n\n'}
          <Text style={styles.rnText}>
            This is a React Native Text component
            <NitroText style={styles.nested}> with nested NitroText </NitroText>
            inside it.
          </Text>
          {'\n\n'}And vice versa - NitroText can contain:{'\n'}
          <NitroText style={styles.nestedContainer}>
            Regular text with
            <Text style={styles.rnNested}> RN Text nested inside</Text>{' '}
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
      <View style={[styles.section, styles.footer]}>
        <NitroText
          style={styles.footerText}
          lineBreakStrategyIOS="hangul-word"
          maxFontSizeMultiplier={1.5}
        >
          Built with ❤️
        </NitroText>
        <Text
          style={styles.footerText}
          lineBreakStrategyIOS="hangul-word"
          maxFontSizeMultiplier={1.5}
        >
          Built with ❤️
        </Text>
      </View>
    </ScrollView>
  );
}

