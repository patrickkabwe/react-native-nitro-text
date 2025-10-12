package com.nitrotext.renderers

import android.content.Context
import android.graphics.Typeface
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.AbsoluteSizeSpan
import android.text.style.BackgroundColorSpan
import android.text.style.ForegroundColorSpan
import android.text.style.StrikethroughSpan
import android.text.style.StyleSpan
import android.text.style.TypefaceSpan
import android.text.style.UnderlineSpan
import com.facebook.react.uimanager.PixelUtil
import com.margelo.nitro.nitrotext.FontStyle
import com.margelo.nitro.nitrotext.FontWeight
import com.margelo.nitro.nitrotext.RichTextStyle
import com.margelo.nitro.nitrotext.RichTextStyleRule
import com.margelo.nitro.nitrotext.TextAlign
import com.margelo.nitro.nitrotext.TextDecorationLine
import com.margelo.nitro.nitrotext.TextDecorationStyle
import com.margelo.nitro.nitrotext.TextTransform
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
import org.jsoup.nodes.Node
import org.jsoup.nodes.TextNode
import java.util.Locale
import androidx.core.graphics.toColorInt
import com.nitrotext.spans.BulletListSpan
import com.nitrotext.spans.LetterSpacingSpan
import com.nitrotext.spans.NitroLineHeightSpan
import com.nitrotext.spans.NumberedListSpan
import com.nitrotext.spans.UrlSpanNoUnderline
import com.nitrotext.spans.VerticalMarginSpan

/**
 * Converts HTML markup to a SpannableStringBuilder while applying Nitro rich text styles.
 */
