//
//  NitroTextImpl.swift
//  Pods
//
//  Created by Patrick Kabwe on 01/09/2025.
//

import UIKit

final class NitroTextImpl {
    weak var nitroTextView: NitroTextView?
    var currentTextAlignment: NSTextAlignment = .natural
    var currentTransform: TextTransform = .none
    var currentEllipsize: NSLineBreakMode = .byTruncatingTail
    var fontCache: [FontKey: UIFont] = [:]
    var paragraphStyleCache: [ParagraphKey: NSParagraphStyle] = [:]
    lazy var htmlRenderer = NitroHtmlRenderer(impl: self)
    var allowFontScaling: Bool = true
    var currentRendererIsHtml: Bool = false
    var currentFontFamily: String? = nil
    var dynamicTypeTextStyle: UIFont.TextStyle? = nil
    @available(iOS 14.0, *)
    var currentLineBreakStrategy: NSParagraphStyle.LineBreakStrategy = .standard
    var maxFontSizeMultiplier: Double? = nil
    var adjustsFontSizeToFit: Bool? = nil
    var minimumFontScale: Double? = nil

    private var renderer: NitroRenderer = .plaintext
    private var fragments: [Fragment]?
    private var plainText: String?
    private var richTextStyleRules: [RichTextStyleRule]?

    private var selectable: Bool = false
    private var selectionColorHex: String?
    private var numberOfLines: Double?
    private var storedEllipsizeMode: EllipsizeMode?

    private var topFontSize: Double?
    private var topFontWeight: FontWeight?
    private var topFontColor: String?
    private var topFontStyle: FontStyle?
    private var topFontFamily: String?
    private var topLetterSpacing: Double?
    private var topLineHeight: Double?
    private var topTextAlign: TextAlign?
    private var topTextTransform: TextTransform?
    private var topTextDecorationLine: TextDecorationLine?
    private var topTextDecorationColor: String?
    private var topTextDecorationStyle: TextDecorationStyle?
    private var topSelectionColor: String?
    private var topFragmentBackgroundColor: String?
    private var needsCommit: Bool = false

    init(_ nitroTextView: NitroTextView) {
        self.nitroTextView = nitroTextView
    }

    func commit() {
        guard let textView = nitroTextView else { return }

        needsCommit = false

        applySelectable()
        applySelectionTint()
        applyLinesAndEllipsize()
        textView.adjustsFontForContentSizeCategory = allowFontScaling

        let defaultColor = resolvedFontColor()
        textView.textColor = defaultColor

        let top = buildTopDefaults()
        applyBaseFont(using: top)

        currentRendererIsHtml = (renderer == .html)
        if currentRendererIsHtml {
            applyHtml(
                text: plainText,
                fragments: fragments,
                rules: richTextStyleRules,
                top: top,
                defaultColor: defaultColor
            )
        } else {
            apply(
                fragments: fragments,
                text: plainText,
                top: top,
                defaultColor: defaultColor
            )
        }

        textView.setNeedsLayout()
    }

    @discardableResult
    func consumeNeedsCommit() -> Bool {
        let dirty = needsCommit
        needsCommit = false
        return dirty
    }

    private func markCommitNeeded() {
        needsCommit = true
    }

    @discardableResult
    private func updateValue<T: Equatable>(_ storage: inout T, to newValue: T) -> Bool {
        if storage != newValue {
            storage = newValue
            needsCommit = true
            return true
        }
        return false
    }

    func setRenderer(_ value: NitroRenderer?) {
        let next = value ?? .plaintext
        if renderer != next {
            renderer = next
            markCommitNeeded()
        }
    }

    func setFragments(_ value: [Fragment]?) {
        fragments = value
        markCommitNeeded()
    }

    func setText(_ value: String?) {
        updateValue(&plainText, to: value)
    }

    func setRichTextStyleRules(_ value: [RichTextStyleRule]?) {
        richTextStyleRules = value
        markCommitNeeded()
    }

