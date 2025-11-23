import type { Fragment } from '../types'
import type {
   ElementNode,
   ListStackItem,
   Node,
   RenderResult,
   WalkContext,
   WalkState,
} from './types'
import {
   BLOCK_TAGS,
   HEADING_SIZES,
   PRE_TAGS,
   VOID_TAGS,
} from '../constants/html'
import { CSSProcessor } from './css-processor'
import {
   appendText,
   collapseWhitespace,
   createState,
   decodeEntities,
   finalizeState,
   mergeStyles,
   trimLeadingWhitespace,
   trimTrailingWhitespace,
} from './utils'

/**
 * HTML renderer with optimized parsing and rendering.
 */
export class HTMLRenderer {
   /**
    * Renders HTML string to fragments with optimized parsing.
    */
   static render(
      html: string,
      baseFragment: Partial<Fragment> = {}
   ): RenderResult {
      const root = this.parseHtmlTree(html)
      const stylesheetBlocks: string[] = []
      this.stripStyleNodes(root, stylesheetBlocks)
      const stylesheet = CSSProcessor.buildStylesheet(stylesheetBlocks)
      const state = createState()
      const walkState: WalkState = {
         stylesheet,
         state,
         listStack: [],
      }
      this.walkNodes(
         root.children,
         { style: baseFragment, preformatted: false },
         walkState
      )
      trimLeadingWhitespace(state)
      trimTrailingWhitespace(state)
      return finalizeState(state)
   }

