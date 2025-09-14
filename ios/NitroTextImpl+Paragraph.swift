//
//  NitroTextImpl+Paragraph.swift
//  Pods
//
//  Created by Patrick Kabwe on 14/09/2025.
//

import UIKit

struct ParagraphKey: Hashable {
    let lineHeight: CGFloat
    let alignmentRaw: Int
    let strategyRaw: UInt
}

extension NitroTextImpl {
    
    func makeParagraphStyle(for fragment: Fragment) -> NSParagraphStyle {
        let textAlignment: NSTextAlignment = {
            if let align = fragment.textAlign {
                switch align {
                case .center: return .center
                case .right: return .right
                case .justify: return .justified
                case .left: return .left
                case .auto: return .natural
                }
            }
            return currentTextAlignment
        }()

        var _lineHeight: CGFloat = 0
        if let lineHeight = fragment.lineHeight, lineHeight > 0 {
            let baseSize: CGFloat = fragment.fontSize.map({ CGFloat($0) })
                ?? nitroTextView?.font?.pointSize
                ?? 14.0
            let scale = allowFontScaling ? getScaleFactor(requestedSize: baseSize) : 1.0
            _lineHeight = CGFloat(lineHeight) * scale
        }

        let strategyRaw: UInt = {
            if #available(iOS 14.0, *) {
                return currentLineBreakStrategy.rawValue
            }
            return 0
        }()

        let key = ParagraphKey(
            lineHeight: _lineHeight,
            alignmentRaw: Int(textAlignment.rawValue),
            strategyRaw: strategyRaw
        )
        if let cached = paragraphStyleCache[key] { return cached }

        let para = NSMutableParagraphStyle()
        if _lineHeight > 0 {
            para.minimumLineHeight = _lineHeight
            para.maximumLineHeight = _lineHeight
        }
        para.alignment = textAlignment
        if #available(iOS 14.0, *) {
            para.lineBreakStrategy = currentLineBreakStrategy
        }

        let immutable = para.copy() as! NSParagraphStyle
        paragraphStyleCache[key] = immutable
        return immutable
    }
}
