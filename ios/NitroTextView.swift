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
    private weak var windowTapRecognizer: UITapGestureRecognizer?

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

    deinit {
        removeWindowTapRecognizer()
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
        layout.usesFontLeading = false
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

    override func didMoveToWindow() {
        super.didMoveToWindow()
        updateWindowTapRecognizer()
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
        nitroTextDelegate?.onNitroTextPressIn()
    }

    override func touchesEnded(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesEnded(touches, with: event)
        nitroTextDelegate?.onNitroTextPressOut()
    }

    override func touchesCancelled(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesCancelled(touches, with: event)
        nitroTextDelegate?.onNitroTextPressOut()
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
        clearSelectionIfNeeded(at: recognizer.location(in: self))
        nitroTextDelegate?.onNitroTextPress()
    }

    @objc private func handleWindowTap(_ recognizer: UITapGestureRecognizer) {
        guard recognizer === windowTapRecognizer, recognizer.state == .ended else { return }
        guard hasActiveSelection() else { return }
        let location = recognizer.location(in: self)
        if point(inside: location, with: nil) { return }
        selectedTextRange = nil
    }

}

private extension NitroTextView {
    func hasActiveSelection() -> Bool {
        guard let currentSelection = selectedTextRange else { return false }
        return selectionLength(currentSelection) > 0
    }

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

    func updateWindowTapRecognizer() {
        guard let window = window else {
            removeWindowTapRecognizer()
            return
        }

        if let recognizer = windowTapRecognizer, recognizer.view !== window {
            removeWindowTapRecognizer()
        }

        if windowTapRecognizer == nil {
            let recognizer = UITapGestureRecognizer(target: self, action: #selector(handleWindowTap(_:)))
            recognizer.cancelsTouchesInView = false
            recognizer.delegate = self
            window.addGestureRecognizer(recognizer)
            windowTapRecognizer = recognizer
        }
    }

    func removeWindowTapRecognizer() {
        guard let recognizer = windowTapRecognizer else { return }
        recognizer.view?.removeGestureRecognizer(recognizer)
        windowTapRecognizer = nil
    }
}

extension NitroTextView: UIGestureRecognizerDelegate {
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        guard gestureRecognizer === windowTapRecognizer else { return true }
        guard hasActiveSelection() else { return false }
        guard let touchedView = touch.view else { return true }
        if touchedView === self { return false }
        if touchedView.isDescendant(of: self) { return false }
        return true
    }

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        gestureRecognizer === windowTapRecognizer
    }
}