   /**
    * Walks the node tree and renders content with optimized traversal.
    */
   private static walkNodes(
      nodes: Node[],
      context: WalkContext,
      walkState: WalkState
   ) {
      const nodesLength = nodes.length
      for (let i = 0; i < nodesLength; i++) {
         const node = nodes[i]
         if (!node) continue
         if (node.type === 'text') {
            const decoded = decodeEntities(node.content)
            const content = context.preformatted
               ? decoded
               : collapseWhitespace(decoded)
            if (content.length > 0) {
               appendText(walkState.state, content, context.style)
            }
            continue
         }

         const tag = node.tag
         if (tag === 'head' || tag === 'style' || tag === 'script') {
            continue
         }

         let nextStyle = context.style
         const applied = CSSProcessor.applyStylesFromSheet(
            node,
            walkState.stylesheet
         )
         if (applied.hidden) {
            continue
         }

         const inlineApplied = CSSProcessor.applyInlineStyles(node.attrs.style)
         if (inlineApplied.hidden) {
            continue
         }

         if (applied.fragment) {
            nextStyle = mergeStyles(nextStyle, applied.fragment)
         }
         if (inlineApplied.fragment) {
            nextStyle = mergeStyles(nextStyle, inlineApplied.fragment)
         }

         const suppressNewlines =
            applied.suppressNewlines || inlineApplied.suppressNewlines

         const semantic = this.semanticStyleForTag(tag)
         if (semantic) {
            nextStyle = mergeStyles(nextStyle, semantic)
         }

         if (tag === 'a') {
            const href = node.attrs.href
            if (href) {
               nextStyle = mergeStyles(nextStyle, { linkUrl: href })
            }
         }

         const styleForChildren = { ...nextStyle }
         if (styleForChildren.fragmentBackgroundColor) {
            delete styleForChildren.fragmentBackgroundColor
         }

         if (tag === 'br') {
            appendText(walkState.state, '\n', nextStyle)
            continue
         }

         if (tag === 'img') {
            // Handle whitespace before img alt text (same as other inline elements)
            const hasContent =
               walkState.state.plainText &&
               walkState.state.plainText.trim().length > 0
            if (hasContent) {
               const trimmed = walkState.state.plainText.trimEnd()
               if (trimmed.length < walkState.state.plainText.length) {
                  const trailingWhitespace = walkState.state.plainText.slice(
                     trimmed.length
                  )
                  const newlineCount = (trailingWhitespace.match(/\n/g) || [])
                     .length

                  if (newlineCount > 0) {
                     // Remove all trailing whitespace, then add back exactly one newline
                     const diff =
                        walkState.state.plainText.length - trimmed.length
                     let removed = 0
                     for (
                        let i = walkState.state.fragments.length - 1;
                        i >= 0 && removed < diff;
                        i--
                     ) {
                        const frag = walkState.state.fragments[i]
                        if (frag && frag.text) {
                           const fragLen = frag.text.length
                           const toRemove = Math.min(fragLen, diff - removed)
                           frag.text = frag.text.slice(0, fragLen - toRemove)
                           removed += toRemove
                           if (!frag.text) {
                              walkState.state.fragments.pop()
                           }
                        }
                     }
                     walkState.state.plainText = trimmed
                     // Add back exactly one newline so img alt text appears on new line
                     const newlineStyle = { ...nextStyle }
                     delete newlineStyle.fragmentBackgroundColor
                     appendText(walkState.state, '\n', newlineStyle)
                  } else {
                     // No newlines, just spaces - remove them all
                     const diff =
                        walkState.state.plainText.length - trimmed.length
                     let removed = 0
                     for (
                        let i = walkState.state.fragments.length - 1;
                        i >= 0 && removed < diff;
                        i--
                     ) {
                        const frag = walkState.state.fragments[i]
                        if (frag && frag.text) {
                           const fragLen = frag.text.length
                           const toRemove = Math.min(fragLen, diff - removed)
                           frag.text = frag.text.slice(0, fragLen - toRemove)
                           removed += toRemove
                           if (!frag.text) {
                              walkState.state.fragments.pop()
                           }
                        }
                     }
                     walkState.state.plainText = trimmed
                  }
               }
            }
            const altText = node.attrs.alt
            if (altText) {
               appendText(walkState.state, altText, nextStyle)
            }
            continue
         }

         const preformatted = context.preformatted || PRE_TAGS.has(tag)
         const isBlock = BLOCK_TAGS.has(tag)

         // Handle inline elements (like span) that come after block elements
         if (!isBlock && tag !== 'br' && tag !== 'img') {
            const hasContent =
               walkState.state.plainText &&
               walkState.state.plainText.trim().length > 0
            if (hasContent) {
               // Check if we have trailing whitespace with newlines (from a block element)
               const trimmed = walkState.state.plainText.trimEnd()
               if (trimmed.length < walkState.state.plainText.length) {
                  const trailingWhitespace = walkState.state.plainText.slice(
                     trimmed.length
                  )
                  const newlineCount = (trailingWhitespace.match(/\n/g) || [])
                     .length

                  // Only process if we have newlines (block element just finished)
                  // If there are only spaces (no newlines), preserve them for normal inline flow
                  if (newlineCount > 0) {
                     // Remove all trailing whitespace, then add back exactly one newline
                     const diff =
                        walkState.state.plainText.length - trimmed.length
                     let removed = 0
                     for (
                        let i = walkState.state.fragments.length - 1;
                        i >= 0 && removed < diff;
                        i--
                     ) {
                        const frag = walkState.state.fragments[i]
                        if (frag && frag.text) {
                           const fragLen = frag.text.length
                           const toRemove = Math.min(fragLen, diff - removed)
                           frag.text = frag.text.slice(0, fragLen - toRemove)
                           removed += toRemove
                           if (!frag.text) {
                              walkState.state.fragments.pop()
                           }
                        }
                     }
                     walkState.state.plainText = trimmed
                     // Add back exactly one newline so inline elements appear on new line
                     const newlineStyle = { ...nextStyle }
                     delete newlineStyle.fragmentBackgroundColor
                     appendText(walkState.state, '\n', newlineStyle)
                  }
               }
            }
         }

         if (tag === 'ul' || tag === 'ol') {
            const listItem: ListStackItem = {
               type: tag as 'ul' | 'ol',
               index: tag === 'ol' ? 1 : 0,
            }
            // Always ensure list containers start on a new line when there's existing content
            // Check for actual non-whitespace content, not just any text
            const hasContent =
               walkState.state.plainText &&
               walkState.state.plainText.trim().length > 0
            if (hasContent) {
               // Trim any trailing whitespace and ensure we end with a newline
               const trimmed = walkState.state.plainText.trimEnd()
               if (trimmed.length < walkState.state.plainText.length) {
                  const diff = walkState.state.plainText.length - trimmed.length
                  let removed = 0
                  for (
                     let i = walkState.state.fragments.length - 1;
                     i >= 0 && removed < diff;
                     i--
                  ) {
                     const frag = walkState.state.fragments[i]
                     if (frag && frag.text) {
                        const fragLen = frag.text.length
                        const toRemove = Math.min(fragLen, diff - removed)
                        frag.text = frag.text.slice(0, fragLen - toRemove)
                        removed += toRemove
                        if (!frag.text) {
                           walkState.state.fragments.pop()
                        }
                     }
                  }
                  walkState.state.plainText = trimmed
               }
               if (!walkState.state.plainText.endsWith('\n')) {
                  const newlineStyle = { ...nextStyle }
                  delete newlineStyle.fragmentBackgroundColor
                  appendText(walkState.state, '\n', newlineStyle)
               }
               // Add extra spacing for non-zero margins
               if (
                  !suppressNewlines &&
                  walkState.state.plainText.endsWith('\n')
               ) {
                  const newlineStyle = { ...nextStyle }
                  delete newlineStyle.fragmentBackgroundColor
                  appendText(walkState.state, '\n', newlineStyle)
               }
            }
            walkState.listStack.push(listItem)
            this.walkNodes(
               node.children,
               { style: nextStyle, preformatted },
               walkState
            )
            walkState.listStack.pop()
            // Always ensure list containers end with a newline for proper block structure
            if (!walkState.state.plainText.endsWith('\n')) {
               const newlineStyle = { ...nextStyle }
               delete newlineStyle.fragmentBackgroundColor
               appendText(walkState.state, '\n', newlineStyle)
            }
            // Add extra spacing for non-zero margins
            if (!suppressNewlines && walkState.state.plainText.endsWith('\n')) {
               const newlineStyle = { ...nextStyle }
               delete newlineStyle.fragmentBackgroundColor
               appendText(walkState.state, '\n', newlineStyle)
            }
            continue
         }

         if (tag === 'li') {
            const activeList =
               walkState.listStack[walkState.listStack.length - 1]
            // Always ensure list items start on a new line when there's existing content
            // Check for actual non-whitespace content, not just any text
            const hasContent =
               walkState.state.plainText &&
               walkState.state.plainText.trim().length > 0
            if (hasContent) {
               // Trim any trailing whitespace and ensure we end with a newline
               const trimmed = walkState.state.plainText.trimEnd()
               if (trimmed.length < walkState.state.plainText.length) {
                  const diff = walkState.state.plainText.length - trimmed.length
                  let removed = 0
                  for (
                     let i = walkState.state.fragments.length - 1;
                     i >= 0 && removed < diff;
                     i--
                  ) {
                     const frag = walkState.state.fragments[i]
                     if (frag && frag.text) {
                        const fragLen = frag.text.length
                        const toRemove = Math.min(fragLen, diff - removed)
                        frag.text = frag.text.slice(0, fragLen - toRemove)
                        removed += toRemove
                        if (!frag.text) {
                           walkState.state.fragments.pop()
                        }
                     }
                  }
                  walkState.state.plainText = trimmed
               }
               if (!walkState.state.plainText.endsWith('\n')) {
                  const newlineStyle = { ...nextStyle }
                  delete newlineStyle.fragmentBackgroundColor
                  appendText(walkState.state, '\n', newlineStyle)
               }
               // Add extra spacing for non-zero margins
               if (
                  !suppressNewlines &&
                  walkState.state.plainText.endsWith('\n')
               ) {
                  const newlineStyle = { ...nextStyle }
                  delete newlineStyle.fragmentBackgroundColor
                  appendText(walkState.state, '\n', newlineStyle)
               }
            }
            if (activeList) {
               const bullet =
                  activeList.type === 'ol' ? `${activeList.index}. ` : '• '
               appendText(walkState.state, bullet, nextStyle)
               activeList.index += 1
            } else {
               appendText(walkState.state, '• ', nextStyle)
            }
            this.walkNodes(
               node.children,
               { style: nextStyle, preformatted },
               walkState
            )
            // Always ensure list items end with a newline for proper block structure
            if (!walkState.state.plainText.endsWith('\n')) {
               const newlineStyle = { ...nextStyle }
               delete newlineStyle.fragmentBackgroundColor
               appendText(walkState.state, '\n', newlineStyle)
            }
            // Add extra spacing for non-zero margins
            if (!suppressNewlines && walkState.state.plainText.endsWith('\n')) {
               const newlineStyle = { ...nextStyle }
               delete newlineStyle.fragmentBackgroundColor
               appendText(walkState.state, '\n', newlineStyle)
            }
            continue
         }

         // Handle spacing BEFORE block elements (margin-top)
         if (isBlock) {
            // Always ensure block elements start on a new line when there's existing content
            // Check for actual non-whitespace content, not just any text
            const hasContent =
               walkState.state.plainText &&
               walkState.state.plainText.trim().length > 0
            if (hasContent) {
               // Trim any trailing whitespace and ensure we end with a newline
               // This handles the case where whitespace text nodes between blocks
               // might have collapsed newlines to spaces
               const trimmed = walkState.state.plainText.trimEnd()
               if (trimmed.length < walkState.state.plainText.length) {
                  // Remove trailing whitespace from fragments
                  const diff = walkState.state.plainText.length - trimmed.length
                  let removed = 0
                  for (
                     let i = walkState.state.fragments.length - 1;
                     i >= 0 && removed < diff;
                     i--
                  ) {
                     const frag = walkState.state.fragments[i]
                     if (frag && frag.text) {
                        const fragLen = frag.text.length
                        const toRemove = Math.min(fragLen, diff - removed)
                        frag.text = frag.text.slice(0, fragLen - toRemove)
                        removed += toRemove
                        if (!frag.text) {
                           walkState.state.fragments.pop()
                        }
                     }
                  }
                  walkState.state.plainText = trimmed
               }
               // Ensure we end with a newline (blocks always maintain structure)
               if (!walkState.state.plainText.endsWith('\n')) {
                  const newlineStyle = { ...nextStyle }
                  delete newlineStyle.fragmentBackgroundColor
                  appendText(walkState.state, '\n', newlineStyle)
               }
               // Add margin-top spacing for all block elements (unless suppressed)
               // Default margin-top: add extra newline for spacing
               if (!suppressNewlines) {
                  const newlineStyle = { ...nextStyle }
                  delete newlineStyle.fragmentBackgroundColor
                  appendText(walkState.state, '\n', newlineStyle)
               }
            }
         }

         // Track content before processing children to detect empty blocks
         const contentBefore = walkState.state.plainText.trim().length
         this.walkNodes(
            node.children,
            { style: styleForChildren, preformatted },
            walkState
         )
         const contentAfter = walkState.state.plainText.trim().length
         const hasContent = contentAfter > contentBefore

         // Handle spacing AFTER block elements (margin-bottom)
         if (isBlock) {
            // Only add spacing if the block element actually produced content
            // This prevents empty fragments with background colors for nested empty divs
            if (hasContent) {
               // Always ensure block elements end with a newline for proper block structure
               if (!walkState.state.plainText.endsWith('\n')) {
                  // Use nextStyle but without background color to preserve alignment
                  const newlineStyle = { ...nextStyle }
                  delete newlineStyle.fragmentBackgroundColor
                  appendText(walkState.state, '\n', newlineStyle)
               }
               // Add margin-bottom spacing for all block elements (unless suppressed)
               // Default margin-bottom: add extra newline for spacing
               if (
                  !suppressNewlines &&
                  walkState.state.plainText.endsWith('\n')
               ) {
                  const newlineStyle = { ...nextStyle }
                  delete newlineStyle.fragmentBackgroundColor
                  appendText(walkState.state, '\n', newlineStyle)
               }
            }
         }
      }
   }

