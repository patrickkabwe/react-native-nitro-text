package com.nitrotext.renderers

import android.text.SpannableStringBuilder
import com.margelo.nitro.nitrotext.RichTextStyle
import com.margelo.nitro.nitrotext.RichTextStyleRule

interface NitroRendererInterface {
  fun render(input: String, baseStyle: RichTextStyle?, rules: Array<RichTextStyleRule>?): SpannableStringBuilder
}