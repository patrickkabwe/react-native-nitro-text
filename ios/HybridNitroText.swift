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
            nitroTextImpl.setFragments(fragments)
        }
    }

    var renderer: NitroRenderer? {
        didSet {
            nitroTextImpl.setRenderer(renderer)
        }
    }

    var richTextStyleRules: [RichTextStyleRule]? {
        didSet {
            nitroTextImpl.setRichTextStyleRules(richTextStyleRules)
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
        }
    }

    var onTextLayout: ((TextLayoutEvent) -> Void)? = nil
    var onPress: (() -> Void)? = nil
    var onPressIn: (() -> Void)? = nil
    var onPressOut: (() -> Void)? = nil

    var fontSize: Double? {
        didSet {
            nitroTextImpl.setFontSize(fontSize)
        }
    }

    var fontWeight: FontWeight? {
        didSet { nitroTextImpl.setFontWeight(fontWeight) }
    }

    var fontColor: String? {
        didSet { nitroTextImpl.setFontColor(fontColor) }
    }

    var fragmentBackgroundColor: String? {
        didSet { nitroTextImpl.setFragmentBackgroundColor(fragmentBackgroundColor) }
    }

    var fontStyle: FontStyle? {
        didSet { nitroTextImpl.setFontStyle(fontStyle) }
    }

    var fontFamily: String? {
        didSet {
            nitroTextImpl.setFontFamily(fontFamily)
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

    var textDecorationLine: TextDecorationLine? {
        didSet { nitroTextImpl.setTextDecorationLine(textDecorationLine) }
    }

    var textDecorationColor: String? {
        didSet { nitroTextImpl.setTextDecorationColor(textDecorationColor) }
    }

    var textDecorationStyle: TextDecorationStyle? {
        didSet { nitroTextImpl.setTextDecorationStyle(textDecorationStyle) }
    }

    var selectionColor: String? {
        didSet {
            nitroTextImpl.setSelectionColor(selectionColor)
        }
    }

    var lineHeight: Double? {
        didSet { nitroTextImpl.setLineHeight(lineHeight) }
    }

    var letterSpacing: Double? {
        didSet { nitroTextImpl.setLetterSpacing(letterSpacing) }
    }

    var text: String? {
        didSet {
            nitroTextImpl.setText(text)
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
        }
    }

    var lineBreakStrategyIOS: LineBreakStrategyIOS? {
        didSet {
            nitroTextImpl.setLineBreakStrategyIOS(lineBreakStrategyIOS)
        }
    }

    var maxFontSizeMultiplier: Double? {
        didSet {
            nitroTextImpl.setMaxFontSizeMultiplier(maxFontSizeMultiplier)
        }
    }

    var adjustsFontSizeToFit: Bool? {
        didSet {
            nitroTextImpl.setAdjustsFontSizeToFit(adjustsFontSizeToFit)
        }
    }

    var minimumFontScale: Double? {
        didSet {
            nitroTextImpl.setMinimumFontScale(minimumFontScale)
        }
    }

    func afterUpdate() {
        if nitroTextImpl.consumeNeedsCommit() {
            nitroTextImpl.commit()
        }
        textView.setNeedsLayout()
    }
}