   /**
    * Strips style nodes and extracts CSS content.
    */
   private static stripStyleNodes(node: ElementNode, styles: string[]) {
      const filtered: Node[] = []
      const childrenLength = node.children.length
      for (let i = 0; i < childrenLength; i++) {
         const child = node.children[i]
         if (!child) continue
         if (child.type === 'element') {
            if (child.tag === 'style') {
               const cssText = this.extractNodeText(child)
               if (cssText.trim()) {
                  styles.push(cssText)
               }
               continue
            }
            this.stripStyleNodes(child, styles)
         }
         filtered.push(child)
      }
      node.children = filtered
   }

   /**
    * Extracts text content from a node tree.
    */
   private static extractNodeText(node: Node): string {
      if (node.type === 'text') {
         return node.content
      }
      const parts: string[] = []
      const childrenLength = node.children.length
      for (let i = 0; i < childrenLength; i++) {
         const child = node.children[i]
         if (child) {
            parts.push(this.extractNodeText(child))
         }
      }
      return parts.join('')
   }

   /**
    * Parses HTML into a tree structure with optimized regex matching.
    */
   private static parseHtmlTree(html: string): ElementNode {
      const root: ElementNode = {
         type: 'element',
         tag: '#root',
         attrs: {},
         children: [],
      }
      const stack: ElementNode[] = [root]
      const sanitized = html.replace(/<!DOCTYPE[\s\S]*?>/gi, '')
      const lower = sanitized.toLowerCase()
      const tagRegex = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>/g
      let lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = tagRegex.exec(sanitized))) {
         const index = match.index
         if (index > lastIndex) {
            const text = sanitized.slice(lastIndex, index)
            if (text) {
               const parent = stack[stack.length - 1]
               parent?.children.push({
                  type: 'text',
                  content: text,
               })
            }
         }

         const token = match[0]
         lastIndex = tagRegex.lastIndex

         if (token.startsWith('<!--') || token.startsWith('<![CDATA[')) {
            continue
         }

         const closing = token.startsWith('</')
         const selfClosing = token.endsWith('/>')
         const tagMatch = token.match(/^<\/?([a-zA-Z0-9:-]+)([\s\S]*?)>?$/)
         if (!tagMatch) {
            continue
         }

         const [, rawTag = '', rawAttr = ''] = tagMatch
         const tagName = rawTag.toLowerCase()
         const attrChunk = rawAttr || ''

         if (closing) {
            this.popUntilTag(stack, tagName)
            continue
         }

         const attrs = this.parseAttributes(attrChunk)
         const element: ElementNode = {
            type: 'element',
            tag: tagName,
            attrs,
            children: [],
         }
         stack[stack.length - 1]?.children.push(element)

         if (tagName === 'script' || tagName === 'style') {
            const lowerTag = `</${tagName}`
            const closeIndex = lower.indexOf(lowerTag, tagRegex.lastIndex)
            if (closeIndex !== -1) {
               const closeEnd = sanitized.indexOf('>', closeIndex)
               const inner = sanitized.slice(tagRegex.lastIndex, closeIndex)
               if (inner) {
                  element.children.push({ type: 'text', content: inner })
               }
               tagRegex.lastIndex =
                  closeEnd === -1 ? sanitized.length : closeEnd + 1
               lastIndex = tagRegex.lastIndex
            } else {
               const inner = sanitized.slice(tagRegex.lastIndex)
               if (inner) {
                  element.children.push({ type: 'text', content: inner })
               }
               tagRegex.lastIndex = sanitized.length
               lastIndex = tagRegex.lastIndex
            }
            continue
         }

         if (!selfClosing && !VOID_TAGS.has(tagName)) {
            stack.push(element)
         }
      }

      if (lastIndex < sanitized.length) {
         const trailing = sanitized.slice(lastIndex)
         if (trailing) {
            stack[stack.length - 1]?.children.push({
               type: 'text',
               content: trailing,
            })
         }
      }

      return root
   }

   /**
    * Pops from stack until matching tag is found.
    */
   private static popUntilTag(stack: ElementNode[], tag: string) {
      while (stack.length > 1) {
         const current = stack.pop()
         if (!current) break
         if (current.tag === tag) {
            break
         }
      }
   }

   /**
    * Parses HTML attributes efficiently.
    */
   private static parseAttributes(chunk: string): Record<string, string> {
      const attrs: Record<string, string> = {}
      const attrRegex =
         /([\w:-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'`=<>]+)))?/g
      let attrMatch: RegExpExecArray | null
      while ((attrMatch = attrRegex.exec(chunk)) !== null) {
         const name = (attrMatch[1] ?? '').toLowerCase()
         const value = attrMatch[3] ?? attrMatch[4] ?? attrMatch[5] ?? ''
         attrs[name] = value
      }
      return attrs
   }

   /**
    * Returns semantic styles for HTML tags.
    */
   private static semanticStyleForTag(
      tag: string
   ): Partial<Fragment> | undefined {
      switch (tag) {
         case 'strong':
         case 'b':
            return { fontWeight: 'bold' }
         case 'em':
         case 'i':
            return { fontStyle: 'italic' }
         case 'u':
            return { textDecorationLine: 'underline' }
         case 's':
         case 'del':
         case 'strike':
            return { textDecorationLine: 'line-through' }
         case 'mark':
            return { fragmentBackgroundColor: '#fff9c4' }
         case 'code':
         case 'pre':
            return {}
         default:
            if (HEADING_SIZES[tag]) {
               return { fontSize: HEADING_SIZES[tag], fontWeight: 'bold' }
            }
            return undefined
      }
   }
}
