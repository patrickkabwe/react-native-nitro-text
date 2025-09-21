//
//  NitroMarkdownUtils.hpp
//  Pods
//
//  Shared Markdown helpers exposed to C++ measurement code.
//

#pragma once

#include <optional>
#include <string>
#include <vector>

#include "FontWeight.hpp"
#include "FontStyle.hpp"
#include "TextDecorationLine.hpp"
#include "TextDecorationStyle.hpp"
#include "TextAlign.hpp"
#include "TextTransform.hpp"

namespace margelo::nitro::nitrotext::views {
    using NitroFontWeight = margelo::nitro::nitrotext::FontWeight;
    using NitroFontStyle = margelo::nitro::nitrotext::FontStyle;
    using NitroFontFamily = std::string;
    using NitroTextDecorationLine = margelo::nitro::nitrotext::TextDecorationLine;
    using NitroTextDecorationStyle = margelo::nitro::nitrotext::TextDecorationStyle;
    using NitroTextAlign = margelo::nitro::nitrotext::TextAlign;
    using NitroTextTransform = margelo::nitro::nitrotext::TextTransform;
    
    struct NitroMarkdownAttributes
    {
        std::string parsedText; // parsed text from markdown
        std::optional<NitroFontWeight> fontWeight;
        std::optional<NitroFontStyle> fontStyle;
        std::optional<NitroFontFamily> fontFamily;
        std::optional<NitroTextDecorationLine> textDecorationLine;
        std::optional<NitroTextDecorationStyle> textDecorationStyle;
        std::optional<NitroTextAlign> textAlign;
        std::optional<NitroTextTransform> textTransform;
    };

    // 1. gets text
    // 2. parse to markdown
    // 3. extract attributes from markdown
    // 4. return attributes
    NitroMarkdownAttributes makeNitroMarkdownAttributes(const std::string &text);
}
