//
//  NitroTextImpl.swift
//  Pods
//
//  Created by Patrick Kabwe on 01/09/2025.
//

import UIKit

final class NitroTextImpl {
    // MARK: - Constants
    private static let defaultFontSize: CGFloat = 14.0
    
    // MARK: - Properties
    weak var nitroTextView: NitroTextView?
    var currentTextAlignment: NSTextAlignment = .natural
    var currentTransform: TextTransform = .none
    var currentEllipsize: NSLineBreakMode = .byTruncatingTail
    var fontCache: [FontKey: UIFont] = [:]
    var paragraphStyleCache: [ParagraphKey: NSParagraphStyle] = [:]
    var colorCache: [String: UIColor] = [:]
    var allowFontScaling: Bool = true
    var currentFontFamily: String? = nil
    var dynamicTypeTextStyle: UIFont.TextStyle? = nil
    @available(iOS 14.0, *)
    var currentLineBreakStrategy: NSParagraphStyle.LineBreakStrategy = .standard
    var maxFontSizeMultiplier: Double? = nil
    var adjustsFontSizeToFit: Bool? = nil
    var minimumFontScale: Double? = nil

    init(_ nitroTextView: NitroTextView) {
        self.nitroTextView = nitroTextView
    }

    // MARK: - Property Setters
    
    func setLineBreakStrategyIOS(_ value: LineBreakStrategyIOS?) {
        guard #available(iOS 14.0, *) else { return }
        
        currentLineBreakStrategy = mapLineBreakStrategyIOS(value)
        
        if let text = nitroTextView?.attributedText, text.length > 0 {
            nitroTextView?.attributedText = text
        }
    }

    func setSelectable(_ selectable: Bool?) {
        nitroTextView?.isSelectable = selectable ?? false
    }

    func setAllowFontScaling(_ value: Bool?) {
        allowFontScaling = value ?? true
        nitroTextView?.adjustsFontForContentSizeCategory = allowFontScaling
        invalidateCachesAndRefreshText(clearFontCache: false, clearColorCache: false)
    }

    func setFontFamily(_ value: String?) {
        guard currentFontFamily != value else { return }
        
        currentFontFamily = value
        invalidateCachesAndRefreshText(clearFontCache: true, clearColorCache: true)
        nitroTextView?.setNeedsLayout()
    }

    func setFontSize(_ value: Double?) {
        if let value = value {
            nitroTextView?.font = UIFont.systemFont(ofSize: CGFloat(value))
        } else {
            nitroTextView?.font = UIFont.systemFont(ofSize: Self.defaultFontSize)
        }
    }

    func setDynamicTypeRamp(_ value: DynamicTypeRamp?) {
        let style = mapDynamicTypeRampToTextStyle(value)
        
        guard dynamicTypeTextStyle != style else { return }
        
        dynamicTypeTextStyle = style
        invalidateCachesAndRefreshText(clearFontCache: true, clearColorCache: false)
        nitroTextView?.setNeedsLayout()
    }

    func setNumberOfLines(_ value: Double?) {
        let n = Int(value ?? 0)
        nitroTextView?.textContainer.maximumNumberOfLines = n
        nitroTextView?.textContainer.lineBreakMode = getLineBreakMode(forLines: n)
    }

    func setMaxFontSizeMultiplier(_ value: Double?) {
        maxFontSizeMultiplier = value
        invalidateCachesAndRefreshText(clearFontCache: true, clearColorCache: false)
        nitroTextView?.setNeedsLayout()
    }

    func setAdjustsFontSizeToFit(_ value: Bool?) {
        adjustsFontSizeToFit = value
    }
    
    func setMinimumFontScale(_ value: Double?) {
        minimumFontScale = value
    }

    func setEllipsizeMode(_ mode: EllipsizeMode?) {
        currentEllipsize = mapEllipsizeModeToNSLineBreakMode(mode)
        
        guard let n = nitroTextView?.textContainer.maximumNumberOfLines else { return }
        nitroTextView?.textContainer.lineBreakMode = getLineBreakMode(forLines: n)
    }

    func getLineBreakMode(forLines n: Int) -> NSLineBreakMode {
        guard n > 0 else { return .byWordWrapping }
        if n == 1 { return currentEllipsize }
        return currentEllipsize
    }

    // MARK: - Text Content Setters
    
    func setText(_ attributedText: NSAttributedString) {
        guard attributedText.length > 0 else {
            nitroTextView?.attributedText = nil
            return
        }
        
        // OPTIMIZATION: Check if this is effectively plain text with minimal styling
        var hasComplexAttributes = false
        
        if attributedText.length > 0 {
            attributedText.enumerateAttributes(
                in: NSRange(location: 0, length: attributedText.length),
                options: []
            ) { attributes, _, stop in
                // Check if we have complex attributes beyond basic font/color
                let complexKeys: Set<NSAttributedString.Key> = [
                    .paragraphStyle,
                    .backgroundColor,
                    .underlineStyle,
                    .strikethroughStyle,
                    .kern,
                    .baselineOffset
                ]
                
                for key in complexKeys {
                    if attributes[key] != nil {
                        hasComplexAttributes = true
                        stop.pointee = true
                        return
                    }
                }
            }
        }
        
        let mutable = NSMutableAttributedString(attributedString: attributedText)
        
        // Only apply baseline offset if we have complex attributes or line heights
        if hasComplexAttributes || hasLineHeights(in: mutable) {
            applyBaselineOffset(mutable)
        }
        
        updateAttributedText(mutable)
    }

