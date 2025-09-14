//
//  NitroTextImpl+Attributes.swift
//  Pods
//
//  Attribute-building helpers for NitroTextImpl (colors, paragraph style, transforms).
//

import UIKit

extension NitroTextImpl {
    func makeAttributes(
        for fragment: Fragment,
        defaultColor: UIColor
    ) -> [NSAttributedString.Key: Any] {
        var attrs: [NSAttributedString.Key: Any] = Dictionary(minimumCapacity: 8)

        let font = makeFont(for: fragment, defaultPointSize: nitroTextView?.font?.pointSize)
        attrs[.font] = font.value
        if font.isItalic { attrs[.obliqueness] = 0.2 }

        let para = makeParagraphStyle(for: fragment)
        attrs[.paragraphStyle] = para

        let color = resolveColor(for: fragment, defaultColor: defaultColor)
        attrs[.foregroundColor] = color

        // Background highlight per-fragment (to match RN Text backgroundColor on runs)
        if let bgColorString = fragment.fragmentBackgroundColor, let bgParsed = ColorParser.parse(bgColorString) {
            attrs[.backgroundColor] = bgParsed
        }

        if let spacing = fragment.letterSpacing {
            attrs[.kern] = spacing
        }

        // Underline / Strikethrough from textDecorationLine
        if let deco = fragment.textDecorationLine {
            let styleRaw = nsUnderlineStyle(from: fragment.textDecorationStyle)
            switch deco {
            case .underline:
                attrs[.underlineStyle] = styleRaw
            case .lineThrough:
                attrs[.strikethroughStyle] = styleRaw
            case .underlineLineThrough:
                attrs[.underlineStyle] = styleRaw
                attrs[.strikethroughStyle] = styleRaw
            case .none:
                break
            }
        }

        // Decoration color (applies to underline/strikethrough if present)
        if let decoColor = fragment.textDecorationColor, let parsed = ColorParser.parse(decoColor) {
            attrs[.underlineColor] = parsed
            attrs[.strikethroughColor] = parsed
        }

        return attrs
    }
    
    func resolveColor(for fragment: Fragment, defaultColor: UIColor) -> UIColor {
        if let value = fragment.fontColor, let parsed = ColorParser.parse(value) {
            return parsed
        }
        return defaultColor
    }

    private func nsUnderlineStyle(from style: TextDecorationStyle?) -> Int {
        guard let style else { return NSUnderlineStyle.single.rawValue }
        switch style {
        case .solid:
            return NSUnderlineStyle.single.rawValue
        case .double:
            return NSUnderlineStyle.double.rawValue
        case .dotted:
            return NSUnderlineStyle.patternDot.rawValue | NSUnderlineStyle.single.rawValue
        case .dashed:
            return NSUnderlineStyle.patternDash.rawValue | NSUnderlineStyle.single.rawValue
        }
    }

    func transform(_ text: String, with fragment: Fragment) -> String {
        let textTransform: TextTransform = {
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

        switch textTransform {
        case .uppercase: return text.uppercased()
        case .lowercase: return text.lowercased()
        case .capitalize: return text.capitalized
        case .none: return text
        }
    }
}
