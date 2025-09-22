## [1.0.1](https://github.com/patrickkabwe/react-native-nitro-text/compare/v1.0.0...v1.0.1) (2025-09-22)

### 🐛 Bug Fixes

* ship NitroText headers with npm package ([325a3d9](https://github.com/patrickkabwe/react-native-nitro-text/commit/325a3d917b25b56809a6bd5741af7849fb224345))

## 1.0.0 (2025-09-21)

### ✨ Features

* **ios:** add allowFontScaling, letterSpacing, DynamicTypeRamp; align Fabric measurement with native (transform, metrics); coalesce Swift updates; fix textTransform updates and dynamic type mapping ([42129d6](https://github.com/patrickkabwe/react-native-nitro-text/commit/42129d66307f9edb55069efa68afae4bde774db3))
* **ios:** add ellipsizeMode support\n\n- Adds new prop ellipsizeMode: 'head' | 'middle' | 'tail' | 'clip'\n- Wires prop through Nitro generated layers (manual patches)\n- Implements mapping in NitroTextImpl using NSLineBreakMode, including multi-line\n- Mirrors truncation in paragraph style for attributed text\n- Updates JS types and config ([98b65cf](https://github.com/patrickkabwe/react-native-nitro-text/commit/98b65cf3a0a61ec90e4afd6b787d8cd66735e0b6))
* **iOS:** add lineBreakStrategyIOS support (render + measure) ([c13d89d](https://github.com/patrickkabwe/react-native-nitro-text/commit/c13d89dbce85626f4cd65bff40a9bef3d6ea7e69))
* **IOS:** add text decoration support in NitroText ([986c873](https://github.com/patrickkabwe/react-native-nitro-text/commit/986c873e40dd21da9f2190c852ada1a111909463))
* **ios:** enhance ellipsizeMode support ([983a7d5](https://github.com/patrickkabwe/react-native-nitro-text/commit/983a7d5b2632f2e57bfdcd70310276e5d54dd9ae))
* **ios:** honor ellipsizeMode for single-line; coerce multi-line to tail/clip\n\n- Add effectiveLineBreakMode helper and apply everywhere\n- Reapply lineBreakMode on numberOfLines/ellipsizeMode changes\n- Fix missing setNeedsLayout in setNumberOfLines ([d5f3fb1](https://github.com/patrickkabwe/react-native-nitro-text/commit/d5f3fb136675ce556862c4aee1bbdbe79939763c))
* **ios:** introduce Fabric NitroText with native iOS view, fragments, selection, and measurement ([9067d25](https://github.com/patrickkabwe/react-native-nitro-text/commit/9067d250a81e4c4b834c687a03490daacb910607))
* **iOS:** support maxFontSizeMultiplier, adjustsFontSizeToFit, minimumFontScale (wiring + measure); cap scaling in renderer ([775e48d](https://github.com/patrickkabwe/react-native-nitro-text/commit/775e48d4938b6279a93d6b329f49edebdabe2c37))
* **text:** add allowFontScaling support; honor RN default fontSizeMultiplier=1.0; update NitroTextShadowNode measurement and iOS font scaling ([8980cd5](https://github.com/patrickkabwe/react-native-nitro-text/commit/8980cd58fc4a53e8a4091a98de4e8362f7aa8013))
* **text:** add fontFamily and selectionColor props; support generic iOS UI font families; pressed highlighting with suppressHighlighting; update ShadowNode measurement ([9f56183](https://github.com/patrickkabwe/react-native-nitro-text/commit/9f56183a0e9943046c3e5567ea4e093a3a69136c))
* **text:** add letterSpacing support matching RN Text (TS props, config, bridge); apply NSKern in iOS; include in Fabric measurement; merge top-level + fragments ([d489f64](https://github.com/patrickkabwe/react-native-nitro-text/commit/d489f64d425964d9e8851c01a9f9f6a13f6246aa))

### 🐛 Bug Fixes

* **ios:** align Fabric text measurement with rendering when font scaling enabled by setting dynamicTypeRamp=Body and applying baseline offset for custom lineHeight; reduces extra bottom spacing ([dd6669c](https://github.com/patrickkabwe/react-native-nitro-text/commit/dd6669c87eb6fdf0d2eccc54129bfd4f0d490957))
* **ios:** apply ellipsizeMode-derived lineBreakMode and request layout\n\n- Ensure setNumberOfLines and setEllipsizeMode call setNeedsLayout\n- Paragraph style and textContainer use effectiveLineBreakMode derived from current ellipsizeMode + numberOfLines\n- Aligns behavior with RN for multi-line clip/tail ([fe367ad](https://github.com/patrickkabwe/react-native-nitro-text/commit/fe367adcad43f556e569a0cddcad4d0271aa53c4))
* **iOS:** match RN Text scaling precisely ([5d58b48](https://github.com/patrickkabwe/react-native-nitro-text/commit/5d58b48097db086f2152ced8216f9e4f3d190831))
* **ios:** multi-line clip should wrap to N lines (use WordWrapping)\n\n- For numberOfLines > 1 and ellipsizeMode=clip, use .byWordWrapping\n- Prevents single-line clipping and matches RN Text behavior ([bdb4a93](https://github.com/patrickkabwe/react-native-nitro-text/commit/bdb4a93c5bacc80014be1816f58fa006eed945b6))

### 💨 Performance Improvements

* **ios:** cache UIFonts and request layout on truncation changes\n\n- Add small font cache keyed by size/weight/italic to avoid repeated font recreation\n- Call setNeedsLayout on numberOfLines/ellipsizeMode changes to ensure efficient relayout\n- Keep helpers accessible from extensions ([5580bfb](https://github.com/patrickkabwe/react-native-nitro-text/commit/5580bfb602f5d5da226abf2e663bd38ab5d1b39e))

### 🔄 Code Refactors

* Extract helpers to simplify setFragments\n\n- Split into makeAttributes/makeFont/makeParagraphStyle/resolveColor/transform\n- Preserve behavior (weights, italics, colors, alignment, truncation)\n- Improves readability and maintainability ([7ca2faa](https://github.com/patrickkabwe/react-native-nitro-text/commit/7ca2faa7e0a59e6557deff4ab97d7cd940f812fa))
* **iOS:** clean up whitespace and improve code formatting in NitroText and NitroTextImpl classes ([13a5926](https://github.com/patrickkabwe/react-native-nitro-text/commit/13a5926ef7d9025adeefa3937c1f4460f7ae7788))
* **ios:** extract attribute builders to NitroTextImpl+Attributes.swift\n\n- Move makeAttributes/makeParagraphStyle/resolveColor/transform into an extension file\n- Relax access controls so extensions can read state (alignment, transform, container)\n- Keep NitroTextImpl.swift focused on core logic ([4f24327](https://github.com/patrickkabwe/react-native-nitro-text/commit/4f24327e61a4beddffe5a5e37fa177473d0d32a3))
* **ios:** extract fragment/default merging into NitroTextImpl+Fragment.swift\n\n- Move FragmentTopDefaults, apply(...) and fontWeight mapping to an extension file\n- Keep NitroTextImpl.swift focused on layout/render logic ([f0d637c](https://github.com/patrickkabwe/react-native-nitro-text/commit/f0d637c3361fdfaeb2e7437a2da0f4fe2b86db86))
* **ios:** move all font logic to NitroTextImpl+Font.swift\n\n- Extract makeFont(for:defaultPointSize:) into +Font extension\n- Update callers to pass default point size\n- Keeps NitroTextImpl.swift focused on non-font responsibilities ([5373ed3](https://github.com/patrickkabwe/react-native-nitro-text/commit/5373ed3a8c5b6d70c5b034409065317cb9a94a61))
* **ios:** move FontKey struct inside NitroTextImpl extension ([8a40eb1](https://github.com/patrickkabwe/react-native-nitro-text/commit/8a40eb1546a04a03fc0b275ce99cf50d92993619))
* **ios:** move fontWeightFromString to NitroTextImpl+Font.swift\n\n- Keep +Fragment focused on fragment/default merging\n- Group font mapping in a dedicated +Font extension ([e24e09d](https://github.com/patrickkabwe/react-native-nitro-text/commit/e24e09d2248e208c88ddde8f3d57f28037bb5465))
* **ios:** move fragment/defaults merge into NitroTextImpl\n\n- Add FragmentTopDefaults and apply(fragments:text:top:) in NitroTextImpl\n- Delegate merging from HybridNitroText to NitroTextImpl\n- Keeps Hybrid class thin and centralizes render logic ([d7791c4](https://github.com/patrickkabwe/react-native-nitro-text/commit/d7791c4206931e9dc56a60db53ad99fc052bc2cf))
* **ios:** remove commented-out code and improve formatting in HybridNitroText and NitroTextImpl ([43c5416](https://github.com/patrickkabwe/react-native-nitro-text/commit/43c54165559ac282c3c378c23e502771b2816160))
* **iOS:** remove custom lineHeight handling from NitroText attributes ([b1e93ce](https://github.com/patrickkabwe/react-native-nitro-text/commit/b1e93ce8107a358d7ee40294ef9b140fdd03ecd7))
* **ios:** rename fontWeightFromString -> uiFontWeight(for:) to reflect behavior ([478d264](https://github.com/patrickkabwe/react-native-nitro-text/commit/478d264f291baf9b500e2ab5043ee7119b4432aa))
* **text:** streamline property updates in HybridNitroText to use markNeedsApply for deferred processing ([fcd8acf](https://github.com/patrickkabwe/react-native-nitro-text/commit/fcd8acf3887e26918a438464fd4cccfe9d58210a))
* **utils:** simplify style handling in getFragmentConfig ([72772bd](https://github.com/patrickkabwe/react-native-nitro-text/commit/72772bd73c7b0420aab8869b21c493c1e045db71))

### 📚 Documentation

* **README:** keep the docs simple ([94936ae](https://github.com/patrickkabwe/react-native-nitro-text/commit/94936ae334ff654d53073805b9d18363a0af7e66))
* **README:** replace Parity Roadmap with concrete checklist and add Text vs NitroText table ([66f4070](https://github.com/patrickkabwe/react-native-nitro-text/commit/66f4070dd75eb76e6be4a5d72c5f19fb22c0ad57))
* **README:** Update features and props documentation to reflect recent changes. ([384abe3](https://github.com/patrickkabwe/react-native-nitro-text/commit/384abe34d12b4e393056c5ac7d29d3dbb2289025))
* update package description and README for NitroText component ([a605715](https://github.com/patrickkabwe/react-native-nitro-text/commit/a605715b3d8df809ae20ff3ab4768c18e843ca3d))

### 🛠️ Other changes

* bump up nitro to 0.29.6 ([01e8f73](https://github.com/patrickkabwe/react-native-nitro-text/commit/01e8f73a9b5dbcd913da1a2bd95622cb80ac7ae0))
* bump version to 0.1.2 in package.json ([702a195](https://github.com/patrickkabwe/react-native-nitro-text/commit/702a1956bb814aa1b8c6b68cf77262e6429fff0e))
* update hermes-engine to version 0.81.4 ([4cd6c2c](https://github.com/patrickkabwe/react-native-nitro-text/commit/4cd6c2c14ba4e775babe859ebdc840be67e1c1c4))
* update typescript version to ^5.8.3 in package.json and bun.lock ([725fb44](https://github.com/patrickkabwe/react-native-nitro-text/commit/725fb44e369863c7906ec5a01a3fec84ee8903e6))
