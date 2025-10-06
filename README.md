<div align="center">
  <h1>react-native-nitro-text</h1>
</div>

<p align="center">
  A Text component that is much richer and performant for both iOS and Android.
</p>


<div align="center">
  
https://github.com/user-attachments/assets/57f56b3f-3988-4235-af83-a5f2cfd82121

</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/react-native-nitro-text?style=for-the-badge)](https://www.npmjs.org/package/react-native-nitro-text)
[![npm downloads](https://img.shields.io/npm/dt/react-native-nitro-text.svg?style=for-the-badge)](https://www.npmjs.org/package/react-native-nitro-text)
[![npm downloads](https://img.shields.io/npm/dm/react-native-nitro-text.svg?style=for-the-badge)](https://www.npmjs.org/package/react-native-nitro-text)
[![mit licence](https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge)](https://github.com/patrickkabwe/react-native-nitro-text/blob/main/LICENSE)

</div>

---

## Features

- Works on both iOS and Android(currently fallback to RN `Text` on Android)
- Native iOS rendering with smooth selection.
- Nested fragments merge into a single native text view
- Rendering Markdown and HTML (coming soon).
- Supports only the New Architecture

## Requirements

- React Native v0.78.0 or higher (Fabric/Nitro Views)
- Node 18+ (Node 20+ recommended)

## Installation

```bash
yarn add react-native-nitro-text react-native-nitro-modules
```

iOS

```bash
cd ios && pod install && cd ..
```

That’s it. You can now use the `NitroText` component in your app.

## Usage

```tsx
import { NitroText as Text } from 'react-native-nitro-text'

export function Title() {
  return (
    <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
      🚀 NitroText Showcase
    </Text>
  )
}
```

## Selection

iOS uses native selection. On Android, NitroText currently falls back to React Native `Text`.

```tsx
import { NitroText as Text } from 'react-native-nitro-text'

export function SelectionExample() {
  return (
    <Text selectable style={{ fontSize: 16, lineHeight: 22 }}>
      Long-press to select this text. NitroText supports smooth selection,
      even with <Text style={{ fontWeight: '600' }}>inline styles</Text> and
      longer paragraphs.
    </Text>
  )
}
```

### 🌀 NativeWind Interop

NitroText detects when the optional [`nativewind`](https://www.nativewind.dev/) package is installed and automatically maps `className` into the underlying style prop. No wrappers are required—just drop in Tailwind classes alongside the usual props.

```tsx
import { NitroText } from 'react-native-nitro-text'

export function TailwindTitle() {
  return (
    <NitroText className="text-xl font-semibold text-blue-500">
      Tailwind-powered NitroText
    </NitroText>
  )
}
```

You can still combine `style` or `renderStyles` for HTML rendering with NativeWind utility classes as needed.

## Platform Support

- iOS
- Android - At the moment `NitroText` fallback to RN `Text`.

## Why NitroText?

Custom native text view with minimal JS overhead and native iOS selection. Great for heavy/nested styled text and large lists. It's a drop-in replacement for RN `Text` component.

## Development

- `bun run build` — typecheck and build the package
- `bun run codegen` — regenerate codegen outputs
- Example app in `example/`

## Credits

Bootstrapped with [create-nitro-module](https://github.com/patrickkabwe/create-nitro-module).

## Contributing

PRs welcome! Please open an issue first for major changes.
