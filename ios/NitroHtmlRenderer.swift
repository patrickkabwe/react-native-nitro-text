import Foundation
import UIKit

final class NitroHtmlRenderer {
    private struct StyleState {
        var style: RichTextStyle
        var linkHref: String?
        var preserveWhitespace: Bool
    }

    private struct BlockContext {
        let start: Int
        let topMargin: CGFloat
        let bottomMargin: CGFloat
        let listType: ListType?
        let listIndex: Int?
        let listDepth: Int
    }

    private enum HtmlToken {
        case text(String)
        case startTag(HtmlTag)
        case endTag(String)
    }

    private struct HtmlTag {
        let name: String
        let attributes: [String: String]
        let isSelfClosing: Bool
    }

    private enum ListType { case ordered, unordered }

    private final class ListContext {
        let type: ListType
        private var counter: Int = 1

        init(type: ListType) { self.type = type }

        func nextIndex() -> Int {
            defer { counter += 1 }
            return counter
        }
    }

    private unowned let impl: NitroTextImpl
    private let bulletSymbol = "\u{2022}"

    init(impl: NitroTextImpl) {
        self.impl = impl
    }

    func render(
        html: String,
        baseStyle: RichTextStyle?,
        rules: [RichTextStyleRule]?,
        defaultColor: UIColor
    ) -> NSAttributedString {
        let builder = NSMutableAttributedString()
        guard !html.isEmpty else { return builder }

        let ruleMap = buildRuleMap(rules)
        let initial = normalizeStyle(baseStyle ?? createStyle())
        var stateStack: [StyleState] = [StyleState(style: initial, linkHref: nil, preserveWhitespace: false)]
        var blockStack: [BlockContext] = []
        var listStack: [ListContext] = []
        var elementStack: [HtmlTag] = []

        let tokens = tokenize(html)
        for token in tokens {
            switch token {
            case .text(let raw):
                guard let current = stateStack.last else { continue }
                appendText(raw, state: current, builder: builder, defaultColor: defaultColor)
            case .startTag(let tag):
                if tag.name == "br" {
                    builder.append(NSAttributedString(string: "\n"))
                    continue
                }

                guard let current = stateStack.last else { continue }

                let ruleStyle = ruleMap[tag.name]
                let tagStyle = defaultStyleForTag(tag.name)
                let merged = mergeStyles(base: current.style, override: tagStyle)
                let finalStyle = normalizeStyle(mergeStyles(base: merged, override: ruleStyle))
                let linkHref = tag.name == "a" ? extractHref(tag, fallback: current.linkHref) : current.linkHref
                let preserveWhitespace = current.preserveWhitespace || tag.name == "pre"

                let isListContainer = tag.name == "ul" || tag.name == "ol"
                if isListContainer {
                    let type: ListType = tag.name == "ol" ? .ordered : .unordered
                    listStack.append(ListContext(type: type))
                }

                let listContextForItem = tag.name == "li" ? listStack.last : nil
                let listIndex = listContextForItem?.type == .ordered ? listContextForItem?.nextIndex() : nil
                let isBlock = Self.blockTags.contains(tag.name) || tag.name == "li"
                var blockContext: BlockContext?
                if isBlock {
                    beginBlock(builder)
                    let topMargin = finalStyle.marginTop.map { CGFloat($0) } ?? 0
                    let bottomMargin = finalStyle.marginBottom.map { CGFloat($0) } ?? 0
                    blockContext = BlockContext(
                        start: builder.length,
                        topMargin: topMargin,
                        bottomMargin: bottomMargin,
                        listType: tag.name == "li" ? listContextForItem?.type : nil,
                        listIndex: listIndex,
                        listDepth: listStack.count
                    )
                    if let ctx = blockContext { blockStack.append(ctx) }
                }

                if tag.name == "li" {
                    if let listContext = listContextForItem {
                        appendListMarker(
                            type: listContext.type,
                            index: listIndex,
                            state: current,
                            builder: builder,
                            defaultColor: defaultColor
                        )
                    }
                }

                if !tag.isSelfClosing {
                    stateStack.append(StyleState(style: finalStyle, linkHref: linkHref, preserveWhitespace: preserveWhitespace))
                    elementStack.append(tag)
                } else {
                    if let ctx = blockContext {
                        endBlock(builder)
                        _ = blockStack.popLast()
                        applyBlockContext(ctx, builder: builder)
                    }
                }
            case .endTag(let name):
                guard !stateStack.isEmpty else { continue }
                if name == "a" {
                    // drop through to pop state
                }
                if let idx = elementStack.lastIndex(where: { $0.name == name }) {
                    let closing = elementStack.remove(at: idx)
                    while elementStack.count > idx {
                        _ = elementStack.removeLast()
                        if stateStack.count > 1 { stateStack.removeLast() }
                    }
                    if stateStack.count > 1 { stateStack.removeLast() }

                    if Self.blockTags.contains(closing.name) || closing.name == "li" {
                        endBlock(builder)
                        if let ctx = blockStack.popLast() {
                            applyBlockContext(ctx, builder: builder)
                        }
                    }

                    if closing.name == "ul" || closing.name == "ol" {
                        if !listStack.isEmpty { listStack.removeLast() }
                    }
                }
            }
        }

        trimTrailingWhitespace(builder)
        return builder
    }
}

