//
//  NitroTextImpl.swift
//  Pods
//
//  Created by Patrick Kabwe on 01/09/2025.
//

import UIKit

protocol NitroTextViewDelegate: AnyObject {
    func onNitroTextMeasured(height: Double)
}

final class NitroTextView: UITextView {
    var tkStorage: NSTextStorage?
    var tkLayoutManager: NSLayoutManager?
    weak var nitroTextDelegate: NitroTextViewDelegate?

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
        isSelectable = true
        isScrollEnabled = false
        isUserInteractionEnabled = true
        backgroundColor = .clear
        textContainerInset = .zero
        textContainer.lineFragmentPadding = 0
        layoutManager.usesFontLeading = false
        contentInset = .zero
        clipsToBounds = true

        delaysContentTouches = false
        panGestureRecognizer.cancelsTouchesInView = false

        if #available(iOS 11.0, *) { textDragInteraction?.isEnabled = true }
    }

    private func measuredHeight(forWidth width: CGFloat) -> CGFloat {
        let inset = textContainerInset
        let availableWidth = max(0, width - inset.left - inset.right)
        textContainer.size = CGSize(width: availableWidth, height: CGFloat.greatestFiniteMagnitude)

        let usedHeight: CGFloat = {
            if let lm = tkLayoutManager {
                let range = lm.glyphRange(for: textContainer)
                let used = lm.usedRect(for: textContainer).height
                let bound = lm.boundingRect(forGlyphRange: range, in: textContainer).height
                return max(used, bound)
            } else {
                let range = layoutManager.glyphRange(for: textContainer)
                let used = layoutManager.usedRect(for: textContainer).height
                let bound = layoutManager.boundingRect(forGlyphRange: range, in: textContainer)
                    .height
                return max(used, bound)
            }
        }()
        return ceil(usedHeight + inset.top + inset.bottom)
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
        let width = self.bounds.width
        guard width > 0 else { return }
        let height = self.measuredHeight(forWidth: width)
        nitroTextDelegate?.onNitroTextMeasured(height: height)
    }
}
