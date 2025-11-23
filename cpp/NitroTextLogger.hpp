//
// NitroTextLogger.hpp
// 
//

#pragma once

#include <string>
#include <sstream>
#include <iostream>

// Check if we're in debug mode
#ifndef NDEBUG
#define NITRO_TEXT_DEBUG_LOGGING 1
#else
#define NITRO_TEXT_DEBUG_LOGGING 0
#endif

namespace margelo::nitro::nitrotext::logger {

/**
 * @brief Logs an informational message
 * @param message The message to log
 * @param tag Optional tag identifier for categorization
 * 
 * Only logs in debug builds to avoid performance overhead in production
 */
inline void info(
    const std::string& message,
    const std::string& tag = "") {
#if NITRO_TEXT_DEBUG_LOGGING
  std::ostringstream oss;
  oss << "[NitroText]";
  if (!tag.empty()) {
    oss << " [" << tag << "]";
  }
  oss << " " << message;
  std::cout << oss.str() << std::endl;
#else
  // No-op in release builds
  (void)message;
  (void)tag;
#endif
}

/**
 * @brief Logs a warning message
 * @param message The warning message to log
 * @param tag Optional tag identifier for categorization
 * 
 * Only logs in debug builds to avoid performance overhead in production
 */
inline void warn(
    const std::string& message,
    const std::string& tag = "") {
#if NITRO_TEXT_DEBUG_LOGGING
  std::ostringstream oss;
  oss << "[NitroText] [WARN]";
  if (!tag.empty()) {
    oss << " [" << tag << "]";
  }
  oss << " " << message;
  std::cerr << oss.str() << std::endl;
#else
  // No-op in release builds
  (void)message;
  (void)tag;
#endif
}

/**
 * @brief Logs an error message
 * @param message The error message to log
 * @param tag Optional tag identifier for categorization
 * 
 * Only logs in debug builds to avoid performance overhead in production
 */
inline void error(
    const std::string& message,
    const std::string& tag = "") {
#if NITRO_TEXT_DEBUG_LOGGING
  std::ostringstream oss;
  oss << "[NitroText] [ERROR]";
  if (!tag.empty()) {
    oss << " [" << tag << "]";
  }
  oss << " " << message;
  std::cerr << oss.str() << std::endl;
#else
  // No-op in release builds
  (void)message;
  (void)tag;
#endif
}

} // namespace margelo::nitro::nitrotext::logger
