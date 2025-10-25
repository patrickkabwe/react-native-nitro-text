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
    var customMenus: [MenuItem] = [] {
        didSet { onCustomMenusUpdated() }
    }
    private var _editMenuInteractionStorage: Any?
    private var cachedSelectionRange: NSRange?
    private var cachedSelectionRect: CGRect?

    @available(iOS 16.0, *)
    private var editMenuInteraction: UIEditMenuInteraction? {
        get { _editMenuInteractionStorage as? UIEditMenuInteraction }
        set { _editMenuInteractionStorage = newValue }
    }

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

        delegate = self

        if #available(iOS 16.0, *) {
            let interaction = UIEditMenuInteraction(delegate: self)
            addInteraction(interaction)
            editMenuInteraction = interaction
        }
    }

    // MARK: - TextKit Integration
    // Build a self-contained TextKit stack when React Native does not supply one.
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

    // Produce detailed line metrics that mirror native layout for JS consumers.
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

    // Deliver press callbacks and manage selection/menu updates on tap.
    @objc private func handleTap(_ recognizer: UITapGestureRecognizer) {
        guard recognizer.state == .ended else { return }
        let location = recognizer.location(in: self)
        clearSelectionIfNeeded(at: location)
        nitroTextDelegate?.onNitroTextPress()
    }

    // Clear the active selection when tapping outside the view.
    @objc private func handleWindowTap(_ recognizer: UITapGestureRecognizer) {
        guard recognizer === windowTapRecognizer, recognizer.state == .ended else { return }
        guard hasActiveSelection() else { return }
        let location = recognizer.location(in: self)
        if point(inside: location, with: nil) { return }
        selectedTextRange = nil
    }

}

// MARK: - Selection & Menu Helpers
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
        if isPoint(point, insideSelection: currentSelection) {
            presentSelectionMenu(for: currentSelection)
        } else {
            selectedTextRange = nil
            resetSelectionAnchor()
        }
    }

    func presentSelectionMenu(for range: UITextRange) {
        guard isSelectable else { return }
        if !isFirstResponder { becomeFirstResponder() }

        guard let anchor = selectionAnchorRect(for: range) else { return }

        if #available(iOS 16.0, *) {
            let interaction = ensureEditMenuInteraction()
            let sourcePoint = CGPoint(x: anchor.midX, y: anchor.midY)
            let configuration = UIEditMenuConfiguration(identifier: nil, sourcePoint: sourcePoint)
            interaction.reloadVisibleMenu()
            interaction.presentEditMenu(with: configuration)
        } else {
            UIMenuController.shared.showMenu(from: self, rect: anchor)
        }
    }

    func onCustomMenusUpdated() {
        guard #available(iOS 16.0, *), let interaction = editMenuInteraction else { return }
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            interaction.reloadVisibleMenu()
            if let selection = self.selectedTextRange, self.selectionLength(selection) > 0 {
                self.presentSelectionMenu(for: selection)
            }
        }
    }

    @available(iOS 16.0, *)
    func ensureEditMenuInteraction() -> UIEditMenuInteraction {
        if let interaction = editMenuInteraction { return interaction }
        let interaction = UIEditMenuInteraction(delegate: self)
        addInteraction(interaction)
        editMenuInteraction = interaction
        return interaction
    }

    func buildMenu(with suggestedActions: [UIMenuElement]) -> UIMenu? {
        let customActions: [UIAction] = customMenus.compactMap { menu in
            guard !menu.title.isEmpty else { return nil }
            let handler = menu.action
            return UIAction(title: menu.title) { _ in handler() }
        }

        guard !customActions.isEmpty else { return nil }
        return UIMenu(children: customActions + suggestedActions)
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

    func selectionAnchorRect(for range: UITextRange) -> CGRect? {
        let currentRange = nsRange(for: range)

        if let cachedRange = cachedSelectionRange,
           let cachedRect = cachedSelectionRect,
           let currentRange,
           cachedRange == currentRange
        {
            return cachedRect
        }

        guard let boundingRect = selectionBoundingRect(for: range) else { return nil }
        let integralRect = boundingRect.integral
        cachedSelectionRange = currentRange
        cachedSelectionRect = integralRect
        return integralRect
    }

    func resetSelectionAnchor() {
        cachedSelectionRange = nil
        cachedSelectionRect = nil
    }

    func updateSelectionAnchorIfNeeded(for range: NSRange) {
        guard let cachedRange = cachedSelectionRange else { return }
        if cachedRange != range {
            resetSelectionAnchor()
        }
    }

    func cachedTargetRect() -> CGRect? {
        cachedSelectionRect
    }

    func selectionBoundingRect(for range: UITextRange) -> CGRect? {
        var aggregate: CGRect?
        for selectionRect in selectionRects(for: range) {
            let rect = selectionRect.rect
            if rect.isNull || rect.isEmpty { continue }
            aggregate = aggregate?.union(rect) ?? rect
        }

        if let aggregate { return aggregate }

        let fallback = firstRect(for: range)
        if fallback.isNull || fallback.isEmpty { return nil }
        return fallback
    }

    func nsRange(for range: UITextRange) -> NSRange? {
        let location = offset(from: beginningOfDocument, to: range.start)
        let length = offset(from: range.start, to: range.end)
        guard location >= 0, length >= 0 else { return nil }
        return NSRange(location: location, length: length)
    }
}

