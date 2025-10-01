package com.nitrotext.spans

import android.graphics.Canvas
import android.graphics.Paint
import android.text.style.LeadingMarginSpan

internal class NumberedListSpan(
    private val number: Int,
    private val leadingMargin: Int,
    private val gapWidth: Int
) : LeadingMarginSpan.LeadingMarginSpan2 {

    override fun getLeadingMargin(first: Boolean): Int = leadingMargin

    override fun getLeadingMarginLineCount(): Int = 1

    override fun drawLeadingMargin(
        canvas: Canvas,
        paint: Paint,
        x: Int,
        dir: Int,
        top: Int,
        baseline: Int,
        bottom: Int,
        text: CharSequence,
        start: Int,
        end: Int,
        first: Boolean,
        layout: android.text.Layout?
    ) {
        if (!first || number <= 0) return
        val label = "$number."
        val previousStyle = paint.style
        paint.style = Paint.Style.FILL

        val textStart = x + dir * leadingMargin
        val labelWidth = paint.measureText(label)
        val gap = gapWidth.toFloat()
        val labelX = if (dir > 0) {
            textStart - gap - labelWidth
        } else {
            textStart + gap
        }

        canvas.drawText(label, labelX, baseline.toFloat(), paint)

        paint.style = previousStyle
    }
}
