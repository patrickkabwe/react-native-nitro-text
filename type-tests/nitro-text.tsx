import React from 'react'

import { NitroText } from '../src'
// @ts-expect-error Renderer was removed with HTML rendering support.
import type { Renderer } from '../src'

const plainTextElement: React.ReactElement = <NitroText>Plain text</NitroText>

const htmlElement: React.ReactElement = (
   // @ts-expect-error HTML rendering is intentionally unsupported.
   <NitroText renderer="html">HTML text</NitroText>
)

const plaintextElement: React.ReactElement = (
   // @ts-expect-error The renderer prop was removed entirely.
   <NitroText renderer="plaintext">Plain text</NitroText>
)

declare const removedRenderer: Renderer

void plainTextElement
void htmlElement
void plaintextElement
void removedRenderer
