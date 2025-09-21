# React Native Nitro Text
A Text component that is much richer and performant for both iOS and Android.

[![Version](https://img.shields.io/npm/v/react-native-nitro-text.svg)](https://www.npmjs.com/package/react-native-nitro-text)
[![Downloads](https://img.shields.io/npm/dm/react-native-nitro-text.svg)](https://www.npmjs.com/package/react-native-nitro-text)
[![License](https://img.shields.io/npm/l/react-native-nitro-text.svg)](https://github.com/patrickkabwe/react-native-nitro-text/LICENSE)

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
