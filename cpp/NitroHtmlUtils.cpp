//
// NitroHtmlUtils.cpp
//

#include "NitroHtmlUtils.hpp"

#include <algorithm>
#include <array>
#include <cctype>

namespace margelo::nitro::nitrotext::html {

std::string NitroHtmlUtils::stripTags(std::string_view input)
{
  std::string output;
  output.reserve(input.size());

  bool inTag = false;
  bool preserveWhitespace = false;
  bool lastWasWhitespace = true;
  std::string tagBuffer;

  auto appendChar = [&](char ch) {
    if (preserveWhitespace)
    {
      output.push_back(ch);
      lastWasWhitespace = std::isspace(static_cast<unsigned char>(ch));
      return;
    }

    if (ch == '\r')
    {
      return;
    }

    if (ch == '\n')
    {
      if (!output.empty() && output.back() == '\n')
      {
        lastWasWhitespace = true;
        return;
      }
      if (!output.empty() && output.back() == ' ')
      {
        output.pop_back();
      }
      output.push_back('\n');
      lastWasWhitespace = true;
      return;
    }

    if (std::isspace(static_cast<unsigned char>(ch)))
    {
      if (!lastWasWhitespace)
      {
        output.push_back(' ');
        lastWasWhitespace = true;
      }
      return;
    }

    output.push_back(ch);
    lastWasWhitespace = false;
  };

  const auto isBlockLevel = [](std::string_view tagName) {
    static constexpr std::array<std::string_view, 27> kBlockTags = {
      "address",
      "article",
      "aside",
      "blockquote",
      "div",
      "dl",
      "fieldset",
      "figcaption",
      "figure",
      "footer",
      "form",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "header",
      "li",
      "main",
      "nav",
      "ol",
      "p",
      "pre",
      "section",
      "table",
      "ul"};

    return std::find(kBlockTags.begin(), kBlockTags.end(), tagName) != kBlockTags.end();
  };

  auto flushTag = [&](std::string_view tagView) {
    const auto first = tagView.find_first_not_of(" \t\n\r");
    if (first == std::string_view::npos)
    {
      return;
    }
    tagView.remove_prefix(first);

    const auto last = tagView.find_last_not_of(" \t\n\r");
    if (last != std::string_view::npos && last + 1 < tagView.size())
    {
      tagView.remove_suffix(tagView.size() - last - 1);
    }

    if (tagView.size() >= 3 && tagView.substr(0, 3) == "!--")
    {
      return;
    }

    bool isClosing = false;
    if (!tagView.empty() && tagView.front() == '/')
    {
      isClosing = true;
      tagView.remove_prefix(1);
      const auto notSpace = tagView.find_first_not_of(" \t\n\r");
      if (notSpace == std::string_view::npos)
      {
        return;
      }
      tagView.remove_prefix(notSpace);
    }

    bool isSelfClosing = false;
    if (!tagView.empty() && tagView.back() == '/')
    {
      isSelfClosing = true;
      tagView.remove_suffix(1);
      const auto notSpace = tagView.find_last_not_of(" \t\n\r");
      if (notSpace == std::string_view::npos)
      {
        return;
      }
      if (notSpace + 1 < tagView.size())
      {
        tagView.remove_suffix(tagView.size() - notSpace - 1);
      }
    }

    const auto spacePos = tagView.find_first_of(" \t\n\r");
    std::string_view tagNameView =
      spacePos == std::string_view::npos ? tagView : tagView.substr(0, spacePos);
    if (tagNameView.empty())
    {
      return;
    }

    std::string tagName(tagNameView);
    std::transform(tagName.begin(), tagName.end(), tagName.begin(), [](unsigned char ch) {
      return static_cast<char>(std::tolower(ch));
    });

    if (!isClosing && !isSelfClosing && tagName == "pre")
    {
      preserveWhitespace = true;
      lastWasWhitespace = true;
    }

    if (isClosing && tagName == "pre")
    {
      preserveWhitespace = false;
      appendChar('\n');
      return;
    }

    if (tagName == "br")
    {
      appendChar('\n');
      return;
    }

    if (isClosing && isBlockLevel(tagName))
    {
      appendChar('\n');
    }
    else if (!isClosing && !isSelfClosing && isBlockLevel(tagName) && !output.empty() && output.back() != '\n')
    {
      appendChar('\n');
    }
  };

  auto decodeEntity = [&](std::string_view entity) {
    if (entity == "nbsp")
    {
      appendChar(' ');
    }
    else if (entity == "amp")
    {
      appendChar('&');
    }
    else if (entity == "lt")
    {
      appendChar('<');
    }
    else if (entity == "gt")
    {
      appendChar('>');
    }
    else if (entity == "quot")
    {
      appendChar('"');
    }
    else if (entity == "apos")
    {
      appendChar(static_cast<char>(0x27));
    }
    else
    {
      appendChar('&');
      for (const char ch : entity)
      {
        appendChar(ch);
      }
      appendChar(';');
    }
  };

  for (size_t i = 0; i < input.size(); ++i)
  {
    const char c = input[i];
    if (inTag)
    {
      if (c == '>')
      {
        inTag = false;
        flushTag(std::string_view{tagBuffer});
        tagBuffer.clear();
      }
      else
      {
        tagBuffer.push_back(c);
      }
      continue;
    }

    if (c == '<')
    {
      inTag = true;
      tagBuffer.clear();
      continue;
    }

    if (c == '&')
    {
      const auto semicolon = input.find(';', i + 1);
      if (semicolon != std::string::npos)
      {
        decodeEntity(input.substr(i + 1, semicolon - (i + 1)));
        i = semicolon;
        continue;
      }
    }

    appendChar(c);
  }

  while (!output.empty() && (output.back() == ' ' || output.back() == '\n'))
  {
    output.pop_back();
  }

  return output;
}

} // namespace margelo::nitro::nitrotext::html