private extension NitroHtmlRenderer {
    static let blockTags: Set<String> = [
        "p", "div", "section", "article", "header", "footer", "aside",
        "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre"
    ]

    private func appendText(
        _ rawText: String,
        state: StyleState,
        builder: NSMutableAttributedString,
        defaultColor: UIColor
    ) {
        let decoded = decodeEntities(rawText)
        let content = state.preserveWhitespace ? decoded : collapseWhitespace(decoded, builder: builder)
        if content.isEmpty { return }
        let transformed = applyTextTransform(content, transform: state.style.textTransform)
        guard !transformed.isEmpty else { return }
        var attrs = makeAttributes(for: state.style, linkHref: state.linkHref, defaultColor: defaultColor)
        builder.append(NSAttributedString(string: transformed, attributes: attrs))
    }

    func makeAttributes(
        for style: RichTextStyle,
        linkHref: String?,
        defaultColor: UIColor
    ) -> [NSAttributedString.Key: Any] {
        let fragment = Fragment(
            text: nil,
            selectionColor: nil,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            fontColor: style.fontColor,
            fragmentBackgroundColor: style.fragmentBackgroundColor,
            fontStyle: style.fontStyle,
            fontFamily: style.fontFamily,
            lineHeight: style.lineHeight,
            letterSpacing: style.letterSpacing,
            textAlign: style.textAlign,
            textTransform: style.textTransform,
            textDecorationLine: style.textDecorationLine,
            textDecorationColor: style.textDecorationColor,
            textDecorationStyle: style.textDecorationStyle
        )
        var attributes = impl.makeAttributes(for: fragment, defaultColor: defaultColor)
        if let existing = attributes[.paragraphStyle] as? NSParagraphStyle {
            let mutable = existing.mutableCopy() as! NSMutableParagraphStyle
            if let top = style.marginTop, top > 0 {
                mutable.paragraphSpacingBefore = CGFloat(top)
            }
            if let bottom = style.marginBottom, bottom > 0 {
                mutable.paragraphSpacing = CGFloat(bottom)
            }
            attributes[.paragraphStyle] = mutable.copy() as! NSParagraphStyle
        }
        if let href = linkHref, let url = URL(string: href) {
            attributes[.link] = url
        }
        return attributes
    }

    func collapseWhitespace(_ text: String, builder: NSMutableAttributedString) -> String {
        guard !text.isEmpty else { return text }
        var result = String()
        result.reserveCapacity(text.count)
        let whitespace = CharacterSet.whitespacesAndNewlines
        var lastWasWhitespace = builder.length == 0 ? true : endsWithWhitespace(builder)
        for scalar in text.unicodeScalars {
            if whitespace.contains(scalar) {
                if !lastWasWhitespace {
                    result.append(" ")
                    lastWasWhitespace = true
                }
            } else {
                result.append(Character(scalar))
                lastWasWhitespace = false
            }
        }
        return result
    }

    func endsWithWhitespace(_ builder: NSMutableAttributedString) -> Bool {
        guard builder.length > 0 else { return true }
        let lastIndex = builder.length - 1
        let char = (builder.string as NSString).character(at: lastIndex)
        if let scalar = UnicodeScalar(char) {
            return CharacterSet.whitespacesAndNewlines.contains(scalar)
        }
        return false
    }

    func applyTextTransform(_ text: String, transform: TextTransform?) -> String {
        guard let transform else { return text }
        switch transform {
        case .uppercase:
            return text.uppercased()
        case .lowercase:
            return text.lowercased()
        case .capitalize:
            return text.capitalized
        case .none:
            return text
        }
    }

