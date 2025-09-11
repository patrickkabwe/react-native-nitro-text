import type {
    HybridView,
    HybridViewMethods,
    HybridViewProps,
} from 'react-native-nitro-modules'

type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify'
type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'
type EllipsizeMode = 'head' | 'middle' | 'tail' | 'clip'
type LineBreakStrategyIOS = 'none' | 'standard' | 'hangul-word' | 'push-out'
type DynamicTypeRamp =
  | 'caption2'
  | 'caption1'
  | 'footnote'
  | 'subheadline'
  | 'callout'
  | 'body'
  | 'headline'
  | 'title3'
  | 'title2'
  | 'title1'
  | 'largeTitle'

// '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'  - Nitro does not support these
type FontWeight = 'normal' | 'bold' | 'ultralight' | 'thin' | 'light' | 'medium' | 'regular' | 'semibold' | 'condensedBold' | 'condensed' | 'heavy' | 'black'
type FontStyle = 'normal' | 'italic' | 'oblique'


export type Fragment = {
    /**
     * The text of the text.
     */
    text?: string

    /**
     * The font size of the text.
     */
    fontSize?: number

    /**
     * The font weight of the text.
     */
    fontWeight?: FontWeight

    /**
     * The font color of the text.
     */
    fontColor?: string

    /**
     * The font style of the text (italic, normal).
     */
    fontStyle?: FontStyle

    /**
     * The line height of the text.
     */
    lineHeight?: number

    /**
     * Additional space between letters (kerning), in points.
     * Matches React Native Text's `letterSpacing` on iOS.
     */
    letterSpacing?: number

    /**
     * The number of lines of the text.
     */
    numberOfLines?: number

    /**
     * Horizontal text alignment applied to the whole block.
     */
    textAlign?: TextAlign
    /**
     * Applies text transform to the content.
     */
    textTransform?: TextTransform
}

export interface NitroTextProps extends HybridViewProps, Fragment {
    /**
     * The fragments of the text. 
     */
    fragments?: Fragment[]

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
     * The onSelectableTextMeasured callback. Used to measure the height of the text.
     */
    onSelectableTextMeasured?: (height: number) => void

}

export interface NitroTextMethods extends HybridViewMethods { }

export type NitroText = HybridView<
    NitroTextProps,
    NitroTextMethods,
    { ios: 'swift' }
>
