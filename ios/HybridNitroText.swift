//
//  HybridNitroText.swift
//  Pods
//
//  Created by Patrick Kabwe on 9/1/2025.
//

import Foundation
import UIKit

class HybridNitroText : HybridNitroTextSpec, NitroTextViewDelegate {
    var view: UIView = NitroTextView()
    var nitroTextImpl: NitroTextImpl?
    
    override init() {
        nitroTextImpl = NitroTextImpl(view as! NitroTextView)
    }
    
    func onNitroTextMeasured(height: Double) {
        onSelectableTextMeasured?(height)
    }
    
    // Props
    
    var fragments: [Fragment]? {
        didSet {
            applyFragmentsAndProps()
        }
    }
    
    var selectable: Bool? {
        didSet {
            nitroTextImpl?.setSelectable(selectable)
        }
    }
    
    var onSelectableTextMeasured: ((Double) -> Void)? {
        didSet {
            if onSelectableTextMeasured == nil {
                (view as! NitroTextView).nitroTextDelegate = nil
                return
            }
            (view as! NitroTextView).nitroTextDelegate = self
        }
    }
    
    var fontSize: Double? {
        didSet {
            applyFragmentsAndProps()
        }
    }
    
    var fontWeight: FontWeight? {
        didSet {
            applyFragmentsAndProps()
        }
    }
    
    var fontColor: String? {
        didSet {
            (view as! NitroTextView).textColor = ColorParser.parse(fontColor)
            applyFragmentsAndProps()
        }
    }
    
    var fontStyle: FontStyle? {
        didSet {
            applyFragmentsAndProps()
        }
    }

    var textAlign: TextAlign? {
        didSet {
            nitroTextImpl?.setTextAlign(textAlign)
            applyFragmentsAndProps()
        }
    }

    var textTransform: TextTransform? {
        didSet {
            nitroTextImpl?.setTextTransform(textTransform)
            applyFragmentsAndProps()
        }
    }
    
    var lineHeight: Double? {
        didSet {
            applyFragmentsAndProps()
        }
    }
    
    var text: String? {
        didSet {
            applyFragmentsAndProps()
        }
    }
    
    var numberOfLines: Double? {
        didSet {
            nitroTextImpl?.setNumberOfLines(numberOfLines)
        }
    }
    
    var ellipsizeMode: EllipsizeMode? {
        didSet {
            nitroTextImpl?.setEllipsizeMode(ellipsizeMode)
            applyFragmentsAndProps()
        }
    }
        
    // Merge per-fragment props with top-level fallbacks and apply to NitroTextImpl
    private func applyFragmentsAndProps() {
        guard let nitroTextImpl else { return }
        
        // If there are no per-fragment entries, but we have `text`, build a single fragment
        guard let source = fragments, !source.isEmpty else {
            if let t = text {
                let single = Fragment(
                    fontSize: fontSize,
                    fontWeight: fontWeight,
                    fontColor: fontColor,
                    fontStyle: fontStyle,
                    lineHeight: lineHeight,
                    text: t,
                    numberOfLines: numberOfLines,
                    textAlign: textAlign,
                    textTransform: textTransform
                )
                nitroTextImpl.setFragments([single])
            } else {
                nitroTextImpl.setFragments(nil)
            }
            return
        }
        
        var merged: [Fragment] = []
        merged.reserveCapacity(source.count)
        
        for var frag in source {
            if frag.text == nil {
                frag.text = ""
            }
            if frag.fontSize == nil, let top = fontSize {
                frag.fontSize = top
            }
            if frag.fontWeight == nil, let top = fontWeight {
                frag.fontWeight = top
            }
            if frag.fontStyle == nil, let top = fontStyle  {
                frag.fontStyle = top
            }
            if frag.lineHeight == nil, let top = lineHeight, top > 0 {
                frag.lineHeight = top
            }

            if frag.fontColor == nil, let top = fontColor, !top.isEmpty {
                frag.fontColor = top
            }
            if frag.textAlign == nil, let ta = textAlign { frag.textAlign = ta }
            if frag.textTransform == nil, let tt = textTransform { frag.textTransform = tt }
                        
            merged.append(frag)
        }
        
        nitroTextImpl.setFragments(merged)
    }
    
    func afterUpdate() {
        view.setNeedsLayout()
    }
}
