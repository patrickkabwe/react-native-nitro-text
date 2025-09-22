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
    var allowFontScaling: Bool = true
    var currentFontFamily: String? = nil
    var dynamicTypeTextStyle: UIFont.TextStyle? = nil
    let markdownCache = NSCache<NSString, NSAttributedString>()
    @available(iOS 14.0, *)
    var currentLineBreakStrategy: NSParagraphStyle.LineBreakStrategy = .standard
    var maxFontSizeMultiplier: Double? = nil
    var adjustsFontSizeToFit: Bool? = nil
    var minimumFontScale: Double? = nil

    init(_ nitroTextView: NitroTextView) {
        self.nitroTextView = nitroTextView
        markdownCache.countLimit = 16
    }

    func setLineBreakStrategyIOS(_ value: LineBreakStrategyIOS?) {
        guard #available(iOS 14.0, *) else { return }
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
        if let text = nitroTextView?.attributedText, text.length > 0 {
            nitroTextView?.attributedText = text
        }
    }

    func setSelectable(_ selectable: Bool?) {
        nitroTextView?.isSelectable = selectable ?? true
    }

    func setAllowFontScaling(_ value: Bool?) {
        allowFontScaling = value ?? true
        nitroTextView?.adjustsFontForContentSizeCategory = allowFontScaling
        paragraphStyleCache.removeAll(keepingCapacity: true)
        if let text = nitroTextView?.attributedText, text.length > 0 {
            nitroTextView?.attributedText = text
        }
    }

    func setFontFamily(_ value: String?) {
        guard currentFontFamily != value else { return }
        currentFontFamily = value
        fontCache.removeAll(keepingCapacity: true)
        if let current = nitroTextView?.attributedText, current.length > 0 {
            nitroTextView?.attributedText = current
            nitroTextView?.setNeedsLayout()
        }
    }

    func setFontSize(_ value: Double?) {
        if let value = value {
            nitroTextView?.font = UIFont.systemFont(ofSize: CGFloat(value))
        } else {
            nitroTextView?.font = UIFont.systemFont(ofSize: 14)
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
        guard dynamicTypeTextStyle != style else { return }
        dynamicTypeTextStyle = style
        fontCache.removeAll(keepingCapacity: true)
        paragraphStyleCache.removeAll(keepingCapacity: true)
        if let current = nitroTextView?.attributedText, current.length > 0 {
            nitroTextView?.attributedText = current
            nitroTextView?.setNeedsLayout()
        }
    }

    func setNumberOfLines(_ value: Double?) {
        let n = Int(value ?? 0)
        nitroTextView?.textContainer.maximumNumberOfLines = n
        nitroTextView?.textContainer.lineBreakMode = getLineBreakMode(forLines: n)
    }

    func setMaxFontSizeMultiplier(_ value: Double?) {
        maxFontSizeMultiplier = value
        fontCache.removeAll(keepingCapacity: true)
        paragraphStyleCache.removeAll(keepingCapacity: true)
        if let current = nitroTextView?.attributedText, current.length > 0 {
            nitroTextView?.attributedText = current
            nitroTextView?.setNeedsLayout()
        }
    }

    func setAdjustsFontSizeToFit(_ value: Bool?) { adjustsFontSizeToFit = value }
    func setMinimumFontScale(_ value: Double?) { minimumFontScale = value }

    func setEllipsizeMode(_ mode: EllipsizeMode?) {
        switch mode {
        case .some(.head): currentEllipsize = .byTruncatingHead
        case .some(.middle): currentEllipsize = .byTruncatingMiddle
        case .some(.tail): currentEllipsize = .byTruncatingTail
        case .some(.clip): currentEllipsize = .byClipping
        default: currentEllipsize = .byTruncatingTail
        }
        guard let n = nitroTextView?.textContainer.maximumNumberOfLines else { return }
        nitroTextView?.textContainer.lineBreakMode = getLineBreakMode(forLines: n)
    }

    func getLineBreakMode(forLines n: Int) -> NSLineBreakMode {
        guard n > 0 else { return .byWordWrapping }
        if n == 1 { return currentEllipsize }
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

    func setText(_ attributedText: NSAttributedString) {
        let mutable = NSMutableAttributedString(attributedString: attributedText)
        applyBaselineOffset(mutable)
        if let storage = nitroTextView?.tkStorage ?? nitroTextView?.layoutManager.textStorage {
            storage.beginEditing()
            storage.setAttributedString(mutable)
            storage.endEditing()
        } else {
            nitroTextView?.attributedText = mutable
        }
    }

    func setTextAlign(_ align: TextAlign?) {
        switch align {
        case .some(.center): currentTextAlignment = .center
        case .some(.right): currentTextAlignment = .right
        case .some(.justify): currentTextAlignment = .justified
        case .some(.left): currentTextAlignment = .left
        default: currentTextAlignment = .natural
        }
        nitroTextView?.textAlignment = currentTextAlignment
    }

    func setTextTransform(_ transform: TextTransform?) {
        switch transform {
        case .some(.uppercase): currentTransform = .uppercase
        case .some(.lowercase): currentTransform = .lowercase
        case .some(.capitalize): currentTransform = .capitalize
        default: currentTransform = .none
        }
    }

    func setFragments(_ fragments: [Fragment]?) {
        guard let fragments = fragments, !fragments.isEmpty else {
            if let storage = nitroTextView?.tkStorage ?? nitroTextView?.layoutManager.textStorage {
                storage.beginEditing()
                storage.setAttributedString(NSAttributedString())
                storage.endEditing()
            } else {
                nitroTextView?.attributedText = nil
            }
            return
        }

        if fragments.count == 1, let only = fragments.first, let raw = only.text, !raw.isEmpty {
            let defaultColor = nitroTextView?.textColor ?? UIColor.clear
            let text = transform(raw, with: only)
            let attrs = makeAttributes(for: only, defaultColor: defaultColor)
            let result = NSMutableAttributedString(string: text, attributes: attrs)
            setText(result)
            return
        }

        let result = NSMutableAttributedString()
        result.beginEditing()
        defer { result.endEditing() }

        let defaultColor = nitroTextView?.textColor ?? UIColor.clear

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

        setText(result)
    }
}

extension NitroTextImpl {
    /// Mirrors RCTApplyBaselineOffset: Computes a baseline offset from paragraph lineHeights and fonts.
    fileprivate func applyBaselineOffset(_ attributed: NSMutableAttributedString) {
        guard attributed.length > 0 else { return }
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
