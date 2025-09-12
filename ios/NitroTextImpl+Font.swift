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
    func makeFont(for fragment: Fragment, defaultPointSize: CGFloat?) -> (
        value: UIFont, isItalic: Bool
    ) {
        let resolvedSize: CGFloat = {
            if let s = fragment.fontSize { return CGFloat(s) }
            if let current = defaultPointSize, current > 0 { return current }
            return 14.0
        }()
        let finalPointSize: CGFloat =
            allowFontScaling
            ? (resolvedSize * getScaleFactor(requestedSize: resolvedSize)) : resolvedSize
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

    func getScaleFactor(requestedSize: CGFloat) -> CGFloat {
        guard allowFontScaling else { return 1.0 }
        var multiplier: CGFloat
        if let style = dynamicTypeTextStyle {
            let metrics = UIFontMetrics(forTextStyle: style)
            let base = requestedSize > 0 ? requestedSize : baseSizeForDynamicType(style)
            multiplier = metrics.scaledValue(for: base) / base
        } else {
            // Exact RN behavior: use environment font size multiplier mapping (RCTFontSizeMultiplier)
            multiplier = rnFontSizeMultiplier()
        }
        if let max = maxFontSizeMultiplier, max >= 1.0 {
            multiplier = min(multiplier, CGFloat(max))
        }
        return multiplier
    }

    private func baseSizeForDynamicType(_ style: UIFont.TextStyle) -> CGFloat {
        switch style {
        case .caption2: return 11.0
        case .caption1: return 12.0
        case .footnote: return 13.0
        case .subheadline: return 15.0
        case .callout: return 16.0
        case .body: return 17.0
        case .headline: return 17.0
        case .title3: return 20.0
        case .title2: return 22.0
        case .title1: return 28.0
        case .largeTitle: return 34.0
        default: return 17.0
        }
    }

    private func rnFontSizeMultiplier() -> CGFloat {
        // Mirror RCTFontSizeMultiplier() mapping exactly
        let category = UIApplication.shared.preferredContentSizeCategory
        switch category {
        case .extraSmall: return 0.823
        case .small: return 0.882
        case .medium: return 0.941
        case .large: return 1.0
        case .extraLarge: return 1.118
        case .extraExtraLarge: return 1.235
        case .extraExtraExtraLarge: return 1.353
        case .accessibilityMedium: return 1.786
        case .accessibilityLarge: return 2.143
        case .accessibilityExtraLarge: return 2.643
        case .accessibilityExtraExtraLarge: return 3.143
        case .accessibilityExtraExtraExtraLarge: return 3.571
        default: return 1.0
        }
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