    func setPlainText(_ value: String?) {
        guard let text = value, !text.isEmpty else {
            nitroTextView?.attributedText = nil
            return
        }
        
        let attributed = NSMutableAttributedString(string: text)
        updateAttributedText(attributed)
    }

    func setTextAlign(_ align: TextAlign?) {
        currentTextAlignment = mapTextAlignToNSTextAlignment(align)
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

        let defaultColor = nitroTextView?.textColor ?? UIColor.clear

        // Fast path: single fragment
        if fragments.count == 1, let only = fragments.first, let raw = only.text, !raw.isEmpty {
            let result = handleSingleFragment(only, defaultColor: defaultColor)
            setText(result)
            return
        }

        // Process multiple fragments
        let result = processMultipleFragments(fragments, defaultColor: defaultColor)
        guard result.length > 0 else {
            nitroTextView?.attributedText = nil
            return
        }
        
        updateAttributedText(result)
    }

    func setMenus(_ menus: [MenuItem]) {
        nitroTextView?.customMenus = menus
    }
    
    // MARK: - Private Helpers
    
    /// Updates the attributed text on the text view, handling both storage and direct assignment
    private func updateAttributedText(_ attributedString: NSMutableAttributedString) {
        if let storage = nitroTextView?.tkStorage ?? nitroTextView?.layoutManager.textStorage {
            storage.beginEditing()
            storage.setAttributedString(attributedString)
            storage.endEditing()
        } else {
            nitroTextView?.attributedText = attributedString
        }
    }
    
    /// Invalidates caches and refreshes the text if needed
    private func invalidateCachesAndRefreshText(clearFontCache: Bool, clearColorCache: Bool) {
        if clearFontCache {
            fontCache.removeAll(keepingCapacity: true)
        }
        if clearColorCache {
            colorCache.removeAll(keepingCapacity: true)
        }
        paragraphStyleCache.removeAll(keepingCapacity: true)
        
        if let current = nitroTextView?.attributedText, current.length > 0 {
            nitroTextView?.attributedText = current
        }
    }
    
    /// Handles a single fragment case (fast path)
    private func handleSingleFragment(_ fragment: Fragment, defaultColor: UIColor) -> NSMutableAttributedString {
        guard let raw = fragment.text, !raw.isEmpty else {
            return NSMutableAttributedString()
        }
        
        let text = transform(raw, with: fragment)
        let attrs = makeAttributes(for: fragment, defaultColor: defaultColor)
        return NSMutableAttributedString(string: text, attributes: attrs)
    }
    
    /// Processes multiple fragments into an attributed string
    private func processMultipleFragments(_ fragments: [Fragment], defaultColor: UIColor) -> NSMutableAttributedString {
        // Pre-filter empty fragments and merge adjacent fragments with identical attributes
        let mergedFragments = mergeAdjacentFragments(fragments)
        guard !mergedFragments.isEmpty else {
            return NSMutableAttributedString()
        }

        // Build attributed string efficiently
        let result = NSMutableAttributedString()
        result.beginEditing()
        defer { result.endEditing() }

        var hasLineHeights = false

        for fragment in mergedFragments {
            guard let rawText = fragment.text, !rawText.isEmpty else { continue }
            
            let text = transform(rawText, with: fragment)
            guard !text.isEmpty else { continue }
            
            // Track if any fragment has line height for conditional baseline offset
            if fragment.lineHeight != nil {
                hasLineHeights = true
            }
            
            let attributes = makeAttributes(for: fragment, defaultColor: defaultColor)
            result.append(NSAttributedString(string: text, attributes: attributes))
        }

        // Only apply baseline offset if we have line heights
        if hasLineHeights {
            applyBaselineOffset(result)
        }
        
        return result
    }
    
    // MARK: - Mapping Helpers
    
    /// Maps TextAlign to NSTextAlignment
    private func mapTextAlignToNSTextAlignment(_ align: TextAlign?) -> NSTextAlignment {
        switch align {
        case .some(.center): return .center
        case .some(.right): return .right
        case .some(.justify): return .justified
        case .some(.left): return .left
        default: return .natural
        }
    }
    
    /// Maps EllipsizeMode to NSLineBreakMode
    private func mapEllipsizeModeToNSLineBreakMode(_ mode: EllipsizeMode?) -> NSLineBreakMode {
        switch mode {
        case .some(.head): return .byTruncatingHead
        case .some(.middle): return .byTruncatingMiddle
        case .some(.tail): return .byTruncatingTail
        case .some(.clip): return .byClipping
        default: return .byTruncatingTail
        }
    }
    
