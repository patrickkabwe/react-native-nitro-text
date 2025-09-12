//
//  NitroTextImpl+Fragment.swift
//  Pods
//
//  Extracted helpers for fragment/default merging and font mapping.
//

import UIKit

extension NitroTextImpl {
    struct FragmentTopDefaults {
        let fontSize: Double?
        let fontWeight: FontWeight?
        let fontColor: String?
        let fontStyle: FontStyle?
        let lineHeight: Double?
        let letterSpacing: Double?
        let textAlign: TextAlign?
        let textTransform: TextTransform?
        let textDecorationLine: TextDecorationLine?
        let textDecorationColor: String?
        let textDecorationStyle: TextDecorationStyle?
    }

    func apply(fragments: [Fragment]?, text: String?, top: FragmentTopDefaults) {
        // Fast path: no fragments, but we have plain text
        guard let fragments, !fragments.isEmpty else {
            if let t = text {
                let single = Fragment(
                    text: t,
                    fontSize: top.fontSize,
                    fontWeight: top.fontWeight,
                    fontColor: top.fontColor,
                    fragmentBackgroundColor: nil,
                    fontStyle: top.fontStyle,
                    lineHeight: top.lineHeight,
                    letterSpacing: top.letterSpacing,
                    numberOfLines: nil,
                    textAlign: top.textAlign,
                    textTransform: top.textTransform,
                    textDecorationLine: top.textDecorationLine,
                    textDecorationColor: top.textDecorationColor,
                    textDecorationStyle: top.textDecorationStyle
                )
                setFragments([single])
            } else {
                setFragments(nil)
            }
            return
        }

        var merged: [Fragment] = []
        merged.reserveCapacity(fragments.count)

        for var frag in fragments {
            if frag.text == nil { frag.text = "" }
            if frag.fontSize == nil, let v = top.fontSize { frag.fontSize = v }
            if frag.fontWeight == nil, let v = top.fontWeight { frag.fontWeight = v }
            if frag.fontStyle == nil, let v = top.fontStyle { frag.fontStyle = v }
            if frag.lineHeight == nil, let v = top.lineHeight, v > 0 { frag.lineHeight = v }
            if frag.letterSpacing == nil, let v = top.letterSpacing { frag.letterSpacing = v }
            if frag.fontColor == nil, let v = top.fontColor, !v.isEmpty { frag.fontColor = v }
            if frag.textAlign == nil, let v = top.textAlign { frag.textAlign = v }
            if frag.textTransform == nil, let v = top.textTransform { frag.textTransform = v }
            if frag.textDecorationLine == nil, let v = top.textDecorationLine { frag.textDecorationLine = v }
            if frag.textDecorationColor == nil, let v = top.textDecorationColor, !v.isEmpty { frag.textDecorationColor = v }
            if frag.textDecorationStyle == nil, let v = top.textDecorationStyle { frag.textDecorationStyle = v }
            merged.append(frag)
        }
        setFragments(merged)
    }

}
