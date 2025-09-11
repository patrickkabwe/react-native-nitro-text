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
        var attrs: [NSAttributedString.Key: Any] = [:]

        let font = makeFont(for: fragment, defaultPointSize: nitroTextView?.font?.pointSize)
        attrs[.font] = font.value
        if font.isItalic { attrs[.obliqueness] = 0.2 }

        let para = makeParagraphStyle(for: fragment)
        attrs[.paragraphStyle] = para

        // Match RN iOS behavior: When a custom lineHeight is provided and is
        // larger than the font's natural lineHeight, vertically center the
        // glyphs within the line by applying a baseline offset.
        if let rawLH = fragment.lineHeight, rawLH > 0 {
            let scaledLH = allowFontScaling ? UIFontMetrics.default.scaledValue(for: CGFloat(rawLH)) : CGFloat(rawLH)
            let fontLineHeight = font.value.lineHeight
            if scaledLH >= fontLineHeight {
                let baseline = (scaledLH - fontLineHeight) / 2.0
                attrs[.baselineOffset] = baseline
            }
        }

        let color = resolveColor(for: fragment, defaultColor: defaultColor)
        attrs[.foregroundColor] = color

        return attrs
    }

    func makeParagraphStyle(for fragment: Fragment) -> NSMutableParagraphStyle {
        let para = NSMutableParagraphStyle()

        if let lineHeight = fragment.lineHeight, lineHeight > 0 {
            let lh = allowFontScaling ? UIFontMetrics.default.scaledValue(for: CGFloat(lineHeight)) : CGFloat(lineHeight)
            para.minimumLineHeight = lh
            para.maximumLineHeight = lh
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

        if let n = nitroTextView?.textContainer.maximumNumberOfLines {
            para.lineBreakMode = effectiveLineBreakMode(forLines: n)
        }
        return para
    }

    func resolveColor(for fragment: Fragment, defaultColor: UIColor) -> UIColor {
        if let value = fragment.fontColor, let parsed = ColorParser.parse(value) {
            return parsed
        }
        return defaultColor
    }

    func transform(_ text: String, with fragment: Fragment) -> String {
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
