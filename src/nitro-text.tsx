import React, { createContext } from 'react'
import { Text, type TextProps } from 'react-native'
import { getHostComponent, type HybridRef } from 'react-native-nitro-modules'
import NitroTextConfig from '../nitrogen/generated/shared/json/NitroTextConfig.json'
import type {
  Fragment,
  NitroTextMethods,
  NitroTextProps,
} from './specs/nitro-text.nitro'
import {
  createStyleFromPropsStyle,
  flattenChildrenToFragments,
  styleToFragment,
} from './utils'

export type NitroTextRef = HybridRef<NitroTextProps, NitroTextMethods>

const NitroTextView = getHostComponent<NitroTextProps, NitroTextMethods>(
  'NitroText',
  () => NitroTextConfig
)

const NitroTextNestingContext = createContext<boolean>(false)

// Hoist RN Text ancestor context lookup out of render to avoid repeated requires
let RNTextAncestorContext: React.Context<any> | null = null

try {
  const mod: any = (require as any)('react-native/Libraries/Text/TextAncestor')
  RNTextAncestorContext = (mod && (mod.Context || mod.default || mod)) ?? null
} catch {}

export const NitroText = (props: TextProps) => {
  const isNested = React.useContext(NitroTextNestingContext)
  // Detect if we are nested inside a native RN <Text> to avoid rendering a view
  const isInsideRNText =
    RNTextAncestorContext && (RNTextAncestorContext as any).Provider
      ? React.useContext(RNTextAncestorContext as any)
      : false
  const { children, style, selectable = true, ...rest } = props

  // Fast path: avoid fragment building when children is a simple string/number
  const isSimpleText =
    typeof children === 'string' || typeof children === 'number'

  const fragments = React.useMemo(() => {
    if (isSimpleText) return [] as Fragment[]
    return flattenChildrenToFragments(children, style as any)
  }, [children, style, isSimpleText])

  // If this SelectableText is nested inside another, just render children so
  // the parent can flatten styles/text. Do not render a native view.
  // If inside RN Text, render a nested <Text> so local styles (e.g., color)
  // can override the parent's inherited color without creating a native view.
  if (isInsideRNText) {
    return (
      <NitroTextNestingContext.Provider value={true}>
        <Text {...rest} selectable={selectable} style={style}>
          {children}
        </Text>
      </NitroTextNestingContext.Provider>
    )
  }

  // If nested inside NitroText, let the parent flatten styles/text.
  if (isNested) {
    return <>{children}</>
  }

  const { color, textAlign, textTransform } = createStyleFromPropsStyle(style)

  const top = styleToFragment(style || undefined)

  if (isSimpleText) {
    return (
      <NitroTextNestingContext.Provider value={true}>
        <NitroTextView
          {...rest}
          selectable={selectable}
          text={String(children)}
          style={style}
          fontColor={color}
          textAlign={textAlign}
          textTransform={textTransform}
          fontSize={top.fontSize}
          fontWeight={top.fontWeight}
          fontStyle={top.fontStyle}
          lineHeight={top.lineHeight}
          letterSpacing={top.letterSpacing}
        />
      </NitroTextNestingContext.Provider>
    )
  }

  return (
    <NitroTextNestingContext.Provider value={true}>
      <NitroTextView
        {...rest}
        selectable={selectable}
        fragments={fragments}
        style={style}
        fontColor={color}
        fontWeight={top.fontWeight}
        fontStyle={top.fontStyle}
        letterSpacing={top.letterSpacing}
        textAlign={textAlign}
        textTransform={textTransform}
      />
    </NitroTextNestingContext.Provider>
  )
}
