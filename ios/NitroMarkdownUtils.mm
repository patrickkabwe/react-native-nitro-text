//
//  NitroMarkdownUtils.mm
//  Pods
//
//  Markdown helpers shared between ShadowNode and UIKit rendering.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

#include <optional>

#include "NitroMarkdownUtils.hpp"

namespace margelo::nitro::nitrotext::views {

#pragma mark - Local helpers

static inline BOOL MDRunIsStrong(NSDictionary<NSAttributedStringKey,id> *attrs) {
    NSNumber *inlineNum = attrs[NSInlinePresentationIntentAttributeName];
    if ([inlineNum isKindOfClass:[NSNumber class]]) {
        // Obj-C: NSInlinePresentationIntent is an NS_OPTIONS mask on NSInteger
        NSInteger mask = inlineNum.integerValue;
        // iOS 15+: NSInlinePresentationIntentStrong / Emphasized are available
        return (mask & NSInlinePresentationIntentStronglyEmphasized) != 0;
    }
    return NO;
}

static inline BOOL MDRunIsEmphasis(NSDictionary<NSAttributedStringKey,id> *attrs) {
    NSNumber *inlineNum = attrs[NSInlinePresentationIntentAttributeName];
    if ([inlineNum isKindOfClass:[NSNumber class]]) {
        NSInteger mask = inlineNum.integerValue;
        return (mask & NSInlinePresentationIntentEmphasized) != 0;
    }
    return NO;
}

static inline BOOL FontIsBold(UIFont *font) {
    if (!font) return NO;
    return (font.fontDescriptor.symbolicTraits & UIFontDescriptorTraitBold) != 0;
}
static inline BOOL FontIsItalic(UIFont *font) {
    if (!font) return NO;
    return (font.fontDescriptor.symbolicTraits & UIFontDescriptorTraitItalic) != 0;
}
static inline NitroFontWeight MarkdownFontWeightFromNumeric(double weight)
{
    if (weight >= 0.8) {
        return NitroFontWeight::BLACK;
    }
    if (weight >= 0.6) {
        return NitroFontWeight::HEAVY;
    }
    if (weight >= 0.45) {
        return NitroFontWeight::BOLD;
    }
    if (weight >= 0.3) {
        return NitroFontWeight::SEMIBOLD;
    }
    if (weight >= 0.15) {
        return NitroFontWeight::MEDIUM;
    }
    if (weight <= -0.6) {
        return NitroFontWeight::ULTRALIGHT;
    }
    if (weight <= -0.4) {
        return NitroFontWeight::THIN;
    }
    if (weight <= -0.2) {
        return NitroFontWeight::LIGHT;
    }
    return NitroFontWeight::REGULAR;
}

static inline NitroFontStyle MarkdownFontStyleFromFont(UIFont *font)
{
    if (FontIsItalic(font)) {
        return NitroFontStyle::ITALIC;
    }
    return NitroFontStyle::NORMAL;
}

static inline std::optional<NitroFontFamily> MarkdownFontFamilyFromFont(UIFont *font)
{
    if (!font) {
        return std::nullopt;
    }
    NSString *family = font.familyName ?: font.fontName;
    if (!family) {
        return std::nullopt;
    }
    const char *utf8 = family.UTF8String;
    if (!utf8) {
        return std::nullopt;
    }
    return std::string(utf8);
}

static inline NitroTextDecorationLine MarkdownDecorationLine(NSInteger underlineMask, NSInteger strikeMask)
{
    const bool hasUnderline = underlineMask != 0;
    const bool hasStrike = strikeMask != 0;
    if (hasUnderline && hasStrike) {
        return NitroTextDecorationLine::UNDERLINE_LINE_THROUGH;
    }
    if (hasUnderline) {
        return NitroTextDecorationLine::UNDERLINE;
    }
    if (hasStrike) {
        return NitroTextDecorationLine::LINE_THROUGH;
    }
    return NitroTextDecorationLine::NONE;
}

static inline std::optional<NitroTextDecorationStyle> MarkdownDecorationStyle(NSInteger mask)
{
    if (mask == 0) {
        return std::nullopt;
    }
    if ((mask & NSUnderlineStyleDouble) == NSUnderlineStyleDouble) {
        return NitroTextDecorationStyle::DOUBLE;
    }
    if ((mask & NSUnderlinePatternDash) == NSUnderlinePatternDash ||
        (mask & NSUnderlinePatternDashDot) == NSUnderlinePatternDashDot ||
        (mask & NSUnderlinePatternDashDotDot) == NSUnderlinePatternDashDotDot) {
        return NitroTextDecorationStyle::DASHED;
    }
    if ((mask & NSUnderlinePatternDot) == NSUnderlinePatternDot) {
        return NitroTextDecorationStyle::DOTTED;
    }
    return NitroTextDecorationStyle::SOLID;
}

static inline std::optional<NitroTextAlign> MarkdownAlignment(NSTextAlignment align)
{
    switch (align) {
    case NSTextAlignmentLeft:
        return NitroTextAlign::LEFT;
    case NSTextAlignmentCenter:
        return NitroTextAlign::CENTER;
    case NSTextAlignmentRight:
        return NitroTextAlign::RIGHT;
    case NSTextAlignmentJustified:
        return NitroTextAlign::JUSTIFY;
    default:
        return std::nullopt;
    }
}

template <typename T>
static inline void MarkdownAssignOrReset(
    std::optional<T> &target,
    const std::optional<T> &value,
    bool resetOnMissing = false)
{
    if (!value.has_value()) {
        if (resetOnMissing && target.has_value()) {
            target.reset();
        }
        return;
    }
    if (!target.has_value()) {
        target = value;
        return;
    }
    if (*target != *value) {
        target.reset();
    }
}
static inline NSString *AlignName(NSTextAlignment a) {
    switch (a) {
        case NSTextAlignmentLeft:      return @"left";
        case NSTextAlignmentCenter:    return @"center";
        case NSTextAlignmentRight:     return @"right";
        case NSTextAlignmentJustified: return @"justified";
        case NSTextAlignmentNatural:   return @"natural";
    }
    return @"unknown";
}
static inline double FontNumericWeight(UIFont *font) {
    // Pulls the CoreText/UIFont numeric weight if available (−1.0…1.0; 0 = regular)
    if (!font) return 0.0;
    NSDictionary *attrs = font.fontDescriptor.fontAttributes;
    NSDictionary *traits = attrs[UIFontDescriptorTraitsAttribute];
    NSNumber *w = traits[UIFontWeightTrait];
    return w ? w.doubleValue : 0.0;
}

#pragma mark - Implementation

// implement makeNitroMarkdownAttributes
NitroMarkdownAttributes makeNitroMarkdownAttributes(const std::string &plainText) {
    // 1. Convert std::string -> NSString (UTF-8)
    NSString *markdownString = [[NSString alloc] initWithBytes:plainText.data()
                                                        length:plainText.size()
                                                      encoding:NSUTF8StringEncoding];

    if (markdownString == nil) {
        throw std::runtime_error("Failed to convert markdown to NSString (UTF-8)");
    }

    // 2. Configure parsing options (optional)
    NSError *error = nil;
    NSAttributedStringMarkdownParsingOptions *opts = [NSAttributedStringMarkdownParsingOptions new];
    // opts.interpretedSyntax = NSAttributedStringMarkdownInterpretedSyntaxFull;

    // 3. Parse Markdown -> NSAttributedString (data-based initializer per your stub)
    NSAttributedString *mdAttr = nil;

    if (@available(iOS 15.0, *)) {
        NSData *markdownData = [markdownString dataUsingEncoding:NSUTF8StringEncoding];
        if (markdownData == nil) {
            throw std::runtime_error("Failed to convert markdown NSString to UTF-8 NSData");
        }
        mdAttr = [[NSAttributedString alloc] initWithMarkdown:markdownData
                                                      options:opts
                                                      baseURL:nil
                                                        error:&error];
    } else {
        throw std::runtime_error("Markdown parsing requires iOS 15 or newer");
    }

    if (mdAttr == nil || error != nil) {
        NSString *desc = error.localizedDescription ?: @"Unknown markdown parse error";
        std::string msg = std::string("Failed to parse markdown: ") + desc.UTF8String;
        throw std::runtime_error(msg);
    }

    // 4. Extract/log attributes and build result
    __block NitroMarkdownAttributes result{}; // default initialize
    result.parsedText = mdAttr.string ? std::string([mdAttr.string UTF8String]) : std::string();

//    // Enumerate attribute runs; log what we find so you can wire your own mapping logic later.
    [mdAttr enumerateAttributesInRange:NSMakeRange(0, mdAttr.length)
                               options:0
                            usingBlock:^(NSDictionary<NSAttributedStringKey,id> *attrs, NSRange range, BOOL *stop) {

        NSString *runText = [mdAttr.string substringWithRange:range];
        
        BOOL isBold   = MDRunIsStrong(attrs);
        BOOL isItalic = MDRunIsEmphasis(attrs);
        

//        // Font traits
        UIFont *font = attrs[NSFontAttributeName];
        NSString *family = font ? (font.familyName ?: font.fontName) : @"(nil)";
        if (!isBold) {
            isBold = FontIsBold(font);
        }
        if (!isItalic) {
            isItalic = FontIsItalic(font);
        }
        double numericWeight = FontNumericWeight(font); // -1.0…1.0 (approx), 0=regular
//
//        // Decorations
        NSInteger ulMask = [attrs[NSUnderlineStyleAttributeName] integerValue];
        NSInteger stMask = [attrs[NSStrikethroughStyleAttributeName] integerValue];
        BOOL hasUnderline = (ulMask & NSUnderlineStyleSingle) != 0;
        BOOL hasStrikethrough = (stMask & NSUnderlineStyleSingle) != 0;
//
//        // Paragraph
        NSParagraphStyle *para = attrs[NSParagraphStyleAttributeName];
        NSTextAlignment align = para ? para.alignment : NSTextAlignmentNatural;
//
//        // Heading level (block semantics) if present
        NSInteger headingLevel = 0;
        if (@available(iOS 15.0, macOS 12.0, *)) {
            id pres = attrs[NSPresentationIntentAttributeName];
            id cur = pres;
//            while (cur) {
//                id kind = [cur valueForKey:@"kind"];
//                NSNumber *level = [cur valueForKey:@"level"];
//                if (kind && [[kind description] containsString:@"heading"] && level) {
//                    headingLevel = level.integerValue; // 1..6
//                    break;
//                }
//                cur = [cur valueForKey:@"parentIntent"];
//            }
        }
//
//        // Inline semantics (emphasis, code, etc.) if you want to peek
        id inlineIntent = attrs[NSInlinePresentationIntentAttributeName];

        // ---- Log everything for now ----
        NSLog(@"\n[MD RUN] range=(%lu,%lu)\n"
              "text=\"%@\"\n"
              "font.family=\"%@\"  bold=%@  italic=%@  numericWeight=%.2f\n"
              "underline=%@ (mask=%ld)  strikethrough=%@ (mask=%ld)\n"
              "alignment=%@\n"
              "headingLevel=%ld\n"
              "inlineIntent=%@\n",
              (unsigned long)range.location, (unsigned long)range.length,
              runText,
              family, isBold?@"YES":@"NO", isItalic?@"YES":@"NO", numericWeight,
              hasUnderline?@"YES":@"NO", (long)ulMask,
              hasStrikethrough?@"YES":@"NO", (long)stMask,
              AlignName(align),
              (long)headingLevel,
              inlineIntent ? [inlineIntent description] : @"(nil)");
        
        auto mappedWeight = isBold ? NitroFontWeight::BOLD : MarkdownFontWeightFromNumeric(numericWeight);
        MarkdownAssignOrReset(result.fontWeight, std::make_optional(mappedWeight));

        auto mappedStyle = MarkdownFontStyleFromFont(font);
        if (isItalic && mappedStyle == NitroFontStyle::NORMAL) {
            mappedStyle = NitroFontStyle::ITALIC;
        }
        MarkdownAssignOrReset(result.fontStyle, std::make_optional(mappedStyle));

        MarkdownAssignOrReset(result.fontFamily, MarkdownFontFamilyFromFont(font), true);

        auto decorationLine = MarkdownDecorationLine(ulMask, stMask);
        if (decorationLine != NitroTextDecorationLine::NONE) {
            MarkdownAssignOrReset(result.textDecorationLine, std::make_optional(decorationLine));
            NSInteger styleMask = ulMask != 0 ? ulMask : stMask;
            MarkdownAssignOrReset(result.textDecorationStyle, MarkdownDecorationStyle(styleMask), true);
        } else {
            MarkdownAssignOrReset(result.textDecorationLine, std::optional<NitroTextDecorationLine>{}, true);
            MarkdownAssignOrReset(result.textDecorationStyle, std::optional<NitroTextDecorationStyle>{}, true);
        }

        MarkdownAssignOrReset(result.textAlign, MarkdownAlignment(align), true);

    }];
    
    // Log a detailed summary of parsed attributes without passing C++ objects directly to NSLog

    // Leave the style fields for you to set with your own logic later.
    // (Optionally assign safe defaults here if your enums require it.)
    return result;
}

std::string sanitizeMarkdownPlainText(const std::string &input) {
    auto attrs = makeNitroMarkdownAttributes(input);
    return attrs.parsedText;
} 
}// namespace margelo::nitro::nitrotext::views


