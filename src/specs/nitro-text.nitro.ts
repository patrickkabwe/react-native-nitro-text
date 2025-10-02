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
} from '../types'

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

export interface NitroTextMethods extends HybridViewMethods { }

export type NitroText = HybridView<
    NitroTextProps,
    NitroTextMethods,
    { ios: 'swift', android: 'kotlin' }
>
