import React, { useLayoutEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { NitroText, TextLayoutEvent } from 'react-native-nitro-text';

const htmlComingFromServer = `
  <!-- HEADING ELEMENTS (h1-h6) -->
  <h1>Heading Level 1</h1>
  <h2>Heading Level 2</h2>
  <h3>Heading Level 3</h3>
  <h4>Heading Level 4</h4>
  <h5>Heading Level 5</h5>
  <h6>Heading Level 6</h6>
  
  <!-- PARAGRAPH ELEMENT (p) -->
  <p>This is a standard paragraph element demonstrating regular text content.</p>
  
  <!-- INLINE ELEMENTS - BOLD -->
  <p>Text with <b>bold using b tag</b> and <strong>bold using strong tag</strong></p>
  
  <!-- INLINE ELEMENTS - ITALIC -->
  <p>Text with <i>italic using i tag</i> and <em>emphasized using em tag</em></p>
  
  <!-- INLINE ELEMENTS - UNDERLINE -->
  <p>Text with <u>underlined content</u> inline</p>
  
  <!-- INLINE ELEMENTS - STRIKETHROUGH -->
  <p>Text with <s>strikethrough content</s> inline</p>
  
  <!-- INLINE ELEMENTS - CODE -->
  <p>Inline code: <code>const x = 42;</code> within text</p>
  
  <!-- INLINE ELEMENTS - MARK (highlight) -->
  <p>Text with <mark>highlighted content</mark> using mark tag</p>
  
  <!-- INLINE ELEMENTS - SMALL -->
  <p>Regular text with <small>smaller text</small> using small tag</p>
  
  <!-- INLINE ELEMENTS - SPAN -->
  <p>Text with <span>span element</span> for generic inline content</p>
  
  <!-- INLINE ELEMENTS - SUB/SUP -->
  <p>Chemical formula: H<sub>2</sub>O and math equation: E=mc<sup>2</sup></p>
  
  <!-- PREFORMATTED BLOCK -->
  <pre>function example() {
  return 'preformatted code block';
}</pre>
  
  <!-- LINK ELEMENTS -->
  <p>Simple link: <a href='https://www.google.com'>Google</a> and email: <a href='mailto:hello@example.com'>hello@example.com</a></p>
  
  <!-- LINE BREAKS -->
  <p>First line<br/>Second line<br/>Third line</p>
  
  <!-- HORIZONTAL RULE -->
  <hr/>
  
  <!-- UNORDERED LIST (ul) -->
  <ul>
    <li>First unordered item</li>
    <li>Second unordered item</li>
    <li>Third unordered item with <b>bold text</b></li>
    <li>Fourth item with <a href='https://example.com'>a link</a></li>
  </ul>
  
  <!-- ORDERED LIST (ol) -->
  <ol>
    <li>First ordered item</li>
    <li>Second ordered item</li>
    <li>Third ordered item with <i>italic text</i></li>
    <li>Fourth item with <code>inline code</code></li>
  </ol>

  
  <!-- BLOCKQUOTE -->
  <blockquote>
    <p>This is a blockquote element used for quotations or excerpts from other sources.</p>
  </blockquote>
  
  <!-- BLOCK ELEMENT (div) -->
  <div>
    <p>Content inside a div block element</p>
  </div>
  
  <!-- SEMANTIC ELEMENT - SECTION -->
  <section>
    <h3>Section Title</h3>
    <p>This is content inside a section element, used for thematic grouping.</p>
  </section>
  
  <!-- SEMANTIC ELEMENT - ARTICLE -->
  <article>
    <h3>Article Title</h3>
    <p>This is an article element representing self-contained content.</p>
    <p>Articles can have multiple paragraphs and <a href='https://source.com'>citations</a>.</p>
  </article>
  
  <!-- SEMANTIC ELEMENT - ASIDE -->
  <aside>
    <p>This is an aside element for content tangentially related to the main content.</p>
  </aside>
  
  <!-- SEMANTIC ELEMENT - HEADER -->
  <header>
    <h3>Header Section</h3>
    <p>Introductory content or navigation in a header element.</p>
  </header>
  
  <!-- SEMANTIC ELEMENT - FOOTER -->
  <footer>
    <p>Footer content with copyright © 2024 and <a href='https://terms.com'>terms of service</a>.</p>
  </footer>
  
  <!-- SEMANTIC ELEMENT - MAIN -->
  <main>
    <h3>Main Content</h3>
    <p>The main content area of the document.</p>
  </main>
  
  <!-- SEMANTIC ELEMENT - NAV -->
  <nav>
    <a href='#home'>Home</a> | <a href='#about'>About</a> | <a href='#contact'>Contact</a>
  </nav>
  
  <!-- COMBINED INLINE FORMATTING -->
  <p>Combined: <b><i>bold italic</i></b>, <u><b>underlined bold</b></u>, <b><i><u>all three</u></i></b></p>
  
  <!-- COMPLEX NESTED CONTENT -->
  <article>
    <header>
      <h2>Product Launch</h2>
      <p><small>Posted on January 15, 2024</small></p>
    </header>
    <section>
      <h3>Features</h3>
      <ul>
        <li><b>Fast</b> - Lightning-quick performance</li>
        <li><i>Reliable</i> - 99.9% uptime</li>
        <li><code>developer-friendly</code> - Easy to integrate</li>
      </ul>
    </section>
    <section>
      <h3>Pricing</h3>
      <p><s>Was $99</s> <b>Now $79</b></p>
      <p><a href='https://buy.com'>Buy Now</a> or <a href='https://learn.com'>Learn More</a></p>
    </section>
    <footer>
      <p><small>Terms and conditions apply</small></p>
    </footer>
  </article>
`;

export default function App() {
  const [layoutInfo, setLayoutInfo] = useState<string>('');

  const handleLayout = (event: any) => {
    const { height, width } = event.nativeEvent.layout;
    setLayoutInfo(`Layout: ${Math.round(width)}×${Math.round(height)}px`);
  };

  const handleTextLayout = (event: TextLayoutEvent) => {
    console.log('lines', event.lines);
    // console.log('width', event);
    // console.log('height', height);
    // setLayoutInfo(`Lines: ${lines.length}`);
  };

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
          🚀 NitroText Showcase
        </NitroText>
        <Text
          style={styles.mainTitle}
          selectable={false}
          onPressIn={() => console.log('onPressIn')}
          onPressOut={() => console.log('onPressOut')}
          onLongPress={() => console.log('onLongPress')}
          onPress={() => console.log('onPress')}
        >
          🚀 NitroText Showcase
        </Text>
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

      {/* Html Renderer */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Html Renderer</NitroText>
        <NitroText
          selectable
          style={styles.htmlText}
          renderer="html"
          renderStyles={{
            b: { fontWeight: 'bold', color: '#E53E3E' }, // deep red
            i: { fontStyle: 'italic', color: '#3182CE' }, // bright blue
            u: { textDecorationStyle: 'dashed', textDecorationColor: '#38A169' }, // green
            s: { textDecorationStyle: 'dashed', textDecorationColor: '#E53E3E' }, // red
            code: { fontFamily: Platform.select({android:'monospace', ios: "ui-monospace"}), color: '#805AD5' }, // purple
            pre: { fontFamily: Platform.select({android:'monospace', ios: "ui-monospace"}), color: '#805AD5' }, // purple
            p: { color: '#2D3748' }, // dark gray for better readability
            a: { color: 'green' }, // lighter blue for links
            h1: { color: '#2F855A', fontWeight: 'bold', fontSize: 32 }, // darker green
            h2: { color: '#2C5282', fontWeight: 'bold', fontSize: 24 }, // darker blue
            h3: { color: '#C05621', fontWeight: 'bold', fontSize: 18.72 }, // darker orange
            h4: { color: '#553C9A', fontWeight: 'bold', fontSize: 16 }, // darker purple
            h5: { color: '#744210', fontWeight: 'bold', fontSize: 13.28 }, // darker brown
            h6: { color: '#4A5568', fontWeight: 'bold', fontSize: 10.72 }, // medium gray
          }}
        >
          {htmlComingFromServer}
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

      {/* Layout Measurement using RN Text */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Layout Measurement(RN Text)</Text>
        <Text style={styles.measuredText} onLayout={handleLayout}>
          This text demonstrates layout measurement capabilities. The component
          can measure its dimensions and report back to JavaScript.
          {'\n\n'}
          <Text style={styles.infoText}>{layoutInfo || 'Measuring...'}</Text>
        </Text>
      </View>

      {/* Line Limiting */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Line Limiting</NitroText>
        <NitroText style={styles.description}>Two lines maximum:</NitroText>
        <NitroText
          style={styles.limitedText}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
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
            This is a React Native Text component
            <NitroText style={styles.nested}> with nested NitroText </NitroText>
            inside it.
          </Text>
          {'\n\n'}And vice versa - NitroText can contain:{'\n'}
          <NitroText style={styles.nestedContainer}>
            Regular text with
            <Text style={styles.rnNested}> RN Text nested inside </Text>
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
    fontFamily: 'ui-monospace',
    // marginBottom: 8,
    backgroundColor: 'red',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    alignSelf: 'flex-start',
    lineHeight: 24,
    borderWidth: 1,
    borderColor: 'blue',
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

  htmlText: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 30,
    padding:16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
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
    fontFamily: Platform.select({android:'monospace', ios: "ui-monospace"}),
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
