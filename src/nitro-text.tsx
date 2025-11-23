import React, { useCallback, useContext, useMemo } from 'react'
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
import {
   flattenChildrenToFragments,
   getStyleProps,
   styleToFragment,
} from './utils'
import { renderStringChildren } from './renderers'

export type NitroTextRef = HybridRef<NitroTextProps, NitroTextMethods>

const NitroTextView = getHostComponent<NitroTextProps, NitroTextMethods>(
   'NitroText',
   () => NitroTextConfig
)

type NitroTextPropsWithEvents = Pick<
   NitroTextProps,
   | 'onTextLayout'
   | 'onPress'
   | 'onPressIn'
   | 'onPressOut'
   | 'menus'
   | 'renderer'
   | 'maxFontSizeMultiplier'
> &
   Omit<TextProps, 'onTextLayout'>

let TextAncestorContext = unstable_TextAncestorContext
if (
   Platform.constants.reactNativeVersion.major === 0 &&
   Platform.constants.reactNativeVersion.minor < 81
) {
   TextAncestorContext = require('react-native/Libraries/Text/TextAncestor')
}
export const NitroText = (props: NitroTextPropsWithEvents) => {
   const isInsideRNText = useContext(TextAncestorContext)
   const {
      style,
      renderer,
      children,
      selectable,
      selectionColor,
      maxFontSizeMultiplier,
      onTextLayout,
      onPress,
      onPressIn,
      onPressOut,
      onLongPress,
      ...rest
   } = props

   const isStringChildren = typeof children === 'string'
   const isSimpleText = isStringChildren || typeof children === 'number'

   const topStyles = useMemo(() => {
      if (!style) return {}
      return styleToFragment(style)
   }, [style])

   const parsedFragments = useMemo(() => {
      if (!renderer || !isStringChildren) return undefined
      const result = renderStringChildren(children, renderer, topStyles)
      return result.fragments
   }, [renderer, children, isStringChildren, topStyles])

   const fragments = useMemo(() => {
      if (parsedFragments !== undefined) return parsedFragments
      if (isSimpleText) return []
      return flattenChildrenToFragments(children, style)
   }, [parsedFragments, children, style, isSimpleText])

   const styleProps = useMemo(() => getStyleProps(topStyles), [topStyles])

   const onRNTextLayout = useCallback(
      (e: TextLayoutEvent) => {
         onTextLayout?.(e.nativeEvent)
      },
      [onTextLayout]
   )

   if (isInsideRNText || Platform.OS === 'android') {
      return (
         <Text
            {...rest}
            selectionColor={selectionColor}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
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

   if (!renderer && isSimpleText) {
      return (
         <NitroTextView
            {...rest}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            selectable={selectable}
            selectionColor={selectionColor as string}
            text={String(children)}
            style={style}
            {...styleProps}
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
         style={style}
         fragments={fragments}
         selectable={selectable}
         selectionColor={selectionColor as string}
         maxFontSizeMultiplier={maxFontSizeMultiplier}
         {...styleProps}
         onTextLayout={callback(onTextLayout)}
         onPress={callback(onPress)}
         onPressIn={callback(onPressIn)}
         onPressOut={callback(onPressOut)}
      />
   )
}

NitroText.displayName = 'NitroText'
