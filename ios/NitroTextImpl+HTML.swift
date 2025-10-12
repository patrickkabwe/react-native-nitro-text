import UIKit

extension NitroTextImpl {
    func applyHtml(
        text html: String?,
        fragments: [Fragment]?,
        rules: [RichTextStyleRule]?,
        top: FragmentTopDefaults,
        defaultColor: UIColor
    ) {
        guard let source = html?.isEmpty == false ? html : fragmentsFlatText(fragments) else {
            renderFragments(nil, defaultColor: defaultColor)
            return
        }
        let baseStyle = richTextStyle(from: top)
        let attributed = htmlRenderer.render(
            html: source,
            baseStyle: baseStyle,
            rules: rules,
            defaultColor: defaultColor
        )
        applyAttributedText(attributed)
    }
}

private extension NitroTextImpl {
    func fragmentsFlatText(_ fragments: [Fragment]?) -> String? {
        guard let fragments, !fragments.isEmpty else { return nil }
        var requiredCapacity = 0
        for fragment in fragments {
            guard let text = fragment.text, !text.isEmpty else { continue }
            requiredCapacity += text.utf16.count
        }
        guard requiredCapacity > 0 else { return nil }

        var result = String()
        result.reserveCapacity(requiredCapacity)
        for fragment in fragments {
            guard let text = fragment.text, !text.isEmpty else { continue }
            result.append(text)
        }
        return result
    }

    func richTextStyle(from top: FragmentTopDefaults) -> RichTextStyle? {
        guard top.fontColor != nil ||
            top.fontSize != nil ||
            top.fontWeight != nil ||
            top.fontStyle != nil ||
            top.fontFamily != nil ||
            top.lineHeight != nil ||
            top.letterSpacing != nil ||
            top.textAlign != nil ||
            top.textTransform != nil ||
            top.textDecorationLine != nil ||
            top.textDecorationColor != nil ||
            top.textDecorationStyle != nil ||
            top.fragmentBackgroundColor != nil
        else {
            return nil
        }

        return RichTextStyle(
            fontColor: top.fontColor,
            fragmentBackgroundColor: top.fragmentBackgroundColor,
            fontSize: top.fontSize,
            fontWeight: top.fontWeight,
            fontStyle: top.fontStyle,
            fontFamily: top.fontFamily,
            lineHeight: top.lineHeight,
            letterSpacing: top.letterSpacing,
            textAlign: top.textAlign,
            textTransform: top.textTransform,
            textDecorationLine: top.textDecorationLine,
            textDecorationColor: top.textDecorationColor,
            textDecorationStyle: top.textDecorationStyle,
            marginTop: nil,
            marginBottom: nil,
            marginLeft: nil,
            marginRight: nil
        )
    }
}
