import { FRAGMENT_STYLE_KEYS, HTML_ENTITY_MAP } from '../constants'
import type { Fragment } from '../types'
import type { AppendState, RenderResult } from './types'

export function createState(): AppendState {
   return {
      fragments: [],
      plainText: '',
   }
}

export function finalizeState(state: AppendState): RenderResult {
   return {
      fragments: state.fragments,
      text: state.plainText,
   }
}

export function appendText(
   state: AppendState,
   text: string,
   style: Partial<Fragment>
) {
   if (!text) return
   state.plainText += text
   const last = state.fragments[state.fragments.length - 1]
   if (last && fragmentsShareStyle(last, style)) {
      last.text = (last.text || '') + text
      return
   }
   state.fragments.push({ ...style, text })
}

export function fragmentsShareStyle(
   fragment: Fragment,
   style: Partial<Fragment>
): boolean {
   for (const key of FRAGMENT_STYLE_KEYS) {
      if (fragment[key] !== style[key]) {
         return false
      }
   }
   return true
}

export function mergeStyles(
   base: Partial<Fragment>,
   override?: Partial<Fragment>
): Partial<Fragment> {
   if (!override || !Object.keys(override).length) {
      return base
   }
   if (!base || !Object.keys(base).length) {
      return { ...override }
   }
   return { ...base, ...override }
}

export function trimTrailingNewlines(state: AppendState) {
   while (state.plainText.endsWith('\n')) {
      state.plainText = state.plainText.slice(0, -1)
      removeTrailingChar(state.fragments, '\n')
   }
}

export function trimTrailingWhitespace(state: AppendState) {
   const trimmed = state.plainText.trimEnd()
   if (trimmed.length < state.plainText.length) {
      const diff = state.plainText.length - trimmed.length
      let removed = 0
      for (let i = state.fragments.length - 1; i >= 0 && removed < diff; i--) {
         const frag = state.fragments[i]
         if (!frag) continue
         if (!frag.text) {
            state.fragments.pop()
            continue
         }
         const fragLen = frag.text.length
         const toRemove = Math.min(fragLen, diff - removed)
         frag.text = frag.text.slice(0, fragLen - toRemove)
         removed += toRemove
         if (!frag.text) {
            state.fragments.pop()
         }
      }
      state.plainText = trimmed
   }
}

function removeTrailingChar(fragments: Fragment[], char: string) {
   while (fragments.length) {
      const last = fragments[fragments.length - 1]
      if (!last) {
         break
      }
      if (!last.text) {
         fragments.pop()
         continue
      }
      if (last.text.endsWith(char)) {
         last.text = last.text.slice(0, -char.length)
         if (!last.text.length) {
            fragments.pop()
            continue
         }
      }
      break
   }
}

export function trimLeadingWhitespace(state: AppendState) {
   const trimmed = state.plainText.trimStart()
   if (trimmed.length < state.plainText.length) {
      const diff = state.plainText.length - trimmed.length
      let removed = 0
      while (state.fragments.length && removed < diff) {
         const first = state.fragments[0]
         if (!first) {
            break
         }
         if (!first.text) {
            state.fragments.shift()
            continue
         }
         const fragLen = first.text.length
         const toRemove = Math.min(fragLen, diff - removed)
         first.text = first.text.slice(toRemove)
         removed += toRemove
         if (!first.text) {
            state.fragments.shift()
         }
      }
      state.plainText = trimmed
   }
}

export function decodeEntities(text: string): string {
   if (!text || text.indexOf('&') === -1) return text
   return text.replace(
      /&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g,
      (_, entity: string) => {
         if (entity.startsWith('#x') || entity.startsWith('#X')) {
            const code = parseInt(entity.slice(2), 16)
            if (!Number.isNaN(code)) return String.fromCodePoint(code)
         } else if (entity.startsWith('#')) {
            const code = parseInt(entity.slice(1), 10)
            if (!Number.isNaN(code)) return String.fromCodePoint(code)
         } else if (HTML_ENTITY_MAP[entity]) {
            return HTML_ENTITY_MAP[entity]
         }
         return '&' + entity + ';'
      }
   )
}

export function collapseWhitespace(text: string): string {
   return text.replace(/\s+/g, ' ')
}

export function parseNumeric(value: string): number | undefined {
   if (!value) return undefined
   const numeric = parseFloat(value)
   return Number.isFinite(numeric) ? numeric : undefined
}

export function isZeroMargin(value: string): boolean {
   const trimmed = value.trim()
   if (trimmed === '0') return true
   const numeric = parseFloat(trimmed)
   return Number.isFinite(numeric) && numeric === 0
}

export function stripQuotes(value: string) {
   if (!value) return value
   let result = value.trim().replace(/^['"]+|['"]+$/g, '')
   result = result.replace(/["']/g, '')
   return result
}
