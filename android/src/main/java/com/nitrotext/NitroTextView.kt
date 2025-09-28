package com.nitrotext

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.text.LineBreaker
import android.text.Layout
import android.view.View
import androidx.appcompat.widget.AppCompatTextView
import com.facebook.react.views.view.ReactViewGroup

@SuppressLint("ViewConstructor")
class NitroTextView(ctx: Context) : ReactViewGroup(ctx){
   val textView = AppCompatTextView(ctx).apply {
      includeFontPadding = false
      minWidth = 0; minHeight = 0
      breakStrategy = LineBreaker.BREAK_STRATEGY_HIGH_QUALITY
      hyphenationFrequency = Layout.HYPHENATION_FREQUENCY_NORMAL
      setHorizontallyScrolling(false)
   }

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
   }

   // Block adding of any other children to this container (we only have a single TextView)
   override fun addView(child: View?, index: Int) {
      if (child === textView) super.addView(child, index)
   }

   override fun addView(child: View?, index: Int, params: LayoutParams?) {
      if (child === textView) super.addView(child, index, params)
   }
}
