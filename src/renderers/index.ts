import type { Fragment, Renderer } from '../types'
import type { RenderResult } from './types'
import { HTMLRenderer } from './html'
import {
   appendText,
   createState,
   finalizeState,
   trimTrailingNewlines,
} from './utils'

export function renderStringChildren(
   input: string,
   renderer: Renderer,
   baseFragment: Partial<Fragment> = {}
): RenderResult {
   const text = input ?? ''
   switch (renderer) {
      case 'html':
         return HTMLRenderer.render(text, baseFragment)
      case 'plaintext':
      default:
         return renderPlain(text, baseFragment)
   }
}

function renderPlain(text: string, base: Partial<Fragment>): RenderResult {
   const state = createState()
   appendText(state, text, base)
   trimTrailingNewlines(state)
   return finalizeState(state)
}

export { HTMLRenderer } from './html'
export { CSSProcessor } from './css-processor'
export type { RenderResult, Stylesheet, AppliedStyle } from './types'
