//
// NitroTextShadowNode.cpp
//
//

#include "NitroTextShadowNode.hpp"

#include "NitroHtmlUtils.hpp"

#include <cmath>
#include <optional>
#include <string>
#include <utility>

#if defined(__ANDROID__)
#include <android/log.h>
#endif

#include <react/renderer/attributedstring/AttributedStringBox.h>

#if __has_include(<cxxreact/ReactNativeVersion.h>)
#include <cxxreact/ReactNativeVersion.h>
#endif

#if defined(REACT_NATIVE_VERSION_MAJOR)
#define RN_VERSION_AT_LEAST(major, minor)                                                     \
  ((REACT_NATIVE_VERSION_MAJOR > (major)) ||                                                  \
   (REACT_NATIVE_VERSION_MAJOR == (major) && REACT_NATIVE_VERSION_MINOR >= (minor)))
#else
#define RN_VERSION_AT_LEAST(major, minor) 0
#endif

namespace margelo::nitro::nitrotext::views {

react::ShadowNodeTraits NitroTextShadowNode::BaseTraits()
{
  auto traits = ConcreteViewShadowNode::BaseTraits();
  traits.set(react::ShadowNodeTraits::Trait::LeafYogaNode);
  traits.set(react::ShadowNodeTraits::Trait::MeasurableYogaNode);
  traits.set(react::ShadowNodeTraits::Trait::BaselineYogaNode);
  return traits;
}

void NitroTextShadowNode::setTextLayoutManager(
    std::shared_ptr<const react::TextLayoutManager> tlm)
{
  textLayoutManager_ = std::move(tlm);
}

react::Size NitroTextShadowNode::measureContent(
    const react::LayoutContext &layoutContext,
    const react::LayoutConstraints &layoutConstraints) const
{
  const auto &props = this->getConcreteProps();
  using NitroRenderer = margelo::nitro::nitrotext::NitroRenderer;
  const bool isHtmlRenderer = props.renderer.value.has_value() &&
    props.renderer.value.value() == NitroRenderer::HTML;

  auto makeTextAttributes =
      [&](const std::optional<margelo::nitro::nitrotext::Fragment> &fragOpt) {
        auto a = react::TextAttributes::defaultTextAttributes();

        // backgroundColor
//                if (props.fragmentBackgroundColor.value.has_value())
//                {
//                    a.backgroundColor = props.fragmentBackgroundColor.value.value();
//                }

        // allowFontScaling
        bool allowFontScaling = props.allowFontScaling.value.value_or(true);
        a.allowFontScaling = allowFontScaling;
        a.fontSizeMultiplier = allowFontScaling ? layoutContext.fontSizeMultiplier : 1.0f;

        if (props.dynamicTypeRamp.value.has_value())
        {
          using NitroDTR = margelo::nitro::nitrotext::DynamicTypeRamp;
          using RNDTR = facebook::react::DynamicTypeRamp;
          switch (props.dynamicTypeRamp.value.value())
          {
          case NitroDTR::CAPTION2:
            a.dynamicTypeRamp = RNDTR::Caption2;
            break;
          case NitroDTR::CAPTION1:
            a.dynamicTypeRamp = RNDTR::Caption1;
            break;
          case NitroDTR::FOOTNOTE:
            a.dynamicTypeRamp = RNDTR::Footnote;
            break;
          case NitroDTR::SUBHEADLINE:
            a.dynamicTypeRamp = RNDTR::Subheadline;
            break;
          case NitroDTR::CALLOUT:
            a.dynamicTypeRamp = RNDTR::Callout;
            break;
          case NitroDTR::BODY:
            a.dynamicTypeRamp = RNDTR::Body;
            break;
          case NitroDTR::HEADLINE:
            a.dynamicTypeRamp = RNDTR::Headline;
            break;
          case NitroDTR::TITLE3:
            a.dynamicTypeRamp = RNDTR::Title3;
            break;
          case NitroDTR::TITLE2:
            a.dynamicTypeRamp = RNDTR::Title2;
            break;
          case NitroDTR::TITLE1:
            a.dynamicTypeRamp = RNDTR::Title1;
            break;
          case NitroDTR::LARGETITLE:
            a.dynamicTypeRamp = RNDTR::LargeTitle;
            break;
          }
        }

        // fontSize
        if (fragOpt.has_value() && fragOpt->fontSize.has_value())
        {
          a.fontSize = fragOpt->fontSize.value();
        }
        else if (props.fontSize.value.has_value())
        {
          a.fontSize = props.fontSize.value.value();
        }

        // fontStyle
        auto applyFontStyle = [&](margelo::nitro::nitrotext::FontStyle s)
        {
          using RNFontStyle = facebook::react::FontStyle;
          using NitroFontStyle = margelo::nitro::nitrotext::FontStyle;
          switch (s)
          {
          case NitroFontStyle::NORMAL:
            a.fontStyle = RNFontStyle::Normal;
            break;
          case NitroFontStyle::ITALIC:
            a.fontStyle = RNFontStyle::Italic;
            break;
          case NitroFontStyle::OBLIQUE:
            a.fontStyle = RNFontStyle::Oblique;
            break;
          }
        };

        if (fragOpt.has_value() && fragOpt->fontStyle.has_value())
        {
          applyFontStyle(fragOpt->fontStyle.value());
        }
        else if (props.fontStyle.value.has_value())
        {
          applyFontStyle(props.fontStyle.value.value());
        }

        // fontFamily
        if (fragOpt.has_value() && fragOpt->fontFamily.has_value())
        {
          a.fontFamily = fragOpt->fontFamily.value();
        }
        else if (props.fontFamily.value.has_value())
        {
          a.fontFamily = props.fontFamily.value.value();
        }

        // fontWeight
        auto applyFontWeight = [&](margelo::nitro::nitrotext::FontWeight w)
        {
          using RNFontWeight = facebook::react::FontWeight;
          using NitroFontWeight = margelo::nitro::nitrotext::FontWeight;
          switch (w)
          {
          case NitroFontWeight::ULTRALIGHT:
            a.fontWeight = RNFontWeight::UltraLight;
            break;
          case NitroFontWeight::THIN:
            a.fontWeight = RNFontWeight::Thin;
            break;
          case NitroFontWeight::LIGHT:
            a.fontWeight = RNFontWeight::Light;
            break;
          case NitroFontWeight::REGULAR:
            a.fontWeight = RNFontWeight::Regular;
            break;
          case NitroFontWeight::MEDIUM:
            a.fontWeight = RNFontWeight::Medium;
            break;
          case NitroFontWeight::SEMIBOLD:
            a.fontWeight = RNFontWeight::Semibold;
            break;
          case NitroFontWeight::BOLD:
            a.fontWeight = RNFontWeight::Bold;
            break;
          case NitroFontWeight::HEAVY:
            a.fontWeight = RNFontWeight::Heavy;
            break;
          case NitroFontWeight::BLACK:
            a.fontWeight = RNFontWeight::Black;
            break;
          default:
            a.fontWeight = RNFontWeight::Regular;
            break;
          }
        };

        if (fragOpt.has_value() && fragOpt->fontWeight.has_value())
        {
          applyFontWeight(fragOpt->fontWeight.value());
        }
        else if (props.fontWeight.value.has_value())
        {
          applyFontWeight(props.fontWeight.value.value());
        }

        // lineHeight
        if (fragOpt.has_value() && fragOpt->lineHeight.has_value())
        {
          a.lineHeight = fragOpt->lineHeight.value();
        }
        else if (props.lineHeight.value.has_value())
        {
          a.lineHeight = props.lineHeight.value.value();
        }

        // letterSpacing
        if (fragOpt.has_value() && fragOpt->letterSpacing.has_value())
        {
          a.letterSpacing = fragOpt->letterSpacing.value();
        }
        else if (props.letterSpacing.value.has_value())
        {
          a.letterSpacing = props.letterSpacing.value.value();
        }

        // textAlign
        auto applyAlign = [&](margelo::nitro::nitrotext::TextAlign al)
        {
          using RNAlign = facebook::react::TextAlignment;
          using NitroAlign = margelo::nitro::nitrotext::TextAlign;
          switch (al)
          {
          case NitroAlign::AUTO:
            a.alignment = RNAlign::Natural;
            break;
          case NitroAlign::LEFT:
            a.alignment = RNAlign::Left;
            break;
          case NitroAlign::RIGHT:
            a.alignment = RNAlign::Right;
            break;
          case NitroAlign::CENTER:
            a.alignment = RNAlign::Center;
            break;
          case NitroAlign::JUSTIFY:
            a.alignment = RNAlign::Justified;
            break;
          default:
            a.alignment = RNAlign::Natural;
            break;
          }
        };
        if (fragOpt.has_value() && fragOpt->textAlign.has_value())
        {
          applyAlign(fragOpt->textAlign.value());
        }
        else if (props.textAlign.value.has_value())
        {
          applyAlign(props.textAlign.value.value());
        }

        // textTransform
        auto applyTransform = [&](margelo::nitro::nitrotext::TextTransform t)
        {
          using RNTransform = facebook::react::TextTransform;
          using NitroTransform = margelo::nitro::nitrotext::TextTransform;
          switch (t)
          {
          case NitroTransform::NONE:
            a.textTransform = RNTransform::None;
            break;
          case NitroTransform::UPPERCASE:
            a.textTransform = RNTransform::Uppercase;
            break;
          case NitroTransform::LOWERCASE:
            a.textTransform = RNTransform::Lowercase;
            break;
          case NitroTransform::CAPITALIZE:
            a.textTransform = RNTransform::Capitalize;
            break;
          default:
            a.textTransform = RNTransform::None;
            break;
          }
        };
        if (fragOpt.has_value() && fragOpt->textTransform.has_value())
        {
          applyTransform(fragOpt->textTransform.value());
        }
        else if (props.textTransform.value.has_value())
        {
          applyTransform(props.textTransform.value.value());
        }

        if (props.lineBreakStrategyIOS.value.has_value())
        {
          using RNLineBreakStrategy = facebook::react::LineBreakStrategy;
          using NitroLBS = margelo::nitro::nitrotext::LineBreakStrategyIOS;
          switch (props.lineBreakStrategyIOS.value.value())
          {
          case NitroLBS::NONE:
            a.lineBreakStrategy = RNLineBreakStrategy::None;
            break;
          case NitroLBS::STANDARD:
            a.lineBreakStrategy = RNLineBreakStrategy::Standard;
            break;
          case NitroLBS::HANGUL_WORD:
            a.lineBreakStrategy = RNLineBreakStrategy::HangulWordPriority;
            break;
          case NitroLBS::PUSH_OUT:
            a.lineBreakStrategy = RNLineBreakStrategy::PushOut;
            break;
          }
        }

        // maxFontSizeMultiplier
        if (props.maxFontSizeMultiplier.value.has_value())
        {
          a.maxFontSizeMultiplier = props.maxFontSizeMultiplier.value.value();
        }

        // Layout direction (match RN ParagraphShadowNode)
        a.layoutDirection = layoutConstraints.layoutDirection;

        return a;
      };

      react::AttributedString attributedString;
      // // Set base attributes like RN's ParagraphShadowNode
      // {
      //     auto base = makeTextAttributes(std::nullopt);
      //     attributedString.setBaseTextAttributes(base);
      // }
      if (props.fragments.value.has_value())
      {
        const auto &frags = props.fragments.value.value();
        for (const auto &f : frags)
        {
          const std::string fragmentText = f.text.has_value() ? f.text.value() : std::string("");
          const std::string sanitizedFragmentText =
            isHtmlRenderer ? html::NitroHtmlUtils::stripTags(fragmentText)
                           : fragmentText;
          if (sanitizedFragmentText.empty())
            continue;
          auto attrs = makeTextAttributes(f);
          attributedString.appendFragment(react::AttributedString::Fragment{
            .string = sanitizedFragmentText,
            .textAttributes = attrs,
            .parentShadowView = react::ShadowView(*this)});
        }
      }
      else
      {
        const std::string textToMeasure = props.text.value.has_value() ? props.text.value.value() : std::string("");
        const std::string sanitizedText =
          isHtmlRenderer ? html::NitroHtmlUtils::stripTags(textToMeasure)
                          : textToMeasure;
#if defined(__ANDROID__)
#if defined(__FILE_NAME__)
        constexpr const char *kFileName = __FILE_NAME__;
#else
        constexpr const char *kFileName = __FILE__;
#endif
        __android_log_print(
          ANDROID_LOG_INFO,
          "NitroTextShadowNode",
          "%s:%d textToMeasure: %s",
          kFileName,
          __LINE__,
          sanitizedText.c_str());
#else
        LOG(INFO) << "textToMeasure: " << sanitizedText;
#endif
        auto attrs = makeTextAttributes(std::nullopt);
        attributedString.appendFragment(react::AttributedString::Fragment{
          .string = sanitizedText,
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

      if (props.adjustsFontSizeToFit.value.has_value())
      {
        paragraphAttributes.adjustsFontSizeToFit = props.adjustsFontSizeToFit.value.value();
      }
      // Keep minimumFontScale as-is; RCTTextLayoutManager primarily uses minimumFontSize,
      // but leaving the scale here avoids over-adjusting and potential divergences.
      if (props.minimumFontScale.value.has_value())
      {
#if RN_VERSION_AT_LEAST(0, 81)
        paragraphAttributes.minimumFontScale = props.minimumFontScale.value.value();
#else
        // React Native < 0.81 does not expose paragraphAttributes.minimumFontScale yet.
#endif
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

      // Ensure we have a TextLayoutManager (set in ComponentDescriptor::adopt)
      if (!textLayoutManager_)
      {
        // Echo back the given width to avoid "invalid measurement" logs.
        return layoutConstraints.clamp({0.f, 0.f});
      }

      // Measure using given constraints (Yoga already accounts for padding/border).
      react::TextLayoutContext textLayoutContext{
        .pointScaleFactor = layoutContext.pointScaleFactor,
#if RN_VERSION_AT_LEAST(0, 81)
        // Older React Native versions didn't surface `surfaceId` on TextLayoutContext.
        .surfaceId = this->getSurfaceId(),
#endif
      };

      const auto measurement = textLayoutManager_->measure(
        react::AttributedStringBox{attributedString}, paragraphAttributes,
        textLayoutContext, layoutConstraints);

      return layoutConstraints.clamp(measurement.size);
    }

react::Float NitroTextShadowNode::baseline(
    const react::LayoutContext &layoutContext, react::Size size) const
{
  (void)layoutContext;
  // Simple approximation: baseline at the bottom.
  // TODO: compute from font metrics via TextLayoutManager for tighter accuracy (but works for now).
  return size.height;
}

} // namespace margelo::nitro::nitrotext::views
