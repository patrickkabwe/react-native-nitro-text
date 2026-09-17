//
// NitroTextComponentDescriptor.cpp
// Shared implementation for custom ComponentDescriptor
//

#include "NitroTextComponentDescriptor.hpp"
#include <NitroModules/RawPropsCompat.hpp>
#include <react/renderer/textlayoutmanager/TextLayoutManager.h>

using namespace facebook;
using namespace margelo::nitro::nitrotext::views;

NitroTextComponentDescriptor::NitroTextComponentDescriptor(const react::ComponentDescriptorParameters& parameters)
    : ConcreteComponentDescriptor(parameters,
                                  margelo::nitro::RawPropsCompat::makePropsParser()) {}

  std::shared_ptr<const react::Props> NitroTextComponentDescriptor::cloneProps(const react::PropsParserContext& context,
                                                                                     const std::shared_ptr<const react::Props>& props,
                                                                                     react::RawProps rawProps) const {
    // 1. Prepare raw props parser
    rawProps.parse(rawPropsParser_);
    // 2. Copy props with Nitro's cached copy constructor
    return NitroTextShadowNode::Props(context, /* & */ rawProps, props);
  }

  void NitroTextComponentDescriptor::adopt(react::ShadowNode& shadowNode) const {
    // Always call base adopt first.
    ConcreteComponentDescriptor::adopt(shadowNode);

    auto& concreteShadowNode = dynamic_cast<NitroTextShadowNode&>(shadowNode);

#ifdef ANDROID
    // On Android, wrap props into state for JNI roundtrip.
    auto constBaseProps = concreteShadowNode.getProps();
    auto constProps = std::static_pointer_cast<const HybridNitroTextProps>(constBaseProps);
    const auto& previousProps = concreteShadowNode.getStateData().getProps();
    if (previousProps == nullptr || !constProps->hasSameProps(*previousProps)) {
      HybridNitroTextState state{std::move(constProps)};
      concreteShadowNode.setStateData(std::move(state));
    }
#endif

    // Inject TextLayoutManager so measurement works on Fabric (iOS/macOS/etc.).
    // Construct directly with the descriptor's ContextContainer.
    if (auto contextContainer = this->getContextContainer()) {
      auto textLayoutManager = std::make_shared<const react::TextLayoutManager>(contextContainer);
      concreteShadowNode.setTextLayoutManager(textLayoutManager);
    } else {
      auto textLayoutManager = std::make_shared<const react::TextLayoutManager>(nullptr);
      concreteShadowNode.setTextLayoutManager(textLayoutManager);
    }
}
