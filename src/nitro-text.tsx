import React, { useCallback } from 'react'
import {
    Platform,
    Text,
    unstable_TextAncestorContext,
    type StyleProp,
    type TextLayoutEvent,
    type TextProps,
    type TextStyle,
} from 'react-native'
import {
    callback,
    getHostComponent,
    type HybridRef,
} from 'react-native-nitro-modules'
import NitroTextConfig from '../nitrogen/generated/shared/json/NitroTextConfig.json'
import {
    ensureNativeWindInterop,
    useNativeWindResolvedProps,
} from './nativewind-interop'
import type { NitroTextMethods, NitroTextProps } from './specs/nitro-text.nitro'
import type { NitroRenderer, RichTextStyleRule } from './types'
import {
    buildRichTextStyleRules,
    flattenChildrenToFragments,
    styleToFragment,
} from './utils'

export type NitroTextRef = HybridRef<NitroTextProps, NitroTextMethods>

const NitroTextView = getHostComponent<NitroTextProps, NitroTextMethods>(
  'NitroText',
  () => NitroTextConfig
)

export type NitroTextComponentProps = Pick<
  NitroTextProps,
  'onTextLayout' | 'onPress' | 'onPressIn' | 'onPressOut' | 'renderer'
> &
  Omit<TextProps, 'onTextLayout'> & {
    renderStyles?: Record<string, StyleProp<TextStyle>>
    className?: string
  }

let TextAncestorContext = unstable_TextAncestorContext
if (
  Platform.constants.reactNativeVersion.major > 0 ||
  (Platform.constants.reactNativeVersion.major === 0 &&
    Platform.constants.reactNativeVersion.minor < 81)
) {
  TextAncestorContext = require('react-native/Libraries/Text/TextAncestor')
}
export const NitroText = (props: NitroTextComponentProps) => {
  const resolvedProps = useNativeWindResolvedProps(props)
  const isInsideRNText = React.useContext(TextAncestorContext)
  const {
    children,
    style,
    className: _className,
    selectable,
    selectionColor,
    onTextLayout,
    onPress,
    onPressIn,
    onPressOut,
    onLongPress,
    renderer = 'plaintext',
    renderStyles,
    ...rest
  } = resolvedProps

  const htmlText = React.useMemo(() => {
    if (renderer !== 'html') return null
    if (typeof children === 'string' || typeof children === 'number') {
      return String(children)
    }
    const array = React.Children.toArray(children)
    if (array.length === 0) return null
    if (
      array.every(
        (child) => typeof child === 'string' || typeof child === 'number'
      )
    ) {
      return array.map((child) => String(child)).join('')
    }
    return null
  }, [children, renderer])

  const plainChildText =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : null

  const effectiveText = htmlText ?? plainChildText
  const isSimpleText = effectiveText != null

  const fragments = React.useMemo(() => {
    if (isSimpleText) return []
    return flattenChildrenToFragments(children, style as any)
  }, [children, style, isSimpleText])

  const richTextStyleRules: RichTextStyleRule[] | undefined =
    React.useMemo(() => {
      if (renderer !== 'html') return undefined
      return buildRichTextStyleRules(renderStyles)
    }, [renderStyles, renderer])

  if (isInsideRNText) {
    const onRNTextLayout = useCallback(
      (e: TextLayoutEvent) => {
        onTextLayout?.(e.nativeEvent)
      },
      [onTextLayout]
    )

    return (
      <Text
        {...rest}
        selectionColor={selectionColor}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onLongPress={onLongPress}
        selectable={selectable}
        style={style}
        onTextLayout={onRNTextLayout}
      >
        {children}
      </Text>
    )
  }

  const topStyles = styleToFragment(style || undefined)

  if (isSimpleText) {
    return (
      <NitroTextView
        {...rest}
        selectable={selectable}
        fontFamily={topStyles.fontFamily}
        selectionColor={selectionColor as string}
        text={effectiveText ?? ''}
        style={style}
        fontColor={topStyles.fontColor}
        textAlign={topStyles.textAlign}
        textTransform={topStyles.textTransform}
        fontSize={topStyles.fontSize}
        fontWeight={topStyles.fontWeight}
        fontStyle={topStyles.fontStyle}
        lineHeight={topStyles.lineHeight}
        letterSpacing={topStyles.letterSpacing}
        textDecorationLine={topStyles.textDecorationLine}
        textDecorationColor={topStyles.textDecorationColor}
        textDecorationStyle={topStyles.textDecorationStyle}
        renderer={renderer as NitroRenderer}
        richTextStyleRules={richTextStyleRules}
        onTextLayout={callback(onTextLayout)}
        onPress={callback(onPress)}
        onPressIn={callback(onPressIn)}
        onPressOut={callback(onPressOut)}
      />
    )
  }

  return (
    <NitroTextView
      {...rest}
      selectable={selectable}
      fragments={fragments}
      fontFamily={topStyles.fontFamily}
      selectionColor={selectionColor as string}
      style={style}
      fontColor={topStyles.fontColor}
      fontSize={topStyles.fontSize}
      fontWeight={topStyles.fontWeight}
      fontStyle={topStyles.fontStyle}
      lineHeight={topStyles.lineHeight}
      letterSpacing={topStyles.letterSpacing}
      textAlign={topStyles.textAlign}
      textTransform={topStyles.textTransform}
      textDecorationLine={topStyles.textDecorationLine}
      textDecorationColor={topStyles.textDecorationColor}
      textDecorationStyle={topStyles.textDecorationStyle}
      renderer={renderer as NitroRenderer}
      richTextStyleRules={richTextStyleRules}
      onTextLayout={callback(onTextLayout)}
      onPress={callback(onPress)}
      onPressIn={callback(onPressIn)}
      onPressOut={callback(onPressOut)}
    />
  )
}

ensureNativeWindInterop(NitroText)