//
//  NitroTextImpl+Markdown.swift
//  Pods
//
//  Markdown rendering helpers for NitroTextImpl.
//

import UIKit

extension NitroTextImpl {
    @discardableResult
    func applyMarkdown(_ text: String, defaults top: FragmentTopDefaults) -> Bool {
        if text.isEmpty {
            setText(NSAttributedString(string: ""))
            return true
        }

        guard #available(iOS 15.0, *) else {
            return false
        }

        let transformed = transformMarkdownSource(text, defaults: top)
        let cacheKey = transformed as NSString
        let baseFragment = top.makeFragment(withText: nil)
        let defaultColor = nitroTextView?.textColor ?? UIColor.clear

        if let cached = markdownCache.object(forKey: cacheKey) {
            let mutable = NSMutableAttributedString(attributedString: cached)
            applyDefaultAttributes(from: baseFragment, to: mutable, defaultColor: defaultColor)
            setText(mutable)
            return true
        }

        var options = AttributedString.MarkdownParsingOptions()
        options.interpretedSyntax = .full
        options.allowsExtendedAttributes = true

        do {
            let parsed = try AttributedString(markdown: transformed, options: options)
            let nsParsed = NSAttributedString(parsed)
            markdownCache.setObject(nsParsed, forKey: cacheKey)
            let mutable = NSMutableAttributedString(attributedString: nsParsed)
            applyDefaultAttributes(from: baseFragment, to: mutable, defaultColor: defaultColor)
            setText(mutable)
            return true
        } catch {
#if DEBUG
            print("NitroTextImpl: Failed to parse markdown: \(error)")
#endif
            return false
        }
    }

    private func transformMarkdownSource(
        _ text: String,
        defaults top: FragmentTopDefaults
    ) -> String {
        let transform = top.textTransform ?? currentTransform
        switch transform {
        case .uppercase:
            return text.uppercased()
        case .lowercase:
            return text.lowercased()
        case .capitalize:
            return text.capitalized
        case .none:
            return text
        }
    }
}

private extension NitroTextImpl {
    func applyDefaultAttributes(
        from fragment: Fragment,
        to attributed: NSMutableAttributedString,
        defaultColor: UIColor
    ) {
        let length = attributed.length
        guard length > 0 else { return }

        var baseFragment = fragment
        if baseFragment.text == nil {
            baseFragment.text = attributed.string
        }

        let baseAttributes = makeAttributes(for: baseFragment, defaultColor: defaultColor)
        let fullRange = NSRange(location: 0, length: length)

        for (key, value) in baseAttributes {
            if key == .font, let font = value as? UIFont {
                applyBaseFont(font, to: attributed, in: fullRange)
                continue
            }

            attributed.enumerateAttribute(key, in: fullRange, options: []) { existing, range, _ in
                if existing == nil {
                    attributed.addAttribute(key, value: value, range: range)
                }
            }
        }
    }

    func applyBaseFont(
        _ baseFont: UIFont,
        to attributed: NSMutableAttributedString,
        in range: NSRange
    ) {
        guard range.length > 0 else { return }
        let referenceSize = UIFont.preferredFont(forTextStyle: .body).pointSize

        attributed.enumerateAttribute(.font, in: range, options: []) { value, subRange, _ in
            let finalFont: UIFont
            if let existing = value as? UIFont {
                finalFont = mergeMarkdownFont(baseFont: baseFont, existing: existing, referenceSize: referenceSize)
            } else {
                finalFont = baseFont
            }
            attributed.addAttribute(.font, value: finalFont, range: subRange)
        }
    }

    func mergeMarkdownFont(
        baseFont: UIFont,
        existing: UIFont,
        referenceSize: CGFloat
    ) -> UIFont {
        let ratio: CGFloat
        if referenceSize > 0 {
            ratio = max(existing.pointSize / referenceSize, 0.1)
        } else {
            ratio = 1.0
        }

        let targetSize = max(baseFont.pointSize * ratio, 0.1)

        let baseDescriptor = baseFont.fontDescriptor
        let existingDescriptor = existing.fontDescriptor

        var combinedTraits = baseDescriptor.symbolicTraits
        combinedTraits.formUnion(existingDescriptor.symbolicTraits)

        var descriptor = baseDescriptor
        if let withTraits = descriptor.withSymbolicTraits(combinedTraits) {
            descriptor = withTraits
        }

        var traitsDict = (descriptor.object(forKey: .traits) as? [UIFontDescriptor.TraitKey: Any]) ?? [:]
        if let existingTraits = existingDescriptor.object(forKey: .traits) as? [UIFontDescriptor.TraitKey: Any] {
            for (key, value) in existingTraits {
                traitsDict[key] = value
            }
        }

        descriptor = descriptor.addingAttributes([UIFontDescriptor.AttributeName.traits: traitsDict])

        return UIFont(descriptor: descriptor, size: targetSize)
    }
}
