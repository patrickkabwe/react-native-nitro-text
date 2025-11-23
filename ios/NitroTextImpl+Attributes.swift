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
        if let bgColorString = fragment.fragmentBackgroundColor {
            if let bgParsed = parseColorCached(bgColorString) {
                attrs[.backgroundColor] = bgParsed
            }
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
        if let decoColor = fragment.textDecorationColor {
            if let parsed = parseColorCached(decoColor) {
                attrs[.underlineColor] = parsed
                attrs[.strikethroughColor] = parsed
            }
        }

        if let urlString = fragment.linkUrl, !urlString.isEmpty {
            if let url = URL(string: urlString) {
                attrs[.link] = url
            }

            if fragment.fontColor == nil {
                if let fontColorString = fragment.fontColor, !fontColorString.isEmpty {
                    if let customColor = parseColorCached(fontColorString) {
                        attrs[.foregroundColor] = customColor
                    } else {
                        attrs[.foregroundColor] = UIColor.systemBlue
                    }
                } else {
                    attrs[.foregroundColor] = UIColor.systemBlue
                }
            }
        }

        return attrs
    }
    
    func resolveColor(for fragment: Fragment, defaultColor: UIColor) -> UIColor {
        if let value = fragment.fontColor {
            return parseColorCached(value) ?? defaultColor
        }
        return defaultColor
    }
    
    func parseColorCached(_ colorString: String) -> UIColor? {
        if let cached = colorCache[colorString] {
            return cached
        }
        
        if let parsed = ColorParser.parse(colorString) {
            colorCache[colorString] = parsed
            return parsed
        }
        
        return nil
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
