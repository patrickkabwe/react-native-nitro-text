import React from 'react'
import {
   StyleSheet,
   type StyleProp,
   type TextProps,
   type TextStyle,
} from 'react-native'
import type { Fragment } from './types'

const STYLE_CACHE = new WeakMap<object, Partial<Fragment>>()

export function normalizeWeight(
   w?: TextStyle['fontWeight']
): Fragment['fontWeight'] | undefined {
   if (!w) return undefined

   if (typeof w === 'string' && isNaN(Number(w))) {
      return w as Fragment['fontWeight']
   }

   const n = Number(w)

   switch (n) {
      case 100:
         return 'ultralight'
      case 200:
         return 'light'
      case 300:
         return 'thin'
      case 400:
         return 'regular'
      case 500:
         return 'medium'
      case 600:
         return 'semibold'
      case 700:
         return 'bold'
      case 800:
         return 'heavy'
      case 900:
         return 'black'
      default:
         return 'regular'
   }
}

export function styleToFragment(
   style: StyleProp<TextStyle> | TextStyle | undefined,
   alreadyFlattened?: boolean
): Partial<Fragment> {
   if (!style) return {}

   // Check cache first for non-array object styles
   if (
      !alreadyFlattened &&
      typeof style === 'object' &&
      !Array.isArray(style)
   ) {
      const cached = STYLE_CACHE.get(style)
      if (cached) return cached
   }

   const s = alreadyFlattened
      ? (style as TextStyle)
      : StyleSheet.flatten(style as StyleProp<TextStyle>)

   if (!s || Object.keys(s).length === 0) return {}

   const result: Partial<Fragment> = {}

   if (s.color !== undefined) {
      result.fontColor = s.color as string
   }
   if (s.backgroundColor !== undefined) {
      result.fragmentBackgroundColor = s.backgroundColor as string
   }
   if (s.fontSize !== undefined) {
      result.fontSize = s.fontSize
   }
   if (s.fontWeight !== undefined) {
      result.fontWeight = normalizeWeight(s.fontWeight)
   }
   if (s.fontStyle !== undefined) {
      result.fontStyle = s.fontStyle
   }
   if (s.fontFamily !== undefined) {
      result.fontFamily = s.fontFamily
   }
   if (s.lineHeight !== undefined) {
      result.lineHeight = s.lineHeight
   }
   if (s.letterSpacing !== undefined) {
      result.letterSpacing = s.letterSpacing
   }
   if (s.textAlign !== undefined) {
      result.textAlign = s.textAlign
   }
   if (s.textTransform !== undefined) {
      result.textTransform = s.textTransform
   }
   if (s.textDecorationLine !== undefined) {
      result.textDecorationLine = s.textDecorationLine
   }
   if (s.textDecorationColor !== undefined) {
      result.textDecorationColor = s.textDecorationColor as string
   }
   if (s.textDecorationStyle !== undefined) {
      result.textDecorationStyle = s.textDecorationStyle
   }

   // Cache the result for non-array object styles
   if (
      !alreadyFlattened &&
      typeof style === 'object' &&
      !Array.isArray(style)
   ) {
      STYLE_CACHE.set(style, result)
   }

   return result
}

function getFragmentConfig(style: StyleProp<TextStyle>): {
   shouldApplyBackground: boolean
   shouldApplyBorder: boolean
} {
   const flat = StyleSheet.flatten(style) || {}
   const hasBackground = !!flat.backgroundColor
   const hasBorder = !!flat.borderColor || !!flat.borderWidth
   return {
      shouldApplyBackground: hasBackground,
      shouldApplyBorder: hasBorder,
   }
}

// Keys used to determine whether two adjacent fragments can be merged
const MERGE_KEYS: (keyof Fragment)[] = [
   'selectionColor',
   'fontSize',
   'fontWeight',
   'fontColor',
   'fragmentBackgroundColor',
   'fontStyle',
   'fontFamily',
   'lineHeight',
   'letterSpacing',
   'textAlign',
   'textTransform',
   'textDecorationLine',
   'textDecorationColor',
   'textDecorationStyle',
]

// Pick fragment-like props from an element's props (outside of style)
function pickFragmentOverrides(
   props: Record<string, unknown>
): Partial<Fragment> {
   if (!props || typeof props !== 'object') return {}
   const out: Partial<Fragment> = {}
   for (const k of MERGE_KEYS) {
      if (props[k] !== undefined) (out as Record<string, unknown>)[k] = props[k]
   }
   return out
}

function canMerge(a: Partial<Fragment>, b: Partial<Fragment>): boolean {
   for (const k of MERGE_KEYS) {
      if (a[k] !== b[k]) return false
   }
   return true
}

function pushFragment(out: Fragment[], text: string, attrs: Partial<Fragment>) {
   if (!text) return
   const last = out[out.length - 1]
   if (last && canMerge(last, attrs)) {
      last.text = (last.text || '') + text
      return
   }
   out.push({ text, ...attrs })
}

function flattenInto(
   out: Fragment[],
   children: React.ReactNode,
   parentStyle?: StyleProp<TextStyle>,
   fragmentConfig?: ReturnType<typeof getFragmentConfig>,
   inheritedOverrides: Partial<Fragment> = {}
) {
   React.Children.forEach(children, (child) => {
      if (child == null || child === false) return
      if (typeof child === 'string' || typeof child === 'number') {
         const base = styleToFragment(parentStyle)
         const merged: Partial<Fragment> = { ...base, ...inheritedOverrides }
         if (
            !fragmentConfig?.shouldApplyBackground &&
            merged.fragmentBackgroundColor
         ) {
            delete merged.fragmentBackgroundColor
         }
         pushFragment(out, String(child), merged)
         return
      }
      if (React.isValidElement(child)) {
         const {
            children: nested,
            style: childStyle,
            ...restProps
         } = child.props as TextProps
         const mergedStyle = [parentStyle, childStyle]
         const ownOverrides = pickFragmentOverrides(restProps)
         const mergedOverrides = { ...inheritedOverrides, ...ownOverrides }
         flattenInto(
            out,
            nested,
            mergedStyle,
            getFragmentConfig(childStyle),
            mergedOverrides
         )
      }
   })
}

export function flattenChildrenToFragments(
   children: React.ReactNode,
   parentStyle?: StyleProp<TextStyle>,
   fragmentConfig?: ReturnType<typeof getFragmentConfig>
): Fragment[] {
   const out: Fragment[] = []
   flattenInto(out, children, parentStyle, fragmentConfig, {})
   return out
}

export function getStyleProps(styles: Partial<Fragment>) {
   // Early return if no styles
   const keys = Object.keys(styles)
   if (keys.length === 0) return {}

   const props: Partial<Fragment> = {}

   // Optimized: only iterate through properties that exist
   for (const key of keys) {
      const value = styles[key as keyof Fragment]
      if (value === undefined) continue

      // Skip empty strings for string properties
      if (
         typeof value === 'string' &&
         value === '' &&
         (key === 'fontFamily' ||
            key === 'fontColor' ||
            key === 'textDecorationColor' ||
            key === 'selectionColor')
      ) {
         continue
      }

      // Type-safe assignment using Record
      ;(props as Record<string, unknown>)[key] = value
   }

   return props
}
