## Summary

- Optimize `setFragments` in `NitroTextImpl`:
  - Fast path for single fragment
  - Batch edits with `beginEditing`/`endEditing`
  - Skip nil/empty runs
  - Use `autoreleasepool` in loop to reduce peak memory
- Add paragraph style caching helper (`ios/NitroTextImpl+Paragraph.swift`) to avoid rebuilding styles.
- Refactor fragment top-level defaults merging into `NitroTextImpl+Fragment.swift`.
- Attribute builder cleanups in `NitroTextImpl+Attributes.swift`.
- Minor wiring/behavior updates in `HybridNitroText.swift` and TS sources.

## Files Changed
- ios/NitroTextImpl.swift
- ios/NitroTextImpl+Attributes.swift
- ios/NitroTextImpl+Fragment.swift
- ios/NitroTextImpl+Paragraph.swift (new)
- ios/HybridNitroText.swift
- src/nitro-text.tsx
- src/utils.ts
- package.json

## Rationale
These changes reduce per-fragment overhead and memory churn when rendering long or highly fragmented text, improving performance and responsiveness, especially under dynamic type scaling.

## Notes
- No breaking API changes intended.
- Paragraph + font caches are invalidated correctly when related props change.