// MARK: - UIGestureRecognizerDelegate
extension NitroTextView: UIGestureRecognizerDelegate {
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        guard gestureRecognizer === windowTapRecognizer else { return true }
        guard hasActiveSelection() else { return false }
        guard let touchedView = touch.view else { return true }
        if isTouchInsideMenu(touchedView) { return false }
        if touchedView === self { return false }
        if touchedView.isDescendant(of: self) { return false }
        return true
    }

    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        gestureRecognizer === windowTapRecognizer
    }

    // Detect touches that originate from UIKit's edit menu chrome to avoid dismissing selection.
    private func isTouchInsideMenu(_ view: UIView) -> Bool {
        var current: UIView? = view
        while let node = current {
            let name = NSStringFromClass(type(of: node))
            if name.contains("UIEditMenu") || name.contains("UICalloutBar") || name.contains("_UIMenu") {
                return true
            }
            current = node.superview
        }
        return false
    }
}

// MARK: - UITextViewDelegate
extension NitroTextView: UITextViewDelegate {
    @available(iOS 16.0, *)
    func textView(
        _ textView: UITextView,
        editMenuForTextIn range: NSRange,
        suggestedActions: [UIMenuElement]
    ) -> UIMenu? {
        buildMenu(with: suggestedActions)
    }

    // Clear cached anchor data when the selection collapses or moves.
    func textViewDidChangeSelection(_ textView: UITextView) {
        guard textView === self else { return }
        if textView.selectedRange.length == 0 {
            resetSelectionAnchor()
        } else {
            updateSelectionAnchorIfNeeded(for: textView.selectedRange)
        }
    }
}

// MARK: - UIEditMenuInteractionDelegate
@available(iOS 16.0, *)
extension NitroTextView: UIEditMenuInteractionDelegate {
    func editMenuInteraction(
        _ interaction: UIEditMenuInteraction,
        menuFor configuration: UIEditMenuConfiguration,
        suggestedActions: [UIMenuElement]
    ) -> UIMenu? {
        buildMenu(with: suggestedActions)
    }

    // Tell UIKit to reuse the stored rect so the menu stays fixed.
    func editMenuInteraction(
        _ interaction: UIEditMenuInteraction,
        targetRectFor configuration: UIEditMenuConfiguration
    ) -> CGRect {
        if let rect = cachedTargetRect(), !rect.isNull, !rect.isEmpty {
            return rect
        }
        let point = configuration.sourcePoint
        return CGRect(origin: point, size: .zero)
    }
}
