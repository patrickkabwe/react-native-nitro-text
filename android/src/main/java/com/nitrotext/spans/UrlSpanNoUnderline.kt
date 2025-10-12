package com.nitrotext.spans

import android.text.TextPaint
import android.text.style.URLSpan

internal class UrlSpanNoUnderline(url: String) : URLSpan(url) {
    override fun updateDrawState(ds: TextPaint) {
        super.updateDrawState(ds)
        ds.isUnderlineText = false
    }
}
