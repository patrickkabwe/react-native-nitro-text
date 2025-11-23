//
// NitroTextComponentOverride.mm
// Override ComponentDescriptor and ComponentView behavior for the generated view class
// without introducing a new ComponentView class.
//

#import <Foundation/Foundation.h>
#import <React/RCTComponentViewFactory.h>
#import <React/RCTViewComponentView.h>
#import <react/renderer/componentregistry/ComponentDescriptorProvider.h>

#import "NitroTextComponentDescriptor.hpp"

// Forward-declare the generated view class; we don't import generated headers here.
@interface HybridNitroTextComponent : RCTViewComponentView
@end

using namespace facebook;
using namespace margelo::nitro::nitrotext::views;

@interface HybridNitroTextComponent (ComponentDescriptorOverride)
@end

@implementation HybridNitroTextComponent (ComponentDescriptorOverride)

+ (void)load
{
  NSLog(@"[NitroText] ComponentDescriptorOverride Step 1: +load - Re-registering HybridNitroTextComponent");
  
  // Re-register THIS class so the factory picks up our overridden methods below.
  // This MUST happen first to ensure our overrides are respected.
  // Without this, the generated class's methods would be used instead.
  [[RCTComponentViewFactory currentComponentViewFactory] registerComponentViewClass:self];
}

+ (react::ComponentDescriptorProvider)componentDescriptorProvider
{
  NSLog(@"[NitroText] ComponentDescriptorOverride Step 2: Providing custom ComponentDescriptorProvider");
  
  // Return our custom descriptor (which uses our custom ShadowNode).
  // This is critical for proper layout and measurement.
  return react::concreteComponentDescriptorProvider<NitroTextComponentDescriptor>();
}

+ (BOOL)shouldBeRecycled
{
  NSLog(@"[NitroText] ComponentOverride Step 3: Disabling component recycling");
  
  // Disable component recycling for NitroText to ensure proper cleanup and re-initialization.
  // This prevents recycling which was causing issues with attributed text state.
  return NO;
}


@end

