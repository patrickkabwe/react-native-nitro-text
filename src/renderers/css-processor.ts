import type { Fragment } from '../types'
import { normalizeWeight } from '../utils'
import type { AppliedStyle, ElementNode, Stylesheet } from './types'
import { isZeroMargin, parseNumeric, stripQuotes } from './utils'

/**
 * High-performance CSS processor for parsing and applying CSS styles.
 * Optimized for minimal allocations and fast lookups.
 */
export class CSSProcessor {
   /**
    * Builds a stylesheet from CSS blocks with optimized parsing.
    */
   static buildStylesheet(blocks: string[]): Stylesheet {
      const sheet: Stylesheet = {
         tag: new Map(),
         className: new Map(),
         id: new Map(),
      }

      for (const block of blocks) {
         // Remove comments efficiently
         const cleaned = block.replace(/\/\*[\s\S]*?\*\//g, '')
         this.parseCssRules(cleaned, (selector, declarations) => {
            if (!selector || selector.startsWith('@')) {
               return
            }
            const parsedDecls = this.parseCssDeclarations(declarations)
            if (!Object.keys(parsedDecls).length) {
               return
            }
            // Handle multiple selectors (comma-separated)
            const targets = selector.split(',')
            for (const raw of targets) {
               const sel = raw.trim()
               if (!sel) continue
               if (sel === '*') {
                  this.addStylesheetEntry(sheet.tag, '*', parsedDecls)
               } else if (sel.startsWith('.')) {
                  this.addStylesheetEntry(
                     sheet.className,
                     sel.slice(1),
                     parsedDecls
                  )
               } else if (sel.startsWith('#')) {
                  this.addStylesheetEntry(sheet.id, sel.slice(1), parsedDecls)
               } else {
                  this.addStylesheetEntry(sheet.tag, sel, parsedDecls)
               }
            }
         })
      }
      return sheet
   }

   /**
    * Parses CSS rules efficiently using indexOf for better performance.
    */
   private static parseCssRules(
      css: string,
      cb: (selector: string, body: string) => void
   ) {
      let index = 0
      while (index < css.length) {
         const braceIndex = css.indexOf('{', index)
         if (braceIndex === -1) break
         const selector = css.slice(index, braceIndex).trim()
         let depth = 1
         let cursor = braceIndex + 1
         while (cursor < css.length && depth > 0) {
            const char = css[cursor]
            if (char === '{') depth += 1
            else if (char === '}') depth -= 1
            cursor += 1
         }
         const body = css.slice(braceIndex + 1, cursor - 1)
         cb(selector, body)
         index = cursor
      }
   }

   /**
    * Adds a stylesheet entry with minimal allocations.
    */
   private static addStylesheetEntry(
      map: Map<string, Array<Record<string, string>>>,
      key: string,
      declarations: Record<string, string>
   ) {
      const existing = map.get(key)
      if (existing) {
         existing.push({ ...declarations })
      } else {
         map.set(key, [{ ...declarations }])
      }
   }

   /**
    * Applies styles from stylesheet to a node with optimized lookups.
    */
   static applyStylesFromSheet(
      node: ElementNode,
      sheet: Stylesheet
   ): AppliedStyle {
      const merged: Record<string, string> = {}
      const result: AppliedStyle = { hidden: false, suppressNewlines: false }

      const applyDecls = (decls?: Array<Record<string, string>>) => {
         if (!decls) return
         for (const entry of decls) {
            for (const [key, value] of Object.entries(entry)) {
               if (key === 'display') {
                  const displayValue = value.trim().toLowerCase()
                  if (displayValue === 'none') {
                     result.hidden = true
                  } else {
                     merged[key] = value
                  }
               } else if (
                  (key === 'margin' ||
                     key === 'margin-top' ||
                     key === 'margin-bottom') &&
                  isZeroMargin(value)
               ) {
                  // Suppress extra spacing when margin is 0
                  // Block elements will still maintain minimal structure
                  result.suppressNewlines = true
                  // Still add margin to merged so it can be used elsewhere if needed
                  merged[key] = value
               } else {
                  merged[key] = value
               }
            }
         }
      }

      // Apply universal selector styles first (lowest specificity)
      applyDecls(sheet.tag.get('*'))

      // Apply tag styles
      applyDecls(sheet.tag.get(node.tag))

      // Apply class styles (handle multiple classes)
      const classAttr = node.attrs.class || node.attrs.classname
      if (classAttr) {
         const classes = classAttr.split(/\s+/)
         for (let i = 0; i < classes.length; i++) {
            const className = classes[i]
            if (className) {
               applyDecls(sheet.className.get(className))
            }
         }
      }

      // Apply ID styles
      const idAttr = node.attrs.id
      if (idAttr) {
         applyDecls(sheet.id.get(idAttr))
      }

      if (Object.keys(merged).length) {
         result.fragment = this.cssDeclarationsToFragment(merged)
      }
      return result
   }

   /**
    * Applies inline styles from style attribute.
    */
   static applyInlineStyles(styleAttr?: string): AppliedStyle {
      if (!styleAttr) {
         return { hidden: false, suppressNewlines: false }
      }
      const declarations = this.parseCssDeclarations(styleAttr)
      const applied: AppliedStyle = { hidden: false, suppressNewlines: false }

      // Check for display: none first - if present, don't process other styles
      for (const [key, value] of Object.entries(declarations)) {
         if (key === 'display' && value.trim().toLowerCase() === 'none') {
            applied.hidden = true
            return applied
         }
      }

      for (const [key, value] of Object.entries(declarations)) {
         if (
            (key === 'margin' ||
               key === 'margin-top' ||
               key === 'margin-bottom') &&
            isZeroMargin(value)
         ) {
            // Suppress extra spacing when margin is 0
            applied.suppressNewlines = true
         }
      }
      if (Object.keys(declarations).length) {
         applied.fragment = this.cssDeclarationsToFragment(declarations)
      }
      return applied
   }

   /**
    * Parses CSS declarations efficiently.
    */
   static parseCssDeclarations(input: string): Record<string, string> {
      const decls: Record<string, string> = {}
      const parts = input.split(';')
      for (let i = 0; i < parts.length; i++) {
         const part = parts[i]
         if (!part) continue
         const trimmed = part.trim()
         if (!trimmed) continue
         const colonIndex = trimmed.indexOf(':')
         if (colonIndex === -1) continue
         const prop = trimmed.slice(0, colonIndex).trim().toLowerCase()
         const value = trimmed.slice(colonIndex + 1).trim()
         if (prop) {
            decls[prop] = value
         }
      }
      return decls
   }

   /**
    * Converts CSS declarations to fragment styles.
    * Optimized with early returns and minimal object creation.
    */
   static cssDeclarationsToFragment(
      decls: Record<string, string>
   ): Partial<Fragment> {
      const fragment: Partial<Fragment> = {}
      for (const [prop, value] of Object.entries(decls)) {
         if (!value) continue
         switch (prop) {
            case 'color':
               fragment.fontColor = value
               break
            case 'background':
            case 'background-color':
               fragment.fragmentBackgroundColor = value
               break
            case 'font-size': {
               const size = parseNumeric(value)
               if (size !== undefined) fragment.fontSize = size
               break
            }
            case 'line-height': {
               const lh = parseNumeric(value)
               if (lh !== undefined) fragment.lineHeight = lh
               break
            }
            case 'letter-spacing': {
               const ls = parseNumeric(value)
               if (ls !== undefined) fragment.letterSpacing = ls
               break
            }
            case 'font-weight': {
               const weight = this.normalizeCssFontWeight(value)
               if (weight) fragment.fontWeight = weight
               break
            }
            case 'font-style':
               if (value === 'italic' || value === 'oblique') {
                  fragment.fontStyle = value
               } else if (value === 'normal') {
                  fragment.fontStyle = 'normal'
               }
               break
            case 'font-family':
               fragment.fontFamily = stripQuotes(value)
               break
            case 'text-align':
               fragment.textAlign = value as Fragment['textAlign']
               break
            case 'text-transform':
               fragment.textTransform = value as Fragment['textTransform']
               break
            case 'text-decoration':
            case 'text-decoration-line':
               fragment.textDecorationLine = this.normalizeDecoration(value)
               break
            case 'text-decoration-color':
               fragment.textDecorationColor = value
               break
            case 'text-decoration-style':
               fragment.textDecorationStyle =
                  value as Fragment['textDecorationStyle']
               break
            case 'font': {
               const parsedFont = this.parseFontShorthand(value)
               Object.assign(fragment, parsedFont)
               break
            }
            default:
               break
         }
      }
      return fragment
   }

   /**
    * Parses font shorthand property.
    */
   private static parseFontShorthand(value: string): Partial<Fragment> {
      const out: Partial<Fragment> = {}
      const tokens = value.split(/\s+/)
      let sizeIndex = -1
      for (let i = 0; i < tokens.length; i += 1) {
         const token = tokens[i]
         if (!token) continue
         if (token.includes('/')) {
            const [sizePart = '', linePart = ''] = token.split('/')
            const size = parseNumeric(sizePart)
            if (size !== undefined) out.fontSize = size
            const lh = parseNumeric(linePart)
            if (lh !== undefined) out.lineHeight = lh
            sizeIndex = i
            break
         }
         if (/[0-9]/.test(token)) {
            const size = parseNumeric(token)
            if (size !== undefined) out.fontSize = size
            sizeIndex = i
            break
         }
      }
      if (sizeIndex === -1) {
         sizeIndex = tokens.length
      }
      for (let i = 0; i < sizeIndex; i += 1) {
         const token = tokens[i]
         if (!token) continue
         if (token === 'italic' || token === 'oblique') {
            out.fontStyle = token
         } else {
            const weight = this.normalizeCssFontWeight(token)
            if (weight) out.fontWeight = weight
         }
      }
      const family = tokens.slice(sizeIndex + 1).join(' ')
      if (family) {
         out.fontFamily = stripQuotes(family)
      }
      return out
   }

   /**
    * Normalizes CSS font weight values.
    */
   private static normalizeCssFontWeight(value: string) {
      const trimmed = value.trim()
      if (!trimmed) return undefined
      return normalizeWeight(trimmed as Fragment['fontWeight'])
   }

   /**
    * Normalizes text decoration values.
    */
   private static normalizeDecoration(value: string) {
      const parts = value
         .split(/\s+/)
         .filter(Boolean)
         .map((token) => token.toLowerCase())
      const supported = parts.filter(
         (token) => token === 'underline' || token === 'line-through'
      )
      if (!supported.length) {
         return undefined
      }
      if (supported.length === 2) {
         return 'underline line-through'
      }
      return supported[0] as Fragment['textDecorationLine']
   }
}
