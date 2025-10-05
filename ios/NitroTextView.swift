//
//  NitroTextImpl.swift
//  Pods
//
//  Created by Patrick Kabwe on 01/09/2025.
//

import UIKit

protocol NitroTextViewDelegate: AnyObject {
    func onNitroTextLayout(_ layout: TextLayoutEvent)
    func onNitroTextPressIn()
    func onNitroTextPressOut()
    func onNitroTextPress()
}

final class NitroTextView: UITextView {
    var tkStorage: NSTextStorage?
    var tkLayoutManager: NSLayoutManager?
    weak var nitroTextDelegate: NitroTextViewDelegate?
    private var tapRecognizer: UITapGestureRecognizer?
    private var linkTouchInProgress: Bool = false

    override init(frame: CGRect, textContainer: NSTextContainer?) {
        if let provided = textContainer {
            super.init(frame: frame, textContainer: provided)
        } else {
            let (storage, layout, container) = Self.makeTextKitStack()
            super.init(frame: frame, textContainer: container)
            self.tkStorage = storage
            self.tkLayoutManager = layout
        }
        setupView()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }

    private func setupView() {
        isEditable = false
        isSelectable = false
        isScrollEnabled = false
        isUserInteractionEnabled = true
        backgroundColor = .clear
        textContainerInset = .zero
        textContainer.lineFragmentPadding = 0
        layoutManager.usesFontLeading = false
        textColor = .black
        contentInset = .zero
        clipsToBounds = true

        delaysContentTouches = false
        panGestureRecognizer.cancelsTouchesInView = false

        if #available(iOS 11.0, *) { textDragInteraction?.isEnabled = true }

        let tap = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        tap.cancelsTouchesInView = false
        addGestureRecognizer(tap)
        self.tapRecognizer = tap
    }

    private static func makeTextKitStack() -> (NSTextStorage, NSLayoutManager, NSTextContainer) {
        let storage = NSTextStorage()
        let layout = NSLayoutManager()
        layout.usesFontLeading = true
        let container = NSTextContainer(size: .zero)
        layout.addTextContainer(container)
        storage.addLayoutManager(layout)
        return (storage, layout, container)
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        guard let delegate = nitroTextDelegate else { return }
        if let layout = computeTextLayoutEvent() {
            delegate.onNitroTextLayout(layout)
        }
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        linkTouchInProgress = touches.first.flatMap { link(at: $0.location(in: self)) } != nil
        if !linkTouchInProgress {
            nitroTextDelegate?.onNitroTextPressIn()
        }
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        if linkTouchInProgress {
            linkTouchInProgress = false
        } else {
            nitroTextDelegate?.onNitroTextPressOut()
        }
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesCancelled(touches, with: event)
        if linkTouchInProgress {
            linkTouchInProgress = false
        } else {
            nitroTextDelegate?.onNitroTextPressOut()
        }
    }

    private func computeTextLayoutEvent() -> TextLayoutEvent? {
        // Determine storage and layout manager
        let lm = tkLayoutManager ?? layoutManager
        let storage = tkStorage ?? lm.textStorage

        let fullText: NSString = {
            if let s = storage?.string as NSString? { return s }
            return (text ?? "") as NSString
        }()

        // Ensure there is content
        if fullText.length == 0 { return TextLayoutEvent(lines: []) }

        // Ensure container has a valid size
        let inset = textContainerInset
        let availableWidth = max(0, bounds.width - inset.left - inset.right)
        textContainer.size = CGSize(width: availableWidth, height: CGFloat.greatestFiniteMagnitude)

        let glyphRange = lm.glyphRange(for: textContainer)
        if glyphRange.length == 0 { return TextLayoutEvent(lines: []) }

        var lines: [TextLayout] = []
        var index = glyphRange.location
        while index < NSMaxRange(glyphRange) {
            var lineGlyphRange = NSRange(location: 0, length: 0)
            let usedRect = lm.lineFragmentUsedRect(
                forGlyphAt: index, effectiveRange: &lineGlyphRange)
            let charRange = lm.characterRange(forGlyphRange: lineGlyphRange, actualGlyphRange: nil)

            let substring = fullText.substring(with: charRange)

            // Resolve font metrics from the first character in the line, fallback to view font
            var asc: CGFloat = font?.ascender ?? 0
            var desc: CGFloat = -(font?.descender ?? 0)
            var cap: CGFloat = font?.capHeight ?? 0
            var xh: CGFloat = font?.xHeight ?? 0
            if let attrsFont = storage?.attribute(
                .font, at: charRange.location, effectiveRange: nil) as? UIFont
            {
                asc = attrsFont.ascender
                desc = -(attrsFont.descender)
                cap = attrsFont.capHeight
                xh = attrsFont.xHeight
            }

            let x = Double(usedRect.minX + inset.left)
            let y = Double(usedRect.minY + inset.top)
            let w = Double(usedRect.width)
            let h = Double(usedRect.height)

            let line = TextLayout(
                text: substring,
                x: x,
                y: y,
                width: w,
                height: h,
                descender: Double(desc),
                capHeight: Double(cap),
                ascender: Double(asc),
                xHeight: Double(xh)
            )
            lines.append(line)

            index = NSMaxRange(lineGlyphRange)
        }

        return TextLayoutEvent(lines: lines)
    }

