import type {
   HybridView,
   HybridViewMethods,
   HybridViewProps,
} from 'react-native-nitro-modules'
import type {
   DynamicTypeRamp,
   EllipsizeMode,
   Fragment,
   LineBreakStrategyIOS,
   TextLayoutEvent,
   MenuItem,
   Renderer,
} from '../types'

export interface NitroTextProps
   extends HybridViewProps,
      Omit<Fragment, 'linkUrl'> {
   /**
    * The fragments of the text.
    */
   fragments?: Fragment[]

   /**
    * Renderer for parsing rich text content from string children.
    * When specified, the string children are parsed by a purpose-built, zero-allocation parser:
    * - 'html': Parses HTML tags, inline CSS styles, `<style>` blocks, selectors (class/id/tag), lists, and semantic tags
    * - 'plaintext': Treats the text literally without any parsing

    * HTML renderer supports by default:
    * - HTML tags (b, i, strong, em, span, div, p, lists, etc.)
    * - Inline CSS styles: `<span style='color: red; font-weight: bold;'>`
    * - CSS stylesheets: `<style>` tags and styles in `<head>`
    * - CSS selectors: classes (`.class`), IDs (`#id`), element selectors
    *
    * Works with string children (matching the pattern in App.tsx):
    * @example
    * ```tsx
    * <NitroText renderer="html"><b>Bold</b> and <i>italic</i></NitroText>
    * <NitroText renderer="html"><span style='color: red; font-weight: bold;'>Styled</span></NitroText>
    *
    * // With stylesheet support (built-in, no configuration needed)
    * <NitroText renderer="html">
    *   <html lang="en">
    *       <head>
    *           <style>
    *               .bold { font-weight: bold; }
    *               .red { color: red; }
    *               #title { font-size: 24px; }
    *           </style>
    *       </head>
    *       <body>
    *           <span class="bold red">Bold and red from stylesheet</span>
    *           <span id="title">Title text</span>
    *       </body>
    *   </html>
    * </NitroText>
    * ```
    *
    * When not provided, content is treated as plain text or React children (nested NitroText components).
    */
   renderer?: Renderer

   /**
    * Selectable text.
    */
   selectable?: boolean

   /**
    * If true, text respects system font scaling (Dynamic Type).
    * Matches React Native Text's allowFontScaling. Defaults to true.
    */
   allowFontScaling?: boolean

   /**
    * Controls where to truncate text when numberOfLines is set.
    * Defaults to 'tail' like RN Text.
    */
   ellipsizeMode?: EllipsizeMode

   /**
    * Limits the text to a maximum number of lines. Truncation behavior is
    * controlled via `ellipsizeMode`. Matches React Native Text's `numberOfLines`.
    */
   numberOfLines?: number

   /**
    * iOS-only line breaking strategy applied when wrapping lines.
    * Mirrors React Native's `lineBreakStrategyIOS`.
    * - 'standard' (default): Use Apple's standard strategies
    * - 'hangul-word': Prioritize Hangul word boundaries
    * - 'push-out': Push glyphs out to avoid breaks
    * - 'none': Disable special strategies
    */
   lineBreakStrategyIOS?: LineBreakStrategyIOS

   /**
    * iOS Dynamic Type ramp. Selects the UIFontMetrics text style used for scaling.
    * Matches React Native's Text `dynamicTypeRamp`. Defaults to body
    */
   dynamicTypeRamp?: DynamicTypeRamp

   /**
    * Caps the Dynamic Type scaling factor when `allowFontScaling` is true.
    * >= 1 to enforce a maximum multiplier; omit/undefined means no cap.
    */
   maxFontSizeMultiplier?: number | null

   /**
    * iOS: Shrink text to fit within the container width.
    */
   adjustsFontSizeToFit?: boolean

   /**
    * iOS: The smallest scale allowed when shrinking.
    * Range 0.01–1.0. Only used when `adjustsFontSizeToFit` is true.
    */
   minimumFontScale?: number

   /**
    * Add custom menu items to the selection menu.
    */
   menus?: MenuItem[]

   /**
    * The onTextLayout callback. Used to measure the layout of the text.
    */
   onTextLayout?: (layout: TextLayoutEvent) => void

   /**
    * Called after a tap completes successfully.
    */
   onPress?: () => void

   /**
    * Called when a press begins (touch down).
    */
   onPressIn?: () => void

   /**
    * Called when a press ends (touch up/cancel).
    */
   onPressOut?: () => void
}

export interface NitroTextMethods extends HybridViewMethods {}

export type NitroText = HybridView<
   NitroTextProps,
   NitroTextMethods,
   { ios: 'swift' }
>
