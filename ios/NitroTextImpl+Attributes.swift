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
            let scaledLH: CGFloat = {
                guard allowFontScaling else { return CGFloat(rawLH) }
                // Use the same multiplier RN uses for the current run
                let baseSize: CGFloat = {
                    if let fs = fragment.fontSize { return CGFloat(fs) }
                    return nitroTextView?.font?.pointSize ?? CGFloat(14.0)
                }()
                let factor = effectiveScaleFactor(requestedSize: baseSize)
                return CGFloat(rawLH) * factor
            }()
            let fontLineHeight = font.value.lineHeight
            if scaledLH >= fontLineHeight {
                let baseline = (scaledLH - fontLineHeight) / 2.0
                attrs[.baselineOffset] = baseline
            }
        }

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
            switch deco {
            case .underline:
                attrs[.underlineStyle] = nsUnderlineStyle(from: fragment.textDecorationStyle)
            case .lineThrough:
                attrs[.strikethroughStyle] = nsUnderlineStyle(from: fragment.textDecorationStyle)
            case .underlineLineThrough:
                attrs[.underlineStyle] = nsUnderlineStyle(from: fragment.textDecorationStyle)
                attrs[.strikethroughStyle] = nsUnderlineStyle(from: fragment.textDecorationStyle)
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

    func makeParagraphStyle(for fragment: Fragment) -> NSMutableParagraphStyle {
        let para = NSMutableParagraphStyle()

        if let lineHeight = fragment.lineHeight, lineHeight > 0 {
            let baseSize: CGFloat = {
                if let fs = fragment.fontSize { return CGFloat(fs) }
                return nitroTextView?.font?.pointSize ?? CGFloat(14.0)
            }()
            let m = allowFontScaling ? effectiveScaleFactor(requestedSize: baseSize) : 1.0
            let lh = CGFloat(lineHeight) * m
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
            para.lineBreakMode = getLineBreakMode(forLines: n)
        }
        if #available(iOS 14.0, *), let _ = nitroTextView {
            para.lineBreakStrategy = currentLineBreakStrategy
        }
        return para
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