    func beginBlock(_ builder: NSMutableAttributedString) {
        ensureTrailingNewline(builder)
    }

    func endBlock(_ builder: NSMutableAttributedString) {
        ensureTrailingNewline(builder)
    }

    func ensureTrailingNewline(_ builder: NSMutableAttributedString) {
        guard builder.length > 0 else { return }
        let ns = builder.string as NSString
        var index = builder.length - 1
        while index >= 0 && ns.character(at: index) == 32 {
            index -= 1
        }
        if index >= 0 {
            let char = ns.character(at: index)
            if char != 10 {
                builder.append(NSAttributedString(string: "\n"))
            }
        }
    }

    private func applyBlockContext(_ context: BlockContext, builder: NSMutableAttributedString) {
        guard builder.length > context.start else { return }
        let end = builder.length
        let range = NSRange(location: context.start, length: end - context.start)
        builder.enumerateAttribute(.paragraphStyle, in: range, options: []) { value, subrange, _ in
            let mutable: NSMutableParagraphStyle
            if let paragraph = value as? NSMutableParagraphStyle {
                mutable = paragraph
            } else if let paragraph = value as? NSParagraphStyle {
                mutable = paragraph.mutableCopy() as! NSMutableParagraphStyle
            } else {
                mutable = NSMutableParagraphStyle()
            }
            if context.topMargin > 0 {
                mutable.paragraphSpacingBefore = max(mutable.paragraphSpacingBefore, context.topMargin)
            }
            if context.bottomMargin > 0 {
                mutable.paragraphSpacing = max(mutable.paragraphSpacing, context.bottomMargin)
            }
            if context.listType != nil {
                let indent = CGFloat(context.listDepth) * 24.0
                mutable.headIndent = indent
                mutable.firstLineHeadIndent = 0
            }
            builder.addAttribute(.paragraphStyle, value: mutable.copy(), range: subrange)
        }
    }

    func trimTrailingWhitespace(_ builder: NSMutableAttributedString) {
        let ns = builder.string as NSString
        var index = ns.length - 1
        while index >= 0 {
            let char = ns.character(at: index)
            if let scalar = UnicodeScalar(char), CharacterSet.whitespacesAndNewlines.contains(scalar) {
                index -= 1
            } else {
                break
            }
        }
        let deleteLength = ns.length - (index + 1)
        if deleteLength > 0 {
            builder.deleteCharacters(in: NSRange(location: index + 1, length: deleteLength))
        }
    }

    func defaultStyleForTag(_ tag: String) -> RichTextStyle? {
        switch tag {
        case "strong", "b":
            return createStyle(fontWeight: .bold)
        case "em", "i":
            return createStyle(fontStyle: .italic)
        case "u":
            return createStyle(textDecorationLine: .underline, textDecorationStyle: .solid)
        case "s", "strike", "del":
            return createStyle(textDecorationLine: .lineThrough, textDecorationStyle: .solid)
        case "code", "pre":
            return createStyle(fontFamily: "ui-monospace")
        default:
            return nil
        }
    }

    func mergeStyles(base: RichTextStyle, override: RichTextStyle?) -> RichTextStyle {
        guard let override else { return base }
        var merged = base
        if let value = override.fontColor { merged.fontColor = value }
        if let value = override.fragmentBackgroundColor { merged.fragmentBackgroundColor = value }
        if let value = override.fontSize { merged.fontSize = value }
        if let value = override.fontWeight { merged.fontWeight = value }
        if let value = override.fontStyle { merged.fontStyle = value }
        if let value = override.fontFamily { merged.fontFamily = value }
        if let value = override.lineHeight { merged.lineHeight = value }
        if let value = override.letterSpacing { merged.letterSpacing = value }
        if let value = override.textAlign { merged.textAlign = value }
        if let value = override.textTransform { merged.textTransform = value }
        merged.textDecorationLine = mergeDecorations(base.textDecorationLine, override.textDecorationLine)
        if let value = override.textDecorationColor { merged.textDecorationColor = value }
        if let value = override.textDecorationStyle { merged.textDecorationStyle = value }
        if let value = override.marginTop { merged.marginTop = value }
        if let value = override.marginBottom { merged.marginBottom = value }
        if let value = override.marginLeft { merged.marginLeft = value }
        if let value = override.marginRight { merged.marginRight = value }
        return merged
    }