    func setSelectable(_ value: Bool?) {
        if selectable != (value ?? false) {
            selectable = value ?? false
            markCommitNeeded()
        }
    }

    func setSelectionColor(_ value: String?) {
        let changed = selectionColorHex != value || topSelectionColor != value
        selectionColorHex = value
        topSelectionColor = value
        if let value, let color = ColorParser.parse(value) {
            nitroTextView?.tintColor = color
        } else {
            nitroTextView?.tintColor = nil
        }
        if changed {
            markCommitNeeded()
        }
    }

    func setAllowFontScaling(_ value: Bool?) {
        let resolved = value ?? true
        if allowFontScaling != resolved {
            allowFontScaling = resolved
            nitroTextView?.adjustsFontForContentSizeCategory = allowFontScaling
            fontCache.removeAll(keepingCapacity: true)
            paragraphStyleCache.removeAll(keepingCapacity: true)
            markCommitNeeded()
        }
    }

    func setFontFamily(_ value: String?) {
        if currentFontFamily != value {
            currentFontFamily = value
            topFontFamily = value
            fontCache.removeAll(keepingCapacity: true)
            paragraphStyleCache.removeAll(keepingCapacity: true)
            markCommitNeeded()
        }
    }

    func setFontSize(_ value: Double?) {
        updateValue(&topFontSize, to: value)
    }

    func setFontWeight(_ value: FontWeight?) {
        updateValue(&topFontWeight, to: value)
    }

    func setFontColor(_ value: String?) {
        updateValue(&topFontColor, to: value)
    }

    func setFontStyle(_ value: FontStyle?) {
        updateValue(&topFontStyle, to: value)
    }

    func setLetterSpacing(_ value: Double?) {
        updateValue(&topLetterSpacing, to: value)
    }

    func setLineHeight(_ value: Double?) {
        updateValue(&topLineHeight, to: value)
    }

    func setTextAlign(_ align: TextAlign?) {
        if topTextAlign != align {
            topTextAlign = align
            markCommitNeeded()
        }
        switch align {
        case .some(.center):
            currentTextAlignment = .center
        case .some(.right):
            currentTextAlignment = .right
        case .some(.justify):
            currentTextAlignment = .justified
        case .some(.left):
            currentTextAlignment = .left
        case .some(.auto), .none:
            currentTextAlignment = .natural
        }
        nitroTextView?.textAlignment = currentTextAlignment
    }

    func setTextTransform(_ transform: TextTransform?) {
        if topTextTransform != transform {
            topTextTransform = transform
            markCommitNeeded()
        }
        switch transform {
        case .some(.uppercase):
            currentTransform = .uppercase
        case .some(.lowercase):
            currentTransform = .lowercase
        case .some(.capitalize):
            currentTransform = .capitalize
        default:
            currentTransform = .none
        }
    }

    func setTextDecorationLine(_ value: TextDecorationLine?) {
        updateValue(&topTextDecorationLine, to: value)
    }

    func setTextDecorationColor(_ value: String?) {
        updateValue(&topTextDecorationColor, to: value)
    }

    func setTextDecorationStyle(_ value: TextDecorationStyle?) {
        updateValue(&topTextDecorationStyle, to: value)
    }

    func setFragmentBackgroundColor(_ value: String?) {
        updateValue(&topFragmentBackgroundColor, to: value)
    }

    func setNumberOfLines(_ value: Double?) {
        updateValue(&numberOfLines, to: value)
    }

    func setEllipsizeMode(_ mode: EllipsizeMode?) {
        if storedEllipsizeMode != mode {
            storedEllipsizeMode = mode
            markCommitNeeded()
        }
        switch mode {
        case .some(.head): currentEllipsize = .byTruncatingHead
        case .some(.middle): currentEllipsize = .byTruncatingMiddle
        case .some(.tail): currentEllipsize = .byTruncatingTail
        case .some(.clip): currentEllipsize = .byClipping
        default: currentEllipsize = .byTruncatingTail
        }
    }

