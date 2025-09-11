//
//  NitroTextImpl.swift
//  Pods
//
//  Created by Patrick Kabwe on 01/09/2025.
//

import UIKit

final class NitroTextImpl {
    private let nitroTextView : NitroTextView
    private var currentTextAlignment: NSTextAlignment = .natural
    private var currentTransform: TextTransform = .none
    private var currentEllipsize: NSLineBreakMode = .byTruncatingTail
    
    init(_ nitroTextView: NitroTextView) {
        self.nitroTextView = nitroTextView
    }
    
    func setSelectable(_ selectable: Bool?) {
        nitroTextView.isSelectable = selectable ?? true
    }
    
    func setNumberOfLines(_ value: Double?) {
        let n = Int(value ?? 0)
        nitroTextView.textContainer.maximumNumberOfLines = n
        // Apply configured ellipsize mode when limiting lines; wrap otherwise.
        nitroTextView.textContainer.lineBreakMode = (n > 0) ? currentEllipsize : .byWordWrapping
        nitroTextView.setNeedsLayout()
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
        let n = nitroTextView.textContainer.maximumNumberOfLines
        nitroTextView.textContainer.lineBreakMode = (n > 0) ? currentEllipsize : .byWordWrapping
        nitroTextView.setNeedsLayout()
    }

    func setText(_ attributedText: NSAttributedString) {
        if let storage = nitroTextView.tkStorage ?? nitroTextView.layoutManager.textStorage {
            storage.beginEditing()
            storage.setAttributedString(attributedText)
            storage.endEditing()
        } else {
            nitroTextView.attributedText = attributedText
        }
        nitroTextView.setNeedsLayout()
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
        nitroTextView.textAlignment = currentTextAlignment
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
            nitroTextView.attributedText = nil
            return
        }
        let result = NSMutableAttributedString()
        let defaultColor = nitroTextView.textColor ?? UIColor.label
        for fragment in fragments {
            guard var text = fragment.text else { continue }
            var attrs: [NSAttributedString.Key: Any] = [:]
            
            let resolvedSize: CGFloat = {
                if let s = fragment.fontSize { return CGFloat(s) }
                if let current = nitroTextView.font?.pointSize { return current }
                return 14.0
            }()
            let weightString = fragment.fontWeight ?? FontWeight.normal
            let isItalic = fragment.fontStyle == FontStyle.italic
            let uiWeight = Self.fontWeightFromString(weightString)

            var baseFont = UIFont.systemFont(ofSize: resolvedSize, weight: uiWeight)

            if isItalic {
                var traits = baseFont.fontDescriptor.symbolicTraits
                traits.insert(.traitItalic)
                if let italicDesc = baseFont.fontDescriptor.withSymbolicTraits(traits) {
                    let traitsDict: [UIFontDescriptor.TraitKey: Any] = [
                        .weight: uiWeight
                    ]
                    let finalDesc = italicDesc.addingAttributes([
                        UIFontDescriptor.AttributeName.traits: traitsDict
                    ])
                    baseFont = UIFont(descriptor: finalDesc, size: resolvedSize)
                }
                attrs[.obliqueness] = 0.2
            }
            attrs[.font] = baseFont
            
            let para = NSMutableParagraphStyle()
            if let lineHeight = fragment.lineHeight, lineHeight > 0 {
                para.minimumLineHeight = lineHeight
                para.maximumLineHeight = lineHeight
            }
            if let fa = fragment.textAlign {
                switch fa {
                case .center: para.alignment = .center
                case .right: para.alignment = .right
                case .justify: para.alignment = .justified
                case .left: para.alignment = .left
                case .auto: para.alignment = .natural
                }
            } else {
                para.alignment = currentTextAlignment
            }
            // Mirror textContainer's truncation behavior in attributed paragraph style
            let hasLineLimit = nitroTextView.textContainer.maximumNumberOfLines > 0
            para.lineBreakMode = hasLineLimit ? currentEllipsize : .byWordWrapping
            attrs[.paragraphStyle] = para
            if let colorValue = fragment.fontColor, let color = ColorParser.parse(colorValue) {
                attrs[.foregroundColor] = color
            } else {
                attrs[.foregroundColor] = defaultColor
            }

            let localTransform: TextTransform = {
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
            switch localTransform {
            case .uppercase: text = text.uppercased()
            case .lowercase: text = text.lowercased()
            case .capitalize: text = text.capitalized
            case .none: break
            }
            result.append(NSAttributedString(string: text, attributes: attrs))
        }
        setText(result)
    }
}


extension NitroTextImpl {
    private static func fontWeightFromString(_ s: FontWeight) -> UIFont.Weight {
        switch s {
        case .ultralight:
            return .ultraLight
        case .thin:
            return .thin
        case .light:
            return .light
        case .regular:
            return .regular
        case .medium:
            return .medium
        case .semibold:
            return .semibold
        case .bold:
            return .bold
        case .heavy:
            return .heavy
        case .black:
            return .black
        default: return .regular
        }
    }
}