    func mergeDecorations(_ first: TextDecorationLine?, _ second: TextDecorationLine?) -> TextDecorationLine? {
        guard let second else { return first }
        guard let first else { return second }
        if first == second { return first }
        let hasUnderline = first == .underline || first == .underlineLineThrough || second == .underline || second == .underlineLineThrough
        let hasStrike = first == .lineThrough || first == .underlineLineThrough || second == .lineThrough || second == .underlineLineThrough
        if hasUnderline && hasStrike { return .underlineLineThrough }
        if hasUnderline { return .underline }
        if hasStrike { return .lineThrough }
        return TextDecorationLine.none
    }

    func buildRuleMap(_ rules: [RichTextStyleRule]?) -> [String: RichTextStyle] {
        guard let rules, !rules.isEmpty else { return [:] }
        var map: [String: RichTextStyle] = [:]
        for rule in rules {
            map[rule.selector.lowercased()] = rule.style
        }
        return map
    }

    func normalizeStyle(_ style: RichTextStyle) -> RichTextStyle {
        var adjusted = style
        if let line = adjusted.textDecorationLine,
           line != .none,
           adjusted.textDecorationStyle == nil {
            adjusted.textDecorationStyle = .solid
        }
        return adjusted
    }

    private func extractHref(_ tag: HtmlTag, fallback: String?) -> String? {
        if let href = tag.attributes["href"], !href.isEmpty {
            return href
        }
        return fallback
    }

    func decodeEntities(_ text: String) -> String {
        guard text.contains("&") else { return text }
        var result = String()
        result.reserveCapacity(text.count)
        let scalars = Array(text)
        var index = 0
        while index < scalars.count {
            if scalars[index] == "&" {
                if let semi = scalars[index...].firstIndex(of: ";"), semi > index {
                    let name = String(scalars[(index + 1)..<semi])
                    if let decoded = decodeHtmlEntity(name) {
                        result.append(decoded)
                        index = semi + 1
                        continue
                    }
                }
            }
            result.append(scalars[index])
            index += 1
        }
        return result
    }

    func decodeHtmlEntity(_ name: String) -> Character? {
        switch name {
        case "nbsp": return " "
        case "amp": return "&"
        case "lt": return "<"
        case "gt": return ">"
        case "quot": return "\""
        case "apos": return "'"
        default:
            if name.hasPrefix("#"), let value = parseNumericEntity(name), let scalar = UnicodeScalar(value) {
                return Character(scalar)
            }
            return nil
        }
    }

    func parseNumericEntity(_ name: String) -> UInt32? {
        let body = name.dropFirst()
        if body.first == "x" || body.first == "X" {
            return UInt32(body.dropFirst(), radix: 16)
        }
        return UInt32(body, radix: 10)
    }

    private func appendListMarker(
        type: ListType,
        index: Int?,
        state: StyleState,
        builder: NSMutableAttributedString,
        defaultColor: UIColor
    ) {
        let marker = markerText(for: type, index: index)
        var attributes = makeAttributes(for: state.style, linkHref: nil, defaultColor: defaultColor)
        if let font = attributes[.font] as? UIFont {
            if type == .unordered {
                attributes[.font] = font.withSize(font.pointSize * 1.35)
            }
        } else if type == .unordered {
            attributes[.font] = UIFont.systemFont(ofSize: UIFont.systemFontSize * 1.35)
        }
        builder.append(NSAttributedString(string: marker, attributes: attributes))
    }

    private func markerText(for type: ListType, index: Int?) -> String {
        switch type {
        case .unordered:
            return "\(bulletSymbol) "
        case .ordered:
            let value = index ?? 0
            return "\(value). "
        }
    }

