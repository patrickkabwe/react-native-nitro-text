import React, { useCallback } from 'react'
import {
  Platform,
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

type NitroTextPropsWithEvents = Pick<
  NitroTextProps,
  'onTextLayout' | 'onPress' | 'onPressIn' | 'onPressOut'
> &
  Omit<TextProps, 'onTextLayout'>

export const NitroText = (props: NitroTextPropsWithEvents) => {
  let TextAncestorContext = unstable_TextAncestorContext
  if (
    Platform.constants.reactNativeVersion.major > 0 ||
    (Platform.constants.reactNativeVersion.major === 0 &&
      Platform.constants.reactNativeVersion.minor >= 81)
  ) {
    TextAncestorContext = require('react-native/Libraries/Text/TextAncestor')
  }
  const isInsideRNText = React.useContext(TextAncestorContext)
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

  const isSimpleText =
    typeof children === 'string' || typeof children === 'number'

  const fragments = React.useMemo(() => {
    if (isSimpleText) return []
    return flattenChildrenToFragments(children, style as any)
  }, [children, style, isSimpleText])

  if (isInsideRNText || Platform.OS === 'android') {
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

  const topStyles = styleToFragment(style || undefined)

  if (isSimpleText) {
    return (
      <NitroTextView
        {...rest}
        selectable={selectable}
        fontFamily={topStyles.fontFamily}
        selectionColor={selectionColor as string}
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
      selectionColor={selectionColor as string}
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
