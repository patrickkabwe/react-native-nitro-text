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
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/7KXUyHjz)
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
- Animations with React Native Reanimated (text, fontSize, fontColor, letterSpacing)

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

## HTML rendering

NitroText can parse HTML string children and inline CSS when you pass `renderer="html"`.

```tsx
import { NitroText } from 'react-native-nitro-text'

export function HtmlExample() {
  const html = `
    <div>
      <h2>Renderer demo</h2>
      <p>This text comes from <strong>HTML</strong> with <em>semantic</em> tags.</p>
      <p><span style="color: #ff6347; font-weight: bold;">Inline CSS works too.</span></p>
    </div>
  `

  return <NitroText renderer="html">{html}</NitroText>
}
```

## Custom selection menu

NitroText supports custom menu items that appear when text is selected. Pass a `menus` prop with an array of menu items, each containing a `title` and `action` callback.

```tsx
import { NitroText } from 'react-native-nitro-text'
import { useMemo } from 'react'

export function MenuExample() {
  const menus = useMemo(
    () => [
      { 
        title: 'Copy', 
        action: () => console.log('Copy action') 
      },
      { 
        title: 'Share', 
        action: () => console.log('Share action') 
      },
      { 
        title: 'Translate', 
        action: () => console.log('Translate action') 
      },
    ],
    []
  )

  return (
    <NitroText selectable menus={menus} style={{ fontSize: 16 }}>
      Select this text to see custom menu options appear in the selection menu.
    </NitroText>
  )
}
```

## Animations with React Native Reanimated

NitroText supports animating text properties using React Native Reanimated. Animations run directly on the UI thread for smooth, performant updates even when the JavaScript thread is busy.

### Setup

First, install the required dependencies:

```bash
yarn add react-native-reanimated react-native-worklets
```

Then, configure Babel to use the worklets plugin. Add it to your `babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // ... other plugins
    'react-native-worklets/plugin',
  ],
};
```

### Supported Animated Props

The following props can be animated:
- `text` - Animate the text content
- `fontSize` - Animate font size
- `fontColor` - Animate text color (as hex string, e.g., `"#FF0000"`)
- `letterSpacing` - Animate letter spacing

### Basic Example

Animate text content using `animatedProps`:

```tsx
import { NitroText } from 'react-native-nitro-text'
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated'
import { useEffect } from 'react'

const AnimatedNitroText = Animated.createAnimatedComponent(NitroText)

export function AnimatedTextExample() {
  const progress = useSharedValue(0)
  
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1000 })
  }, [])

  const animatedProps = useAnimatedProps(() => ({
    text: `Progress: ${Math.round(progress.value * 100)}%`,
  }))

  return (
    <AnimatedNitroText 
      animatedProps={animatedProps}
      style={{ fontSize: 24, fontWeight: 'bold' }}
    />
  )
}
```

### Advanced Example

Animate multiple properties simultaneously:

```tsx
import { NitroText } from 'react-native-nitro-text'
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated'
import { useEffect } from 'react'

const AnimatedNitroText = Animated.createAnimatedComponent(NitroText)

export function AdvancedAnimationExample() {
  const scale = useSharedValue(1)
  const color = useSharedValue(0)
  
  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
    
    color.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    )
  }, [])

  const animatedProps = useAnimatedProps(() => {
    const fontSize = 16 + (scale.value - 1) * 8
    const hue = Math.round(color.value * 360)
    
    return {
      fontSize,
      fontColor: `hsl(${hue}, 70%, 50%)`,
    } as any
  })

  return (
    <AnimatedNitroText 
      animatedProps={animatedProps}
      style={{ fontWeight: '600' }}
    >
      Animated Text
    </AnimatedNitroText>
  )
}
```

### Performance Benefits

Since animations run on the UI thread, NitroText animations remain smooth even when:
- The JavaScript thread is blocked
- Heavy computations are running
- The app is processing large amounts of data

This makes NitroText ideal for real-time text updates, counters, and dynamic content that needs to stay responsive.

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

> 💬 For quick support, join our [Discord channel](https://discord.gg/7KXUyHjz)