    private func tokenize(_ input: String) -> [HtmlToken] {
        var tokens: [HtmlToken] = []
        let scalars = Array(input)
        var index = 0
        var textBuffer = String()

        func flushText() {
            if !textBuffer.isEmpty {
                tokens.append(.text(textBuffer))
                textBuffer.removeAll(keepingCapacity: true)
            }
        }

        while index < scalars.count {
            let char = scalars[index]
            if char == "<" {
                flushText()
                if index + 3 < scalars.count, scalars[index + 1] == "!", scalars[index + 2] == "-", scalars[index + 3] == "-" {
                    index += 4
                    while index + 2 < scalars.count {
                        if scalars[index] == "-" && scalars[index + 1] == "-" && scalars[index + 2] == ">" {
                            index += 3
                            break
                        }
                        index += 1
                    }
                    continue
                }

                var cursor = index + 1
                var isClosing = false
                if cursor < scalars.count, scalars[cursor] == "/" {
                    isClosing = true
                    cursor += 1
                }

                while cursor < scalars.count, scalars[cursor].isWhitespace {
                    cursor += 1
                }

                let nameStart = cursor
                while cursor < scalars.count, !scalars[cursor].isWhitespace, scalars[cursor] != "/", scalars[cursor] != ">" {
                    cursor += 1
                }
                if nameStart >= scalars.count { break }
                let name = String(scalars[nameStart..<cursor]).lowercased()

                var attributes: [String: String] = [:]
                var isSelfClosing = false

                while cursor < scalars.count {
                    while cursor < scalars.count, scalars[cursor].isWhitespace {
                        cursor += 1
                    }
                    if cursor >= scalars.count { break }
                    let current = scalars[cursor]
                    if current == "/" {
                        isSelfClosing = true
                        cursor += 1
                        continue
                    }
                    if current == ">" {
                        cursor += 1
                        break
                    }

                    let attrNameStart = cursor
                    while cursor < scalars.count,
                          !scalars[cursor].isWhitespace,
                          scalars[cursor] != "=",
                          scalars[cursor] != "/",
                          scalars[cursor] != ">" {
                        cursor += 1
                    }
                    let attrName = String(scalars[attrNameStart..<cursor]).lowercased()
                    while cursor < scalars.count, scalars[cursor].isWhitespace {
                        cursor += 1
                    }
                    var value = ""
                    if cursor < scalars.count, scalars[cursor] == "=" {
                        cursor += 1
                        while cursor < scalars.count, scalars[cursor].isWhitespace {
                            cursor += 1
                        }
                        if cursor < scalars.count, scalars[cursor] == "\"" || scalars[cursor] == "'" {
                            let quote = scalars[cursor]
                            cursor += 1
                            let valueStart = cursor
                            while cursor < scalars.count, scalars[cursor] != quote {
                                cursor += 1
                            }
                            if cursor <= scalars.count {
                                value = String(scalars[valueStart..<cursor])
                            }
                            cursor += 1
                        } else {
                            let valueStart = cursor
                            while cursor < scalars.count,
                                  !scalars[cursor].isWhitespace,
                                  scalars[cursor] != "/",
                                  scalars[cursor] != ">" {
                                cursor += 1
                            }
                            value = String(scalars[valueStart..<cursor])
                        }
                    }
                    attributes[attrName] = value
                }

                if cursor <= scalars.count && cursor > index {
                    if isClosing {
                        tokens.append(.endTag(name))
                    } else {
                        let tag = HtmlTag(name: name, attributes: attributes, isSelfClosing: isSelfClosing)
                        tokens.append(.startTag(tag))
                    }
                    index = cursor
                    continue
                }
            }

            textBuffer.append(char)
            index += 1
        }

        flushText()
        return tokens
    }

    func createStyle(
        fontColor: String? = nil,
        fragmentBackgroundColor: String? = nil,
        fontSize: Double? = nil,
        fontWeight: FontWeight? = nil,
        fontStyle: FontStyle? = nil,
        fontFamily: String? = nil,
        lineHeight: Double? = nil,
        letterSpacing: Double? = nil,
        textAlign: TextAlign? = nil,
        textTransform: TextTransform? = nil,
        textDecorationLine: TextDecorationLine? = nil,
        textDecorationColor: String? = nil,
        textDecorationStyle: TextDecorationStyle? = nil,
        marginTop: Double? = nil,
        marginBottom: Double? = nil,
        marginLeft: Double? = nil,
        marginRight: Double? = nil
    ) -> RichTextStyle {
        return RichTextStyle(
            fontColor: fontColor,
            fragmentBackgroundColor: fragmentBackgroundColor,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            fontFamily: fontFamily,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing,
            textAlign: textAlign,
            textTransform: textTransform,
            textDecorationLine: textDecorationLine,
            textDecorationColor: textDecorationColor,
            textDecorationStyle: textDecorationStyle,
            marginTop: marginTop,
            marginBottom: marginBottom,
            marginLeft: marginLeft,
            marginRight: marginRight
        )
    }
}
