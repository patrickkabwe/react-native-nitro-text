//
// NitroTextComponentDescriptor.hpp
// Custom, non-generated ComponentDescriptor for NitroText
//

#pragma once

#include "../cpp/NitroTextShadowNode.hpp"
#include <react/renderer/core/ConcreteComponentDescriptor.h>

namespace margelo::nitro::nitrotext::views {

  /**
   * The Component Descriptor for the "NitroText" View.
   */
  class NitroTextComponentDescriptor final: public react::ConcreteComponentDescriptor<NitroTextShadowNode> {
  public:
    NitroTextComponentDescriptor(const react::ComponentDescriptorParameters& parameters);

  public:
    /**
     * A faster path for cloning props - reuses the caching logic from `HybridNitroTextProps`.  
     */
    std::shared_ptr<const react::Props> cloneProps(const react::PropsParserContext& context,
                                                   const std::shared_ptr<const react::Props>& props,
                                                   react::RawProps rawProps) const override;

    void adopt(react::ShadowNode& shadowNode) const override;
  };

} // namespace margelo::nitro::nitrotext::views
