package com.nitrotext

import android.graphics.Color
import android.graphics.Typeface
import android.text.Spannable
import android.text.SpannableStringBuilder
import android.text.TextUtils
import android.text.style.AbsoluteSizeSpan
import android.text.style.BackgroundColorSpan
import android.text.style.ClickableSpan
import android.text.style.ForegroundColorSpan
import android.text.style.StrikethroughSpan
import android.text.style.StyleSpan
import android.text.style.TypefaceSpan
import android.text.style.UnderlineSpan
import android.view.Gravity
import android.text.method.ArrowKeyMovementMethod
import android.text.method.LinkMovementMethod
import androidx.appcompat.widget.AppCompatTextView
import com.facebook.react.uimanager.PixelUtil
import com.margelo.nitro.nitrotext.*
import androidx.core.graphics.toColorInt
import com.nitrotext.renderers.NitroHtmlRenderer
import com.nitrotext.spans.NitroLineHeightSpan

class NitroTextImpl(private val view: AppCompatTextView) {
  // Stored props
  private var fragments: Array<Fragment>? = null
  private var text: String? = null
  private var renderer: NitroRenderer = NitroRenderer.PLAINTEXT
  private var richTextStyleRules: Array<RichTextStyleRule>? = null

  private var selectable: Boolean? = null
  private var selectionColor: String? = null
  private var numberOfLines: Double? = null
  private var ellipsizeMode: EllipsizeMode? = null
  private var allowFontScaling: Boolean = true
  private var maxFontSizeMultiplier: Double? = null

  // Top-level styling (applied when using simple text)
  private var fontSize: Double? = null
  private var fontWeight: FontWeight? = null
  private var fontColor: String? = null
  private var fontStyle: FontStyle? = null
  private var fontFamily: String? = null
  private var letterSpacing: Double? = null
  private var lineHeight: Double? = null
  private var textAlign: TextAlign? = null
  private var textTransform: TextTransform? = null
  private var textDecorationLine: TextDecorationLine? = null
  private var textDecorationColor: String? = null
  private var textDecorationStyle: TextDecorationStyle? = null

  private var fragmentBackgroundColor: String? = null

  fun commit() {
    // Reset typography to avoid stale values from recycled views
    view.setLineSpacing(0f, 1f)
    view.letterSpacing = 0f
    applySelectable()
    applySelectionColor()
    applyLinesAndEllipsize()
    applyAlignment()

    val frags = fragments
    val content = text
    
    if (renderer == NitroRenderer.HTML && !content.isNullOrEmpty()) {
      applyHtml(content)
    } else if (!frags.isNullOrEmpty()) {
      applyFragments(frags)
    } else {
      applySimpleText()
    }

    applyLetterSpacing()
  }

  // Setters
  fun setFragments(value: Array<Fragment>?) { fragments = value }
  fun setText(value: String?) { text = value }
  fun setRenderer(value: NitroRenderer?) { renderer = value ?: NitroRenderer.PLAINTEXT }
  fun setRichTextStyleRules(value: Array<RichTextStyleRule>?) { richTextStyleRules = value }

  fun setSelectable(value: Boolean?) { selectable = value }
  fun setSelectionColor(value: String?) { selectionColor = value }
  fun setNumberOfLines(value: Double?) { numberOfLines = value }
  fun setEllipsizeMode(value: EllipsizeMode?) { ellipsizeMode = value }
  fun setAllowFontScaling(value: Boolean?) { allowFontScaling = value ?: true }
  fun setMaxFontSizeMultiplier(value: Double?) { maxFontSizeMultiplier = value }

  fun setFontSize(value: Double?) { fontSize = value }
  fun setFontWeight(value: FontWeight?) { fontWeight = value }
  fun setFontColor(value: String?) { fontColor = value }
  fun setFontStyle(value: FontStyle?) { fontStyle = value }
  fun setFontFamily(value: String?) { fontFamily = value }
  fun setLetterSpacing(value: Double?) { letterSpacing = value }
  fun setLineHeight(value: Double?) { lineHeight = value }
  fun setTextAlign(value: TextAlign?) { textAlign = value }
  fun setTextTransform(value: TextTransform?) { textTransform = value }
  fun setTextDecorationLine(value: TextDecorationLine?) { textDecorationLine = value }
  fun setTextDecorationColor(value: String?) { textDecorationColor = value }
  fun setTextDecorationStyle(value: TextDecorationStyle?) { textDecorationStyle = value }

  fun setFragmentBackgroundColor(value: String?) {
    fragmentBackgroundColor = value
  }

  // Apply helpers
  private fun applySelectable() {
    selectable?.let { view.setTextIsSelectable(it) }
  }

