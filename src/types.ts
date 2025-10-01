type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify'
type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'
export type EllipsizeMode = 'head' | 'middle' | 'tail' | 'clip'
export type LineBreakStrategyIOS = 'none' | 'standard' | 'hangul-word' | 'push-out'
export type DynamicTypeRamp =
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

type TextDecorationLine = 'none' | 'underline' | 'line-through' | 'underline line-through'
type TextDecorationStyle = 'solid' | 'double' | 'dotted' | 'dashed'

export type TextLayout = {
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    descender: number,
    capHeight: number,
    ascender: number,
    xHeight: number
}

export type TextLayoutEvent = {
    lines: Array<TextLayout>
}

export type Fragment = {
    /**
     * The text of the text.
     */
    text?: string
    
    /**
     * iOS: Color for text selection highlight/caret.
     */
    selectionColor?: string

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
     * Background highlight behind this text fragment.
     * Mirrors React Native Text's `backgroundColor` when applied to nested runs.
     * Named differently to avoid clashing with view style `backgroundColor`.
     */
    fragmentBackgroundColor?: string

    /**
     * The font style of the text (italic, normal).
     */
    fontStyle?: FontStyle

    /**
     * Custom font family for this fragment.
     * Note: Currently applied as a top-level font on iOS NitroText.
     */
    fontFamily?: string

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
     * Horizontal text alignment applied to the whole block.
     */
    textAlign?: TextAlign
    /**
     * Applies text transform to the content.
     */
    textTransform?: TextTransform

    /**
     * Text decoration for underline/strikethrough.
     * Mirrors RN Text's `textDecorationLine`.
     */
    textDecorationLine?: TextDecorationLine

    /**
     * Text decoration color.
     */
    textDecorationColor?: string

    /**
     * Text decoration style (solid, double, dotted, dashed).
     */
    textDecorationStyle?: TextDecorationStyle
}

export type NitroRenderer = 'plaintext' | 'html'

export type RichTextStyle = {
    fontColor?: string
    fragmentBackgroundColor?: string
    fontSize?: number
    fontWeight?: FontWeight
    fontStyle?: FontStyle
    fontFamily?: string
    lineHeight?: number
    letterSpacing?: number
    textAlign?: TextAlign
    textTransform?: TextTransform
    textDecorationLine?: TextDecorationLine
    textDecorationColor?: string
    textDecorationStyle?: TextDecorationStyle
    marginTop?: number
    marginBottom?: number
    marginLeft?: number
    marginRight?: number
}

export type RichTextStyleRule = {
    selector: string
    style: RichTextStyle
}
