package com.nitrotext.spans

import android.text.TextPaint
import android.text.style.MetricAffectingSpan

internal class LetterSpacingSpan(private val em: Float) : MetricAffectingSpan() {
    override fun updateDrawState(tp: TextPaint) {
        tp.letterSpacing = em
    }

    override fun updateMeasureState(tp: TextPaint) {
        tp.letterSpacing = em
    }
}