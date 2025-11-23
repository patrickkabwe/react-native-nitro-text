package com.nitrotext

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Rect
import android.graphics.text.LineBreaker
import android.text.Layout
import android.text.StaticLayout
import android.text.TextPaint
import android.text.TextUtils
import android.view.ActionMode
import android.view.Menu
import android.view.MenuItem as AndroidMenuItem
import android.view.View
import androidx.appcompat.widget.AppCompatTextView
import com.facebook.react.views.view.ReactViewGroup
import com.margelo.nitro.nitrotext.TextLayout
import com.margelo.nitro.nitrotext.TextLayoutEvent
import com.margelo.nitro.nitrotext.MenuItem


interface NitroTextViewDelegate {
   fun onNitroTextLayout(event: TextLayoutEvent)
}

@SuppressLint("ViewConstructor")
class NitroTextView(ctx: Context) : ReactViewGroup(ctx) {
   val textView = AppCompatTextView(ctx).apply {
      includeFontPadding = true
      minWidth = 0; minHeight = 0
      breakStrategy = LineBreaker.BREAK_STRATEGY_HIGH_QUALITY
      hyphenationFrequency = Layout.HYPHENATION_FREQUENCY_NORMAL
      setHorizontallyScrolling(false)
      // Disable scrolling - container should size based on content
      isVerticalScrollBarEnabled = false
      isHorizontalScrollBarEnabled = false
      movementMethod = null // Prevent scrolling via movement method
      // Ensure TextView can expand to show all content
   }

   var nitroTextDelegate: NitroTextViewDelegate? = null
      set(value) {
         field = value
         scheduleTextLayoutDispatch()
      }
   
   var customMenus: Array<MenuItem>? = null
      set(value) {
         field = value
         updateActionModeCallback()
      }

   private var pendingLayoutDispatch = false
   
   private fun updateActionModeCallback() {
      textView.customSelectionActionModeCallback = customMenus?.takeIf { it.isNotEmpty() }
         ?.let { createCustomActionModeCallback(it) }
   }
   
   private fun createCustomActionModeCallback(menus: Array<MenuItem>): ActionMode.Callback {
      val menuItemMap = menus.mapIndexedNotNull { index, item ->
         if (item.title.isNotEmpty()) { Menu.FIRST + index to item } else null
      }.toMap()
      
      return object : ActionMode.Callback {
         override fun onCreateActionMode(mode: ActionMode?, menu: Menu?): Boolean {
            menuItemMap.forEach { (id, item) ->
               menu?.add(Menu.NONE, id, Menu.NONE, item.title)
            }
            return true
         }
         
         override fun onPrepareActionMode(mode: ActionMode?, menu: Menu?) = true
         
         override fun onActionItemClicked(mode: ActionMode?, item: AndroidMenuItem?): Boolean {
            menuItemMap[item?.itemId]?.let {
               it.action.invoke()
               mode?.finish()
               return true
            }
            return false
         }
         
         override fun onDestroyActionMode(mode: ActionMode?) {}
      }
   }

