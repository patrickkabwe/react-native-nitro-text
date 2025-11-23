import type { Fragment } from '../types'

export type RenderResult = {
   fragments: Fragment[]
   text: string
}

export type AppendState = {
   fragments: Fragment[]
   plainText: string
}

export type ElementNode = {
   type: 'element'
   tag: string
   attrs: Record<string, string>
   children: Node[]
}

export type TextNode = {
   type: 'text'
   content: string
}

export type Node = ElementNode | TextNode

export type Stylesheet = {
   tag: Map<string, Array<Record<string, string>>>
   className: Map<string, Array<Record<string, string>>>
   id: Map<string, Array<Record<string, string>>>
}

export type AppliedStyle = {
   fragment?: Partial<Fragment>
   hidden: boolean
   suppressNewlines: boolean
}

export type WalkContext = {
   style: Partial<Fragment>
   preformatted: boolean
}

export type ListStackItem = {
   type: 'ul' | 'ol'
   index: number
}

export type WalkState = {
   stylesheet: Stylesheet
   state: AppendState
   listStack: ListStackItem[]
}
