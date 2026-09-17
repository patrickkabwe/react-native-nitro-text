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

        for fragment in fragments {
            merged.append(mergingTop(fragment, with: top))
        }
        setFragments(merged)
    }
    
    // MARK: - Private Merge Helpers
    
    private func mergingTop(_ fragment: Fragment, with top: FragmentTopDefaults) -> Fragment {
        return Fragment(
            text: fragment.text ?? "",
            selectionColor: fragment.selectionColor ?? nonEmpty(top.selectionColor),
            fontSize: fragment.fontSize ?? top.fontSize,
            fontWeight: fragment.fontWeight ?? top.fontWeight,
            fontColor: fragment.fontColor ?? nonEmpty(top.fontColor),
            fragmentBackgroundColor: fragment.fragmentBackgroundColor,
            fontStyle: fragment.fontStyle ?? top.fontStyle,
            fontFamily: fragment.fontFamily ?? nonEmpty(top.fontFamily),
            lineHeight: fragment.lineHeight ?? positive(top.lineHeight),
            letterSpacing: fragment.letterSpacing ?? top.letterSpacing,
            textAlign: fragment.textAlign ?? top.textAlign,
            textTransform: fragment.textTransform ?? top.textTransform,
            textDecorationLine: fragment.textDecorationLine ?? top.textDecorationLine,
            textDecorationColor: fragment.textDecorationColor ?? nonEmpty(top.textDecorationColor),
            textDecorationStyle: fragment.textDecorationStyle ?? top.textDecorationStyle,
            linkUrl: fragment.linkUrl
        )
    }

    private func nonEmpty(_ value: String?) -> String? {
        guard let value, !value.isEmpty else { return nil }
        return value
    }

    private func positive(_ value: Double?) -> Double? {
        guard let value, value > 0 else { return nil }
        return value
    }
}