   init {
      // Fill the container; borders/radius are applied to this container by RN.
      // TextView should wrap content height, but match parent width
      addView(
         textView,
         LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.WRAP_CONTENT
         )
      )
   }

   override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
      // Measure the TextView first to get its desired size
      val width = MeasureSpec.getSize(widthMeasureSpec)
      val availableWidth = (width - paddingLeft - paddingRight).coerceAtLeast(0)
      
      if (availableWidth <= 0) {
         // No width available, return minimum size
         setMeasuredDimension(width, 0)
         return
      }
      
      val widthSpec = MeasureSpec.makeMeasureSpec(availableWidth, MeasureSpec.EXACTLY)
      
      // Measure TextView with a very large height to ensure layout is fully calculated
      // This allows TextView to calculate its complete layout including all spans
      // Using a large AT_MOST constraint ensures TextView measures all content
      val largeHeightSpec = MeasureSpec.makeMeasureSpec(Int.MAX_VALUE shr 2, MeasureSpec.AT_MOST)
      textView.measure(widthSpec, largeHeightSpec)
      
      // Try to get the layout from TextView - this is the most accurate
      var textViewHeight = textView.measuredHeight
      val layout = textView.layout
      
      if (layout != null && layout.lineCount > 0) {
         // Use layout height which accurately accounts for all spans
         // getLineBottom returns the bottom of the line including all spacing from spans
         val lastLineBottom = layout.getLineBottom(layout.lineCount - 1)
         val paddingTop = textView.totalPaddingTop
         val paddingBottom = textView.totalPaddingBottom
         textViewHeight = lastLineBottom + paddingTop + paddingBottom
      } else {
         // Layout not available yet - TextView's measuredHeight should account for spans
         // when measured with a large height constraint
         // However, if measuredHeight seems too small, try calculating with StaticLayout
         val text = textView.text
         if (text != null && text.isNotEmpty() && textView.measuredHeight < 100) {
            // Measured height seems suspiciously small, try StaticLayout as fallback
            // Note: StaticLayout won't account for custom spans, but gives a baseline
            val paint = TextPaint(textView.paint)
            val alignment = when (textView.textAlignment) {
               View.TEXT_ALIGNMENT_CENTER -> Layout.Alignment.ALIGN_CENTER
               View.TEXT_ALIGNMENT_TEXT_END, View.TEXT_ALIGNMENT_VIEW_END -> Layout.Alignment.ALIGN_OPPOSITE
               else -> Layout.Alignment.ALIGN_NORMAL
            }
            
            val staticLayout = StaticLayout.Builder
               .obtain(text, 0, text.length, paint, availableWidth)
               .setAlignment(alignment)
               .setLineSpacing(textView.lineSpacingExtra, textView.lineSpacingMultiplier)
               .setIncludePad(textView.includeFontPadding)
               .setBreakStrategy(textView.breakStrategy)
               .setHyphenationFrequency(textView.hyphenationFrequency)
               .setMaxLines(Int.MAX_VALUE)
               .build()
            
            if (staticLayout.lineCount > 0) {
               val staticHeight = staticLayout.getLineBottom(staticLayout.lineCount - 1) + 
                                 textView.totalPaddingTop + 
                                 textView.totalPaddingBottom
               // Use the larger of measured height or static layout height
               // Measured height should account for spans, static layout gives baseline
               textViewHeight = textViewHeight.coerceAtLeast(staticHeight)
            }
         }
         // Otherwise trust TextView's measuredHeight which should be accurate when measured with large height
      }
      
      // Container height should wrap content (TextView's content height + container padding)
      val totalHeight = textViewHeight + paddingTop + paddingBottom
      val height = MeasureSpec.getSize(heightMeasureSpec)
      val finalHeight = when (MeasureSpec.getMode(heightMeasureSpec)) {
         MeasureSpec.UNSPECIFIED -> totalHeight
         MeasureSpec.AT_MOST -> {
            // Report the actual content height we need
            // If it's larger than the constraint, we still report it so container can expand
            totalHeight
         }
         MeasureSpec.EXACTLY -> {
            // For EXACTLY, we must use at least the content height
            // If constraint is smaller, we still need to report our actual height
            height.coerceAtLeast(totalHeight)
         }
         else -> totalHeight
      }
      
      setMeasuredDimension(width, finalHeight)
   }

   override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
      val childLeft   = paddingLeft
      val childTop    = paddingTop
      val childRight  = measuredWidth  - paddingRight
      
      // Calculate TextView height from layout if available
      val layout = textView.layout
      val textViewHeight = if (layout != null && layout.lineCount > 0) {
         val lastLineBottom = layout.getLineBottom(layout.lineCount - 1)
         val paddingTop = textView.totalPaddingTop
         val paddingBottom = textView.totalPaddingBottom
         lastLineBottom + paddingTop + paddingBottom
      } else {
         textView.measuredHeight
      }
      
      val childBottom = childTop + textViewHeight
      textView.layout(childLeft, childTop, childRight, childBottom)
      
      // After layout, verify the TextView's layout height matches our container height
      // If layout shows more content, request a remeasure to expand container
      if (layout != null && layout.lineCount > 0) {
         val actualLayoutHeight = layout.getLineBottom(layout.lineCount - 1) + 
                                 textView.totalPaddingTop + 
                                 textView.totalPaddingBottom
         val containerContentHeight = measuredHeight - paddingTop - paddingBottom
         
         // Check if content is being cut off
         // Use a larger tolerance (5px) to account for rounding and span calculations
         if (actualLayoutHeight > containerContentHeight + 5) {
            // Layout shows more content than container, request remeasure
            // This will trigger onMeasure again with the correct height
            // Use post to avoid layout during layout
            post {
               // Force a full remeasure by invalidating the measurement cache
               forceLayout()
               requestLayout()
            }
         }
      } else if (layout == null && textView.text != null && textView.text.isNotEmpty()) {
         // Layout not calculated yet but text exists - request remeasure
         // This can happen if text was set but layout wasn't calculated
         post {
            forceLayout()
            requestLayout()
         }
      }
      
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