class NitroHtmlRenderer(
  private val context: Context,
  private val defaultTextSizePx: Float,
  private val allowFontScaling: Boolean,
  private val maxFontSizeMultiplier: Double?
) : NitroRendererInterface {

  private val listLeadingMarginPx = PixelUtil.toPixelFromDIP(24f).toInt()
  private val listGapPx = PixelUtil.toPixelFromDIP(8f).toInt()
  private val bulletRadiusPx = PixelUtil.toPixelFromDIP(3f)

  override fun render(
    input: String,
    baseStyle: RichTextStyle?,
    rules: Array<RichTextStyleRule>?
  ): SpannableStringBuilder {
    val builder = SpannableStringBuilder()
    val document = Jsoup.parse(input)
    val ruleMap = buildRuleMap(rules)

    val stateStack = ArrayDeque<StyleState>()
    stateStack.addLast(StyleState(baseStyle ?: EMPTY_STYLE, preserveWhitespace = false))

    val blockStack = ArrayDeque<BlockContext>()
    val blockRanges = mutableListOf<BlockRange>()
    val listStack = ArrayDeque<ListContext>()

    traverse(document.body(), builder, stateStack, blockStack, blockRanges, listStack, ruleMap)

    applyBlockMargins(builder, blockRanges)
    trimTrailingWhitespace(builder)
    return builder
  }

  private fun traverse(
    node: Node,
    builder: SpannableStringBuilder,
    stateStack: ArrayDeque<StyleState>,
    blockStack: ArrayDeque<BlockContext>,
    blockRanges: MutableList<BlockRange>,
    listStack: ArrayDeque<ListContext>,
    ruleMap: Map<String, RichTextStyle>
  ) {
    when (node) {
      is TextNode -> appendText(node, builder, stateStack.last())
      is Element -> handleElement(node, builder, stateStack, blockStack, blockRanges, listStack, ruleMap)
    }
  }

  private fun appendText(textNode: TextNode, builder: SpannableStringBuilder, state: StyleState) {
    val raw = if (state.preserveWhitespace) textNode.wholeText else textNode.text()
    if (!state.preserveWhitespace && raw.isBlank()) return
    if (raw.isEmpty()) return

    val content = applyTextTransform(raw, state.style.textTransform)
    if (!state.preserveWhitespace && content.isBlank()) return
    if (content.isEmpty()) return

    val start = builder.length
    builder.append(content)
    val end = builder.length

    val style = state.style

    style.fontColor?.let { parseColorSafe(it)?.let { c ->
      builder.setSpan(ForegroundColorSpan(c), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    } }

    style.fragmentBackgroundColor?.let { parseColorSafe(it)?.let { c ->
      builder.setSpan(BackgroundColorSpan(c), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    } }

    style.fontSize?.let { size ->
      builder.setSpan(AbsoluteSizeSpan(size.toInt(), true), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    }

    when (style.fontWeight) {
      FontWeight.BOLD, FontWeight.SEMIBOLD, FontWeight.HEAVY, FontWeight.BLACK ->
        builder.setSpan(StyleSpan(Typeface.BOLD), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
      FontWeight.ULTRALIGHT,
      FontWeight.THIN,
      FontWeight.LIGHT,
      FontWeight.MEDIUM,
      FontWeight.REGULAR,
      FontWeight.CONDENSED,
      FontWeight.CONDENSEDBOLD,
      FontWeight.NORMAL,
      null -> Unit
    }

    when (style.fontStyle) {
      FontStyle.ITALIC, FontStyle.OBLIQUE -> builder.setSpan(StyleSpan(Typeface.ITALIC), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
      FontStyle.NORMAL, null -> Unit
    }

    style.fontFamily?.let {
      builder.setSpan(TypefaceSpan(it), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    }

    when (style.textDecorationLine) {
      TextDecorationLine.UNDERLINE -> builder.setSpan(UnderlineSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
      TextDecorationLine.LINE_THROUGH -> builder.setSpan(StrikethroughSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
      TextDecorationLine.UNDERLINE_LINE_THROUGH -> {
        builder.setSpan(UnderlineSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
        builder.setSpan(StrikethroughSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
      }
      TextDecorationLine.NONE, null -> Unit
    }

    style.lineHeight?.let { value ->
      val px = resolveLineHeight(value)
      if (px > 0f) builder.setSpan(NitroLineHeightSpan(px), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    }

    style.letterSpacing?.let { spacing ->
      val em = resolveLetterSpacing(spacing)
      if (em != 0f) builder.setSpan(LetterSpacingSpan(em), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    }

    state.linkHref?.let { url ->
      builder.setSpan(UrlSpanNoUnderline(url), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
    }
  }

  private fun handleElement(
    element: Element,
    builder: SpannableStringBuilder,
    stateStack: ArrayDeque<StyleState>,
    blockStack: ArrayDeque<BlockContext>,
    blockRanges: MutableList<BlockRange>,
    listStack: ArrayDeque<ListContext>,
    ruleMap: Map<String, RichTextStyle>
  ) {
    val tag = element.normalName().lowercase(Locale.US)

    if (tag == "br") {
      builder.append('\n')
      return
    }

    val current = stateStack.last()
    val ruleStyle = ruleMap[tag]
    val tagStyle = defaultStyleForTag(tag)
    val merged = mergeStyles(current.style, tagStyle)
    val finalStyle = mergeStyles(merged, ruleStyle)
    val linkHref = when (tag) {
      "a" -> element.attr("href").takeIf { it.isNotEmpty() } ?: current.linkHref
      else -> current.linkHref
    }

    val preserveWhitespace = current.preserveWhitespace || tag == "pre"

    val isListContainer = tag == "ul" || tag == "ol"
    if (isListContainer) {
      listStack.addLast(ListContext(if (tag == "ol") ListType.ORDERED else ListType.UNORDERED))
    }

    val listContextForItem = if (tag == "li") listStack.lastOrNull() else null
    val listMarkerIndex = if (listContextForItem?.type == ListType.ORDERED) {
      listContextForItem.nextIndex()
    } else null

    val isBlock = tag in BLOCK_TAGS || tag == "li"
    val blockStartIndex = if (isBlock) beginBlock(builder) else -1
    val blockContext = if (isBlock) {
      val top = finalStyle.marginTop?.let { toPx(it) } ?: 0f
      val bottom = finalStyle.marginBottom?.let { toPx(it) } ?: 0f
      BlockContext(blockStartIndex, top, bottom)
    } else null

    blockContext?.let { blockStack.addLast(it) }

    val childState = StyleState(finalStyle, linkHref, preserveWhitespace)
    stateStack.addLast(childState)

    val children = element.childNodes()
    for (child in children) {
      traverse(child, builder, stateStack, blockStack, blockRanges, listStack, ruleMap)
    }

    stateStack.removeLast()

    var blockEnd = -1
    if (isBlock) {
      val ctx = blockStack.removeLast()
      blockEnd = endBlock(builder)
      if (blockEnd > ctx.start) {
        blockRanges.add(BlockRange(ctx.start, blockEnd, ctx.topMarginPx, ctx.bottomMarginPx))
      }
    }

    if (tag == "li" && blockStartIndex >= 0 && blockEnd > blockStartIndex) {
      applyListSpan(
        builder = builder,
        start = blockStartIndex,
        end = blockEnd,
        listType = listContextForItem?.type,
        listIndex = listMarkerIndex,
        depth = listStack.size
      )
    }

    if (isListContainer && listStack.isNotEmpty()) {
      listStack.removeLast()
    }
  }

  private fun beginBlock(builder: SpannableStringBuilder): Int {
    ensureTrailingNewline(builder)
    return builder.length
  }

  private fun endBlock(builder: SpannableStringBuilder): Int {
    val end = builder.length
    ensureTrailingNewline(builder)
    return end
  }

  private fun ensureTrailingNewline(builder: SpannableStringBuilder) {
    val length = builder.length
    if (length == 0) return
    var index = length - 1
    while (index >= 0 && builder[index] == ' ') index--
    if (index >= 0 && builder[index] != '\n') {
      builder.append('\n')
    }
  }

  private fun applyBlockMargins(builder: SpannableStringBuilder, ranges: List<BlockRange>) {
    for (range in ranges) {
      if (range.end <= range.start) continue
      if (range.topMarginPx <= 0f && range.bottomMarginPx <= 0f) continue
      builder.setSpan(
        VerticalMarginSpan(range.topMarginPx, range.bottomMarginPx),
        range.start,
        range.end,
        Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
      )
    }
  }

  private fun trimTrailingWhitespace(builder: SpannableStringBuilder) {
    var end = builder.length
    while (end > 0) {
      val ch = builder[end - 1]
      if (ch == '\n' || ch == ' ') {
        end -= 1
      } else {
        break
      }
    }
    if (end < builder.length) {
      builder.delete(end, builder.length)
    }
  }

  private fun applyListSpan(
    builder: SpannableStringBuilder,
    start: Int,
    end: Int,
    listType: ListType?,
    listIndex: Int?,
    depth: Int
  ) {
    if (listType == null || start >= end) return
    val effectiveDepth = depth.coerceAtLeast(1)
    val leadingMargin = listLeadingMarginPx * effectiveDepth
    val span = when (listType) {
      ListType.UNORDERED -> BulletListSpan(leadingMargin, listGapPx, bulletRadiusPx)
      ListType.ORDERED -> NumberedListSpan(listIndex ?: 0, leadingMargin, listGapPx)
    }
    builder.setSpan(span, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
  }

  private fun mergeStyles(base: RichTextStyle, override: RichTextStyle?): RichTextStyle {
    if (override == null) return base
    return createStyle(
      fontColor = override.fontColor ?: base.fontColor,
      fragmentBackgroundColor = override.fragmentBackgroundColor ?: base.fragmentBackgroundColor,
      fontSize = override.fontSize ?: base.fontSize,
      fontWeight = override.fontWeight ?: base.fontWeight,
      fontStyle = override.fontStyle ?: base.fontStyle,
      fontFamily = override.fontFamily ?: base.fontFamily,
      lineHeight = override.lineHeight ?: base.lineHeight,
      letterSpacing = override.letterSpacing ?: base.letterSpacing,
      textAlign = override.textAlign ?: base.textAlign,
      textTransform = override.textTransform ?: base.textTransform,
      textDecorationLine = mergeDecorations(base.textDecorationLine, override.textDecorationLine),
      textDecorationColor = override.textDecorationColor ?: base.textDecorationColor,
      textDecorationStyle = override.textDecorationStyle ?: base.textDecorationStyle,
      marginTop = override.marginTop ?: base.marginTop,
      marginBottom = override.marginBottom ?: base.marginBottom,
      marginLeft = override.marginLeft ?: base.marginLeft,
      marginRight = override.marginRight ?: base.marginRight,
    )
  }

  private fun mergeDecorations(a: TextDecorationLine?, b: TextDecorationLine?): TextDecorationLine? {
    if (b == null) return a
    if (a == null) return b
    if (a == b) return a
    val underline = a == TextDecorationLine.UNDERLINE || a == TextDecorationLine.UNDERLINE_LINE_THROUGH ||
      b == TextDecorationLine.UNDERLINE || b == TextDecorationLine.UNDERLINE_LINE_THROUGH
    val strike = a == TextDecorationLine.LINE_THROUGH || a == TextDecorationLine.UNDERLINE_LINE_THROUGH ||
      b == TextDecorationLine.LINE_THROUGH || b == TextDecorationLine.UNDERLINE_LINE_THROUGH
    return when {
      underline && strike -> TextDecorationLine.UNDERLINE_LINE_THROUGH
      underline -> TextDecorationLine.UNDERLINE
      strike -> TextDecorationLine.LINE_THROUGH
      else -> TextDecorationLine.NONE
    }
  }

  private fun defaultStyleForTag(tag: String): RichTextStyle? = when (tag) {
    "strong", "b" -> createStyle(fontWeight = FontWeight.BOLD)
    "em", "i" -> createStyle(fontStyle = FontStyle.ITALIC)
    "u" -> createStyle(textDecorationLine = TextDecorationLine.UNDERLINE, textDecorationStyle = TextDecorationStyle.SOLID)
    "s", "strike", "del" -> createStyle(textDecorationLine = TextDecorationLine.LINE_THROUGH, textDecorationStyle = TextDecorationStyle.SOLID)
    "code", "pre" -> createStyle(fontFamily = "monospace")
    else -> null
  }

  private fun buildRuleMap(rules: Array<RichTextStyleRule>?): Map<String, RichTextStyle> {
    if (rules == null || rules.isEmpty()) return emptyMap()
    val map = HashMap<String, RichTextStyle>(rules.size)
    for (rule in rules) {
      map[rule.selector.lowercase(Locale.US)] = rule.style
    }
    return map
  }

  private fun resolveLineHeight(value: Double): Float {
    return if (allowFontScaling) {
      PixelUtil.toPixelFromSP(value.toFloat(), maxFontSizeMultiplier?.toFloat() ?: Float.NaN)
    } else {
      PixelUtil.toPixelFromDIP(value.toFloat())
    }
  }

  private fun resolveLetterSpacing(value: Double): Float {
    val px = if (allowFontScaling) {
      PixelUtil.toPixelFromSP(value.toFloat(), maxFontSizeMultiplier?.toFloat() ?: Float.NaN)
    } else {
      PixelUtil.toPixelFromDIP(value.toFloat())
    }
    return if (defaultTextSizePx == 0f) 0f else px / defaultTextSizePx
  }

  private fun applyTextTransform(text: String, transform: TextTransform?): String {
    return when (transform) {
      TextTransform.UPPERCASE -> text.uppercase()
      TextTransform.LOWERCASE -> text.lowercase()
      TextTransform.CAPITALIZE -> text.split(' ').joinToString(" ") { part ->
        if (part.isEmpty()) part else part.replaceFirstChar { ch -> ch.titlecase() }
      }
      TextTransform.NONE, null -> text
    }
  }

  private fun parseColorSafe(value: String): Int? = try {
      value.toColorInt()
  } catch (_: Exception) {
    null
  }

  private fun toPx(value: Double): Float {
    return PixelUtil.toPixelFromDIP(value.toFloat())
  }

  private enum class ListType { ORDERED, UNORDERED }

  private class ListContext(val type: ListType) {
    private var next = 1
    fun nextIndex(): Int {
      val current = next
      next += 1
      return current
    }
  }

  private data class StyleState(
    val style: RichTextStyle,
    val linkHref: String? = null,
    val preserveWhitespace: Boolean = false,
  )

  private data class BlockContext(
    val start: Int,
    val topMarginPx: Float,
    val bottomMarginPx: Float,
  )

  private data class BlockRange(
    val start: Int,
    val end: Int,
    val topMarginPx: Float,
    val bottomMarginPx: Float,
  )

  companion object {
    private val BLOCK_TAGS = setOf(
      "p", "div", "section", "article", "header", "footer", "aside",
      "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre"
    )
    private val EMPTY_STYLE = createStyle()

    private fun createStyle(
      fontColor: String? = null,
      fragmentBackgroundColor: String? = null,
      fontSize: Double? = null,
      fontWeight: FontWeight? = null,
      fontStyle: FontStyle? = null,
      fontFamily: String? = null,
      lineHeight: Double? = null,
      letterSpacing: Double? = null,
      textAlign: TextAlign? = null,
      textTransform: TextTransform? = null,
      textDecorationLine: TextDecorationLine? = null,
      textDecorationColor: String? = null,
      textDecorationStyle: TextDecorationStyle? = null,
      marginTop: Double? = null,
      marginBottom: Double? = null,
      marginLeft: Double? = null,
      marginRight: Double? = null,
    ): RichTextStyle {
      return RichTextStyle(
        fontColor,
        fragmentBackgroundColor,
        fontSize,
        fontWeight,
        fontStyle,
        fontFamily,
        lineHeight,
        letterSpacing,
        textAlign,
        textTransform,
        textDecorationLine,
        textDecorationColor,
        textDecorationStyle,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
      )
    }
  }
}
