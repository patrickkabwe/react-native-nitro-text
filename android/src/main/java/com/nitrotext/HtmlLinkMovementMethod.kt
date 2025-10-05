package com.nitrotext

import android.text.Selection
import android.text.Spannable
import android.text.method.MovementMethod
import android.text.style.ClickableSpan
import android.view.MotionEvent
import android.widget.TextView

internal object HtmlLinkMovementMethod : MovementMethod {
  override fun initialize(widget: TextView?, text: Spannable?) = Unit
  override fun onKeyDown(widget: TextView?, text: Spannable?, keyCode: Int, event: android.view.KeyEvent?) = false
  override fun onKeyUp(widget: TextView?, text: Spannable?, keyCode: Int, event: android.view.KeyEvent?) = false
  override fun onKeyOther(widget: TextView?, text: Spannable?, event: android.view.KeyEvent?) = false
  override fun onTrackballEvent(widget: TextView?, text: Spannable?, event: MotionEvent?) = false
  override fun onTakeFocus(widget: TextView?, text: Spannable?, direction: Int) = Unit
  override fun canSelectArbitrarily() = false
  override fun onGenericMotionEvent(widget: TextView?, text: Spannable?, event: MotionEvent?) = false

  override fun onTouchEvent(widget: TextView, buffer: Spannable, event: MotionEvent): Boolean {
    val action = event.action

    if (action != MotionEvent.ACTION_UP && action != MotionEvent.ACTION_DOWN) {
      return false
    }

    val layout = widget.layout ?: return false
    val x = event.x.toInt() - widget.totalPaddingLeft + widget.scrollX
    val y = event.y.toInt() - widget.totalPaddingTop + widget.scrollY

    val line = layout.getLineForVertical(y)
    val offset = layout.getOffsetForHorizontal(line, x.toFloat())

    val links = buffer.getSpans(offset, offset, ClickableSpan::class.java)
    if (links.isNotEmpty()) {
      val link = links[0]
      if (action == MotionEvent.ACTION_UP) {
        link.onClick(widget)
      } else {
        Selection.setSelection(buffer, buffer.getSpanStart(link), buffer.getSpanEnd(link))
      }
      return true
    }

    return false
  }
}
