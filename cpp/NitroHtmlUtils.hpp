//
// NitroHtmlUtils.hpp
//

#pragma once

#include <string>
#include <string_view>

namespace margelo::nitro::nitrotext::html {

class NitroHtmlUtils
{
public:
  static std::string stripTags(std::string_view input);
};

} // namespace margelo::nitro::nitrotext::html

