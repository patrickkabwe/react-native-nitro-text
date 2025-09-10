# react-native-nitro-text

Drop‑in, high‑performance Text for React Native (Fabric). Native iOS rendering with smooth selection, rich styling fragments, precise measurement, and line limiting.

[![Version](https://img.shields.io/npm/v/react-native-nitro-text.svg)](https://www.npmjs.com/package/react-native-nitro-text)
[![Downloads](https://img.shields.io/npm/dm/react-native-nitro-text.svg)](https://www.npmjs.com/package/react-native-nitro-text)
[![License](https://img.shields.io/npm/l/react-native-nitro-text.svg)](https://github.com/patrickkabwe/react-native-nitro-text/LICENSE)

## Features

- Native iOS rendering: UITextView/TextKit for smooth selection and layout.
- Rich styling fragments: nested styles merged into native attributed text.
- Precise measurement: reports size for dynamic UIs; supports `numberOfLines`.
- Text alignment & transform: `textAlign` and `textTransform` support.
- Color parsing: decimal ARGB, named colors, hex (RGB/RGBA), `rgb()/rgba()`.
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
<NitroText numberOfLines={2} style={{ fontSize: 16 }}>
  This long text will be truncated with an ellipsis when it exceeds two lines.
</NitroText>

// Native height callback (iOS)
<NitroText
  onSelectableTextMeasured={(height) => console.log('height', height)}
  style={{ fontSize: 16 }}
>
  Measure my height after layout
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

- `style`: supports `color`, `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`, `textAlign`, `textTransform`.
- `numberOfLines?: number`: single/multi‑line with tail truncation for single line.
- `selectable?: boolean` (default `true`): enables native selection.
- `onSelectableTextMeasured?(height: number)`: native iOS height after layout.

Note: Nested `<NitroText>` elements produce styling fragments merged natively.

## Platform Support

- iOS (Fabric)

## Parity Roadmap

Status toward React Native `Text` parity. Checked = implemented, unchecked = planned.

- [x] Core styles: `color`, `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`
- [x] Layout/behavior: `numberOfLines` (single‑line tail truncation), nested spans
- [x] Alignment/transform: `textAlign`, `textTransform`
- [x] Color parsing: decimal ARGB, named colors, hex, `rgb()/rgba()`
- [x] Native selection: iOS selection handles/caret; smooth scrolling/selection
- [x] Measurement: native height via `onSelectableTextMeasured`
- [ ] `fontFamily` (custom fonts + weight/style fallback matrix)
- [ ] `letterSpacing`, `textDecoration*`, `textShadow*`
- [ ] `ellipsizeMode` parity (head, middle, tail, clip) and multi‑line behavior
- [ ] `allowFontScaling`, `maxFontSizeMultiplier` (Dynamic Type)
- [ ] `fontVariant` (small‑caps, tabular‑nums, oldstyle‑nums, etc.)
- [ ] iOS `lineBreakStrategyIOS`, `hyphenationFactor`
- [ ] `selectionColor`, `dataDetectorTypes`, linkable spans
- [ ] Press events: `onPress`, `onLongPress`, `onPressIn/Out` incl. nested spans
- [ ] `onTextLayout` parity (line/fragment metrics)
- [ ] Accessibility: roles/labels/hints, nested span accessibility
- [ ] Bidi/RTL: `writingDirection`, mixed LTR/RTL validation
- [ ] Baseline/typography: `baselineOffset`, ligatures, kerning
- [ ] Inline attachments (inline images/icons) where feasible

Priorities: fontFamily, letterSpacing/decoration/shadows, ellipsizeMode parity, press events.

## Text vs NitroText

| Aspect | RN `Text` | `NitroText` |
| --- | --- | --- |
| Rendering engine | Platform text primitives via RN | Native iOS TextKit/UITextView via Fabric (reduced JS overhead) |
| Performance | General‑purpose, solid for most cases | Optimized for rich text and large lists; faster layout/measurement and smoother selection |
| Props coverage | Full RN `Text` surface | Core styles, alignment/transform, nested fragments, selection, single‑line `numberOfLines`; rest tracked in roadmap |
| Selection | Functional selection behavior | Native iOS selection with precise caret/handles and smooth interaction |
| Ellipsis | `ellipsizeMode`: head/middle/tail/clip; multi‑line | Tail on single‑line today; multi‑line + full parity planned |
| Accessibility | Mature, cross‑platform | iOS first; parity in progress per roadmap |
| Platform support | iOS, Android, Web (via RN impls) | iOS (Fabric) today; Android planned |
| Recommended usage | Broad, cross‑platform text needs | Heavy/nested styled text and list performance; native selection/measurement focus |

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
