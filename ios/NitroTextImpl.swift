//
//  NitroTextImpl.swift
//  Pods
//
//  Created by Patrick Kabwe on 01/09/2025.
//

import UIKit

final class NitroTextImpl {
    weak var nitroTextView : NitroTextView?
    var currentTextAlignment: NSTextAlignment = .natural
    var currentTransform: TextTransform = .none
    var currentEllipsize: NSLineBreakMode = .byTruncatingTail
    var fontCache: [FontKey: UIFont] = [:]
    var allowFontScaling: Bool = true
    
    init(_ nitroTextView: NitroTextView) {
        self.nitroTextView = nitroTextView
    }
    
    func setSelectable(_ selectable: Bool?) {
        nitroTextView?.isSelectable = selectable ?? true
    }
    
    func setAllowFontScaling(_ value: Bool?) {
        allowFontScaling = value ?? true
        nitroTextView?.adjustsFontForContentSizeCategory = allowFontScaling
        if let text = nitroTextView?.attributedText, text.length > 0 {
            nitroTextView?.attributedText = text
        }
    }
    
    func setNumberOfLines(_ value: Double?) {
        let n = Int(value ?? 0)
        nitroTextView?.textContainer.maximumNumberOfLines = n
        nitroTextView?.textContainer.lineBreakMode = effectiveLineBreakMode(forLines: n)
    }

    func setEllipsizeMode(_ mode: EllipsizeMode?) {
        switch mode {
        case .some(.head): currentEllipsize = .byTruncatingHead
        case .some(.middle): currentEllipsize = .byTruncatingMiddle
        case .some(.tail): currentEllipsize = .byTruncatingTail
        case .some(.clip): currentEllipsize = .byClipping
        default: currentEllipsize = .byTruncatingTail
        }
        // Re-apply to container based on current numberOfLines
        guard let n = nitroTextView?.textContainer.maximumNumberOfLines else { return }
        nitroTextView?.textContainer.lineBreakMode = effectiveLineBreakMode(forLines: n)
    }

    func effectiveLineBreakMode(forLines n: Int) -> NSLineBreakMode {
        guard n > 0 else { return .byWordWrapping }
        if n == 1 { return currentEllipsize }
        switch currentEllipsize {
        case .byClipping:
            return .byClipping
        case .byTruncatingHead:
            return .byTruncatingHead
        case .byTruncatingMiddle:
            return .byTruncatingMiddle
        default:
            return .byTruncatingTail
        }
    }

    func setText(_ attributedText: NSAttributedString) {
        if let storage = nitroTextView?.tkStorage ?? nitroTextView?.layoutManager.textStorage {
            storage.beginEditing()
            storage.setAttributedString(attributedText)
            storage.endEditing()
        } else {
            nitroTextView?.attributedText = attributedText
        }
    }
    
    func setPlainText(_ value: String?) {
        let attributed = NSAttributedString(string: value ?? "")
        setText(attributed)
    }

    func setTextAlign(_ align: TextAlign?) {
        switch align {
        case .some(.center): currentTextAlignment = .center
        case .some(.right): currentTextAlignment = .right
        case .some(.justify): currentTextAlignment = .justified
        case .some(.left): currentTextAlignment = .left
        default: currentTextAlignment = .natural
        }
        nitroTextView?.textAlignment = currentTextAlignment
    }

    func setTextTransform(_ transform: TextTransform?) {
        switch transform {
        case .some(.uppercase): currentTransform = .uppercase
        case .some(.lowercase): currentTransform = .lowercase
        case .some(.capitalize): currentTransform = .capitalize
        default: currentTransform = .none
        }
    }
    
    func setFragments(_ fragments: [Fragment]?) {
        guard let fragments = fragments, !fragments.isEmpty else {
            nitroTextView?.attributedText = nil
            return
        }

        let result = NSMutableAttributedString()
        let defaultColor = nitroTextView?.textColor ?? UIColor.label

        for fragment in fragments {
            guard let rawText = fragment.text else { continue }
            let text = transform(rawText, with: fragment)
            let attributes = makeAttributes(for: fragment, defaultColor: defaultColor)
            result.append(NSAttributedString(string: text, attributes: attributes))
        }

        setText(result)
    }
}