  private fun applySelectionColor() {
    selectionColor?.let { colorString ->
      parseColorSafe(colorString)?.let { view.highlightColor = it }
    }
  }

  private fun applyLinesAndEllipsize() {
    val lines = numberOfLines?.toInt() ?: Int.MAX_VALUE
    view.maxLines = if (lines <= 0) Int.MAX_VALUE else lines
    view.isSingleLine = (lines == 1)
  
    view.ellipsize = when (ellipsizeMode) {
      EllipsizeMode.HEAD   -> TextUtils.TruncateAt.START
      EllipsizeMode.MIDDLE -> TextUtils.TruncateAt.MIDDLE
      EllipsizeMode.TAIL   -> TextUtils.TruncateAt.END
      EllipsizeMode.CLIP   -> null
      else -> TextUtils.TruncateAt.END
    }
  }

  private fun applyLetterSpacing() {
    letterSpacing?.let { spacingPx ->
      val spacingPxFloat = if (allowFontScaling) {
        PixelUtil.toPixelFromSP(spacingPx.toFloat(), maxFontScale())
      } else {
        PixelUtil.toPixelFromDIP(spacingPx.toFloat())
      }
      val textSizePx = view.textSize
      if (textSizePx > 0f) {
        val em = spacingPxFloat / textSizePx
        view.letterSpacing = em
      }
    }
  }

  private fun applyAlignment() {
    val verticalCenter = Gravity.CENTER_VERTICAL
    view.gravity = when (textAlign) {
      TextAlign.LEFT -> Gravity.START or verticalCenter
      TextAlign.RIGHT -> Gravity.END or verticalCenter
      TextAlign.CENTER -> Gravity.CENTER_HORIZONTAL or verticalCenter
      TextAlign.JUSTIFY, TextAlign.AUTO, null -> Gravity.START or verticalCenter
    }
  }

  private fun applySimpleText() {
    val content = transformText(text, textTransform)
    val lineHeightPx = resolveLineHeight(lineHeight)
    if (content != null) {
      val spansRequired = textDecorationLine != null || lineHeightPx != null
      if (spansRequired) {
        val builder = SpannableStringBuilder(content)
        applyDecorationSpans(builder, 0, builder.length, textDecorationLine)
        lineHeightPx?.let { applyLineHeightSpan(builder, 0, builder.length, it) }
        view.text = builder
      } else {
        view.text = content
      }
    } else {
      view.text = ""
    }

    view.setTextColor(resolvedFontColor())
    fontSize?.let {
      if (allowFontScaling) {
        view.setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, it.toFloat())
      } else {
        val px = PixelUtil.toPixelFromDIP(it.toFloat())
        view.setTextSize(android.util.TypedValue.COMPLEX_UNIT_PX, px)
      }
    }

