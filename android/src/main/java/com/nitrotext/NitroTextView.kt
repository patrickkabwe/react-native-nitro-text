package com.nitrotext

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Rect
import android.graphics.text.LineBreaker
import android.text.Layout
import android.text.TextPaint
import android.view.View
import androidx.appcompat.widget.AppCompatTextView
import com.facebook.react.views.view.ReactViewGroup
import com.margelo.nitro.nitrotext.TextLayout
import com.margelo.nitro.nitrotext.TextLayoutEvent


interface NitroTextViewDelegate {
   fun onNitroTextLayout(event: TextLayoutEvent)
}

@SuppressLint("ViewConstructor")
class NitroTextView(ctx: Context) : ReactViewGroup(ctx) {
   val textView = AppCompatTextView(ctx).apply {
      includeFontPadding = false
      minWidth = 0; minHeight = 0
      breakStrategy = LineBreaker.BREAK_STRATEGY_HIGH_QUALITY
      hyphenationFrequency = Layout.HYPHENATION_FREQUENCY_NORMAL
      setHorizontallyScrolling(false)
   }

   var nitroTextDelegate: NitroTextViewDelegate? = null
      set(value) {
         field = value
         scheduleTextLayoutDispatch()
      }

   private var pendingLayoutDispatch = false

   init {
      // Fill the container; borders/radius are applied to this container by RN.
      addView(
         textView,
         LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.MATCH_PARENT
         )
      )
   }

   override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
      val childLeft   = paddingLeft
      val childTop    = paddingTop
      val childRight  = measuredWidth  - paddingRight
      val childBottom = measuredHeight - paddingBottom
      textView.layout(childLeft, childTop, childRight, childBottom)
      scheduleTextLayoutDispatch()
   }

   // Block adding of any other children to this container (we only have a single TextView)
   override fun addView(child: View?, index: Int) {
      if (child === textView) super.addView(child, index)
   }

   override fun addView(child: View?, index: Int, params: LayoutParams?) {
      if (child === textView) super.addView(child, index, params)
   }

   private fun scheduleTextLayoutDispatch() {
      val delegate = nitroTextDelegate ?: return
      if (pendingLayoutDispatch) return
      pendingLayoutDispatch = true
      textView.post {
         pendingLayoutDispatch = false
         val event = buildTextLayoutEvent()
         if (event != null) {
            delegate.onNitroTextLayout(event)
         } else if (nitroTextDelegate != null) {
            scheduleTextLayoutDispatch()
         }
      }
   }

   private fun buildTextLayoutEvent(): TextLayoutEvent? {
      val layout = textView.layout ?: return null
      val content = textView.text ?: return TextLayoutEvent(emptyArray<TextLayout>())
      if (content.isEmpty()) return TextLayoutEvent(emptyArray<TextLayout>())

      val density = resources.displayMetrics.density

      val paintCopy = TextPaint(textView.paint).apply { textSize *= 100f }
      val capBounds = Rect()
      paintCopy.getTextBounds("T", 0, 1, capBounds)
      val capHeight = capBounds.height() / 100f / density

      val xBounds = Rect()
      paintCopy.getTextBounds("x", 0, 1, xBounds)
      val xHeight = xBounds.height() / 100f / density

      val totalLines = layout.lineCount
      val leftOffset = textView.left + textView.totalPaddingLeft
      val topOffset = textView.top + textView.totalPaddingTop
      val lines = Array(totalLines) { lineIndex ->
         val start = layout.getLineStart(lineIndex)
         val end = layout.getLineEnd(lineIndex)
         val lineText = content.subSequence(start, end).toString()

         val endsWithNewline = end > start && content[end - 1] == '\n'
         val widthPx = if (endsWithNewline) layout.getLineMax(lineIndex) else layout.getLineWidth(lineIndex)
         val lineLeft = layout.getLineLeft(lineIndex)
         val lineTop = layout.getLineTop(lineIndex)
         val lineBottom = layout.getLineBottom(lineIndex)

         val x = (leftOffset + lineLeft) / density
         val y = (topOffset + lineTop) / density
         val height = (lineBottom - lineTop) / density
         val descender = layout.getLineDescent(lineIndex) / density
         val ascender = -layout.getLineAscent(lineIndex) / density

         TextLayout(
            text = lineText,
            x = x.toDouble(),
            y = y.toDouble(),
            width = (widthPx / density).toDouble(),
            height = height.toDouble(),
            descender = descender.toDouble(),
            capHeight = capHeight.toDouble(),
            ascender = ascender.toDouble(),
            xHeight = xHeight.toDouble()
         )
      }

      return TextLayoutEvent(lines)
   }
}
