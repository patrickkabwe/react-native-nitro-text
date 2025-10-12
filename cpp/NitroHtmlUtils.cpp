//
// NitroHtmlUtils.cpp
//

#include "NitroHtmlUtils.hpp"

#include <algorithm>
#include <array>
#include <cctype>
#include <charconv>
#include <functional>
#include <optional>
#include <system_error>
#include <unordered_map>
#include <vector>

namespace {

using margelo::nitro::nitrotext::FontStyle;
using margelo::nitro::nitrotext::FontWeight;
using margelo::nitro::nitrotext::RichTextStyle;
using margelo::nitro::nitrotext::TextDecorationLine;
using margelo::nitro::nitrotext::TextDecorationStyle;

constexpr std::array<std::string_view, 27> kBlockTags = {
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

constexpr std::string_view kBulletSymbol = "\xE2\x80\xA2 ";

bool isWhitespace(char ch)
{
  return ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r' || ch == '\f' || ch == '\v';
}

bool isBlockTag(std::string_view tag)
{
  return std::binary_search(kBlockTags.begin(), kBlockTags.end(), tag, std::less<>{});
}

bool isListContainer(std::string_view tag)
{
  return tag == "ul" || tag == "ol";
}

bool isListItem(std::string_view tag)
{
  return tag == "li";
}

std::optional<std::string> codePointToUtf8(char32_t codepoint)
{
  if (codepoint > 0x10FFFF)
  {
    return std::nullopt;
  }

  std::string utf8;
  if (codepoint <= 0x7F)
  {
    utf8.push_back(static_cast<char>(codepoint));
  }
  else if (codepoint <= 0x7FF)
  {
    utf8.push_back(static_cast<char>(0xC0 | ((codepoint >> 6) & 0x1F)));
    utf8.push_back(static_cast<char>(0x80 | (codepoint & 0x3F)));
  }
  else if (codepoint <= 0xFFFF)
  {
    utf8.push_back(static_cast<char>(0xE0 | ((codepoint >> 12) & 0x0F)));
    utf8.push_back(static_cast<char>(0x80 | ((codepoint >> 6) & 0x3F)));
    utf8.push_back(static_cast<char>(0x80 | (codepoint & 0x3F)));
  }
  else
  {
    utf8.push_back(static_cast<char>(0xF0 | ((codepoint >> 18) & 0x07)));
    utf8.push_back(static_cast<char>(0x80 | ((codepoint >> 12) & 0x3F)));
    utf8.push_back(static_cast<char>(0x80 | ((codepoint >> 6) & 0x3F)));
    utf8.push_back(static_cast<char>(0x80 | (codepoint & 0x3F)));
  }

  return utf8;
}

std::optional<std::string> decodeHtmlEntity(std::string_view entity)
{
  static constexpr std::array<std::pair<std::string_view, std::string_view>, 6> kNamedEntities = {
      std::pair<std::string_view, std::string_view>{"nbsp", " "},
      std::pair<std::string_view, std::string_view>{"amp", "&"},
      std::pair<std::string_view, std::string_view>{"lt", "<"},
      std::pair<std::string_view, std::string_view>{"gt", ">"},
      std::pair<std::string_view, std::string_view>{"quot", "\""},
      std::pair<std::string_view, std::string_view>{"apos", "'"}};

  for (const auto &entry : kNamedEntities)
  {
    if (entry.first == entity)
    {
      return std::string(entry.second);
    }
  }

  if (!entity.empty() && entity.front() == '#')
  {
    const bool isHex = entity.size() > 1 && (entity[1] == 'x' || entity[1] == 'X');
    const std::string_view digits = isHex ? entity.substr(2) : entity.substr(1);
    if (digits.empty())
    {
      return std::nullopt;
    }
    unsigned int value = 0;
    const auto begin = digits.data();
    const auto end = digits.data() + digits.size();
    const auto result = std::from_chars(begin, end, value, isHex ? 16 : 10);
    if (result.ec == std::errc() && result.ptr == end)
    {
      if (auto utf8 = codePointToUtf8(static_cast<char32_t>(value)))
      {
        return utf8;
      }
    }
    return std::nullopt;
  }

  return std::nullopt;
}

TextDecorationLine mergeTextDecorationLines(
    const std::optional<TextDecorationLine> &base,
    const std::optional<TextDecorationLine> &overrideLine)
{
  if (!overrideLine.has_value())
  {
    return base.value_or(TextDecorationLine::NONE);
  }

  if (!base.has_value())
  {
    return overrideLine.value();
  }

  if (base.value() == overrideLine.value())
  {
    return base.value();
  }

  const auto hasUnderline = [&](TextDecorationLine value) {
    return value == TextDecorationLine::UNDERLINE ||
        value == TextDecorationLine::UNDERLINE_LINE_THROUGH;
  };

  const auto hasStrike = [&](TextDecorationLine value) {
    return value == TextDecorationLine::LINE_THROUGH ||
        value == TextDecorationLine::UNDERLINE_LINE_THROUGH;
  };

  const bool underline = hasUnderline(base.value()) || hasUnderline(overrideLine.value());
  const bool strike = hasStrike(base.value()) || hasStrike(overrideLine.value());

  if (underline && strike)
  {
    return TextDecorationLine::UNDERLINE_LINE_THROUGH;
  }
  if (underline)
  {
    return TextDecorationLine::UNDERLINE;
  }
  if (strike)
  {
    return TextDecorationLine::LINE_THROUGH;
  }
  return TextDecorationLine::NONE;
}

RichTextStyle mergeStyles(const RichTextStyle &base, const RichTextStyle &overrideStyle)
{
  RichTextStyle merged = base;

  if (overrideStyle.fontColor.has_value())
  {
    merged.fontColor = overrideStyle.fontColor;
  }
  if (overrideStyle.fragmentBackgroundColor.has_value())
  {
    merged.fragmentBackgroundColor = overrideStyle.fragmentBackgroundColor;
  }
  if (overrideStyle.fontSize.has_value())
  {
    merged.fontSize = overrideStyle.fontSize;
  }
  if (overrideStyle.fontWeight.has_value())
  {
    merged.fontWeight = overrideStyle.fontWeight;
  }
  if (overrideStyle.fontStyle.has_value())
  {
    merged.fontStyle = overrideStyle.fontStyle;
  }
  if (overrideStyle.fontFamily.has_value())
  {
    merged.fontFamily = overrideStyle.fontFamily;
  }
  if (overrideStyle.lineHeight.has_value())
  {
    merged.lineHeight = overrideStyle.lineHeight;
  }
  if (overrideStyle.letterSpacing.has_value())
  {
    merged.letterSpacing = overrideStyle.letterSpacing;
  }
  if (overrideStyle.textAlign.has_value())
  {
    merged.textAlign = overrideStyle.textAlign;
  }
  if (overrideStyle.textTransform.has_value())
  {
    merged.textTransform = overrideStyle.textTransform;
  }
  if (overrideStyle.textDecorationLine.has_value() || base.textDecorationLine.has_value())
  {
    merged.textDecorationLine = mergeTextDecorationLines(
        base.textDecorationLine, overrideStyle.textDecorationLine);
  }
  if (overrideStyle.textDecorationColor.has_value())
  {
    merged.textDecorationColor = overrideStyle.textDecorationColor;
  }
  if (overrideStyle.textDecorationStyle.has_value())
  {
    merged.textDecorationStyle = overrideStyle.textDecorationStyle;
  }
  if (overrideStyle.marginTop.has_value())
  {
    merged.marginTop = overrideStyle.marginTop;
  }
  if (overrideStyle.marginBottom.has_value())
  {
    merged.marginBottom = overrideStyle.marginBottom;
  }
  if (overrideStyle.marginLeft.has_value())
  {
    merged.marginLeft = overrideStyle.marginLeft;
  }
  if (overrideStyle.marginRight.has_value())
  {
    merged.marginRight = overrideStyle.marginRight;
  }

  return merged;
}

std::optional<RichTextStyle> defaultStyleForTag(std::string_view tag)
{
  RichTextStyle style;
  bool modified = false;

  if (tag == "strong" || tag == "b")
  {
    style.fontWeight = FontWeight::BOLD;
    modified = true;
  }
  else if (tag == "em" || tag == "i")
  {
    style.fontStyle = FontStyle::ITALIC;
    modified = true;
  }
  else if (tag == "u")
  {
    style.textDecorationLine = TextDecorationLine::UNDERLINE;
    style.textDecorationStyle = TextDecorationStyle::SOLID;
    modified = true;
  }
  else if (tag == "s" || tag == "strike" || tag == "del")
  {
    style.textDecorationLine = TextDecorationLine::LINE_THROUGH;
    style.textDecorationStyle = TextDecorationStyle::SOLID;
    modified = true;
  }
  else if (tag == "code" || tag == "pre")
  {
    style.fontFamily = std::string("ui-monospace");
    modified = true;
  }

  if (!modified)
  {
    return std::nullopt;
  }

  return style;
}

struct StyleState
{
  RichTextStyle style;
  bool preserveWhitespace;
};

enum class ListType
{
  Ordered,
  Unordered
};

struct ListContext
{
  ListType type;
  int counter;

  [[nodiscard]] int next()
  {
    return counter++;
  }
};

struct ElementState
{
  std::string name;
  bool isBlock;
  bool isListItem;
  bool isListContainer;
};

void appendDecodedText(
    std::string_view text,
    StyleState &state,
    std::string &currentText,
    bool &lastWasWhitespace)
{
  const bool preserve = state.preserveWhitespace;
  currentText.reserve(currentText.size() + text.size());

  for (size_t i = 0; i < text.size();)
  {
    char ch = text[i];

    if (ch == '&')
    {
      const size_t semicolon = text.find(';', i + 1);
      if (semicolon != std::string_view::npos)
      {
        const std::string_view entity = text.substr(i + 1, semicolon - (i + 1));
        if (auto decoded = decodeHtmlEntity(entity))
        {
          for (char decodedChar : *decoded)
          {
            if (preserve)
            {
              currentText.push_back(decodedChar);
              lastWasWhitespace = isWhitespace(decodedChar);
            }
            else if (isWhitespace(decodedChar))
            {
              if (!lastWasWhitespace)
              {
                currentText.push_back(' ');
                lastWasWhitespace = true;
              }
            }
            else
            {
              currentText.push_back(decodedChar);
              lastWasWhitespace = false;
            }
          }
          i = semicolon + 1;
          continue;
        }
      }
    }

    if (preserve)
    {
      currentText.push_back(ch);
      lastWasWhitespace = isWhitespace(ch);
    }
    else if (isWhitespace(ch))
    {
      if (!lastWasWhitespace)
      {
        currentText.push_back(' ');
        lastWasWhitespace = true;
      }
    }
    else
    {
      currentText.push_back(ch);
      lastWasWhitespace = false;
    }

    ++i;
  }
}

void trimTrailingWhitespace(std::string &text)
{
  while (!text.empty())
  {
    const char ch = text.back();
    if (ch == ' ' || ch == '\t' || ch == '\n' || ch == '\r')
    {
      text.pop_back();
      continue;
    }
    break;
  }
}

} // namespace

namespace margelo::nitro::nitrotext::html {

std::string NitroHtmlUtils::stripTags(std::string_view input)
{
  std::string output;
  output.reserve(input.size());

  bool preserveWhitespace = false;
  bool lastWasWhitespace = true;

  // 1: append characters while mirroring browser whitespace collapsing rules.
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

  // 2: identify HTML block-level tags that should produce line breaks.
  const auto isBlockLevel = [](std::string_view tagName) {
    return std::binary_search(kBlockTags.begin(), kBlockTags.end(), tagName, std::less<>{});
  };

  // 3: normalise tag text, toggling whitespace rules and injecting newlines on block boundaries.
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

  // 4: decode HTML entities (or preserve the literal sequence if unknown).
  auto decodeEntity = [&](std::string_view entity) {
    if (auto decoded = decodeHtmlEntity(entity))
    {
      for (char ch : *decoded)
      {
        appendChar(ch);
      }
      return;
    }

    appendChar('&');
    for (const char ch : entity)
    {
      appendChar(ch);
    }
    appendChar(';');
  };

  std::string tagBuffer;
  tagBuffer.reserve(32);

  const char *cursor = input.data();
  const char *const end = cursor + input.size();

  while (cursor < end)
  {
    const char ch = *cursor;

    // 5: when we hit '<', grab the whole tag and process it in one shot.
    if (ch == '<')
    {
      ++cursor;
      tagBuffer.clear();

      while (cursor < end && *cursor != '>')
      {
        tagBuffer.push_back(*cursor++);
      }

      if (cursor < end && *cursor == '>')
      {
        flushTag(std::string_view(tagBuffer.data(), tagBuffer.size()));
        ++cursor;
        continue;
      }

      // No closing '>' found – treat accumulated chars as plain text and stop.
      appendChar('<');
      for (const char c : tagBuffer)
      {
        appendChar(c);
      }
      break;
    }

    // 6: attempt to decode HTML entities inline.
    if (ch == '&')
    {
      const char *entityStart = cursor + 1;
      const char *scan = entityStart;
      while (scan < end && *scan != ';' && *scan != '<')
      {
        ++scan;
      }
      if (scan < end && *scan == ';')
      {
        decodeEntity(std::string_view(entityStart, static_cast<size_t>(scan - entityStart)));
        cursor = scan + 1;
        continue;
      }
    }

    // 7: copy normal characters directly into the destination buffer.
    appendChar(ch);
    ++cursor;
  }

  // 8: trim trailing whitespace so callers do not see dangling blanks.
  while (!output.empty() && (output.back() == ' ' || output.back() == '\n'))
  {
    output.pop_back();
  }

  return output;
}

HtmlParseResult NitroHtmlUtils::parseToFragments(
    const std::string &html,
    const std::unordered_map<std::string, margelo::nitro::nitrotext::RichTextStyle> &styleRules)
{
  HtmlParseResult result;
  if (html.empty())
  {
    return result;
  }

  std::vector<StyleState> styleStack;
  styleStack.push_back(StyleState{RichTextStyle{}, /*preserveWhitespace=*/false});
  std::vector<ElementState> elementStack;
  std::vector<ListContext> listStack;

  std::string currentText;
  bool lastWasWhitespace = true;

  auto updateWhitespaceState = [&]() {
    if (!currentText.empty())
    {
      lastWasWhitespace = isWhitespace(currentText.back());
      return;
    }
    for (auto it = result.fragments.rbegin(); it != result.fragments.rend(); ++it)
    {
      if (!it->text.empty())
      {
        lastWasWhitespace = isWhitespace(it->text.back());
        return;
      }
    }
    lastWasWhitespace = true;
  };

  auto flushText = [&]() {
    if (currentText.empty())
    {
      return;
    }
    HtmlFragment fragment;
    fragment.text = currentText;
    fragment.style = styleStack.back().style;
    lastWasWhitespace = isWhitespace(currentText.back());
    result.fragments.push_back(std::move(fragment));
    currentText.clear();
  };

  auto trimTrailingInlineWhitespace = [&]() {
    if (!currentText.empty())
    {
      trimTrailingWhitespace(currentText);
      updateWhitespaceState();
      return;
    }
    while (!result.fragments.empty())
    {
      auto &lastText = result.fragments.back().text;
      trimTrailingWhitespace(lastText);
      if (lastText.empty())
      {
        result.fragments.pop_back();
        continue;
      }
      updateWhitespaceState();
      return;
    }
    lastWasWhitespace = true;
  };

  auto ensureBlockBoundary = [&]() {
    trimTrailingInlineWhitespace();
    const bool hasOutput = !currentText.empty() || !result.fragments.empty();
    if (!hasOutput)
    {
      return;
    }
    bool alreadyNewline = false;
    if (!currentText.empty())
    {
      alreadyNewline = currentText.back() == '\n';
    }
    else if (!result.fragments.empty())
    {
      const auto &lastText = result.fragments.back().text;
      alreadyNewline = !lastText.empty() && lastText.back() == '\n';
    }
    if (!alreadyNewline)
    {
      currentText.push_back('\n');
      lastWasWhitespace = true;
      flushText();
    }
    else if (!currentText.empty())
    {
      flushText();
    }
  };

  auto appendTextSegment = [&](std::string_view segment) {
    if (segment.empty())
    {
      return;
    }
    appendDecodedText(segment, styleStack.back(), currentText, lastWasWhitespace);
  };

  auto appendMarkerText = [&](std::string_view marker) {
    if (marker.empty())
    {
      return;
    }
    appendDecodedText(marker, styleStack.back(), currentText, lastWasWhitespace);
  };

  auto processClosingTag = [&](const std::string &tagName) {
    for (int index = static_cast<int>(elementStack.size()) - 1; index >= 0; --index)
    {
      if (elementStack[index].name != tagName)
      {
        continue;
      }

      while (static_cast<int>(elementStack.size()) - 1 > index)
      {
        elementStack.pop_back();
        if (styleStack.size() > 1)
        {
          styleStack.pop_back();
        }
      }

      const ElementState closingElement = elementStack.back();

      flushText();
      if (closingElement.isBlock || closingElement.isListItem)
      {
        ensureBlockBoundary();
      }

      elementStack.pop_back();
      if (styleStack.size() > 1)
      {
        styleStack.pop_back();
      }

      if (closingElement.isListContainer && !listStack.empty())
      {
        listStack.pop_back();
      }

      updateWhitespaceState();
      break;
    }
  };

  auto processOpeningTag = [&](const std::string &tagName, bool selfClosing) {
    StyleState &currentState = styleStack.back();
    const bool block = isBlockTag(tagName);
    const bool listItem = isListItem(tagName);
    const bool listContainer = isListContainer(tagName);

    if (block || listItem)
    {
      ensureBlockBoundary();
    }

    if (listContainer)
    {
      listStack.push_back({tagName == "ol" ? ListType::Ordered : ListType::Unordered, 1});
    }

    ListContext *activeList = listStack.empty() ? nullptr : &listStack.back();
    int orderedIndex = 0;
    if (listItem && activeList != nullptr && activeList->type == ListType::Ordered)
    {
      orderedIndex = activeList->next();
    }

    if (listItem)
    {
      std::string marker;
      if (activeList != nullptr && activeList->type == ListType::Ordered)
      {
        marker = std::to_string(std::max(orderedIndex, 1)) + ". ";
      }
      else
      {
        marker = std::string(kBulletSymbol);
      }
      appendMarkerText(marker);
    }

    RichTextStyle mergedStyle = currentState.style;
    if (auto defaults = defaultStyleForTag(tagName))
    {
      mergedStyle = mergeStyles(mergedStyle, defaults.value());
    }
    if (auto it = styleRules.find(tagName); it != styleRules.end())
    {
      mergedStyle = mergeStyles(mergedStyle, it->second);
    }

    const bool preserveWhitespace = currentState.preserveWhitespace || tagName == "pre";

    if (selfClosing)
    {
      if (block || listItem)
      {
        ensureBlockBoundary();
      }
      if (listContainer && !listStack.empty())
      {
        listStack.pop_back();
      }
      return;
    }

    elementStack.push_back({tagName, block || listItem, listItem, listContainer});
    styleStack.push_back({mergedStyle, preserveWhitespace});
  };

  auto processTag = [&](std::string_view tagContent) {
    const auto first = tagContent.find_first_not_of(" \t\n\r");
    if (first == std::string_view::npos)
    {
      return;
    }
    tagContent.remove_prefix(first);

    if (tagContent.size() >= 3 && tagContent.substr(0, 3) == "!--")
    {
      return;
    }
    if (!tagContent.empty() && (tagContent.front() == '!' || tagContent.front() == '?'))
    {
      return;
    }

    bool closing = false;
    if (!tagContent.empty() && tagContent.front() == '/')
    {
      closing = true;
      tagContent.remove_prefix(1);
      const auto notSpace = tagContent.find_first_not_of(" \t\n\r");
      if (notSpace == std::string_view::npos)
      {
        return;
      }
      tagContent.remove_prefix(notSpace);
    }

    bool selfClosing = false;
    auto lastNonSpace = tagContent.find_last_not_of(" \t\n\r");
    if (lastNonSpace == std::string_view::npos)
    {
      return;
    }
    if (tagContent[lastNonSpace] == '/')
    {
      selfClosing = true;
      if (lastNonSpace == 0)
      {
        return;
      }
      tagContent.remove_suffix(tagContent.size() - lastNonSpace);
    }
    else
    {
      tagContent.remove_suffix(tagContent.size() - (lastNonSpace + 1));
    }

    const size_t spacePos = tagContent.find_first_of(" \t\n\r");
    std::string tagName = spacePos == std::string_view::npos
                               ? std::string(tagContent)
                               : std::string(tagContent.substr(0, spacePos));
    if (tagName.empty())
    {
      return;
    }
    std::transform(tagName.begin(), tagName.end(), tagName.begin(), [](unsigned char ch) {
      return static_cast<char>(std::tolower(ch));
    });

    if (tagName == "br")
    {
      trimTrailingInlineWhitespace();
      currentText.push_back('\n');
      lastWasWhitespace = true;
      flushText();
      return;
    }

    if (closing)
    {
      processClosingTag(tagName);
      return;
    }

    processOpeningTag(tagName, selfClosing);
  };

  std::string textBuffer;
  std::string tagBuffer;
  bool inTag = false;

  for (size_t index = 0; index < html.size(); ++index)
  {
    const char ch = html[index];
    if (inTag)
    {
      if (ch == '>')
      {
        inTag = false;
        processTag(std::string_view(tagBuffer));
        tagBuffer.clear();
      }
      else
      {
        tagBuffer.push_back(ch);
      }
      continue;
    }

    if (ch == '<')
    {
      if (!textBuffer.empty())
      {
        appendTextSegment(std::string_view(textBuffer));
        textBuffer.clear();
      }
      inTag = true;
      continue;
    }

    textBuffer.push_back(ch);
  }

  if (!textBuffer.empty())
  {
    appendTextSegment(std::string_view(textBuffer));
  }

  flushText();
  trimTrailingInlineWhitespace();

  const auto trimTrailingFragments = [&]() {
    while (!result.fragments.empty())
    {
      auto &text = result.fragments.back().text;
      const auto pos = text.find_last_not_of(" \t\n\r");
      if (pos == std::string::npos)
      {
        result.fragments.pop_back();
        continue;
      }
      text.erase(pos + 1);
      if (text.empty())
      {
        result.fragments.pop_back();
        continue;
      }
      break;
    }
  };

  trimTrailingFragments();

  result.fragments.erase(
      std::remove_if(
          result.fragments.begin(),
          result.fragments.end(),
          [](const HtmlFragment &fragment) { return fragment.text.empty(); }),
      result.fragments.end());

  updateWhitespaceState();

  return result;
}

} // namespace margelo::nitro::nitrotext::html