    val style = combineStyle(fontWeight, fontStyle)
    if (style != Typeface.NORMAL) view.setTypeface(view.typeface, style)
  }

  private fun applyFragments(fragments: Array<Fragment>) {
    val builder = SpannableStringBuilder()
    val containerLineHeightPx = resolveLineHeight(lineHeight)
    var start: Int
    for (frag in fragments) {
      val fragText = transformText(frag.text, frag.textTransform) ?: ""
      start = builder.length
      builder.append(fragText)
      val end = builder.length
      if (start == end) continue

      frag.fontColor?.let { parseColorSafe(it)?.let { c ->
        builder.setSpan(ForegroundColorSpan(c), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
      }}
      frag.fragmentBackgroundColor?.let { parseColorSafe(it)?.let { c ->
        builder.setSpan(BackgroundColorSpan(c), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
      }}
      // Font Size in SP
      frag.fontSize?.let { sz ->
        builder.setSpan(AbsoluteSizeSpan(sz.toInt(), true), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
      }
      // Font Weight/Style
      val style = combineStyle(frag.fontWeight, frag.fontStyle)
      if (style != Typeface.NORMAL) {
        builder.setSpan(StyleSpan(style), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
      }
      // Font Family
      frag.fontFamily?.let {
        builder.setSpan(TypefaceSpan(it), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
      }
      // Decorations
      applyDecorationSpans(builder, start, end, frag.textDecorationLine)
      frag.lineHeight?.let { lh ->
        resolveLineHeight(lh)?.let { applyLineHeightSpan(builder, start, end, it) }
      }
    }
    containerLineHeightPx?.let { applyLineHeightSpan(builder, 0, builder.length, it) }
    view.text = builder
    
    // Apply default text color for runs without explicit color
    view.setTextColor(resolvedFontColor())
  }

  private fun applyDecorationSpans(builder: SpannableStringBuilder, start: Int, end: Int, line: TextDecorationLine?) {
    when (line) {
      TextDecorationLine.UNDERLINE -> builder.setSpan(UnderlineSpan(), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
      TextDecorationLine.LINE_THROUGH -> builder.setSpan(StrikethroughSpan(), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
      TextDecorationLine.UNDERLINE_LINE_THROUGH -> {
        builder.setSpan(UnderlineSpan(), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
        builder.setSpan(StrikethroughSpan(), start, end, Spannable.SPAN_EXCLUSIVE_EXCLUSIVE)
      }
      else -> Unit
    }
  }

  private fun combineStyle(weight: FontWeight?, style: FontStyle?): Int {
    val isBold = when (weight) {
      FontWeight.BOLD, FontWeight.SEMIBOLD, FontWeight.HEAVY, FontWeight.BLACK, FontWeight.CONDENSEDBOLD -> true
      else -> false
    }
    val isItalic = when (style) {
      FontStyle.ITALIC, FontStyle.OBLIQUE -> true
      else -> false
    }
    return when {
      isBold && isItalic -> Typeface.BOLD_ITALIC
      isBold -> Typeface.BOLD
      isItalic -> Typeface.ITALIC
      else -> Typeface.NORMAL
    }
  }

  private fun transformText(text: String?, transform: TextTransform?): String? {
    if (text == null) return null
    return when (transform) {
      TextTransform.UPPERCASE -> text.uppercase()
      TextTransform.LOWERCASE -> text.lowercase()
      TextTransform.CAPITALIZE -> text.split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.uppercase() } }
      else -> text
    }
  }

  private fun parseColorSafe(str: String): Int? = try {
      str.toColorInt()
  } catch (_: Throwable) { null }

  private fun resolvedFontColor(): Int {
    val parsed = fontColor?.let { parseColorSafe(it) }
    return parsed ?: Color.BLACK
  }

  private fun baseRichTextStyle(): RichTextStyle {
    return RichTextStyle(
      fontColor = fontColor,
      fragmentBackgroundColor = fragmentBackgroundColor,
      fontSize = fontSize,
      fontWeight = fontWeight,
      fontStyle = fontStyle,
      fontFamily = fontFamily,
      lineHeight = lineHeight,
      letterSpacing = letterSpacing,
      textAlign = textAlign,
      textTransform = textTransform,
      textDecorationLine = textDecorationLine,
      textDecorationColor = textDecorationColor,
      textDecorationStyle = textDecorationStyle,
      marginTop = null,
      marginBottom = null,
      marginLeft = null,
      marginRight = null,
    )
  }

  private fun applyHtml(html: String) {
    val renderer = NitroHtmlRenderer(
      context = view.context,
      defaultTextSizePx = view.textSize,
      allowFontScaling = allowFontScaling,
      maxFontSizeMultiplier = maxFontSizeMultiplier,
    )
    val spannable = renderer.render(html, baseRichTextStyle(), richTextStyleRules)
    trimTrailingNewlines(spannable)
    view.text = spannable
    val hasLinks = spannable.getSpans(0, spannable.length, ClickableSpan::class.java).isNotEmpty()
    view.linksClickable = hasLinks
    val isSelectable = selectable == true
    view.movementMethod = when {
      hasLinks && isSelectable -> LinkMovementMethod.getInstance()
      hasLinks -> HtmlLinkMovementMethod
      isSelectable -> ArrowKeyMovementMethod.getInstance()
      else -> null
    }
    view.setTextIsSelectable(isSelectable)
    view.setTextColor(resolvedFontColor())
  }

  private fun trimTrailingNewlines(builder: SpannableStringBuilder) {
    var length = builder.length
    while (length > 0 && builder[length - 1] == '\n') {
      builder.delete(length - 1, length)
      length = builder.length
    }
  }

  private fun resolveLineHeight(value: Double?): Float? {
    val raw = value ?: return null
    val px = if (allowFontScaling) {
      PixelUtil.toPixelFromSP(raw.toFloat(), maxFontScale())
    } else {
      PixelUtil.toPixelFromDIP(raw.toFloat())
    }
    return px.takeIf { it > 0f }
  }

  private fun maxFontScale(): Float {
    val multiplier = maxFontSizeMultiplier
    return if (multiplier != null && multiplier >= 1.0) multiplier.toFloat() else Float.NaN
  }

  private fun applyLineHeightSpan(
    builder: SpannableStringBuilder,
    start: Int,
    end: Int,
    lineHeightPx: Float
  ) {
    if (start >= end) return
    val flags = if (start == 0) {
      Spannable.SPAN_INCLUSIVE_INCLUSIVE
    } else {
      Spannable.SPAN_EXCLUSIVE_INCLUSIVE
    }
    builder.setSpan(NitroLineHeightSpan(lineHeightPx), start, end, flags)
  }
}
