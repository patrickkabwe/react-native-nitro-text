import React from 'react';
import { ScrollView, View } from 'react-native';
import { NitroText } from 'react-native-nitro-text';
import { styles } from './styles';

export function HtmlScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.section}>
        <NitroText style={styles.mainTitle}>🌐 HTML Renderer</NitroText>
        <NitroText style={styles.subtitle}>
          Render rich HTML content with NitroText's native performance
        </NitroText>
      </View>

      {/* Basic HTML Elements */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Basic HTML Elements</NitroText>
        <NitroText style={styles.description}>
          Standard HTML tags: headings, paragraphs, and text formatting
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<h4>Heading 4</h4>
<h5>Heading 5</h5>
<h6>Heading 6</h6>

<p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
<p>Text with <u>underline</u> and <s>strikethrough</s>.</p>
<p>Using <b>b tag</b> and <i>i tag</i> for formatting.</p>
<p>Text with <mark>highlighted</mark> content.</p>`}
        </NitroText>
      </View>

      {/* Links */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Links</NitroText>
        <NitroText style={styles.description}>
          Interactive links that open directly in Safari
        </NitroText>
        <NitroText
          renderer="html"
          selectable
          style={styles.htmlSection}
        >
          {`
          
<style>
  .link-primary { color: #007bff; text-decoration: underline; }
  .link-success { color: #28a745; font-weight: bold; }
</style>

          <p>Visit <a href="https://www.google.com">Google</a> for search.</p>
<p>Learn more at <a href="https://reactnative.dev">React Native Docs</a>.</p>
<p>Links can have <a href="https://github.com" style="color: #ff6b6b; font-weight: bold; text-decoration: underline;">custom styling</a> too!</p>
<p>Multiple <a href="https://example.com/1">links</a> in <a href="https://example.com/2">one</a> paragraph <a href="https://example.com/3">work</a> perfectly.</p>

<p>Styled with CSS: <a href="https://example.com" class="link-primary">Primary Link</a> and <a href="https://example.com" class="link-success">Success Link</a>.</p>

<p>Links work with <a href="https://example.com"><strong>bold</strong></a> and <a href="https://example.com"><em>italic</em></a> text.</p>`}
        </NitroText>
      </View>

      {/* Lists */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Lists</NitroText>
        <NitroText style={styles.description}>
          Ordered and unordered lists
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<ul>
  <li>Unordered list item 1</li>
  <li>Unordered list item 2</li>
  <li>Unordered list item 3</li>
</ul>

<ol>
  <li>Ordered list item 1</li>
  <li>Ordered list item 2</li>
  <li>Ordered list item 3</li>
</ol>`}
        </NitroText>
      </View>

      {/* CSS Styling */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>CSS Styling</NitroText>
        <NitroText style={styles.description}>
          CSS classes, IDs, and inline styles
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<style>
  .text-red { color: red; font-weight: bold; }
  .text-blue { color: blue; }
  .bg-yellow { background-color: #fff9c4; }
  .large { font-size: 20px; }
  #header { font-size: 24px; }
</style>

<p class="text-red">Red text from CSS class</p>
<p class="text-blue">Blue text from CSS class</p>
<p class="bg-yellow">Yellow background from CSS class</p>
<p class="large">Large text from CSS class</p>
<p id="header">Header with ID styling</p>
<p style="color: green; font-weight: bold;">Green bold text from inline style</p>
<p style="font-size: 18px; line-height: 28px;">Custom font size and line height</p>
<div style="display: flex; flex-direction: column; gap: 10px; border: 1px solid #000; padding: 10px;">
    <p style="text-align: center; ">Centered text</p>
    <p style="text-transform: uppercase;">uppercase text</p>
    <p style="text-decoration: underline; text-decoration-color: purple;">Purple underline</p>
</div>
`}
        </NitroText>
      </View>

      {/* Code Blocks */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Code & Preformatted Text</NitroText>
        <NitroText style={styles.description}>
          Preformatted text and inline code
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<pre>Preformatted text
with multiple lines
and    extra    spaces</pre>

<p>Inline <code>code text</code> in a paragraph.</p>

<pre><code>// Code block example
function hello() {
  console.log("Hello, World!");
}</code></pre>`}
        </NitroText>
      </View>

      {/* Blockquotes */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Blockquotes</NitroText>
        <NitroText style={styles.description}>
          Quoted content blocks
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<blockquote>
  This is a blockquote. It's used to highlight quoted content from another source.
</blockquote>

<blockquote style="border-left: 4px solid #007bff; padding-left: 16px; margin-left: 0;">
  Styled blockquote with custom border and padding.
</blockquote>`}
        </NitroText>
      </View>

      {/* HTML Entities & Unicode */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>HTML Entities & Unicode</NitroText>
        <NitroText style={styles.description}>
          Special characters and emojis
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<p>HTML entities: &amp; &lt; &gt; &quot; &apos; &nbsp; non-breaking space</p>
<p>Unicode emojis: &#x1F600; &#x1F4A9; &#x2764; &#x1F44D; &#x1F680;</p>
<p>Mathematical symbols: &sum; &infin; &pi; &alpha; &beta; &gamma;</p>
<p>Currency symbols: &euro; &pound; &yen; &cent;</p>`}
        </NitroText>
      </View>

      {/* Nested Elements */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Nested Elements</NitroText>
        <NitroText style={styles.description}>
          Complex nested HTML structures
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<div style="background-color: #f0f0f0; padding: 12px; border-radius: 8px;">
  <p>Nested div content</p>
  <span style="color: #007bff; font-weight: bold;">Span element</span>
  <div style="margin-top: 8px; padding-left: 16px; border-left: 3px solid #007bff;">
    <p>Deeply nested content</p>
    <ul>
      <li>Nested list item</li>
    </ul>
  </div>
</div>`}
        </NitroText>
      </View>

      {/* Hidden Elements */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Hidden Elements</NitroText>
        <NitroText style={styles.description}>
          Elements with display: none should be hidden
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<style>
  .hidden { display: none; }
</style>

<p>This paragraph is visible.</p>
<p class="hidden">This should be hidden (CSS class)</p>
<p style="display: none;">This should also be hidden (inline style)</p>
<p>This paragraph is also visible.</p>`}
        </NitroText>
      </View>

      {/* Complex Example */}
      <View style={styles.section}>
        <NitroText style={styles.sectionTitle}>Complex Example</NitroText>
        <NitroText style={styles.description}>
          Combining multiple HTML features together
        </NitroText>
        <NitroText renderer="html" selectable style={styles.htmlSection}>
          {`<style>
  .card { 
    background-color: white; 
    border: 1px solid #ddd; 
    border-radius: 8px; 
    padding: 16px; 
    margin: 8px 0;
  }
  .title { 
    font-size: 20px; 
    font-weight: bold; 
    color: #2c3e50; 
    margin-bottom: 8px;
  }
  .meta { 
    color: #6c757d; 
    font-size: 14px; 
  }
</style>

<div class="card">
  <div class="title">Article Title</div>
  <div class="meta">Published on January 1, 2024</div>
  <p>This is a <strong>complex example</strong> combining multiple HTML features:</p>
  <ul>
    <li>CSS classes and styling</li>
    <li>Nested <em>elements</em></li>
    <li>Text <mark>formatting</mark></li>
  </ul>
  <blockquote style="margin: 16px 0; padding-left: 16px; border-left: 4px solid #007bff;">
    "The best way to predict the future is to create it."
  </blockquote>
  <p>You can use <code>inline code</code> and <strong>bold text</strong> together.</p>
</div>`}
        </NitroText>
      </View>
    </ScrollView>
  );
}