    /// Maps DynamicTypeRamp to UIFont.TextStyle
    private func mapDynamicTypeRampToTextStyle(_ value: DynamicTypeRamp?) -> UIFont.TextStyle? {
        switch value {
        case .caption2?: return .caption2
        case .caption1?: return .caption1
        case .footnote?: return .footnote
        case .subheadline?: return .subheadline
        case .callout?: return .callout
        case .body?: return .body
        case .headline?: return .headline
        case .title3?: return .title3
        case .title2?: return .title2
        case .title1?: return .title1
        case .largetitle?: return .largeTitle
        case nil: return nil
        }
    }
    
    /// Maps LineBreakStrategyIOS to NSParagraphStyle.LineBreakStrategy
    @available(iOS 14.0, *)
    private func mapLineBreakStrategyIOS(_ value: LineBreakStrategyIOS?) -> NSParagraphStyle.LineBreakStrategy {
        switch value {
        case .some(.none): return []
        case .some(.standard): return .standard
        case .some(.hangulWord): return .hangulWordPriority
        case .some(.pushOut): return .pushOut
        default: return .standard
        }
    }
}

extension NitroTextImpl {
    // MARK: - Baseline Offset
    
    /// Mirrors RCTApplyBaselineOffset: Computes a baseline offset from paragraph lineHeights and fonts.
    fileprivate func applyBaselineOffset(_ attributed: NSMutableAttributedString) {
        let fullRange = NSRange(location: 0, length: attributed.length)

        var maximumLineHeight: CGFloat = 0
        var maximumFontLineHeight: CGFloat = 0

        attributed.enumerateAttributes(in: fullRange, options: []) { attrs, _, _ in
            if let style = attrs[.paragraphStyle] as? NSParagraphStyle {
                maximumLineHeight = max(maximumLineHeight, style.maximumLineHeight)
            }
            if let font = attrs[.font] as? UIFont {
                maximumFontLineHeight = max(maximumFontLineHeight, font.lineHeight)
            }
        }
        if maximumLineHeight <= 0 { return }
        if maximumLineHeight < maximumFontLineHeight { return }

        let baseLineOffset = (maximumLineHeight - maximumFontLineHeight) / 2.0
        if baseLineOffset != 0 {
            attributed.addAttribute(.baselineOffset, value: baseLineOffset, range: fullRange)
        }
    }
    
    /// Checks if the attributed string has any line heights set
    fileprivate func hasLineHeights(in attributed: NSMutableAttributedString) -> Bool {
        let fullRange = NSRange(location: 0, length: attributed.length)
        var foundLineHeight = false
        
        attributed.enumerateAttribute(.paragraphStyle, in: fullRange, options: []) { value, _, stop in
            if let style = value as? NSParagraphStyle, style.maximumLineHeight > 0 {
                foundLineHeight = true
                stop.pointee = true
            }
        }
        
        return foundLineHeight
    }
    
    // MARK: - Fragment Processing
    
    /// Merges adjacent fragments with identical attributes to reduce fragment count
    fileprivate func mergeAdjacentFragments(_ fragments: [Fragment]) -> [Fragment] {
        guard fragments.count > 1 else { return fragments }
        
        var merged: [Fragment] = []
        merged.reserveCapacity(fragments.count)
        
        var current: Fragment? = nil
        
        for fragment in fragments {
            guard let text = fragment.text, !text.isEmpty else { continue }
            
            if let existing = current {
                // Check if attributes are identical (excluding text)
                if fragmentsHaveIdenticalAttributes(existing, fragment) {
                    // Merge text by creating a new fragment with combined text
                    var mergedFragment = existing
                    mergedFragment.text = (existing.text ?? "") + text
                    current = mergedFragment
                    continue
                } else {
                    // Attributes differ, save current and start new
                    merged.append(existing)
                }
            }
            
            current = fragment
        }
        
        // Don't forget the last fragment
        if let last = current {
            merged.append(last)
        }
        
        return merged.isEmpty ? fragments : merged
    }
    
    /// Checks if two fragments have identical attributes (excluding text content)
    fileprivate func fragmentsHaveIdenticalAttributes(_ a: Fragment, _ b: Fragment) -> Bool {
        return a.fontSize == b.fontSize &&
               a.fontWeight == b.fontWeight &&
               a.fontStyle == b.fontStyle &&
               a.fontFamily == b.fontFamily &&
               a.fontColor == b.fontColor &&
               a.lineHeight == b.lineHeight &&
               a.letterSpacing == b.letterSpacing &&
               a.textAlign == b.textAlign &&
               a.textTransform == b.textTransform &&
               a.textDecorationLine == b.textDecorationLine &&
               a.textDecorationColor == b.textDecorationColor &&
               a.textDecorationStyle == b.textDecorationStyle &&
               a.fragmentBackgroundColor == b.fragmentBackgroundColor &&
               a.selectionColor == b.selectionColor &&
               a.linkUrl == b.linkUrl
    }
}
