//
//  NitroTextImpl.swift
//  Pods
//
//  Created by Patrick Kabwe on 01/09/2025.
//

import UIKit

final class NitroTextImpl {
    private weak var nitroTextView : NitroTextView?
    private var currentTextAlignment: NSTextAlignment = .natural
    private var currentTransform: TextTransform = .none
    private var currentEllipsize: NSLineBreakMode = .byTruncatingTail
    
    init(_ nitroTextView: NitroTextView) {
        self.nitroTextView = nitroTextView
    }
    
    func setSelectable(_ selectable: Bool?) {
        nitroTextView?.isSelectable = selectable ?? true
    }
    
    func setNumberOfLines(_ value: Double?) {
        let n = Int(value ?? 0)
        nitroTextView?.textContainer.maximumNumberOfLines = n
        nitroTextView?.textContainer.lineBreakMode = effectiveLineBreakMode(forLines: n)
    }

    func setEllipsizeMode(_ mode: EllipsizeMode?) {
        switch mode {
        case .some(.head): currentEllipsize = .byTruncatingHead
        case .some(.middle): currentEllipsize = .byTruncatingMiddle
        case .some(.tail): currentEllipsize = .byTruncatingTail
        case .some(.clip): currentEllipsize = .byClipping
        default: currentEllipsize = .byTruncatingTail
        }
        // Re-apply to container based on current numberOfLines
        guard let n = nitroTextView?.textContainer.maximumNumberOfLines else { return }
        nitroTextView?.textContainer.lineBreakMode = effectiveLineBreakMode(forLines: n)
    }

    private func effectiveLineBreakMode(forLines n: Int) -> NSLineBreakMode {
        guard n > 0 else { return .byWordWrapping }
        if n == 1 { return currentEllipsize }
        // Multi-line behavior: allow wrapping, then apply final-line behavior.
        // - tail: use truncatingTail to append ellipsis on the last visible line
        // - clip: keep wrapping and clip after the Nth line (word wrapping)
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
        nitroTextView?.setNeedsLayout()
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
        let defaultColor = nitroTextView?.textColor ?? UIColor.label

        for fragment in fragments {
            guard let rawText = fragment.text else { continue }
            let text = transform(rawText, with: fragment)
            let attributes = makeAttributes(for: fragment, defaultColor: defaultColor)
            result.append(NSAttributedString(string: text, attributes: attributes))
        }

        setText(result)
    }

    // MARK: - Attribute helpers

    private func makeAttributes(
        for fragment: Fragment,
        defaultColor: UIColor
    ) -> [NSAttributedString.Key: Any] {
        var attrs: [NSAttributedString.Key: Any] = [:]

        let font = makeFont(for: fragment)
        attrs[.font] = font.value
        if font.isItalic { attrs[.obliqueness] = 0.2 }

        let para = makeParagraphStyle(for: fragment)
        attrs[.paragraphStyle] = para

        let color = resolveColor(for: fragment, defaultColor: defaultColor)
        attrs[.foregroundColor] = color

        return attrs
    }

    private func makeFont(for fragment: Fragment) -> (value: UIFont, isItalic: Bool) {
        let resolvedSize: CGFloat = {
            if let s = fragment.fontSize { return CGFloat(s) }
            if let current = nitroTextView?.font?.pointSize { return current }
            return 14.0
        }()
        let weightToken = fragment.fontWeight ?? FontWeight.normal
        let uiWeight = Self.fontWeightFromString(weightToken)

        var base = UIFont.systemFont(ofSize: resolvedSize, weight: uiWeight)
        let isItalic = fragment.fontStyle == FontStyle.italic
        if isItalic {
            var traits = base.fontDescriptor.symbolicTraits
            traits.insert(.traitItalic)
            if let italicDesc = base.fontDescriptor.withSymbolicTraits(traits) {
                let traitsDict: [UIFontDescriptor.TraitKey: Any] = [.weight: uiWeight]
                let finalDesc = italicDesc.addingAttributes([
                    UIFontDescriptor.AttributeName.traits: traitsDict
                ])
                base = UIFont(descriptor: finalDesc, size: resolvedSize)
            }
        }
        return (base, isItalic)
    }

    private func makeParagraphStyle(for fragment: Fragment) -> NSMutableParagraphStyle {
        let para = NSMutableParagraphStyle()

        if let lineHeight = fragment.lineHeight, lineHeight > 0 {
            para.minimumLineHeight = lineHeight
            para.maximumLineHeight = lineHeight
        }

        if let align = fragment.textAlign {
            switch align {
            case .center: para.alignment = .center
            case .right: para.alignment = .right
            case .justify: para.alignment = .justified
            case .left: para.alignment = .left
            case .auto: para.alignment = .natural
            }
        } else {
            para.alignment = currentTextAlignment
        }

        guard let n = nitroTextView?.textContainer.maximumNumberOfLines else { return para }
        para.lineBreakMode = effectiveLineBreakMode(forLines: n)
        return para
    }

    private func resolveColor(for fragment: Fragment, defaultColor: UIColor) -> UIColor {
        if let value = fragment.fontColor, let parsed = ColorParser.parse(value) {
            return parsed
        }
        return defaultColor
    }

    private func transform(_ text: String, with fragment: Fragment) -> String {
        let effective: TextTransform = {
            if let ft = fragment.textTransform {
                switch ft {
                case .uppercase: return .uppercase
                case .lowercase: return .lowercase
                case .capitalize: return .capitalize
                case .none: return .none
                }
            }
            return currentTransform
        }()

        switch effective {
        case .uppercase: return text.uppercased()
        case .lowercase: return text.lowercased()
        case .capitalize: return text.capitalized
        case .none: return text
        }
    }
}


// Fragment merging and font helpers moved to NitroTextImpl+Fragment.swift
