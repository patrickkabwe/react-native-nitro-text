//
// NitroTextUtil.hpp
// Utility macros for React Native version checking
//

#pragma once

#if __has_include(<cxxreact/ReactNativeVersion.h>)
#include <cxxreact/ReactNativeVersion.h>
#endif

/**
 * @spec RN_VERSION_AT_LEAST
 * @brief Checks if React Native version is >= (major.minor)
 * @param major Major version number (e.g., 0, 1, 2)
 * @param minor Minor version number (e.g., 81, 82, 83)
 * @return Non-zero if version >= (major.minor), 0 otherwise
 * 
 * @example
 * ```cpp
 * #if RN_VERSION_AT_LEAST(0, 81)
 *   // Code for RN >= 0.81
 * #endif
 * ```
 */
#if defined(REACT_NATIVE_VERSION_MAJOR)
#define RN_VERSION_AT_LEAST(major, minor)                                                     \
  ((REACT_NATIVE_VERSION_MAJOR > (major)) ||                                                  \
   (REACT_NATIVE_VERSION_MAJOR == (major) && REACT_NATIVE_VERSION_MINOR >= (minor)))
#else
#define RN_VERSION_AT_LEAST(major, minor) 0
#endif

