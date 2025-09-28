#include <jni.h>
#include "NitroTextOnLoad.hpp"
#include "NitroTextRegisterProvider.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  margelo::nitro::nitrotext::registerNitroTextComponentDescriptor();
  return margelo::nitro::nitrotext::initialize(vm);
}
