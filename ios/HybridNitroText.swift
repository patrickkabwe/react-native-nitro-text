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
    private var needsApply: Bool = false

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
        didSet { markNeedsApply() }
    }

    var renderer: NitroTextRenderer? {
        didSet { markNeedsApply() }
    }

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

    var onTextLayout: ((TextLayoutEvent) -> Void)? = nil
    var onPress: (() -> Void)? = nil
    var onPressIn: (() -> Void)? = nil
    var onPressOut: (() -> Void)? = nil

    var fontSize: Double? {
        didSet {
            nitroTextImpl.setFontSize(fontSize)
            markNeedsApply()
        }
    }

    var fontWeight: FontWeight? {
        didSet { markNeedsApply() }
    }

    var fontColor: String? {
        didSet {
            textView.textColor = ColorParser.parse(fontColor)
            markNeedsApply()
        }
    }

    var fragmentBackgroundColor: String? {
        didSet { markNeedsApply() }
    }

    var fontStyle: FontStyle? {
        didSet { markNeedsApply() }
    }
    
    var fontFamily: String? {
        didSet {
            nitroTextImpl.setFontFamily(fontFamily)
            markNeedsApply()
        }
    }

    var textAlign: TextAlign? {
        didSet {
            nitroTextImpl.setTextAlign(textAlign)
            markNeedsApply()
        }
    }

    var textTransform: TextTransform? {
        didSet {
            nitroTextImpl.setTextTransform(textTransform)
            markNeedsApply()
        }
    }

    var textDecorationLine: TextDecorationLine? {
        didSet { markNeedsApply() }
    }

    var textDecorationColor: String? {
        didSet { markNeedsApply() }
    }

    var textDecorationStyle: TextDecorationStyle? {
        didSet { markNeedsApply() }
    }

    var selectionColor: String? {
        didSet {
            if let v = selectionColor, let color = ColorParser.parse(v) {
                textView.tintColor = color
            }
        }
    }

    var lineHeight: Double? {
        didSet { markNeedsApply() }
    }

    var letterSpacing: Double? {
        didSet { markNeedsApply() }
    }

    var text: String? {
        didSet { markNeedsApply() }
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
            markNeedsApply()
        }
    }

    var lineBreakStrategyIOS: LineBreakStrategyIOS? {
        didSet {
            nitroTextImpl.setLineBreakStrategyIOS(lineBreakStrategyIOS)
            markNeedsApply()
        }
    }

    var maxFontSizeMultiplier: Double? {
        didSet {
            nitroTextImpl.setMaxFontSizeMultiplier(maxFontSizeMultiplier)
            markNeedsApply()
        }
    }

    var adjustsFontSizeToFit: Bool? {
        didSet {
            nitroTextImpl.setAdjustsFontSizeToFit(adjustsFontSizeToFit)
            markNeedsApply()
        }
    }

    var minimumFontScale: Double? {
        didSet {
            nitroTextImpl.setMinimumFontScale(minimumFontScale)
            markNeedsApply()
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
        nitroTextImpl.apply(
            fragments: fragments,
            text: text,
            renderer: renderer,
            top: top
        )
    }

    func afterUpdate() {
        if needsApply {
            applyFragmentsAndProps()
            needsApply = false
        }
        textView.setNeedsLayout()
    }

    private func markNeedsApply() { needsApply = true }
}