    @objc private func handleTap(_ recognizer: UITapGestureRecognizer) {
        guard recognizer.state == .ended else { return }
        let location = recognizer.location(in: self)
        if let url = link(at: location) {
            openLink(url)
            linkTouchInProgress = false
            return
        }
        clearSelectionIfNeeded(at: location)
        nitroTextDelegate?.onNitroTextPress()
    }

}

private extension NitroTextView {
    func selectionLength(_ range: UITextRange) -> Int {
        offset(from: range.start, to: range.end)
    }

    func isPoint(_ point: CGPoint, insideSelection range: UITextRange) -> Bool {
        for selectionRect in selectionRects(for: range) {
            let rect = selectionRect.rect
            if rect.isNull || rect.isEmpty { continue }
            if rect.contains(point) { return true }
        }
        return false
    }

    func clearSelectionIfNeeded(at point: CGPoint) {
        guard let currentSelection = selectedTextRange,
            selectionLength(currentSelection) > 0
        else { return }
        if !isPoint(point, insideSelection: currentSelection) {
            selectedTextRange = nil
        }
    }

    func link(at point: CGPoint) -> URL? {
        let layoutManager = tkLayoutManager ?? self.layoutManager
        guard let textStorage = tkStorage ?? layoutManager.textStorage,
              textStorage.length > 0 else { return nil }

        let location = CGPoint(
            x: point.x - textContainerInset.left - contentOffset.x,
            y: point.y - textContainerInset.top - contentOffset.y
        )

        let container = textContainer
        let glyphIndex = layoutManager.glyphIndex(for: location, in: container)
        if glyphIndex >= layoutManager.numberOfGlyphs { return nil }

        var fraction: CGFloat = 0
        let effectiveIndex = layoutManager.glyphIndex(for: location, in: container, fractionOfDistanceThroughGlyph: &fraction)
        if effectiveIndex >= layoutManager.numberOfGlyphs { return nil }
        if fraction == 1.0 { return nil }

        let glyphRect = layoutManager.boundingRect(forGlyphRange: NSRange(location: effectiveIndex, length: 1), in: container)
        if !glyphRect.contains(location) { return nil }

        let charIndex = layoutManager.characterIndexForGlyph(at: effectiveIndex)
        if charIndex >= textStorage.length { return nil }

        let attribute = textStorage.attribute(.link, at: charIndex, effectiveRange: nil)
        if let url = attribute as? URL {
            return url
        }
        if let string = attribute as? String {
            return URL(string: string)
        }
        return nil
    }

    func openLink(_ url: URL) {
        guard let application = NitroTextView.sharedApplication else { return }
        guard application.canOpenURL(url) else { return }
        if #available(iOS 10.0, *) {
            application.open(url, options: [:], completionHandler: nil)
        } else {
            application.openURL(url)
        }
    }

    static var sharedApplication: UIApplication? {
        let selector = NSSelectorFromString("sharedApplication")
        guard UIApplication.responds(to: selector) else { return nil }
        let unmanaged = UIApplication.perform(selector)
        return unmanaged?.takeUnretainedValue() as? UIApplication
    }
}
