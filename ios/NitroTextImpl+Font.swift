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
    let family: String?
}

extension NitroTextImpl {
    private static let defaultFontFamily = UIFont.systemFont(ofSize: 14).familyName

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
        
        let hasExplicitWeight = fragment.fontWeight != nil
        let hasExplicitStyle = fragment.fontStyle != nil
        var isItalic = fragment.fontStyle == FontStyle.italic
        let requestedFamily = fragment.fontFamily ?? currentFontFamily
        let resolvedFamily: String = {
            if let family = requestedFamily, !family.isEmpty { return family }
            return Self.defaultFontFamily
        }()
        
        let key = FontKey(size: finalPointSize, weightRaw: uiWeight.rawValue, italic: isItalic, family: resolvedFamily)
        if let cached = fontCache[key] {
            return (cached, isItalic)
        }

        var targetWeight = uiWeight
        var familyName = resolvedFamily
        let normalizedFamilyName = familyName.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        let isSystemCondensed = normalizedFamilyName == "systemcondensed"
        let isSystemFamily =
            familyName == Self.defaultFontFamily
            || normalizedFamilyName == "system-ui"
            || normalizedFamilyName == "system"
            || isSystemCondensed
        var isCondensed = isSystemCondensed
        var didFindFont = false
        var base: UIFont? = nil

        let systemDesign: UIFontDescriptor.SystemDesign? = {
            switch normalizedFamilyName {
            case "system-ui", "system":
                return nil
            case "ui-serif":
                return .serif
            case "ui-rounded":
                return .rounded
            case "ui-monospace":
                return .monospaced
            case "systemcondensed":
                return .default
            default:
                return nil
            }
        }()

        if isSystemFamily || systemDesign != nil
        {
            base = UIFont.systemFont(ofSize: finalPointSize, weight: targetWeight)
            didFindFont = true

            var descriptor = base?.fontDescriptor
            if let design = systemDesign {
                descriptor = descriptor?.withDesign(design)
            }
            if isItalic || isCondensed {
                var traits = descriptor?.symbolicTraits ?? []
                if isItalic { traits.insert(.traitItalic) }
                if isCondensed { traits.insert(.traitCondensed) }
                descriptor = descriptor?.withSymbolicTraits(traits)
            }
            if let descriptor = descriptor {
                base = UIFont(descriptor: descriptor, size: finalPointSize)
            }
        }

        var fontsInFamily = UIFont.fontNames(forFamilyName: familyName)

        // Gracefully handle being given a font name rather than a family name
        if !didFindFont && fontsInFamily.isEmpty {
            if let named = UIFont(name: familyName, size: finalPointSize) {
                base = named
                familyName = named.familyName
                fontsInFamily = UIFont.fontNames(forFamilyName: familyName)
                if !hasExplicitWeight { targetWeight = Self.fontWeight(from: named) }
                if !hasExplicitStyle { isItalic = Self.isItalicFont(named) }
                isCondensed = Self.isCondensedFont(named)
            } else {
                base = UIFont.systemFont(ofSize: finalPointSize, weight: targetWeight)
            }
        }

        // Find closest weight match within the family respecting italic/condensed traits
        if !didFindFont {
            var closestWeight = CGFloat.infinity
            for name in fontsInFamily {
                guard let match = UIFont(name: name, size: finalPointSize) else { continue }
                if isItalic == Self.isItalicFont(match) && isCondensed == Self.isCondensedFont(match) {
                    let testWeight = Self.fontWeight(from: match)
                    if abs(testWeight.rawValue - targetWeight.rawValue) < abs(closestWeight - targetWeight.rawValue) {
                        base = match
                        closestWeight = testWeight.rawValue
                    }
                }
            }
        }

        // If no exact match, pick the first font from the family
        if base == nil, let first = fontsInFamily.first {
            base = UIFont(name: first, size: finalPointSize)
        }

        let finalFont = base ?? UIFont.systemFont(ofSize: finalPointSize, weight: targetWeight)
        fontCache[key] = finalFont
        return (finalFont, isItalic)
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

    private static func fontWeight(from font: UIFont) -> UIFont.Weight {
        let suffixes: [(String, UIFont.Weight)] = [
            ("normal", .regular),
            ("ultralight", .ultraLight),
            ("thin", .thin),
            ("light", .light),
            ("regular", .regular),
            ("medium", .medium),
            ("semibold", .semibold),
            ("demibold", .semibold),
            ("extrabold", .heavy),
            ("ultrabold", .heavy),
            ("bold", .bold),
            ("heavy", .heavy),
            ("black", .black)
        ]

        let name = font.fontName.lowercased()
        if let match = suffixes.first(where: { name.hasSuffix($0.0) }) {
            return match.1
        }

        if let traits = font.fontDescriptor.object(forKey: .traits) as? [UIFontDescriptor.TraitKey: Any],
           let raw = traits[.weight] as? NSNumber {
            return UIFont.Weight(rawValue: CGFloat(truncating: raw))
        }
        return .regular
    }

    private static func isItalicFont(_ font: UIFont) -> Bool {
        font.fontDescriptor.symbolicTraits.contains(.traitItalic)
    }

    private static func isCondensedFont(_ font: UIFont) -> Bool {
        font.fontDescriptor.symbolicTraits.contains(.traitCondensed)
    }
}
