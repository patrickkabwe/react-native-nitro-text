import { HTMLRenderer } from './html'
import type { Fragment } from '../types'

describe('HTMLRenderer', () => {
   describe('render', () => {
      describe('basic text rendering', () => {
         it('should render plain text', () => {
            const result = HTMLRenderer.render('Hello World')
            expect(result.text).toBe('Hello World')
            expect(result.fragments).toHaveLength(1)
            expect(result.fragments[0]?.text).toBe('Hello World')
         })

         it('should render empty string', () => {
            const result = HTMLRenderer.render('')
            expect(result.text).toBe('')
            expect(result.fragments).toHaveLength(0)
         })

         it('should trim leading and trailing whitespace', () => {
            const result = HTMLRenderer.render('  Hello  ')
            expect(result.text).toBe('Hello')
         })

         it('should collapse multiple spaces to single space', () => {
            const result = HTMLRenderer.render('Hello    World')
            expect(result.text).toBe('Hello World')
         })
      })

      describe('semantic tags', () => {
         it('should render bold text with <strong>', () => {
            const result = HTMLRenderer.render('<strong>Bold</strong>')
            expect(result.text).toBe('Bold')
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })

         it('should render bold text with <b>', () => {
            const result = HTMLRenderer.render('<b>Bold</b>')
            expect(result.text).toBe('Bold')
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })

         it('should render italic text with <em>', () => {
            const result = HTMLRenderer.render('<em>Italic</em>')
            expect(result.text).toBe('Italic')
            expect(result.fragments[0]?.fontStyle).toBe('italic')
         })

         it('should render italic text with <i>', () => {
            const result = HTMLRenderer.render('<i>Italic</i>')
            expect(result.text).toBe('Italic')
            expect(result.fragments[0]?.fontStyle).toBe('italic')
         })

         it('should render underlined text with <u>', () => {
            const result = HTMLRenderer.render('<u>Underlined</u>')
            expect(result.text).toBe('Underlined')
            expect(result.fragments[0]?.textDecorationLine).toBe('underline')
         })

         it('should render strikethrough with <s>', () => {
            const result = HTMLRenderer.render('<s>Strikethrough</s>')
            expect(result.text).toBe('Strikethrough')
            expect(result.fragments[0]?.textDecorationLine).toBe('line-through')
         })

         it('should render strikethrough with <del>', () => {
            const result = HTMLRenderer.render('<del>Deleted</del>')
            expect(result.text).toBe('Deleted')
            expect(result.fragments[0]?.textDecorationLine).toBe('line-through')
         })

         it('should render strikethrough with <strike>', () => {
            const result = HTMLRenderer.render('<strike>Strike</strike>')
            expect(result.text).toBe('Strike')
            expect(result.fragments[0]?.textDecorationLine).toBe('line-through')
         })

         it('should render marked text with background color', () => {
            const result = HTMLRenderer.render('<mark>Highlighted</mark>')
            expect(result.text).toBe('Highlighted')
            expect(result.fragments[0]).toBeDefined()
         })

         it('should combine multiple semantic styles', () => {
            const result = HTMLRenderer.render(
               '<strong><em>Bold and Italic</em></strong>'
            )
            expect(result.text).toBe('Bold and Italic')
            const fragment = result.fragments[0]
            expect(fragment?.fontWeight).toBe('bold')
            expect(fragment?.fontStyle).toBe('italic')
         })
      })

      describe('headings', () => {
         it('should render h1 with correct size', () => {
            const result = HTMLRenderer.render('<h1>Heading 1</h1>')
            expect(result.text).toBe('Heading 1')
            expect(result.fragments[0]?.fontSize).toBe(30)
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })

         it('should render h2 with correct size', () => {
            const result = HTMLRenderer.render('<h2>Heading 2</h2>')
            expect(result.text).toBe('Heading 2')
            expect(result.fragments[0]?.fontSize).toBe(26)
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })

         it('should render h3 with correct size', () => {
            const result = HTMLRenderer.render('<h3>Heading 3</h3>')
            expect(result.text).toBe('Heading 3')
            expect(result.fragments[0]?.fontSize).toBe(22)
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })

         it('should render h4 with correct size', () => {
            const result = HTMLRenderer.render('<h4>Heading 4</h4>')
            expect(result.text).toBe('Heading 4')
            expect(result.fragments[0]?.fontSize).toBe(20)
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })

         it('should render h5 with correct size', () => {
            const result = HTMLRenderer.render('<h5>Heading 5</h5>')
            expect(result.text).toBe('Heading 5')
            expect(result.fragments[0]?.fontSize).toBe(18)
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })

         it('should render h6 with correct size', () => {
            const result = HTMLRenderer.render('<h6>Heading 6</h6>')
            expect(result.text).toBe('Heading 6')
            expect(result.fragments[0]?.fontSize).toBe(16)
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })
      })

      describe('block elements', () => {
         it('should add newlines around paragraphs', () => {
            const result = HTMLRenderer.render('<p>First</p><p>Second</p>')
            expect(result.text).toBe('First\n\nSecond')
         })

         it('should add newlines around divs', () => {
            const result = HTMLRenderer.render(
               '<div>First</div><div>Second</div>'
            )
            expect(result.text).toBe('First\n\nSecond')
         })

         it('should handle nested block elements', () => {
            const result = HTMLRenderer.render('<div><p>Nested</p></div>')
            expect(result.text).toBe('Nested')
         })

         it('should handle block elements after text', () => {
            const result = HTMLRenderer.render('Text<p>Paragraph</p>')
            expect(result.text).toBe('Text\n\nParagraph')
         })
      })

      describe('inline elements', () => {
         it('should handle span elements', () => {
            const result = HTMLRenderer.render('<span>Inline</span>')
            expect(result.text).toBe('Inline')
         })

         it('should handle multiple inline elements', () => {
            const result = HTMLRenderer.render(
               '<span>First</span> <span>Second</span>'
            )
            expect(result.text).toBe('First Second')
         })

         it('should handle inline elements after block elements', () => {
            const result = HTMLRenderer.render(
               '<p>Block</p><span>Inline</span>'
            )
            expect(result.text).toBe('Block\nInline')
         })
      })

      describe('line breaks', () => {
         it('should render br tags as newlines', () => {
            const result = HTMLRenderer.render('Line 1<br>Line 2')
            expect(result.text).toBe('Line 1\nLine 2')
         })

         it('should handle multiple br tags', () => {
            const result = HTMLRenderer.render('Line 1<br><br>Line 2')
            expect(result.text).toBe('Line 1\n\nLine 2')
         })

         it('should handle br tags with attributes', () => {
            const result = HTMLRenderer.render('Line 1<br />Line 2')
            expect(result.text).toBe('Line 1\nLine 2')
         })
      })

      describe('lists', () => {
         it('should render unordered list with bullets', () => {
            const result = HTMLRenderer.render(
               '<ul><li>Item 1</li><li>Item 2</li></ul>'
            )
            expect(result.text).toBe('• Item 1\n\n• Item 2')
         })

         it('should render ordered list with numbers', () => {
            const result = HTMLRenderer.render(
               '<ol><li>First</li><li>Second</li></ol>'
            )
            expect(result.text).toBe('1. First\n\n2. Second')
         })

         it('should handle nested lists', () => {
            const result = HTMLRenderer.render(
               '<ul><li>Item 1<ul><li>Sub 1</li></ul></li></ul>'
            )
            expect(result.text).toContain('• Item 1')
            expect(result.text).toContain('• Sub 1')
         })

         it('should handle mixed ordered and unordered lists', () => {
            const result = HTMLRenderer.render(
               '<ol><li>First<ul><li>Bullet</li></ul></li></ol>'
            )
            expect(result.text).toContain('1. First')
            expect(result.text).toContain('• Bullet')
         })

         it('should handle list with text before it', () => {
            const result = HTMLRenderer.render('Text<ul><li>Item</li></ul>')
            expect(result.text).toBe('Text\n\n• Item')
         })
      })

      describe('images', () => {
         it('should render image alt text', () => {
            const result = HTMLRenderer.render(
               '<img alt="Image description" />'
            )
            expect(result.text).toBe('Image description')
         })

         it('should ignore image without alt text', () => {
            const result = HTMLRenderer.render('<img src="test.jpg" />')
            expect(result.text).toBe('')
         })

         it('should handle image after text', () => {
            const result = HTMLRenderer.render('Text<img alt="Image" />')
            expect(result.text).toBe('TextImage')
         })

         it('should handle image in block element', () => {
            const result = HTMLRenderer.render('<p><img alt="Image" /></p>')
            expect(result.text).toBe('Image')
         })
      })

      describe('HTML entities', () => {
         it('should decode common HTML entities', () => {
            const result = HTMLRenderer.render('&lt;div&gt;')
            expect(result.text).toBe('<div>')
         })

         it('should decode ampersand', () => {
            const result = HTMLRenderer.render('Tom &amp; Jerry')
            expect(result.text).toBe('Tom & Jerry')
         })

         it('should decode quotes', () => {
            const result = HTMLRenderer.render('&quot;Hello&quot;')
            expect(result.text).toBe('"Hello"')
         })

         it('should decode non-breaking space', () => {
            const result = HTMLRenderer.render('Word&nbsp;Word')
            expect(result.text).toBe('Word Word')
         })

         it('should decode numeric entities', () => {
            const result = HTMLRenderer.render('&#65; &#x41;')
            expect(result.text).toBe('A A')
         })

         it('should decode greek letters', () => {
            const result = HTMLRenderer.render('&alpha; &beta; &gamma;')
            expect(result.text).toBe('\u03b1 \u03b2 \u03b3')
         })

         it('should decode copyright and other symbols', () => {
            const result = HTMLRenderer.render('&copy; &reg; &trade;')
            expect(result.text).toBe('\u00a9 \u00ae \u2122')
         })
      })

      describe('CSS integration', () => {
         it('should apply inline styles', () => {
            const result = HTMLRenderer.render(
               '<span style="color: red; font-size: 20px;">Styled</span>'
            )
            expect(result.text).toBe('Styled')
            expect(result.fragments[0]?.fontColor).toBe('red')
            expect(result.fragments[0]?.fontSize).toBe(20)
         })

         it('should apply styles from style tag', () => {
            const html = `
               <style>
                  .red { color: red; }
               </style>
               <span class="red">Red Text</span>
            `
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Red Text')
            expect(result.fragments[0]?.fontColor).toBe('red')
         })

         it('should apply tag selector styles', () => {
            const html = `
               <style>
                  p { color: blue; }
               </style>
               <p>Blue paragraph</p>
            `
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Blue paragraph')
            expect(result.fragments[0]?.fontColor).toBe('blue')
         })

         it('should apply ID selector styles', () => {
            const html = `
               <style>
                  #special { color: green; }
               </style>
               <span id="special">Special</span>
            `
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Special')
            expect(result.fragments[0]?.fontColor).toBe('green')
         })

         it('should give priority to inline styles over CSS', () => {
            const html = `
               <style>
                  .text { color: blue; }
               </style>
               <span class="text" style="color: red;">Text</span>
            `
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Text')
            expect(result.fragments[0]?.fontColor).toBe('red')
         })

         it('should handle display:none to hide elements', () => {
            const html = '<span style="display: none;">Hidden</span>Visible'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Visible')
         })
      })

      describe('baseFragment', () => {
         it('should apply base fragment styles', () => {
            const base: Partial<Fragment> = {
               fontSize: 14,
               fontColor: 'blue',
            }
            const result = HTMLRenderer.render('Text', base)
            expect(result.fragments[0]?.fontSize).toBe(14)
            expect(result.fragments[0]?.fontColor).toBe('blue')
         })

         it('should allow HTML to override base fragment', () => {
            const base: Partial<Fragment> = {
               fontSize: 14,
            }
            const result = HTMLRenderer.render(
               '<span style="font-size: 20px;">Text</span>',
               base
            )
            expect(result.fragments[0]?.fontSize).toBe(20)
         })

         it('should combine base fragment with semantic styles', () => {
            const base: Partial<Fragment> = {
               fontColor: 'blue',
            }
            const result = HTMLRenderer.render('<strong>Bold</strong>', base)
            expect(result.fragments[0]?.fontColor).toBe('blue')
            expect(result.fragments[0]?.fontWeight).toBe('bold')
         })
      })

      describe('whitespace handling', () => {
         it('should preserve whitespace in pre tags', () => {
            const result = HTMLRenderer.render(
               '<pre>Line 1\n  Line 2\n    Line 3</pre>'
            )
            expect(result.text).toBe('Line 1\n  Line 2\n    Line 3')
         })

         it('should collapse whitespace outside pre tags', () => {
            const result = HTMLRenderer.render('Text   with    spaces')
            expect(result.text).toBe('Text with spaces')
         })

         it('should collapse newlines outside pre tags', () => {
            const result = HTMLRenderer.render('Line 1\n\n\nLine 2')
            expect(result.text).toBe('Line 1 Line 2')
         })

         it('should trim trailing newlines', () => {
            const result = HTMLRenderer.render('<p>Text</p>\n\n')
            expect(result.text).toBe('Text')
         })
      })

      describe('edge cases', () => {
         it('should handle malformed HTML gracefully', () => {
            const result = HTMLRenderer.render('<div><p>Unclosed')
            expect(result.text).toBe('Unclosed')
         })

         it('should handle DOCTYPE declarations', () => {
            const html = '<!DOCTYPE html><html><body>Content</body></html>'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Content')
         })

         it('should ignore script tags', () => {
            const html = '<script>alert("test")</script>Text'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Text')
         })

         it('should ignore style tag content as text', () => {
            const html = '<style>p { color: red; }</style>Text'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Text')
         })

         it('should ignore head tag content', () => {
            const html = '<head><title>Title</title></head><body>Body</body>'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Body')
         })

         it('should handle HTML comments', () => {
            const html = 'Text<!-- Comment -->More'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('TextMore')
         })

         it('should handle CDATA sections', () => {
            const html = 'Text<![CDATA[data]]>More'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('TextMore')
         })

         it('should handle empty elements', () => {
            const result = HTMLRenderer.render('<p></p>')
            expect(result.text).toBe('')
         })

         it('should handle void tags', () => {
            const html = '<hr /><br /><img />'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('')
         })

         it('should handle self-closing tags', () => {
            const html = '<div>Text<br/>More</div>'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Text\nMore')
         })

         it('should handle mixed content', () => {
            const html = `
               <div>
                  <h1>Title</h1>
                  <p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>
                  <ul>
                     <li>Item 1</li>
                     <li>Item 2</li>
                  </ul>
               </div>
            `
            const result = HTMLRenderer.render(html)
            expect(result.text).toContain('Title')
            expect(result.text).toContain('Paragraph with bold and italic.')
            expect(result.text).toContain('• Item 1')
            expect(result.text).toContain('• Item 2')
         })
      })

      describe('background color handling', () => {
         it('should apply background color from inline style', () => {
            const result = HTMLRenderer.render(
               '<span style="background-color: yellow;">Highlighted</span>'
            )
            expect(result.text).toBe('Highlighted')
            expect(result.fragments[0]).toBeDefined()
         })

         it('should not apply background color to newlines after block elements', () => {
            const result = HTMLRenderer.render(
               '<div style="background-color: yellow;">Text</div>'
            )
            expect(result.text).toBe('Text')
            expect(result.fragments[0]?.text).toBe('Text')
         })

         it('should not inherit background color to children', () => {
            const result = HTMLRenderer.render(
               '<div style="background-color: yellow;"><span>Text</span></div>'
            )
            expect(result.text).toBe('Text')
            expect(result.fragments[0]?.text).toBe('Text')
         })
      })

      describe('complex HTML structures', () => {
         it('should handle deeply nested elements', () => {
            const html =
               '<div><p><span><strong><em>Nested</em></strong></span></p></div>'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Nested')
            const fragment = result.fragments[0]
            expect(fragment?.fontWeight).toBe('bold')
            expect(fragment?.fontStyle).toBe('italic')
         })

         it('should handle sibling elements with different styles', () => {
            const html = '<p><strong>Bold</strong> <em>Italic</em> Normal</p>'
            const result = HTMLRenderer.render(html)
            expect(result.text).toBe('Bold Italic Normal')

            const boldFragment = result.fragments.find(
               (f) => f.fontWeight === 'bold'
            )
            const italicFragment = result.fragments.find(
               (f) => f.fontStyle === 'italic'
            )
            expect(boldFragment?.text).toBe('Bold')
            expect(italicFragment?.text).toBe('Italic')
         })

         it('should handle article structure', () => {
            const html = `
               <article>
                  <header>
                     <h1>Article Title</h1>
                  </header>
                  <section>
                     <p>First paragraph.</p>
                     <p>Second paragraph.</p>
                  </section>
                  <footer>Footer text</footer>
               </article>
            `
            const result = HTMLRenderer.render(html)
            expect(result.text).toContain('Article Title')
            expect(result.text).toContain('First paragraph.')
            expect(result.text).toContain('Second paragraph.')
            expect(result.text).toContain('Footer text')
         })
      })

      describe('links', () => {
         it('should capture link href and render text', () => {
            const result = HTMLRenderer.render(
               '<a href="https://example.com">Click</a>'
            )

            expect(result.text).toBe('Click')
            expect(result.fragments).toHaveLength(1)
            expect(result.fragments[0]?.text).toBe('Click')
            expect(result.fragments[0]?.linkUrl).toBe('https://example.com')
            expect(result.fragments[0]?.fontColor).toBeUndefined()
         })

         it('should ignore target attribute on links', () => {
            const result = HTMLRenderer.render(
               '<a href="https://example.com" target="_blank">New Tab</a>'
            )

            const frag = result.fragments[0]
            expect(result.text).toBe('New Tab')
            expect(frag?.linkUrl).toBe('https://example.com')
         })

         it('should support inline styles on <a>', () => {
            const result = HTMLRenderer.render(
               '<a href="#" style="color: red; font-weight: bold;">Link</a>'
            )

            const frag = result.fragments[0]
            expect(result.text).toBe('Link')
            expect(frag?.linkUrl).toBe('#')
            expect(frag?.fontColor).toBe('red')
            expect(frag?.fontWeight).toBe('bold')
         })

         it('should inherit semantic styles inside <a>', () => {
            const result = HTMLRenderer.render(
               '<a href="/path"><strong>Bold</strong> and <em>Italic</em></a>'
            )

            expect(result.text).toBe('Bold and Italic')

            const boldFrag = result.fragments.find(
               (f) => f.fontWeight === 'bold'
            )
            const italicFrag = result.fragments.find(
               (f) => f.fontStyle === 'italic'
            )

            expect(boldFrag?.text).toBe('Bold')
            expect(boldFrag?.fontWeight).toBe('bold')
            expect(boldFrag?.linkUrl).toBe('/path')
            expect(italicFrag?.text).toBe('Italic')
            expect(italicFrag?.fontStyle).toBe('italic')
            expect(italicFrag?.linkUrl).toBe('/path')
         })

         it('should handle links without href', () => {
            const result = HTMLRenderer.render('<a>No Link</a>')

            expect(result.text).toBe('No Link')
            expect(result.fragments[0]?.linkUrl).toBeUndefined()
         })

         it('should ignore empty links', () => {
            const result = HTMLRenderer.render('<a href="x"></a>')
            expect(result.text).toBe('')
            expect(result.fragments).toHaveLength(0)
         })

         it('should handle whitespace around links', () => {
            const result = HTMLRenderer.render(
               'Hello <a href="/link">there</a> friend'
            )
            expect(result.text).toBe('Hello there friend')
            const linkFrag = result.fragments.find((f) => f.linkUrl)
            expect(linkFrag?.text).toBe('there')
            expect(linkFrag?.linkUrl).toBe('/link')
         })

         it('should not inherit color from parent paragraph', () => {
            const result = HTMLRenderer.render(
               '<p>Visit <a href="https://google.com">Google</a> for search.</p>'
            )

            const linkFrag = result.fragments.find(
               (f) => f.linkUrl === 'https://google.com'
            )
            expect(linkFrag).toBeDefined()
            expect(linkFrag?.text).toBe('Google')
            expect(linkFrag?.linkUrl).toBe('https://google.com')
            expect(linkFrag?.fontColor).toBeUndefined()
         })
      })
   })
})
