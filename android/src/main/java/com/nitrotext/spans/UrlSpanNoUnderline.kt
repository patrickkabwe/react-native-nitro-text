package com.nitrotext.spans

import android.text.TextPaint
import android.text.style.URLSpan

internal class UrlSpanNoUnderline(url: String) : URLSpan(url) {
    override fun updateDrawState(ds: TextPaint) {
        // Don't call super.updateDrawState() to avoid default link color
        // This allows custom colors from ForegroundColorSpan to be applied
        ds.isUnderlineText = false
    }
}
