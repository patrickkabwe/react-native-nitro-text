//
// NitroHtmlUtils.hpp
//

#pragma once

#include <string>
#include <string_view>
#include <vector>
#include <unordered_map>
#include "RichTextStyle.hpp"

namespace margelo::nitro::nitrotext::html {

struct HtmlFragment {
  std::string text;
  margelo::nitro::nitrotext::RichTextStyle style;
};

struct HtmlParseResult {
  std::vector<HtmlFragment> fragments;
};

class NitroHtmlUtils
{
public:
  static std::string stripTags(std::string_view input);
  
  static HtmlParseResult parseToFragments(
    const std::string& html,
    const std::unordered_map<std::string, margelo::nitro::nitrotext::RichTextStyle>& styleRules
  );
};

} // namespace margelo::nitro::nitrotext::html

