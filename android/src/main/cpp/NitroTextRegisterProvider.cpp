//
// NitroTextRegisterProvider.cpp
// Registers custom ComponentDescriptor for NitroText on Android
//

#include "NitroTextRegisterProvider.hpp"

#include <react/fabric/CoreComponentsRegistry.h>
#include <react/renderer/core/ConcreteComponentDescriptor.h>
#include "../../../cpp/NitroTextComponentDescriptor.hpp"

namespace margelo::nitro::nitrotext {

// Call this from JNI_OnLoad after nitrogen initialization
void registerNitroTextComponentDescriptor() {
  using namespace facebook::react;
  using margelo::nitro::nitrotext::views::NitroTextComponentDescriptor;

  auto provider = concreteComponentDescriptorProvider<NitroTextComponentDescriptor>();
  auto providerRegistry = CoreComponentsRegistry::sharedProviderRegistry();
  // Add/override provider for component name "NitroText" (HybridNitroTextComponentName)
  providerRegistry->add(provider);
}

} // namespace margelo::nitro::nitrotext
