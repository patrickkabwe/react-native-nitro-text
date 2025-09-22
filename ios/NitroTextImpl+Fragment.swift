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
        let fontFamily: String?
        let lineHeight: Double?
        let letterSpacing: Double?
        let textAlign: TextAlign?
        let textTransform: TextTransform?
        let textDecorationLine: TextDecorationLine?
        let textDecorationColor: String?
        let textDecorationStyle: TextDecorationStyle?
        let selectionColor: String?
    }

    func apply(
        fragments: [Fragment]?,
        text: String?,
        renderer: NitroTextRenderer?,
        top: FragmentTopDefaults
    ) {
        if renderer == .markdown, let markdownText = text {
            if applyMarkdown(markdownText, defaults: top) {
                return
            }
        }

        // Fast path: no fragments, but we have plain text
        guard let fragments, !fragments.isEmpty else {
            if let t = text {
                let single = top.makeFragment(withText: t)
                setFragments([single])
            } else {
                setFragments(nil)
            }
            return
        }

        if !hasApplicableTop(top), fragments.allSatisfy({ $0.text != nil }) {
            setFragments(fragments)
            return
        }

        var merged: [Fragment] = []
        merged.reserveCapacity(fragments.count)

        for var frag in fragments {
            mergeTop(into: &frag, with: top)
            merged.append(frag)
        }
        setFragments(merged)
    }

}

extension NitroTextImpl.FragmentTopDefaults {
    func makeFragment(withText text: String?) -> Fragment {
        Fragment(
            text: text,
            selectionColor: selectionColor,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontColor: fontColor,
            fragmentBackgroundColor: nil,
            fontStyle: fontStyle,
            fontFamily: fontFamily,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing,
            textAlign: textAlign,
            textTransform: textTransform,
            textDecorationLine: textDecorationLine,
            textDecorationColor: textDecorationColor,
            textDecorationStyle: textDecorationStyle
        )
    }
}

// MARK: - Merge helpers
private extension NitroTextImpl {
    @inline(__always)
    func hasApplicableTop(_ top: FragmentTopDefaults) -> Bool {
        if top.fontSize != nil { return true }
        if top.fontWeight != nil { return true }
        if let s = top.fontColor, !s.isEmpty { return true }
        if top.fontStyle != nil { return true }
        if let s = top.fontFamily, !s.isEmpty { return true }
        if let v = top.lineHeight, v > 0 { return true }
        if top.letterSpacing != nil { return true }
        if top.textAlign != nil { return true }
        if top.textTransform != nil { return true }
        if top.textDecorationLine != nil { return true }
        if let s = top.textDecorationColor, !s.isEmpty { return true }
        if top.textDecorationStyle != nil { return true }
        if let s = top.selectionColor, !s.isEmpty { return true }
        return false
    }

    @inline(__always)
    func mergeTop(into frag: inout Fragment, with top: FragmentTopDefaults) {
        if frag.text == nil { frag.text = "" }

        if frag.fontSize == nil, let v = top.fontSize { frag.fontSize = v }
        if frag.fontWeight == nil, let v = top.fontWeight { frag.fontWeight = v }
        if frag.fontStyle == nil, let v = top.fontStyle { frag.fontStyle = v }

        if frag.fontFamily == nil, let v = top.fontFamily, !v.isEmpty { frag.fontFamily = v }
        if frag.lineHeight == nil, let v = top.lineHeight, v > 0 { frag.lineHeight = v }
        if frag.letterSpacing == nil, let v = top.letterSpacing { frag.letterSpacing = v }

        if frag.fontColor == nil, let v = top.fontColor, !v.isEmpty { frag.fontColor = v }
        if frag.selectionColor == nil, let v = top.selectionColor, !v.isEmpty { frag.selectionColor = v }

        if frag.textAlign == nil, let v = top.textAlign { frag.textAlign = v }
        if frag.textTransform == nil, let v = top.textTransform { frag.textTransform = v }

        if frag.textDecorationLine == nil, let v = top.textDecorationLine { frag.textDecorationLine = v }
        if frag.textDecorationColor == nil, let v = top.textDecorationColor, !v.isEmpty { frag.textDecorationColor = v }
        if frag.textDecorationStyle == nil, let v = top.textDecorationStyle { frag.textDecorationStyle = v }
    }
}
