import React, { useCallback } from 'react'
import {
  Text,
  type TextLayoutEvent,
  type TextProps,
  unstable_TextAncestorContext,
} from 'react-native'

import {
  callback,
  getHostComponent,
  type HybridRef,
} from 'react-native-nitro-modules'
import NitroTextConfig from '../nitrogen/generated/shared/json/NitroTextConfig.json'
import type { NitroTextMethods, NitroTextProps } from './specs/nitro-text.nitro'
import { flattenChildrenToFragments, styleToFragment } from './utils'

export type NitroTextRef = HybridRef<NitroTextProps, NitroTextMethods>

const NitroTextView = getHostComponent<NitroTextProps, NitroTextMethods>(
  'NitroText',
  () => NitroTextConfig
)

type NitroTextPropsWithEvents = Omit<TextProps, 'onTextLayout'> & NitroTextProps

export const NitroText = (props: NitroTextPropsWithEvents) => {
  const isInsideRNText = React.useContext(unstable_TextAncestorContext)
  const {
    children,
    style,
    selectable = true,
    selectionColor,
    onTextLayout,
    onPress,
    onPressIn,
    onPressOut,
    onLongPress,
    ...rest
  } = props

  // Fast path: avoid fragment building when children is a simple string/number
  const isSimpleText =
    typeof children === 'string' || typeof children === 'number'

  const fragments = React.useMemo(() => {
    if (isSimpleText) return []
    return flattenChildrenToFragments(children, style as any)
  }, [children, style, isSimpleText])

  // If this SelectableText is nested inside another, just render children so
  // the parent can flatten styles/text. Do not render a native view.
  // If inside RN Text, render a nested <Text> so local styles (e.g., color)
  // can override the parent's inherited color without creating a native view.

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
        selectionColor={selectionColor as any}
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

  // Note: Nested NitroText components do not mount as separate views.
  // The parent NitroText flattens its children (including nested NitroText)
  // into fragments, so this component will not observe `isNested`.

  const topStyles = styleToFragment(style || undefined)

  if (isSimpleText) {
    return (
      <NitroTextView
        {...rest}
        selectable={selectable}
        fontFamily={topStyles.fontFamily}
        selectionColor={selectionColor}
        text={String(children)}
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
      selectionColor={selectionColor}
      style={style}
      fontColor={topStyles.fontColor}
      fontWeight={topStyles.fontWeight}
      fontStyle={topStyles.fontStyle}
      letterSpacing={topStyles.letterSpacing}
      textAlign={topStyles.textAlign}
      textTransform={topStyles.textTransform}
      textDecorationLine={topStyles.textDecorationLine}
      textDecorationColor={topStyles.textDecorationColor}
      textDecorationStyle={topStyles.textDecorationStyle}
      onTextLayout={callback(onTextLayout)}
      onPress={callback(onPress)}
      onPressIn={callback(onPressIn)}
      onPressOut={callback(onPressOut)}
    />
  )
}
