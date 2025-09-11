//
//  NitroTextImpl+Font.swift
//  Pods
//
//  Font-related helpers for NitroTextImpl.
//

import UIKit

extension NitroTextImpl {
    func makeFont(for fragment: Fragment, defaultPointSize: CGFloat?) -> (value: UIFont, isItalic: Bool) {
        let resolvedSize: CGFloat = {
            if let s = fragment.fontSize { return CGFloat(s) }
            if let current = defaultPointSize { return current }
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
    static func fontWeightFromString(_ s: FontWeight) -> UIFont.Weight {
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
        default:
            return .regular
        }
    }
}
