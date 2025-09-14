<div>
  <img width="2652" height="611" alt="Group 18 1" src="https://github.com/user-attachments/assets/72c83d81-d887-4f91-9197-19007990bfa1" />
</div>

<br />

[![Version](https://img.shields.io/npm/v/react-native-nitro-text.svg)](https://www.npmjs.com/package/react-native-nitro-text)
[![Downloads](https://img.shields.io/npm/dm/react-native-nitro-text.svg)](https://www.npmjs.com/package/react-native-nitro-text)
[![License](https://img.shields.io/npm/l/react-native-nitro-text.svg)](https://github.com/patrickkabwe/react-native-nitro-text/LICENSE)

## Features

- Works on both iOS and Android(currently fallback to RN `Text`)
- Native iOS TextKit renderer (Fabric)
- Nested fragments merge into a single native text view
- Supports only the New Architecture
- Selection: selectable by default, iOS `selectionColor`

## Requirements

- React Native v0.78.0 or higher (Fabric/Nitro Views)
- Node 18+ (Node 20+ recommended)

## Installation

```bash
yarn add react-native-nitro-text react-native-nitro-modules
```

iOS

```bash
cd ios && pod install && cd -
```

That’s it. Nitro autolinking registers the view and codegen output.

## Usage

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

## Platform Support

- iOS
- Android (not implemented yet) - At the moment NitroText fallback to RN `Text`.

## Why NitroText?

Custom native text view with minimal JS overhead and native iOS selection. Great for heavy/nested styled text and large lists.

## Development

- `bun run build` — typecheck and build package
- `bun run codegen` — regenerate codegen outputs
- Example app in `example/`

## Credits

Bootstrapped with [create-nitro-module](https://github.com/patrickkabwe/create-nitro-module).

## Contributing

PRs welcome! Please open an issue first for major changes.
