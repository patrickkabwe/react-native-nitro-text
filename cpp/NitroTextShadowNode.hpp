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

namespace margelo::nitro::nitrotext::views {

/**
 * The Shadow Node for the "NitroText" View.
 * Mark as a Leaf + Measurable Yoga node so Fabric queries the ShadowNode for
 * size. (We measure cross-platform in C++ using TextLayoutManager, like
 * Paragraph.)
 */
class NitroTextShadowNode final
    : public react::ConcreteViewShadowNode<
          HybridNitroTextComponentName,
          HybridNitroTextProps,
          react::ViewEventEmitter,
          HybridNitroTextState> {
public:
  using ConcreteViewShadowNode::ConcreteViewShadowNode;

  static react::ShadowNodeTraits BaseTraits();

  void setTextLayoutManager(
      std::shared_ptr<const react::TextLayoutManager> tlm);

protected:
  react::Size measureContent(
      const react::LayoutContext &layoutContext,
      const react::LayoutConstraints &layoutConstraints) const override;

  react::Float baseline(const react::LayoutContext &layoutContext,
                        react::Size size) const override;

private:
  std::shared_ptr<const react::TextLayoutManager> textLayoutManager_;
};

} // namespace margelo::nitro::nitrotext::views
