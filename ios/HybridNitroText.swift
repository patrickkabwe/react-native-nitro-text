//
//  HybridNitroText.swift
//  Pods
//
//  Created by Patrick Kabwe on 9/1/2025.
//

import Foundation
import UIKit

class HybridNitroText : HybridNitroTextSpec, NitroTextViewDelegate {
    private let textView = NitroTextView()
    var view: UIView { textView }
    let nitroTextImpl: NitroTextImpl
    private var needsApply = false
    
    override init() {
        self.nitroTextImpl = NitroTextImpl(textView)
        super.init()
    }
    
    func onNitroTextMeasured(height: Double) {
        onSelectableTextMeasured?(height)
    }
    
    // Props
    
    var fragments: [Fragment]? { didSet { markNeedsApply() } }
    
    var selectable: Bool? {
        didSet {
            nitroTextImpl.setSelectable(selectable)
        }
    }
    
    var allowFontScaling: Bool? {
        didSet {
            nitroTextImpl.setAllowFontScaling(allowFontScaling)
            markNeedsApply()
        }
    }
    
    var onSelectableTextMeasured: ((Double) -> Void)? {
        didSet {
            if onSelectableTextMeasured == nil {
                textView.nitroTextDelegate = nil
                return
            }
            textView.nitroTextDelegate = self
        }
    }
    
    var fontSize: Double? { didSet { markNeedsApply() } }
    
    var fontWeight: FontWeight? { didSet { markNeedsApply() } }
    
    var fontColor: String? {
        didSet {
            textView.textColor = ColorParser.parse(fontColor)
            markNeedsApply()
        }
    }
    
    var fontStyle: FontStyle? { didSet { markNeedsApply() } }

    var textAlign: TextAlign? { didSet { nitroTextImpl.setTextAlign(textAlign); markNeedsApply() } }

    var textTransform: TextTransform? { didSet { nitroTextImpl.setTextTransform(textTransform); markNeedsApply() } }
    
    var lineHeight: Double? { didSet { markNeedsApply() } }
    
    var letterSpacing: Double? { didSet { markNeedsApply() } }
    
    var text: String? { didSet { markNeedsApply() } }
    
    var numberOfLines: Double? {
        didSet {
            nitroTextImpl.setNumberOfLines(numberOfLines)
        }
    }
    
    var ellipsizeMode: EllipsizeMode? {
        didSet {
            nitroTextImpl.setEllipsizeMode(ellipsizeMode)
        }
    }
        
    // Merge per-fragment props with top-level fallbacks and apply (delegated to NitroTextImpl)
    private func applyFragmentsAndProps() {
        let top = NitroTextImpl.FragmentTopDefaults(
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontColor: fontColor,
            fontStyle: fontStyle,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing,
            textAlign: textAlign,
            textTransform: textTransform
        )
        nitroTextImpl.apply(fragments: fragments, text: text, top: top)
    }
    
    private func markNeedsApply() { needsApply = true }
    
    func afterUpdate() {
        if needsApply {
            applyFragmentsAndProps()
            needsApply = false
        }
        textView.setNeedsLayout()
    }
}
