//
// NitroTextShadowNode.cpp
//

#include "NitroTextShadowNode.hpp"
#include "NitroTextUtil.hpp"

#include <cmath>
#include <optional>
#include <string>
#include <utility>

#include <react/renderer/attributedstring/AttributedStringBox.h>
#include <react/renderer/textlayoutmanager/TextLayoutManagerExtended.h>

#if __has_include(<cxxreact/ReactNativeVersion.h>)
#include <cxxreact/ReactNativeVersion.h>
#endif

namespace margelo::nitro::nitrotext::views {

namespace {

struct NitroTextLayoutInputs {
  react::AttributedString attributedString;
  react::ParagraphAttributes paragraphAttributes;
};

std::optional<NitroTextLayoutInputs> prepareTextLayoutInputs(
    const NitroTextShadowNode &node,
    const react::LayoutContext &layoutContext,
    const react::LayoutConstraints &layoutConstraints)
{
  const auto &props = node.getConcreteProps();

  auto makeTextAttributes =
      [&](const std::optional<margelo::nitro::nitrotext::Fragment> &fragOpt) {
        auto a = react::TextAttributes::defaultTextAttributes();

        if (props.allowFontScaling.value.has_value()) {
          bool allowFontScaling = props.allowFontScaling.value.value();
          a.allowFontScaling = allowFontScaling;
          a.fontSizeMultiplier =
              allowFontScaling ? layoutContext.fontSizeMultiplier : 1.0f;
        } else {
          a.fontSizeMultiplier = layoutContext.fontSizeMultiplier;
        }

        if (props.dynamicTypeRamp.value.has_value()) {
          using NitroDTR = margelo::nitro::nitrotext::DynamicTypeRamp;
          using RNDTR = facebook::react::DynamicTypeRamp;
          switch (props.dynamicTypeRamp.value.value()) {
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

        if (fragOpt.has_value() && fragOpt->fontSize.has_value()) {
          a.fontSize = fragOpt->fontSize.value();
        } else if (props.fontSize.value.has_value()) {
          a.fontSize = props.fontSize.value.value();
        }

        auto applyFontStyle =
            [&](margelo::nitro::nitrotext::FontStyle s) {
              using RNFontStyle = facebook::react::FontStyle;
              using NitroFontStyle = margelo::nitro::nitrotext::FontStyle;
              switch (s) {
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

        if (fragOpt.has_value() && fragOpt->fontStyle.has_value()) {
          applyFontStyle(fragOpt->fontStyle.value());
        } else if (props.fontStyle.value.has_value()) {
          applyFontStyle(props.fontStyle.value.value());
        }

        if (fragOpt.has_value() && fragOpt->fontFamily.has_value()) {
          a.fontFamily = fragOpt->fontFamily.value();
        } else if (props.fontFamily.value.has_value()) {
          a.fontFamily = props.fontFamily.value.value();
        }

        auto applyFontWeight =
            [&](margelo::nitro::nitrotext::FontWeight w) {
              using RNFontWeight = facebook::react::FontWeight;
              using NitroFontWeight = margelo::nitro::nitrotext::FontWeight;
              switch (w) {
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

        if (fragOpt.has_value() && fragOpt->fontWeight.has_value()) {
          applyFontWeight(fragOpt->fontWeight.value());
        } else if (props.fontWeight.value.has_value()) {
          applyFontWeight(props.fontWeight.value.value());
        }

        if (fragOpt.has_value() && fragOpt->lineHeight.has_value()) {
          a.lineHeight = fragOpt->lineHeight.value();
        } else if (props.lineHeight.value.has_value()) {
          a.lineHeight = props.lineHeight.value.value();
        }

        if (fragOpt.has_value() && fragOpt->letterSpacing.has_value()) {
          a.letterSpacing = fragOpt->letterSpacing.value();
        } else if (props.letterSpacing.value.has_value()) {
          a.letterSpacing = props.letterSpacing.value.value();
        }

        auto applyAlign = [&](margelo::nitro::nitrotext::TextAlign al) {
          using RNAlign = facebook::react::TextAlignment;
          using NitroAlign = margelo::nitro::nitrotext::TextAlign;
          switch (al) {
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

        if (fragOpt.has_value() && fragOpt->textAlign.has_value()) {
          applyAlign(fragOpt->textAlign.value());
        } else if (props.textAlign.value.has_value()) {
          applyAlign(props.textAlign.value.value());
        }

        auto applyTransform =
            [&](margelo::nitro::nitrotext::TextTransform t) {
              using RNTransform = facebook::react::TextTransform;
              using NitroTransform = margelo::nitro::nitrotext::TextTransform;
              switch (t) {
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

        if (fragOpt.has_value() && fragOpt->textTransform.has_value()) {
          applyTransform(fragOpt->textTransform.value());
        } else if (props.textTransform.value.has_value()) {
          applyTransform(props.textTransform.value.value());
        }

        if (props.lineBreakStrategyIOS.value.has_value()) {
          using RNLineBreakStrategy = facebook::react::LineBreakStrategy;
          using NitroLBS = margelo::nitro::nitrotext::LineBreakStrategyIOS;
          switch (props.lineBreakStrategyIOS.value.value()) {
          case NitroLBS::NONE:
            a.lineBreakStrategy = RNLineBreakStrategy::None;
            break;
          case NitroLBS::STANDARD:
            a.lineBreakStrategy = RNLineBreakStrategy::Standard;
            break;
          case NitroLBS::HANGUL_WORD:
            a.lineBreakStrategy =
                RNLineBreakStrategy::HangulWordPriority;
            break;
          case NitroLBS::PUSH_OUT:
            a.lineBreakStrategy = RNLineBreakStrategy::PushOut;
            break;
          }
        }

        if (props.maxFontSizeMultiplier.value.has_value()) {
          a.maxFontSizeMultiplier =
              props.maxFontSizeMultiplier.value.value();
        }

        a.layoutDirection = layoutConstraints.layoutDirection;

        return a;
      };

  react::AttributedString attributedString;

  if (props.fragments.value.has_value()) {
    const auto &frags = props.fragments.value.value();
    size_t lastNonEmptyIndex = SIZE_MAX;

    for (size_t i = frags.size(); i > 0; i--) {
      const std::string fragmentText =
          frags[i - 1].text.has_value() ? frags[i - 1].text.value()
                                        : std::string("");
      if (!fragmentText.empty()) {
        lastNonEmptyIndex = i - 1;
        break;
      }
    }

    const react::ShadowView shadowView(node);

    for (size_t i = 0; i < frags.size(); i++) {
      const auto &f = frags[i];
      std::string fragmentText =
          f.text.has_value() ? f.text.value() : std::string("");
      if (fragmentText.empty()) {
        continue;
      }

      if (i == lastNonEmptyIndex) {
        if (!fragmentText.empty() &&
            (fragmentText.back() == ' ' || fragmentText.back() == '\t' ||
             fragmentText.back() == '\n' || fragmentText.back() == '\r')) {
          size_t lastNonWhitespace =
              fragmentText.find_last_not_of(" \t\n\r\f\v");
          if (lastNonWhitespace != std::string::npos) {
            fragmentText = fragmentText.substr(0, lastNonWhitespace + 1);
          } else {
            continue;
          }
        }
      }

      auto attrs = makeTextAttributes(f);
      attributedString.appendFragment(react::AttributedString::Fragment{
          .string = fragmentText,
          .textAttributes = attrs,
          .parentShadowView = shadowView});
    }
  } else {
    const std::string textToMeasure =
        props.text.value.has_value() ? props.text.value.value()
                                     : std::string("");

    if (textToMeasure.empty()) {
      return std::nullopt;
    }

    const react::ShadowView shadowView(node);

    if (!props.fontSize.value.has_value() &&
        !props.fontWeight.value.has_value() &&
        !props.fontStyle.value.has_value() &&
        !props.fontFamily.value.has_value() &&
        !props.fontColor.value.has_value() &&
        !props.textAlign.value.has_value() &&
        !props.textTransform.value.has_value() &&
        !props.lineHeight.value.has_value() &&
        !props.letterSpacing.value.has_value() &&
        !props.textDecorationLine.value.has_value() &&
        !props.textDecorationColor.value.has_value() &&
        !props.textDecorationStyle.value.has_value() &&
        !props.dynamicTypeRamp.value.has_value() &&
        !props.allowFontScaling.value.has_value()) {
      auto attrs = react::TextAttributes::defaultTextAttributes();
      attrs.layoutDirection = layoutConstraints.layoutDirection;
      attrs.fontSizeMultiplier = layoutContext.fontSizeMultiplier;
      attributedString.appendFragment(react::AttributedString::Fragment{
          .string = textToMeasure,
          .textAttributes = attrs,
          .parentShadowView = shadowView});
    } else {
      auto attrs = makeTextAttributes(std::nullopt);
      attributedString.appendFragment(react::AttributedString::Fragment{
          .string = textToMeasure,
          .textAttributes = attrs,
          .parentShadowView = shadowView});
    }
  }

  react::ParagraphAttributes paragraphAttributes;

  bool needsParagraphAttrs =
      props.numberOfLines.value.has_value() ||
      props.adjustsFontSizeToFit.value.has_value() ||
      props.minimumFontScale.value.has_value() ||
      props.ellipsizeMode.value.has_value();

  if (needsParagraphAttrs) {
    if (props.numberOfLines.value.has_value()) {
      auto n =
          static_cast<int>(std::round(props.numberOfLines.value.value()));
      if (n > 0) {
        paragraphAttributes.maximumNumberOfLines = n;
      }
    }

    if (props.adjustsFontSizeToFit.value.has_value()) {
      paragraphAttributes.adjustsFontSizeToFit =
          props.adjustsFontSizeToFit.value.value();
    }

    if (props.minimumFontScale.value.has_value()) {
#if RN_VERSION_AT_LEAST(0, 81)
      paragraphAttributes.minimumFontScale =
          props.minimumFontScale.value.value();
#endif
    }

    if (props.ellipsizeMode.value.has_value()) {
      using NitroEllipsizeMode =
          margelo::nitro::nitrotext::EllipsizeMode;
      using RNEllipsizeMode = facebook::react::EllipsizeMode;
      switch (props.ellipsizeMode.value.value()) {
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
  }

  return NitroTextLayoutInputs{
      .attributedString = std::move(attributedString),
      .paragraphAttributes = paragraphAttributes,
  };
}

} // namespace

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
  const auto layoutInputs =
      prepareTextLayoutInputs(*this, layoutContext, layoutConstraints);

  if (!layoutInputs.has_value()) {
    return layoutConstraints.clamp({0.f, 0.f});
  }

  if (!textLayoutManager_) {
    return layoutConstraints.clamp({0.f, 0.f});
  }

  react::TextLayoutContext textLayoutContext{
      .pointScaleFactor = layoutContext.pointScaleFactor,
  };

  const auto measurement = textLayoutManager_->measure(
      react::AttributedStringBox{layoutInputs->attributedString},
      layoutInputs->paragraphAttributes,
      textLayoutContext,
      layoutConstraints);

  return layoutConstraints.clamp(measurement.size);
}

react::Float NitroTextShadowNode::baseline(
    const react::LayoutContext &layoutContext, react::Size size) const
{
  if (!textLayoutManager_) {
    return size.height;
  }

  const auto layoutMetrics = getLayoutMetrics();
  react::LayoutConstraints layoutConstraints{
      .minimumSize = size,
      .maximumSize = size,
      .layoutDirection = layoutMetrics.layoutDirection};

  const auto layoutInputs =
      prepareTextLayoutInputs(*this, layoutContext, layoutConstraints);

  if (!layoutInputs.has_value()) {
    return size.height;
  }

  const react::AttributedStringBox attributedStringBox{
      layoutInputs->attributedString};

  if constexpr (react::TextLayoutManagerExtended::supportsLineMeasurement()) {
    const auto lines = react::TextLayoutManagerExtended(*textLayoutManager_)
                           .measureLines(
                               attributedStringBox,
                               layoutInputs->paragraphAttributes,
                               size);
    if (!lines.empty()) {
      return react::LineMeasurement::baseline(lines);
    }
  } else {
    return size.height;
  }

  return size.height;
}

} // namespace margelo::nitro::nitrotext::views
