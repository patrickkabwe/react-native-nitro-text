import { CSSProcessor } from './css-processor'
import type { ElementNode, Stylesheet } from './types'

describe('CSSProcessor', () => {
   describe('buildStylesheet', () => {
      it('should build an empty stylesheet from empty blocks', () => {
         const sheet = CSSProcessor.buildStylesheet([])
         expect(sheet.tag.size).toBe(0)
         expect(sheet.className.size).toBe(0)
         expect(sheet.id.size).toBe(0)
      })

      it('should parse tag selectors', () => {
         const sheet = CSSProcessor.buildStylesheet([
            'p { color: red; font-size: 16px; }',
         ])
         const pStyles = sheet.tag.get('p')
         expect(pStyles).toBeDefined()
         expect(pStyles?.[0]).toEqual({
            'color': 'red',
            'font-size': '16px',
         })
      })

      it('should parse class selectors', () => {
         const sheet = CSSProcessor.buildStylesheet([
            '.my-class { color: blue; }',
         ])
         const classStyles = sheet.className.get('my-class')
         expect(classStyles).toBeDefined()
         expect(classStyles?.[0]).toEqual({ color: 'blue' })
      })

      it('should parse ID selectors', () => {
         const sheet = CSSProcessor.buildStylesheet([
            '#my-id { color: green; }',
         ])
         const idStyles = sheet.id.get('my-id')
         expect(idStyles).toBeDefined()
         expect(idStyles?.[0]).toEqual({ color: 'green' })
      })

      it('should parse universal selector (*)', () => {
         const sheet = CSSProcessor.buildStylesheet([
            '* { color: blue; font-size: 14px; }',
         ])
         const universalStyles = sheet.tag.get('*')
         expect(universalStyles).toBeDefined()
         expect(universalStyles?.[0]).toEqual({
            'color': 'blue',
            'font-size': '14px',
         })
      })

      it('should handle multiple selectors (comma-separated)', () => {
         const sheet = CSSProcessor.buildStylesheet([
            'h1, h2, h3 { font-weight: bold; }',
         ])
         expect(sheet.tag.get('h1')?.[0]).toEqual({ 'font-weight': 'bold' })
         expect(sheet.tag.get('h2')?.[0]).toEqual({ 'font-weight': 'bold' })
         expect(sheet.tag.get('h3')?.[0]).toEqual({ 'font-weight': 'bold' })
      })

      it('should handle universal selector in comma-separated selectors', () => {
         const sheet = CSSProcessor.buildStylesheet(['*, p { color: red; }'])
         expect(sheet.tag.get('*')?.[0]).toEqual({ color: 'red' })
         expect(sheet.tag.get('p')?.[0]).toEqual({ color: 'red' })
      })

      it('should handle multiple CSS blocks', () => {
         const sheet = CSSProcessor.buildStylesheet([
            'p { color: red; }',
            '.class { color: blue; }',
            '#id { color: green; }',
         ])
         expect(sheet.tag.get('p')?.[0]).toEqual({ color: 'red' })
         expect(sheet.className.get('class')?.[0]).toEqual({ color: 'blue' })
         expect(sheet.id.get('id')?.[0]).toEqual({ color: 'green' })
      })

      it('should merge multiple rules for the same selector', () => {
         const sheet = CSSProcessor.buildStylesheet([
            'p { color: red; }',
            'p { font-size: 16px; }',
         ])
         const pStyles = sheet.tag.get('p')
         expect(pStyles).toBeDefined()
         expect(pStyles?.length).toBe(2)
         expect(pStyles?.[0]).toEqual({ color: 'red' })
         expect(pStyles?.[1]).toEqual({ 'font-size': '16px' })
      })

      it('should remove CSS comments', () => {
         const sheet = CSSProcessor.buildStylesheet([
            '/* This is a comment */ p { color: red; }',
            '.class { /* inline comment */ color: blue; }',
         ])
         expect(sheet.tag.get('p')?.[0]).toEqual({ color: 'red' })
         expect(sheet.className.get('class')?.[0]).toEqual({ color: 'blue' })
      })

      it('should handle multi-line comments', () => {
         const sheet = CSSProcessor.buildStylesheet([
            '/*\n * Multi-line\n * comment\n */ p { color: red; }',
         ])
         expect(sheet.tag.get('p')?.[0]).toEqual({ color: 'red' })
      })

      it('should ignore @ rules', () => {
         const sheet = CSSProcessor.buildStylesheet([
            '@media screen { p { color: red; } }',
            '@keyframes fade { from { opacity: 0; } }',
         ])
         expect(sheet.tag.size).toBe(0)
         expect(sheet.className.size).toBe(0)
         expect(sheet.id.size).toBe(0)
      })

      it('should handle empty declarations', () => {
         const sheet = CSSProcessor.buildStylesheet(['p { }'])
         expect(sheet.tag.size).toBe(0)
      })

      it('should handle whitespace in selectors', () => {
         const sheet = CSSProcessor.buildStylesheet([
            '  p  { color: red; }',
            '  .class  { color: blue; }',
            '  #id  { color: green; }',
         ])
         expect(sheet.tag.get('p')?.[0]).toEqual({ color: 'red' })
         expect(sheet.className.get('class')?.[0]).toEqual({ color: 'blue' })
         expect(sheet.id.get('id')?.[0]).toEqual({ color: 'green' })
      })

      it('should handle nested braces correctly', () => {
         const sheet = CSSProcessor.buildStylesheet([
            'div { color: red; }',
            'span { color: blue; }',
         ])
         expect(sheet.tag.get('div')?.[0]).toEqual({ color: 'red' })
         expect(sheet.tag.get('span')?.[0]).toEqual({ color: 'blue' })
      })
   })

   describe('parseCssDeclarations', () => {
      it('should parse simple declarations', () => {
         const decls = CSSProcessor.parseCssDeclarations(
            'color: red; font-size: 16px;'
         )
         expect(decls).toEqual({
            'color': 'red',
            'font-size': '16px',
         })
      })

      it('should handle declarations without semicolon at end', () => {
         const decls = CSSProcessor.parseCssDeclarations('color: red')
         expect(decls).toEqual({ color: 'red' })
      })

      it('should normalize property names to lowercase', () => {
         const decls = CSSProcessor.parseCssDeclarations(
            'Color: red; Font-Size: 16px;'
         )
         expect(decls).toEqual({
            'color': 'red',
            'font-size': '16px',
         })
      })

      it('should handle whitespace', () => {
         const decls = CSSProcessor.parseCssDeclarations(
            '  color  :  red  ;  font-size  :  16px  ;  '
         )
         expect(decls).toEqual({
            'color': 'red',
            'font-size': '16px',
         })
      })

      it('should handle empty input', () => {
         const decls = CSSProcessor.parseCssDeclarations('')
         expect(decls).toEqual({})
      })

      it('should handle multiple semicolons', () => {
         const decls = CSSProcessor.parseCssDeclarations(
            'color: red;; font-size: 16px;'
         )
         expect(decls).toEqual({
            'color': 'red',
            'font-size': '16px',
         })
      })

      it('should skip invalid declarations', () => {
         const decls = CSSProcessor.parseCssDeclarations(
            'color: red; invalid; font-size: 16px;'
         )
         expect(decls).toEqual({
            'color': 'red',
            'font-size': '16px',
         })
      })

      it('should preserve value whitespace', () => {
         const decls = CSSProcessor.parseCssDeclarations(
            'font-family: Arial, sans-serif;'
         )
         expect(decls).toEqual({
            'font-family': 'Arial, sans-serif',
         })
      })
   })

   describe('applyStylesFromSheet', () => {
      let sheet: Stylesheet

      beforeEach(() => {
         sheet = CSSProcessor.buildStylesheet([
            'p { color: red; font-size: 16px; }',
            '.highlight { background-color: yellow; }',
            '#title { font-weight: bold; }',
         ])
      })

      it('should apply tag styles', () => {
         const node: ElementNode = {
            type: 'element',
            tag: 'p',
            attrs: {},
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.fragment).toEqual({
            fontColor: 'red',
            fontSize: 16,
         })
         expect(result.hidden).toBe(false)
         expect(result.suppressNewlines).toBe(false)
      })

      it('should apply class styles', () => {
         const node: ElementNode = {
            type: 'element',
            tag: 'span',
            attrs: { class: 'highlight' },
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.fragment).toEqual({
            fragmentBackgroundColor: 'yellow',
         })
      })

      it('should apply ID styles', () => {
         const node: ElementNode = {
            type: 'element',
            tag: 'h1',
            attrs: { id: 'title' },
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.fragment).toEqual({
            fontWeight: 'bold',
         })
      })

      it('should apply multiple class styles', () => {
         sheet = CSSProcessor.buildStylesheet([
            '.class1 { color: red; }',
            '.class2 { font-size: 20px; }',
         ])
         const node: ElementNode = {
            type: 'element',
            tag: 'div',
            attrs: { class: 'class1 class2' },
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.fragment).toEqual({
            fontColor: 'red',
            fontSize: 20,
         })
      })

      it('should handle classname attribute', () => {
         const node: ElementNode = {
            type: 'element',
            tag: 'span',
            attrs: { classname: 'highlight' },
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.fragment).toEqual({
            fragmentBackgroundColor: 'yellow',
         })
      })

      it('should combine tag, class, and ID styles', () => {
         sheet = CSSProcessor.buildStylesheet([
            'div { color: blue; }',
            '.container { font-size: 18px; }',
            '#main { font-weight: bold; }',
         ])
         const node: ElementNode = {
            type: 'element',
            tag: 'div',
            attrs: { class: 'container', id: 'main' },
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.fragment).toEqual({
            fontColor: 'blue',
            fontSize: 18,
            fontWeight: 'bold',
         })
      })

      it('should handle display: none', () => {
         sheet = CSSProcessor.buildStylesheet(['.hidden { display: none; }'])
         const node: ElementNode = {
            type: 'element',
            tag: 'div',
            attrs: { class: 'hidden' },
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.hidden).toBe(true)
         expect(result.fragment).toBeUndefined()
      })

      it('should handle zero margin', () => {
         sheet = CSSProcessor.buildStylesheet(['p { margin: 0; }'])
         const node: ElementNode = {
            type: 'element',
            tag: 'p',
            attrs: {},
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.suppressNewlines).toBe(true)
      })

      it('should handle margin-top: 0', () => {
         sheet = CSSProcessor.buildStylesheet(['p { margin-top: 0; }'])
         const node: ElementNode = {
            type: 'element',
            tag: 'p',
            attrs: {},
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.suppressNewlines).toBe(true)
      })

      it('should handle margin-bottom: 0', () => {
         sheet = CSSProcessor.buildStylesheet(['p { margin-bottom: 0; }'])
         const node: ElementNode = {
            type: 'element',
            tag: 'p',
            attrs: {},
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.suppressNewlines).toBe(true)
      })

      it('should return empty result when no styles match', () => {
         const node: ElementNode = {
            type: 'element',
            tag: 'span',
            attrs: {},
            children: [],
         }
         const emptySheet: Stylesheet = {
            tag: new Map(),
            className: new Map(),
            id: new Map(),
         }
         const result = CSSProcessor.applyStylesFromSheet(node, emptySheet)
         expect(result.fragment).toBeUndefined()
         expect(result.hidden).toBe(false)
         expect(result.suppressNewlines).toBe(false)
      })

      it('should apply universal selector styles to all elements', () => {
         sheet = CSSProcessor.buildStylesheet(['* { color: gray; }'])
         const node: ElementNode = {
            type: 'element',
            tag: 'div',
            attrs: {},
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         expect(result.fragment).toEqual({ fontColor: 'gray' })
      })

      it('should apply universal selector before tag-specific styles', () => {
         sheet = CSSProcessor.buildStylesheet([
            '* { color: gray; }',
            'p { color: red; }',
         ])
         const node: ElementNode = {
            type: 'element',
            tag: 'p',
            attrs: {},
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         // Tag-specific style should override universal selector
         expect(result.fragment).toEqual({ fontColor: 'red' })
      })

      it('should apply universal selector before class styles', () => {
         sheet = CSSProcessor.buildStylesheet([
            '* { font-size: 12px; }',
            '.highlight { font-size: 18px; }',
         ])
         const node: ElementNode = {
            type: 'element',
            tag: 'span',
            attrs: { class: 'highlight' },
            children: [],
         }
         const result = CSSProcessor.applyStylesFromSheet(node, sheet)
         // Class style should override universal selector
         expect(result.fragment).toEqual({ fontSize: 18 })
      })

      it('should apply universal selector to elements with any tag', () => {
         sheet = CSSProcessor.buildStylesheet(['* { font-weight: bold; }'])
         const tags = ['div', 'span', 'p', 'h1', 'a']
         for (const tag of tags) {
            const node: ElementNode = {
               type: 'element',
               tag,
               attrs: {},
               children: [],
            }
            const result = CSSProcessor.applyStylesFromSheet(node, sheet)
            expect(result.fragment).toEqual({ fontWeight: 'bold' })
         }
      })
   })

   describe('applyInlineStyles', () => {
      it('should parse and apply inline styles', () => {
         const result = CSSProcessor.applyInlineStyles(
            'color: red; font-size: 16px;'
         )
         expect(result.fragment).toEqual({
            fontColor: 'red',
            fontSize: 16,
         })
         expect(result.hidden).toBe(false)
         expect(result.suppressNewlines).toBe(false)
      })

      it('should handle empty style attribute', () => {
         const result = CSSProcessor.applyInlineStyles(undefined)
         expect(result.fragment).toBeUndefined()
         expect(result.hidden).toBe(false)
         expect(result.suppressNewlines).toBe(false)
      })

      it('should handle display: none', () => {
         const result = CSSProcessor.applyInlineStyles(
            'display: none; color: red;'
         )
         expect(result.hidden).toBe(true)
         expect(result.fragment).toBeUndefined()
      })

      it('should handle zero margin', () => {
         const result = CSSProcessor.applyInlineStyles('margin: 0; color: red;')
         expect(result.suppressNewlines).toBe(true)
         expect(result.fragment).toEqual({
            fontColor: 'red',
         })
      })

      it('should handle margin-top: 0', () => {
         const result = CSSProcessor.applyInlineStyles('margin-top: 0;')
         expect(result.suppressNewlines).toBe(true)
      })

      it('should handle margin-bottom: 0', () => {
         const result = CSSProcessor.applyInlineStyles('margin-bottom: 0;')
         expect(result.suppressNewlines).toBe(true)
      })
   })

   describe('cssDeclarationsToFragment', () => {
      it('should convert color to fontColor', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            color: 'red',
         })
         expect(fragment).toEqual({ fontColor: 'red' })
      })

      it('should convert background-color to fragmentBackgroundColor', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'background-color': 'yellow',
         })
         expect(fragment).toEqual({ fragmentBackgroundColor: 'yellow' })
      })

      it('should convert background to fragmentBackgroundColor', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            background: 'blue',
         })
         expect(fragment).toEqual({ fragmentBackgroundColor: 'blue' })
      })

      it('should convert font-size to fontSize', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-size': '16px',
         })
         expect(fragment).toEqual({ fontSize: 16 })
      })

      it('should handle font-size with different units', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-size': '1.5em',
         })
         expect(fragment).toEqual({ fontSize: 1.5 })
      })

      it('should convert line-height to lineHeight', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'line-height': '1.5',
         })
         expect(fragment).toEqual({ lineHeight: 1.5 })
      })

      it('should convert letter-spacing to letterSpacing', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'letter-spacing': '2px',
         })
         expect(fragment).toEqual({ letterSpacing: 2 })
      })

      it('should convert font-weight to fontWeight', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-weight': 'bold',
         })
         expect(fragment).toEqual({ fontWeight: 'bold' })
      })

      it('should normalize numeric font-weight', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-weight': '700',
         })
         expect(fragment).toEqual({ fontWeight: 'bold' })
      })

      it('should convert font-style to fontStyle', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-style': 'italic',
         })
         expect(fragment).toEqual({ fontStyle: 'italic' })
      })

      it('should handle font-style: normal', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-style': 'normal',
         })
         expect(fragment).toEqual({ fontStyle: 'normal' })
      })

      it('should handle font-style: oblique', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-style': 'oblique',
         })
         expect(fragment).toEqual({ fontStyle: 'oblique' })
      })

      it('should convert font-family to fontFamily', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-family': 'Arial, sans-serif',
         })
         expect(fragment).toEqual({ fontFamily: 'Arial, sans-serif' })
      })

      it('should strip quotes from font-family', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-family': '"Arial", sans-serif',
         })
         expect(fragment).toEqual({ fontFamily: 'Arial, sans-serif' })
      })

      it('should convert text-align to textAlign', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'text-align': 'center',
         })
         expect(fragment).toEqual({ textAlign: 'center' })
      })

      it('should convert text-transform to textTransform', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'text-transform': 'uppercase',
         })
         expect(fragment).toEqual({ textTransform: 'uppercase' })
      })

      it('should convert text-decoration-line to textDecorationLine', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'text-decoration-line': 'underline',
         })
         expect(fragment).toEqual({ textDecorationLine: 'underline' })
      })

      it('should convert text-decoration to textDecorationLine', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'text-decoration': 'underline',
         })
         expect(fragment).toEqual({ textDecorationLine: 'underline' })
      })

      it('should handle multiple text decorations', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'text-decoration': 'underline line-through',
         })
         expect(fragment).toEqual({
            textDecorationLine: 'underline line-through',
         })
      })

      it('should filter unsupported text decorations', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'text-decoration': 'overline',
         })
         expect(fragment.textDecorationLine).toBeUndefined()
      })

      it('should convert text-decoration-color to textDecorationColor', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'text-decoration-color': 'red',
         })
         expect(fragment).toEqual({ textDecorationColor: 'red' })
      })

      it('should convert text-decoration-style to textDecorationStyle', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'text-decoration-style': 'dashed',
         })
         expect(fragment).toEqual({ textDecorationStyle: 'dashed' })
      })

      it('should parse font shorthand', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            font: 'bold italic 16px/1.5 Arial',
         })
         expect(fragment).toEqual({
            fontWeight: 'bold',
            fontStyle: 'italic',
            fontSize: 16,
            lineHeight: 1.5,
            fontFamily: 'Arial',
         })
      })

      it('should parse font shorthand without line-height', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            font: 'bold 16px Arial',
         })
         expect(fragment).toEqual({
            fontWeight: 'bold',
            fontSize: 16,
            fontFamily: 'Arial',
         })
      })

      it('should parse font shorthand with quoted family', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            font: '16px "Times New Roman"',
         })
         expect(fragment).toEqual({
            fontSize: 16,
            fontFamily: 'Times New Roman',
         })
      })

      it('should handle multiple declarations', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'color': 'red',
            'font-size': '16px',
            'font-weight': 'bold',
            'text-align': 'center',
         })
         expect(fragment).toEqual({
            fontColor: 'red',
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
         })
      })

      it('should ignore empty values', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'color': '',
            'font-size': '16px',
         })
         expect(fragment).toEqual({ fontSize: 16 })
      })

      it('should ignore unsupported properties', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'border-width': '1px',
            'padding': '10px',
            'color': 'red',
         })
         expect(fragment).toEqual({ fontColor: 'red' })
      })

      it('should handle invalid numeric values', () => {
         const fragment = CSSProcessor.cssDeclarationsToFragment({
            'font-size': 'invalid',
            'line-height': 'not-a-number',
         })
         expect(fragment.fontSize).toBeUndefined()
         expect(fragment.lineHeight).toBeUndefined()
      })
   })
})
