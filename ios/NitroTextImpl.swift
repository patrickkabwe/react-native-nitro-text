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
    var allowFontScaling: Bool = true
    var currentFontFamily: String? = nil
    var dynamicTypeTextStyle: UIFont.TextStyle? = nil
    @available(iOS 14.0, *)
    var currentLineBreakStrategy: NSParagraphStyle.LineBreakStrategy = .standard
    var maxFontSizeMultiplier: Double? = nil
    var adjustsFontSizeToFit: Bool? = nil
    var minimumFontScale: Double? = nil

    init(_ nitroTextView: NitroTextView) {
        self.nitroTextView = nitroTextView
    }

    func setLineBreakStrategyIOS(_ value: LineBreakStrategyIOS?) {
        if #available(iOS 14.0, *) {
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
    }

    func setSelectable(_ selectable: Bool?) {
        nitroTextView?.isSelectable = selectable ?? true
    }

    func setAllowFontScaling(_ value: Bool?) {
        allowFontScaling = value ?? true
        nitroTextView?.adjustsFontForContentSizeCategory = allowFontScaling
        if let text = nitroTextView?.attributedText, text.length > 0 {
            nitroTextView?.attributedText = text
        }
    }

    func setFontFamily(_ value: String?) {
        if currentFontFamily != value {
            currentFontFamily = value
            fontCache.removeAll(keepingCapacity: true)
            if let current = nitroTextView?.attributedText, current.length > 0 {
                nitroTextView?.attributedText = current
                nitroTextView?.setNeedsLayout()
            }
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
        if dynamicTypeTextStyle != style {
            dynamicTypeTextStyle = style
            fontCache.removeAll(keepingCapacity: true)
            if let current = nitroTextView?.attributedText, current.length > 0 {
                nitroTextView?.attributedText = current
                nitroTextView?.setNeedsLayout()
            }
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
        if let storage = nitroTextView?.tkStorage ?? nitroTextView?.layoutManager.textStorage {
            storage.beginEditing()
            storage.setAttributedString(attributedText)
            storage.endEditing()
        } else {
            nitroTextView?.attributedText = attributedText
        }
    }

    func setPlainText(_ value: String?) {
        let attributed = NSAttributedString(string: value ?? "")
        setText(attributed)
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
            nitroTextView?.attributedText = nil
            return
        }

        let result = NSMutableAttributedString()
        let defaultColor = nitroTextView?.textColor ?? UIColor.clear

        for fragment in fragments {
            guard let rawText = fragment.text else { continue }
            let text = transform(rawText, with: fragment)
            let attributes = makeAttributes(for: fragment, defaultColor: defaultColor)
            result.append(NSAttributedString(string: text, attributes: attributes))
        }

        setText(result)
    }
}
