package com.nitrotext.spans

import android.graphics.Paint
import android.text.style.LineHeightSpan
import kotlin.math.roundToInt

internal class VerticalMarginSpan(
    private val top: Float,
    private val bottom: Float
) : LineHeightSpan {
    override fun chooseHeight(
        text: CharSequence?,
        start: Int,
        end: Int,
        spanstartv: Int,
        v: Int,
        fm: Paint.FontMetricsInt?
    ) {
        fm ?: return
        val addTop = top.roundToInt()
        val addBottom = bottom.roundToInt()
        if (addTop != 0) {
            fm.top -= addTop
            fm.ascent -= addTop
        }
        if (addBottom != 0) {
            fm.bottom += addBottom
            fm.descent += addBottom
        }
    }
}
