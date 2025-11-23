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

        var hasApplicableValues: Bool {
            if fontSize != nil { return true }
            if fontWeight != nil { return true }
            if let fc = fontColor, !fc.isEmpty { return true }
            if fontStyle != nil { return true }
            if let ff = fontFamily, !ff.isEmpty { return true }
            if let lh = lineHeight, lh > 0 { return true }
            if letterSpacing != nil { return true }
            if textAlign != nil { return true }
            if textTransform != nil { return true }
            if textDecorationLine != nil { return true }
            if let tdc = textDecorationColor, !tdc.isEmpty { return true }
            if textDecorationStyle != nil { return true }
            if let sc = selectionColor, !sc.isEmpty { return true }
            
            return false
        }
    }

    func apply(fragments: [Fragment]?, text: String?, top: FragmentTopDefaults) {
        if let t = text, (fragments == nil || fragments!.isEmpty), !top.hasApplicableValues {
            nitroTextView?.text = t
            return
        }
        
        guard let fragments, !fragments.isEmpty else {
            if let t = text {
                let single = Fragment(
                    text: t,
                    selectionColor: top.selectionColor,
                    fontSize: top.fontSize,
                    fontWeight: top.fontWeight,
                    fontColor: top.fontColor,
                    fragmentBackgroundColor: nil,
                    fontStyle: top.fontStyle,
                    fontFamily: top.fontFamily,
                    lineHeight: top.lineHeight,
                    letterSpacing: top.letterSpacing,
                    textAlign: top.textAlign,
                    textTransform: top.textTransform,
                    textDecorationLine: top.textDecorationLine,
                    textDecorationColor: top.textDecorationColor,
                    textDecorationStyle: top.textDecorationStyle,
                    linkUrl: nil
                )
                setFragments([single])
            } else {
                setFragments(nil)
            }
            return
        }

        if !top.hasApplicableValues, fragments.allSatisfy({ $0.text != nil }) {
            setFragments(fragments)
            return
        }

        // Merge top-level defaults into each fragment
        var merged: [Fragment] = []
        merged.reserveCapacity(fragments.count)

        for var frag in fragments {
            mergeTop(into: &frag, with: top)
            merged.append(frag)
        }
        setFragments(merged)
    }
    
    // MARK: - Private Merge Helpers
    
    private func mergeTop(into frag: inout Fragment, with top: FragmentTopDefaults) {
        if frag.text == nil { frag.text = "" }

        if frag.fontSize == nil, let v = top.fontSize { frag.fontSize = v }
        if frag.fontWeight == nil, let v = top.fontWeight { frag.fontWeight = v }
        if frag.fontStyle == nil, let v = top.fontStyle { frag.fontStyle = v }
        if frag.letterSpacing == nil, let v = top.letterSpacing { frag.letterSpacing = v }
        if frag.textAlign == nil, let v = top.textAlign { frag.textAlign = v }
        if frag.textTransform == nil, let v = top.textTransform { frag.textTransform = v }
        if frag.textDecorationLine == nil, let v = top.textDecorationLine { frag.textDecorationLine = v }
        if frag.textDecorationStyle == nil, let v = top.textDecorationStyle { frag.textDecorationStyle = v }
        if frag.fontFamily == nil, let v = top.fontFamily, !v.isEmpty { frag.fontFamily = v }
        if frag.fontColor == nil, let v = top.fontColor, !v.isEmpty { frag.fontColor = v }
        if frag.selectionColor == nil, let v = top.selectionColor, !v.isEmpty { frag.selectionColor = v }
        if frag.textDecorationColor == nil, let v = top.textDecorationColor, !v.isEmpty { frag.textDecorationColor = v }
        if frag.lineHeight == nil, let v = top.lineHeight, v > 0 { frag.lineHeight = v }
    }
}
