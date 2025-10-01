package com.nitrotext.spans

import android.graphics.Paint
import android.text.style.LineHeightSpan
import kotlin.math.ceil
import kotlin.math.floor

/**
 * Matches React Native's CustomLineHeightSpan so lineHeight behaves the same as <Text>.
 */
internal class NitroLineHeightSpan(heightPx: Float) : LineHeightSpan {
    private val lineHeight: Int = ceil(heightPx.toDouble()).toInt()

    override fun chooseHeight(
        text: CharSequence,
        start: Int,
        end: Int,
        spanstartv: Int,
        v: Int,
        fm: Paint.FontMetricsInt
    ) {
        val leading = lineHeight - ((-fm.ascent) + fm.descent)
        val halfLeading = leading / 2f
        fm.ascent -= ceil(halfLeading.toDouble()).toInt()
        fm.descent += floor(halfLeading.toDouble()).toInt()
        if (start == 0) fm.top = fm.ascent
        if (end == text.length) fm.bottom = fm.descent
    }
}