    func setDynamicTypeRamp(_ value: DynamicTypeRamp?) {
        let style: UIFont.TextStyle? = {
            switch value {
            case .caption2?: return .caption2
            case .caption1?: return .caption1
            case .footnote?: return .footnote
            case .subheadline?: return .subheadline
            case .callout?: return .callout
            case .body?: return .body
            case .headline?: return .headline
            case .title3?: return .title3
            case .title2?: return .title2
            case .title1?: return .title1
            case .largetitle?: return .largeTitle
            case nil: return nil
            }
        }()
        if dynamicTypeTextStyle != style {
            dynamicTypeTextStyle = style
            fontCache.removeAll(keepingCapacity: true)
            paragraphStyleCache.removeAll(keepingCapacity: true)
            markCommitNeeded()
        }
    }

    func setLineBreakStrategyIOS(_ value: LineBreakStrategyIOS?) {
        if #available(iOS 14.0, *) {
            let previous = currentLineBreakStrategy
            switch value {
            case .some(.none):
                currentLineBreakStrategy = []
            case .some(.standard):
                currentLineBreakStrategy = .standard
            case .some(.hangulWord):
                currentLineBreakStrategy = .hangulWordPriority
            case .some(.pushOut):
                currentLineBreakStrategy = .pushOut
            default:
                currentLineBreakStrategy = .standard
            }
            paragraphStyleCache.removeAll(keepingCapacity: true)
            if previous != currentLineBreakStrategy {
                markCommitNeeded()
            }
        }
    }

    func setMaxFontSizeMultiplier(_ value: Double?) {
        if updateValue(&maxFontSizeMultiplier, to: value) {
            fontCache.removeAll(keepingCapacity: true)
            paragraphStyleCache.removeAll(keepingCapacity: true)
        }
    }

    func setAdjustsFontSizeToFit(_ value: Bool?) {
        updateValue(&adjustsFontSizeToFit, to: value)
    }

    func setMinimumFontScale(_ value: Double?) {
        updateValue(&minimumFontScale, to: value)
    }

    // MARK: - Rendering helpers
    func renderFragments(_ fragments: [Fragment]?, defaultColor: UIColor) {
        guard let fragments, !fragments.isEmpty else {
            nitroTextView?.attributedText = nil
            return
        }

        if fragments.count == 1, let only = fragments.first, let raw = only.text, !raw.isEmpty {
            let text = transform(raw, with: only)
            let attrs = makeAttributes(for: only, defaultColor: defaultColor)
            let result = NSMutableAttributedString(string: text, attributes: attrs)
            applyAttributedText(result)
            return
        }

        let result = NSMutableAttributedString()
        result.beginEditing()
        defer { result.endEditing() }

        for fragment in fragments {
            guard let rawText = fragment.text, !rawText.isEmpty else { continue }
            autoreleasepool {
                let text = transform(rawText, with: fragment)
                if !text.isEmpty {
                    let attributes = makeAttributes(for: fragment, defaultColor: defaultColor)
                    result.append(NSAttributedString(string: text, attributes: attributes))
                }
            }
        }

        applyAttributedText(result)
    }

    func applyAttributedText(_ attributedText: NSAttributedString) {
        let mutable = NSMutableAttributedString(attributedString: attributedText)
        applyBaselineOffset(mutable)

        // if let textView = nitroTextView {
        //     textView.textContainer.lineFragmentPadding = 0
        //     textView.textContainerInset = .zero
        //     textView.contentInset = .zero
        // }

        if let storage = nitroTextView?.tkStorage ?? nitroTextView?.layoutManager.textStorage {
            storage.beginEditing()
            storage.setAttributedString(mutable)
            storage.endEditing()
        } else {
            nitroTextView?.attributedText = mutable
        }
    }

    private func buildTopDefaults() -> FragmentTopDefaults {
        FragmentTopDefaults(
            fontSize: topFontSize,
            fontWeight: topFontWeight,
            fontColor: topFontColor,
            fontStyle: topFontStyle,
            fontFamily: topFontFamily,
            lineHeight: topLineHeight,
            letterSpacing: topLetterSpacing,
            textAlign: topTextAlign,
            textTransform: topTextTransform,
            textDecorationLine: topTextDecorationLine,
            textDecorationColor: topTextDecorationColor,
            textDecorationStyle: topTextDecorationStyle,
            selectionColor: topSelectionColor,
            fragmentBackgroundColor: topFragmentBackgroundColor
        )
    }

    private func applySelectable() {
        nitroTextView?.isSelectable = selectable
    }

    private func applySelectionTint() {
        guard let textView = nitroTextView else { return }
        if let selectionColorHex, let color = ColorParser.parse(selectionColorHex) {
            textView.tintColor = color
        } else {
            textView.tintColor = nil
        }
    }

    private func applyLinesAndEllipsize() {
        guard let textView = nitroTextView else { return }
        let lines = numberOfLines.map { Int($0) } ?? 0
        textView.textContainer.maximumNumberOfLines = lines
        textView.textContainer.lineBreakMode = lineBreakMode(for: lines)
    }

    private func lineBreakMode(for lines: Int) -> NSLineBreakMode {
        guard lines > 0 else { return .byWordWrapping }
        if lines == 1 { return currentEllipsize }
        switch currentEllipsize {
        case .byClipping:
            return .byClipping
        case .byTruncatingHead:
            return .byTruncatingHead
        case .byTruncatingMiddle:
            return .byTruncatingMiddle
        default:
            return .byTruncatingTail
        }
    }

    private func applyBaseFont(using top: FragmentTopDefaults) {
        guard let textView = nitroTextView else { return }
        let defaultSize = textView.font?.pointSize
        let fragment = Fragment(
            text: "",
            selectionColor: top.selectionColor,
            fontSize: top.fontSize,
            fontWeight: top.fontWeight,
            fontColor: nil,
            fragmentBackgroundColor: top.fragmentBackgroundColor,
            fontStyle: top.fontStyle,
            fontFamily: top.fontFamily,
            lineHeight: top.lineHeight,
            letterSpacing: top.letterSpacing,
            textAlign: top.textAlign,
            textTransform: top.textTransform,
            textDecorationLine: top.textDecorationLine,
            textDecorationColor: top.textDecorationColor,
            textDecorationStyle: top.textDecorationStyle
        )
        let font = makeFont(for: fragment, defaultPointSize: defaultSize).value
        textView.font = font
    }

    private func resolvedFontColor() -> UIColor {
        if let topFontColor, let color = ColorParser.parse(topFontColor) {
            return color
        }
        return nitroTextView?.textColor ?? UIColor.black
    }
}

extension NitroTextImpl {
    /// Mirrors RCTApplyBaselineOffset: Computes a baseline offset from paragraph lineHeights and fonts.
    fileprivate func applyBaselineOffset(_ attributed: NSMutableAttributedString) {
        let fullRange = NSRange(location: 0, length: attributed.length)

        var maximumLineHeight: CGFloat = 0
        var maximumFontLineHeight: CGFloat = 0

        attributed.enumerateAttributes(in: fullRange, options: []) { attrs, _, _ in
            if let style = attrs[.paragraphStyle] as? NSParagraphStyle {
                maximumLineHeight = max(maximumLineHeight, style.maximumLineHeight)
            }
            if let font = attrs[.font] as? UIFont {
                maximumFontLineHeight = max(maximumFontLineHeight, font.lineHeight)
            }
        }
        if maximumLineHeight <= 0 { return }
        if maximumLineHeight < maximumFontLineHeight { return }

        let baseLineOffset = (maximumLineHeight - maximumFontLineHeight) / 2.0
        if baseLineOffset != 0 {
            attributed.addAttribute(.baselineOffset, value: baseLineOffset, range: fullRange)
        }
    }
}
