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
    
    override init() {
        self.nitroTextImpl = NitroTextImpl(textView)
        super.init()
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
            nitroTextImpl.setSelectable(selectable)
        }
    }
    
    var allowFontScaling: Bool? {
        didSet {
            nitroTextImpl.setAllowFontScaling(allowFontScaling)
            applyFragmentsAndProps()
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
            textView.textColor = ColorParser.parse(fontColor)
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
            nitroTextImpl.setTextAlign(textAlign)
        }
    }

    var textTransform: TextTransform? {
        didSet {
            nitroTextImpl.setTextTransform(textTransform)
        }
    }
    
    var lineHeight: Double? {
        didSet {
            applyFragmentsAndProps()
        }
    }
    
    var letterSpacing: Double? {
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
    
    func afterUpdate() {
        textView.setNeedsLayout()
    }
}
