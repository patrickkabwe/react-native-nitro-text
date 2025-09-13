//
//  HybridNitroText.swift
//  Pods
//
//  Created by Patrick Kabwe on 9/1/2025.
//

import Foundation
import UIKit

class HybridNitroText: HybridNitroTextSpec, NitroTextViewDelegate {
    private let textView = NitroTextView()
    var view: UIView { textView }
    let nitroTextImpl: NitroTextImpl

    override init() {
        self.nitroTextImpl = NitroTextImpl(textView)
        super.init()
        self.textView.nitroTextDelegate = self
    }

    func onNitroTextLayout(_ layout: TextLayoutEvent) {
        onTextLayout?(layout)
    }

    func onNitroTextPressIn() { onPressIn?() }
    func onNitroTextPressOut() { onPressOut?() }
    func onNitroTextPress() { onPress?() }

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

    var onTextLayout: ((TextLayoutEvent) -> Void)? = nil
    var onPress: (() -> Void)? = nil
    var onPressIn: (() -> Void)? = nil
    var onPressOut: (() -> Void)? = nil

    var fontSize: Double? {
        didSet {
            nitroTextImpl.setFontSize(fontSize)
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

    var fragmentBackgroundColor: String? {
        didSet {
            applyFragmentsAndProps()
        }
    }

    var fontStyle: FontStyle? {
        didSet {
            applyFragmentsAndProps()
        }
    }
    
    var fontFamily: String? {
        didSet {
            nitroTextImpl.setFontFamily(fontFamily)
            applyFragmentsAndProps()
        }
    }

    var textAlign: TextAlign? {
        didSet {
            nitroTextImpl.setTextAlign(textAlign)
            applyFragmentsAndProps()
        }
    }

    var textTransform: TextTransform? {
        didSet {
            nitroTextImpl.setTextTransform(textTransform)
            applyFragmentsAndProps()
        }
    }

    var textDecorationLine: TextDecorationLine? {
        didSet {
            applyFragmentsAndProps()
        }
    }

    var textDecorationColor: String? {
        didSet {
            applyFragmentsAndProps()
        }
    }

    var textDecorationStyle: TextDecorationStyle? {
        didSet {
            applyFragmentsAndProps()
        }
    }

    var selectionColor: String? {
        didSet {
            if let v = selectionColor, let c = ColorParser.parse(v) {
                textView.tintColor = c
            }
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

    var dynamicTypeRamp: DynamicTypeRamp? {
        didSet {
            nitroTextImpl.setDynamicTypeRamp(dynamicTypeRamp)
            applyFragmentsAndProps()
        }
    }

    var lineBreakStrategyIOS: LineBreakStrategyIOS? {
        didSet {
            nitroTextImpl.setLineBreakStrategyIOS(lineBreakStrategyIOS)
            applyFragmentsAndProps()
        }
    }

    var maxFontSizeMultiplier: Double? {
        didSet {
            nitroTextImpl.setMaxFontSizeMultiplier(maxFontSizeMultiplier)
            applyFragmentsAndProps()
        }
    }

    var adjustsFontSizeToFit: Bool? {
        didSet {
            nitroTextImpl.setAdjustsFontSizeToFit(adjustsFontSizeToFit)
            applyFragmentsAndProps()
        }
    }

    var minimumFontScale: Double? {
        didSet {
            nitroTextImpl.setMinimumFontScale(minimumFontScale)
            applyFragmentsAndProps()
        }
    }

    // Merge per-fragment props with top-level fallbacks and apply (delegated to NitroTextImpl)
    private func applyFragmentsAndProps() {
        let top = NitroTextImpl.FragmentTopDefaults(
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontColor: fontColor,
            fontStyle: fontStyle,
            fontFamily: fontFamily,
            lineHeight: lineHeight,
            letterSpacing: letterSpacing,
            textAlign: textAlign,
            textTransform: textTransform,
            textDecorationLine: textDecorationLine,
            textDecorationColor: textDecorationColor,
            textDecorationStyle: textDecorationStyle,
            selectionColor: selectionColor
        )
        nitroTextImpl.apply(fragments: fragments, text: text, top: top)
    }

    func afterUpdate() {
        textView.setNeedsLayout()
    }
}
