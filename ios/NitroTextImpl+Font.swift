//
//  NitroTextImpl+Font.swift
//  Pods
//
//  Font-related helpers for NitroTextImpl.
//

import UIKit

struct FontKey: Hashable {
    let size: CGFloat
    let weightRaw: CGFloat
    let italic: Bool
}

extension NitroTextImpl {
    func makeFont(for fragment: Fragment, defaultPointSize: CGFloat?) -> (value: UIFont, isItalic: Bool) {
        let resolvedSize: CGFloat = {
            if let s = fragment.fontSize { return CGFloat(s) }
            if let current = defaultPointSize { return current }
            return 14.0
        }()
        let finalPointSize: CGFloat = allowFontScaling ? UIFontMetrics.default.scaledValue(for: resolvedSize) : resolvedSize
        let weightToken = fragment.fontWeight ?? FontWeight.normal
        let uiWeight = Self.uiFontWeight(for: weightToken)
        let isItalic = fragment.fontStyle == FontStyle.italic

        let key = FontKey(size: finalPointSize, weightRaw: uiWeight.rawValue, italic: isItalic)
        if let cached = fontCache[key] {
            return (cached, isItalic)
        }

        var base = UIFont.systemFont(ofSize: finalPointSize, weight: uiWeight)
        if isItalic {
            var traits = base.fontDescriptor.symbolicTraits
            traits.insert(.traitItalic)
            if let italicDesc = base.fontDescriptor.withSymbolicTraits(traits) {
                let traitsDict: [UIFontDescriptor.TraitKey: Any] = [.weight: uiWeight]
                let finalDesc = italicDesc.addingAttributes([
                    UIFontDescriptor.AttributeName.traits: traitsDict
                ])
                base = UIFont(descriptor: finalDesc, size: finalPointSize)
            }
        }
        fontCache[key] = base
        return (base, isItalic)
    }
    static func uiFontWeight(for weight: FontWeight) -> UIFont.Weight {
        switch weight {
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
        default:
            return .regular
        }
    }
}
