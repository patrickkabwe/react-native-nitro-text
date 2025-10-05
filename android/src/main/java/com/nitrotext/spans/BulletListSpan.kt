package com.nitrotext.spans

import android.graphics.Canvas
import android.graphics.Paint
import android.text.style.LeadingMarginSpan

internal class BulletListSpan(
    private val leadingMargin: Int,
    private val gapWidth: Int,
    private val radiusPx: Float
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
        if (!first || radiusPx <= 0f) return
        val previousStyle = paint.style
        val previousColor = paint.color
        paint.style = Paint.Style.FILL

        val gap = gapWidth.toFloat() / 2f
        val centerX = if (dir > 0) {
            x + radiusPx + gap
        } else {
            x - radiusPx - gap
        }
        val centerY = (top + bottom) / 2f
        canvas.drawCircle(centerX, centerY, radiusPx, paint)

        paint.style = previousStyle
        paint.color = previousColor
    }
}
