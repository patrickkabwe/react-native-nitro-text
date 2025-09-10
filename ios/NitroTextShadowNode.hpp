//
// NitroTextShadowNode.hpp
// Custom, non-generated ShadowNode for NitroText
//

#pragma once

#include "HybridNitroTextComponent.hpp"

#include <react/renderer/core/LayoutConstraints.h>
#include <react/renderer/core/LayoutContext.h>

#include <react/renderer/attributedstring/AttributedString.h>
#include <react/renderer/attributedstring/TextAttributes.h>
#include <react/renderer/components/view/ViewShadowNode.h>
#include <react/renderer/textlayoutmanager/TextLayoutContext.h>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>

namespace margelo::nitro::nitrotext::views
{
    /**
     * The Shadow Node for the "NitroText" View.
     * Mark as a Leaf + Measurable Yoga node so Fabric queries the ShadowNode for
     * size. (We measure cross-platform in C++ using TextLayoutManager, like
     * Paragraph.)
     */
    class NitroTextShadowNode final
        : public react::ConcreteViewShadowNode<
              HybridNitroTextComponentName /* "HybridNitroText" */,
              HybridNitroTextProps /* custom props */,
              react::ViewEventEmitter /* default */,
              HybridNitroTextState /* custom state */>
    {
    public:
        using ConcreteViewShadowNode::ConcreteViewShadowNode;

        static react::ShadowNodeTraits BaseTraits()
        {
            auto traits = ConcreteViewShadowNode::BaseTraits();
            traits.set(react::ShadowNodeTraits::Trait::LeafYogaNode);
            traits.set(react::ShadowNodeTraits::Trait::MeasurableYogaNode);
            traits.set(react::ShadowNodeTraits::Trait::BaselineYogaNode);
            return traits;
        }


        void
        setTextLayoutManager(std::shared_ptr<const react::TextLayoutManager> tlm)
        {
            textLayoutManager_ = std::move(tlm);
        }

    protected:
        react::Size measureContent(
            const react::LayoutContext &layoutContext,
            const react::LayoutConstraints &layoutConstraints) const override
        {
            // 1) Resolve definite width (Yoga passes min==max when width is known)
            const float maxW = layoutConstraints.maximumSize.width;
            const float minW = layoutConstraints.minimumSize.width;
            const float width = (std::isfinite(maxW) && maxW > 0.f)   ? maxW
                                : (std::isfinite(minW) && minW > 0.f) ? minW
                                                                      : 0.f;

            if (width <= 0.f)
            {
                return layoutConstraints.clamp({0.f, 0.f});
            }

            // 2) Build AttributedString from props (simplified: plain text or joined fragments)
            const auto &props = this->getConcreteProps();

            std::string textToMeasure;
            if (props.text.value.has_value())
            {
                textToMeasure = props.text.value.value();
            }
            else if (props.fragments.value.has_value())
            {
                const auto &frags = props.fragments.value.value();
                textToMeasure.reserve(64);
                for (const auto &f : frags)
                {
                    if (f.text.has_value())
                        textToMeasure += f.text.value();
                }
            }

            react::TextAttributes textAttributes =
                react::TextAttributes::defaultTextAttributes();
            if (props.fontSize.value.has_value())
            {
                textAttributes.fontSize = props.fontSize.value.value();
            }

            if (props.fontStyle.value.has_value())
            {
                using RNFontStyle = facebook::react::FontStyle;
                using NitroFontStyle = margelo::nitro::nitrotext::FontStyle;
                switch (props.fontStyle.value.value())
                {
                case NitroFontStyle::NORMAL:
                    textAttributes.fontStyle = RNFontStyle::Normal;
                    break;
                case NitroFontStyle::ITALIC:
                    textAttributes.fontStyle = RNFontStyle::Italic;
                    break;
                case NitroFontStyle::OBLIQUE:
                    textAttributes.fontStyle = RNFontStyle::Oblique;
                    break;
                }
            }

            if (props.fontWeight.value.has_value())
            {
                using RNFontWeight = facebook::react::FontWeight;
                using NitroFontWeight = margelo::nitro::nitrotext::FontWeight;
                switch (props.fontWeight.value.value())
                {
                case NitroFontWeight::ULTRALIGHT:
                    textAttributes.fontWeight = RNFontWeight::UltraLight;
                    break;
                case NitroFontWeight::THIN:
                    textAttributes.fontWeight = RNFontWeight::Thin;
                    break;
                case NitroFontWeight::LIGHT:
                    textAttributes.fontWeight = RNFontWeight::Light;
                    break;
                case NitroFontWeight::REGULAR:
                    textAttributes.fontWeight = RNFontWeight::Regular;
                    break;
                case NitroFontWeight::MEDIUM:
                    textAttributes.fontWeight = RNFontWeight::Medium;
                    break;
                case NitroFontWeight::SEMIBOLD:
                    textAttributes.fontWeight = RNFontWeight::Semibold;
                    break;
                case NitroFontWeight::BOLD:
                    textAttributes.fontWeight = RNFontWeight::Bold;
                    break;
                case NitroFontWeight::HEAVY:
                    textAttributes.fontWeight = RNFontWeight::Heavy;
                    break;
                case NitroFontWeight::BLACK:
                    textAttributes.fontWeight = RNFontWeight::Black;
                    break;
                default:
                    textAttributes.fontWeight = RNFontWeight::Regular;
                }
            }

            if (props.lineHeight.value.has_value())
            {
                textAttributes.lineHeight = props.lineHeight.value.value();
            }
            if (props.textAlign.value.has_value())
            {
                using NitroAlign = margelo::nitro::nitrotext::TextAlign;
                using RNAlign = facebook::react::TextAlignment;
                switch (props.textAlign.value.value())
                {
                case NitroAlign::AUTO:
                    textAttributes.alignment = RNAlign::Natural;
                    break;
                case NitroAlign::LEFT:
                    textAttributes.alignment = RNAlign::Left;
                    break;
                case NitroAlign::RIGHT:
                    textAttributes.alignment = RNAlign::Right;
                    break;
                case NitroAlign::CENTER:
                    textAttributes.alignment = RNAlign::Center;
                    break;
                case NitroAlign::JUSTIFY:
                    textAttributes.alignment = RNAlign::Justified;
                    break;
                default:
                    textAttributes.alignment = RNAlign::Natural;
                    break;
                }
            }
            if (props.textTransform.value.has_value())
            {
                using NitroTransform = margelo::nitro::nitrotext::TextTransform;
                using RNTransform = facebook::react::TextTransform;
                switch (props.textTransform.value.value())
                {
                case NitroTransform::NONE:
                    textAttributes.textTransform = RNTransform::None;
                    break;
                case NitroTransform::UPPERCASE:
                    textAttributes.textTransform = RNTransform::Uppercase;
                    break;
                case NitroTransform::LOWERCASE:
                    textAttributes.textTransform = RNTransform::Lowercase;
                    break;
                case NitroTransform::CAPITALIZE:
                    textAttributes.textTransform = RNTransform::Capitalize;
                    break;
                default:
                    textAttributes.textTransform = RNTransform::None;
                    break;
                }
            }
            // NOTE: You can also map fontWeight/fontStyle/fontColor into
            // textAttributes here when you settle on your Fragment <->
            // TextAttributes mapping.

            react::AttributedString attributedString;
            attributedString.appendFragment(react::AttributedString::Fragment{
                .string = textToMeasure,
                .textAttributes = textAttributes,
                .parentShadowView = react::ShadowView(*this)});

            react::ParagraphAttributes paragraphAttributes;
            if (props.numberOfLines.value.has_value())
            {
                auto n =
                    static_cast<int>(std::round(props.numberOfLines.value.value()));
                if (n > 0)
                {
                    paragraphAttributes.maximumNumberOfLines = n;
                }
            }

            // 3) Ensure we have a TextLayoutManager (set in ComponentDescriptor::adopt)
            if (!textLayoutManager_)
            {
                // Echo back the given width to avoid "invalid measurement" logs.
                return layoutConstraints.clamp({width, 0.f});
            }

            // 4) Pin width and measure
            react::LayoutConstraints pinned = layoutConstraints;
            pinned.minimumSize.width = width;
            pinned.maximumSize.width = width;

            react::TextLayoutContext textLayoutContext{
                .pointScaleFactor = layoutContext.pointScaleFactor,
                .surfaceId = this->getSurfaceId(),
            };

            const auto measurement = textLayoutManager_->measure(
                react::AttributedStringBox{attributedString}, paragraphAttributes,
                textLayoutContext, pinned);

            // 5) Return (width, measured.height) and clamp to constraints
            react::Size out{width, measurement.size.height};
            return layoutConstraints.clamp(out);
        }

        react::Float baseline(const react::LayoutContext & /*layoutContext*/,
                              react::Size size) const override
        {
            // Simple approximation: baseline at the bottom.
            // For tighter accuracy, compute from font metrics via
            // TextLayoutManager.
            return size.height;
        }

    private:
        std::shared_ptr<const react::TextLayoutManager> textLayoutManager_;
    };

} // namespace margelo::nitro::nitrotext::views
