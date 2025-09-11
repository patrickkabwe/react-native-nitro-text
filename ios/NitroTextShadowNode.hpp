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

            // 2) Build AttributedString with per-fragment attributes to mirror rendering
            const auto &props = this->getConcreteProps();

            auto makeTextAttributes = [&](const std::optional<margelo::nitro::nitrotext::Fragment> &fragOpt) {
                react::TextAttributes a = react::TextAttributes::defaultTextAttributes();
                
                // allowFontScaling
                bool allowFontScaling = props.allowFontScaling.value.value_or(true);
                a.allowFontScaling = allowFontScaling;
                a.fontSizeMultiplier = allowFontScaling ? layoutContext.fontSizeMultiplier : 1.0f;
                a.dynamicTypeRamp = facebook::react::DynamicTypeRamp::Body;

                // fontSize
                if (fragOpt.has_value() && fragOpt->fontSize.has_value()) {
                    a.fontSize = fragOpt->fontSize.value();
                } else if (props.fontSize.value.has_value()) {
                    a.fontSize = props.fontSize.value.value();
                }

                // fontStyle
                auto applyFontStyle = [&](margelo::nitro::nitrotext::FontStyle s) {
                    using RNFontStyle = facebook::react::FontStyle;
                    using NitroFontStyle = margelo::nitro::nitrotext::FontStyle;
                    switch (s) {
                        case NitroFontStyle::NORMAL:  a.fontStyle = RNFontStyle::Normal; break;
                        case NitroFontStyle::ITALIC:  a.fontStyle = RNFontStyle::Italic; break;
                        case NitroFontStyle::OBLIQUE: a.fontStyle = RNFontStyle::Oblique; break;
                    }
                };
                
                if (fragOpt.has_value() && fragOpt->fontStyle.has_value()) {
                    applyFontStyle(fragOpt->fontStyle.value());
                } else if (props.fontStyle.value.has_value()) {
                    applyFontStyle(props.fontStyle.value.value());
                }

                // fontWeight
                auto applyFontWeight = [&](margelo::nitro::nitrotext::FontWeight w) {
                    using RNFontWeight = facebook::react::FontWeight;
                    using NitroFontWeight = margelo::nitro::nitrotext::FontWeight;
                    switch (w) {
                        case NitroFontWeight::ULTRALIGHT: a.fontWeight = RNFontWeight::UltraLight; break;
                        case NitroFontWeight::THIN:       a.fontWeight = RNFontWeight::Thin; break;
                        case NitroFontWeight::LIGHT:      a.fontWeight = RNFontWeight::Light; break;
                        case NitroFontWeight::REGULAR:    a.fontWeight = RNFontWeight::Regular; break;
                        case NitroFontWeight::MEDIUM:     a.fontWeight = RNFontWeight::Medium; break;
                        case NitroFontWeight::SEMIBOLD:   a.fontWeight = RNFontWeight::Semibold; break;
                        case NitroFontWeight::BOLD:       a.fontWeight = RNFontWeight::Bold; break;
                        case NitroFontWeight::HEAVY:      a.fontWeight = RNFontWeight::Heavy; break;
                        case NitroFontWeight::BLACK:      a.fontWeight = RNFontWeight::Black; break;
                        default:                          a.fontWeight = RNFontWeight::Regular; break;
                    }
                };
                
                if (fragOpt.has_value() && fragOpt->fontWeight.has_value()) {
                    applyFontWeight(fragOpt->fontWeight.value());
                } else if (props.fontWeight.value.has_value()) {
                    applyFontWeight(props.fontWeight.value.value());
                }

                // lineHeight
                if (fragOpt.has_value() && fragOpt->lineHeight.has_value()) {
                    a.lineHeight = fragOpt->lineHeight.value();
                } else if (props.lineHeight.value.has_value()) {
                    a.lineHeight = props.lineHeight.value.value();
                }

                // textAlign
                auto applyAlign = [&](margelo::nitro::nitrotext::TextAlign al) {
                    using RNAlign = facebook::react::TextAlignment;
                    using NitroAlign = margelo::nitro::nitrotext::TextAlign;
                    switch (al) {
                        case NitroAlign::AUTO:     a.alignment = RNAlign::Natural; break;
                        case NitroAlign::LEFT:     a.alignment = RNAlign::Left; break;
                        case NitroAlign::RIGHT:    a.alignment = RNAlign::Right; break;
                        case NitroAlign::CENTER:   a.alignment = RNAlign::Center; break;
                        case NitroAlign::JUSTIFY:  a.alignment = RNAlign::Justified; break;
                        default:                    a.alignment = RNAlign::Natural; break;
                    }
                };
                if (fragOpt.has_value() && fragOpt->textAlign.has_value()) {
                    applyAlign(fragOpt->textAlign.value());
                } else if (props.textAlign.value.has_value()) {
                    applyAlign(props.textAlign.value.value());
                }

                // Effective textTransform
                auto applyTransform = [&](margelo::nitro::nitrotext::TextTransform t) {
                    using RNTransform = facebook::react::TextTransform;
                    using NitroTransform = margelo::nitro::nitrotext::TextTransform;
                    switch (t) {
                        case NitroTransform::NONE:       a.textTransform = RNTransform::None; break;
                        case NitroTransform::UPPERCASE:  a.textTransform = RNTransform::Uppercase; break;
                        case NitroTransform::LOWERCASE:  a.textTransform = RNTransform::Lowercase; break;
                        case NitroTransform::CAPITALIZE: a.textTransform = RNTransform::Capitalize; break;
                        default:                          a.textTransform = RNTransform::None; break;
                    }
                };
                if (fragOpt.has_value() && fragOpt->textTransform.has_value()) {
                    applyTransform(fragOpt->textTransform.value());
                } else if (props.textTransform.value.has_value()) {
                    applyTransform(props.textTransform.value.value());
                }

                return a;
            };

            react::AttributedString attributedString;
            if (props.fragments.value.has_value()) {
                const auto &frags = props.fragments.value.value();
                for (const auto &f : frags) {
                    const std::string fragmentText = f.text.has_value() ? f.text.value() : std::string("");
                    if (fragmentText.empty()) continue;
                    auto attrs = makeTextAttributes(f);
                    attributedString.appendFragment(react::AttributedString::Fragment{
                        .string = fragmentText,
                        .textAttributes = attrs,
                        .parentShadowView = react::ShadowView(*this)});
                }
            } else {
                const std::string textToMeasure = props.text.value.has_value() ? props.text.value.value() : std::string("");
                auto attrs = makeTextAttributes(std::nullopt);
                attributedString.appendFragment(react::AttributedString::Fragment{
                    .string = textToMeasure,
                    .textAttributes = attrs,
                    .parentShadowView = react::ShadowView(*this)});
            }

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
            
            if (props.ellipsizeMode.value.has_value())
            {
                using NitroEllipsizeMode = margelo::nitro::nitrotext::EllipsizeMode;
                using RNEllipsizeMode = facebook::react::EllipsizeMode;
                switch (props.ellipsizeMode.value.value())
                {
                case NitroEllipsizeMode::CLIP:
                    paragraphAttributes.ellipsizeMode = RNEllipsizeMode::Clip;
                    break;
                case NitroEllipsizeMode::HEAD:
                    paragraphAttributes.ellipsizeMode = RNEllipsizeMode::Head;
                    break;
                case NitroEllipsizeMode::MIDDLE:
                    paragraphAttributes.ellipsizeMode = RNEllipsizeMode::Middle;
                    break;
                case NitroEllipsizeMode::TAIL:
                    paragraphAttributes.ellipsizeMode = RNEllipsizeMode::Tail;
                    break;
                default:
                    paragraphAttributes.ellipsizeMode = RNEllipsizeMode::Tail;
                    break;
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
