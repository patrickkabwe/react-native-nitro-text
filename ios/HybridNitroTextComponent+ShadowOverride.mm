//
// HybridNitroTextComponent+ShadowOverride.mm
// Override only the ShadowNode/Descriptor for the generated view class
// without introducing a new ComponentView class.
//

#import <Foundation/Foundation.h>
#import <React/RCTComponentViewFactory.h>
#import <React/RCTViewComponentView.h>
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>

#import "../cpp/NitroTextComponentDescriptor.hpp"

// Forward-declare the generated view class; we don't import generated headers here.
@interface HybridNitroTextComponent : RCTViewComponentView
@end

using namespace facebook;
using namespace margelo::nitro::nitrotext::views;

@interface HybridNitroTextComponent (ShadowOverride)
@end

@implementation HybridNitroTextComponent (ShadowOverride)

+ (react::ComponentDescriptorProvider)componentDescriptorProvider
{
  // 1) Return our custom descriptor (which uses our custom ShadowNode).
  NSLog(@"[NitroText] ShadowOverride: providing custom ComponentDescriptorProvider for NitroText");
  return react::concreteComponentDescriptorProvider<NitroTextComponentDescriptor>();
}

+ (void)load
{
  // 2) Re-register THIS class so the factory picks up the (overridden) provider.
  // This avoids introducing a new view class and preserves the generated view implementation.
  NSLog(@"[NitroText] ShadowOverride +load: re-registering HybridNitroTextComponent to update provider");
  [[RCTComponentViewFactory currentComponentViewFactory] registerComponentViewClass:self];
}

@end
