import type {
    HybridView,
    HybridViewMethods,
    HybridViewProps,
} from 'react-native-nitro-modules'

type TextAlign = 'auto' | 'left' | 'right' | 'center' | 'justify'
type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'
type EllipsizeMode = 'head' | 'middle' | 'tail' | 'clip'

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
