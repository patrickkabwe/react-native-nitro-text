# react-native-nitro-text

Drop‑in, high‑performance Text for React Native (Fabric). Native iOS rendering with smooth selection, rich styling fragments, precise measurement, and line limiting.

[![Version](https://img.shields.io/npm/v/react-native-nitro-text.svg)](https://www.npmjs.com/package/react-native-nitro-text)
[![Downloads](https://img.shields.io/npm/dm/react-native-nitro-text.svg)](https://www.npmjs.com/package/react-native-nitro-text)
[![License](https://img.shields.io/npm/l/react-native-nitro-text.svg)](https://github.com/patrickkabwe/react-native-nitro-text/LICENSE)

## Features

- Native iOS rendering: UITextView/TextKit for smooth selection and layout.
- Rich styling fragments: nested styles merged into native attributed text.
- Precise measurement: per‑line metrics via `onTextLayout`; supports `numberOfLines`.
- Ellipsis & wrapping: `ellipsizeMode` (`head` | `middle` | `tail` | `clip`) and iOS `lineBreakStrategyIOS`.
- Typography: `fontFamily`, `fontWeight`, `fontStyle`, `letterSpacing`, `lineHeight`.
- Text alignment & transform: `textAlign`, `textTransform`.
- Decorations: `textDecorationLine`, `textDecorationStyle`, `textDecorationColor`.
- Dynamic Type: `allowFontScaling`, `dynamicTypeRamp`, `maxFontSizeMultiplier`.
- Selection & press: `selectable`, `selectionColor`, `onPress`, `onPressIn`, `onPressOut`.
- Color parsing: decimal ARGB, named colors, hex (#rgb/#rgba/#rrggbb/#rrggbbaa, `0x...`), and `rgb()/rgba()`.
- Works with RN Text: use NitroText inside RN `<Text>` and vice‑versa.

## Requirements

- React Native v0.78.0 or higher (Fabric/Nitro Views)
- Node 18+ (Node 20+ recommended)

## Installation

```bash
bun add react-native-nitro-text react-native-nitro-modules
```

iOS

```bash
cd ios && pod install && cd -
```

That’s it. Nitro autolinking registers the view and codegen output.

## Usage

Basic

```tsx
import { NitroText } from 'react-native-nitro-text'

export function Title() {
  return (
    <NitroText style={{ fontSize: 24, fontWeight: 'bold' }}>
      🚀 NitroText Showcase
    </NitroText>
  )
}
```

Rich text (nested fragments)

```tsx
<NitroText style={{ fontSize: 16, lineHeight: 24 }}>
  Welcome to <NitroText style={{ fontWeight: 'bold' }}>bold</NitroText> and{' '}
  <NitroText style={{ fontStyle: 'italic', color: '#6f42c1' }}>italic</NitroText>
  {' '}text with colors and sizes.
}</NitroText>
```

Line limiting and measurement

```tsx
<NitroText
  numberOfLines={2}
  ellipsizeMode="tail"
  style={{ fontSize: 16 }}
>
  This long text will be truncated with an ellipsis when it exceeds two lines.
</NitroText>

// Per‑line layout metrics (iOS)
<NitroText
  onTextLayout={(e) => console.log('lines', e.lines)}
  style={{ fontSize: 16 }}
>
  Measure my layout after rendering
</NitroText>
```

Mixed with RN Text

```tsx
<Text>
  RN <NitroText style={{ fontWeight: 'bold' }}>meets Nitro</NitroText> inside
  one paragraph.
</Text>
```

## Props

Unless noted, props mirror React Native Text style behavior through the `style` prop.

- `style`: supports `color`, `backgroundColor` (applies as fragment highlight), `fontSize`, `fontWeight`,
  `fontStyle`, `fontFamily`, `lineHeight`, `letterSpacing`, `textAlign`, `textTransform`,
  `textDecorationLine`, `textDecorationStyle`, `textDecorationColor`.
- `numberOfLines?: number`: limits visible lines.
- `ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip'`: truncation behavior when `numberOfLines` is set.
- `selectable?: boolean` (default `true`): enables native selection.
- `selectionColor?: string`: caret/selection handle tint color (iOS).
- `allowFontScaling?: boolean` (default `true`): enable Dynamic Type scaling.
- `dynamicTypeRamp?: DynamicTypeRamp`: iOS UIFontMetrics text style to scale against.
- `maxFontSizeMultiplier?: number`: caps Dynamic Type scaling multiplier.
- `lineBreakStrategyIOS?: 'none' | 'standard' | 'hangul-word' | 'push-out'`: iOS line break strategy.
- `onTextLayout?(event)`: per‑line layout metrics `{ lines: Array<{ text, x, y, width, height, descender, capHeight, ascender, xHeight }> }`.
- `onPress?()`, `onPressIn?()`, `onPressOut?()`: press events.

Note: Nested `<NitroText>` elements produce styling fragments merged natively.

## Platform Support

- iOS (Fabric)

## Parity Roadmap

Status toward React Native `Text` parity. Checked = implemented, unchecked = planned.

- [x] Core styles: `color`, `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`, `letterSpacing`
- [x] Layout/behavior: `numberOfLines`, `ellipsizeMode` (head/middle/tail/clip), nested spans
- [x] Alignment/transform: `textAlign`, `textTransform`
- [x] Decorations: `textDecorationLine`, `textDecorationStyle`, `textDecorationColor`
- [x] Color parsing: decimal ARGB, named colors, hex, `rgb()/rgba()`
- [x] Native selection: iOS selection handles/caret; `selectionColor`
- [x] Measurement: per‑line metrics via `onTextLayout`
- [x] `fontFamily` (system families and custom names)
- [x] Dynamic Type: `allowFontScaling`, `dynamicTypeRamp`, `maxFontSizeMultiplier`
- [x] iOS `lineBreakStrategyIOS`
- [ ] `fontVariant` (small‑caps, tabular‑nums, oldstyle‑nums, etc.)
- [ ] `hyphenationFactor`
- [ ] `onLongPress` parity in native path
- [ ] Accessibility: roles/labels/hints, nested span accessibility
- [ ] Bidi/RTL: `writingDirection`, mixed LTR/RTL validation
- [ ] Text shadows: `textShadow*`
- [ ] Baseline/typography: ligatures, kerning fine‑tuning
- [ ] Inline attachments (inline images/icons) where feasible

Priorities: fontFamily, letterSpacing/decoration/shadows, ellipsizeMode parity, press events.

## Text vs NitroText

| Aspect            | RN `Text`                                          | `NitroText`                                                                                                         |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Rendering engine  | Platform text primitives via RN                    | Native iOS TextKit/UITextView via Fabric (reduced JS overhead)                                                      |
| Performance       | General‑purpose, solid for most cases              | Optimized for rich text and large lists; faster layout/measurement and smoother selection                           |
| Props coverage    | Full RN `Text` surface                             | Core styles, alignment/transform, nested fragments, selection, single‑line `numberOfLines`; rest tracked in roadmap |
| Selection         | Functional selection behavior                      | Native iOS selection with precise caret/handles and smooth interaction                                              |                                                        |                                                          |
| Platform support  | iOS, Android, Web (via RN impls)                   | iOS (Fabric) today; Android planned                                                                                 |
| Recommended usage | Broad, cross‑platform text needs                   | Heavy/nested styled text and list performance; native selection/measurement focus                                   |

## Why NitroText?

NitroText uses Nitro Modules + Fabric to render natively with minimal JS overhead. Text selection, layout, and styling are handled in native code (Swift/C++/Obj‑C++), delivering smooth performance in complex lists and rich text scenarios.

## Development

- `bun run build` — typecheck and build package.
- `bun run codegen` — regenerate Nitrogen codegen outputs.
- Example app in `example/` (run pods in `example/ios` and start RN).

## Credits

Bootstrapped with [create-nitro-module](https://github.com/patrickkabwe/create-nitro-module).

## Contributing

PRs welcome! Please open an issue first for major changes.
