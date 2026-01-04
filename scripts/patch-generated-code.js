#!/usr/bin/env node
/**
 * Post-generation patch script for HybridNitroTextComponent.cpp
 * 
 * This script automatically applies optimizations to the generated C++ code
 * after Nitrogen codegen runs. It converts the default fromRawValue pattern
 * to use direct RawValue decoding with aggregate initialization for animated props.
 */

const fs = require('fs');
const path = require('path');

const GENERATED_FILE = path.join(
  __dirname,
  '..',
  'nitrogen',
  'generated',
  'shared',
  'c++',
  'views',
  'HybridNitroTextComponent.cpp'
);

// Props that should use direct RawValue decoding (animated props from Reanimated)
const PROPS_TO_PATCH = [
  { name: 'text', type: 'std::optional<std::string>' },
  { name: 'fontSize', type: 'std::optional<double>' },
  { name: 'fontColor', type: 'std::optional<std::string>' },
  { name: 'letterSpacing', type: 'std::optional<double>' },
];

function patchProp(content, propName, propType) {
  // Escape special regex characters
  const escapedName = propName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedType = propType.replace(/</g, '\\<').replace(/>/g, '\\>');
  
  // Match the pattern: fromRawValue call for this specific prop
  // We'll replace the two lines: the runtime/value extraction and the fromRawValue call
  const pattern = new RegExp(
    `(\\s+${escapedName}\\(\\[&\\]\\(\\) -> CachedProp<${escapedType}> \\{[\\s\\S]*?if \\(rawValue == nullptr\\) return sourceProps\\.${escapedName};\\s+)(const auto& \\[runtime, value\\] = \\(std::pair<jsi::Runtime\\*, jsi::Value>\\)\\*rawValue;\\s+return CachedProp<${escapedType}>::fromRawValue\\(\\*runtime, value, sourceProps\\.${escapedName}\\);)`,
    'm'
  );

  const replacement = `$1// Decode directly from RawValue using its conversion operator
        // RawValue's operator T() handles both JSI and folly::dynamic cases internally
        // This is safe for animated props from Reanimated (folly::dynamic) and regular props (JSI)
        ${propType} decodedValue = static_cast<${propType}>(*rawValue);
        // Construct CachedProp with aggregate initialization (no JSI value for caching optimization)
        return CachedProp<${propType}>{std::move(decodedValue), BorrowingReference<jsi::Value>{}, true};`;

  return content.replace(pattern, replacement);
}

function main() {
  if (!fs.existsSync(GENERATED_FILE)) {
    console.warn(`Generated file not found: ${GENERATED_FILE}`);
    console.warn('Skipping patch (this is normal if codegen hasn\'t run yet)');
    return;
  }

  let content = fs.readFileSync(GENERATED_FILE, 'utf8');
  let patched = false;

  for (const prop of PROPS_TO_PATCH) {
    const beforeContent = content;
    content = patchProp(content, prop.name, prop.type);
    if (content !== beforeContent) {
      patched = true;
      console.log(`✓ Patched ${prop.name} prop to use direct RawValue decoding`);
    } else {
      // Check if it's already patched
      const propPattern = new RegExp(`${prop.name}\\(\\[&\\]\\(\\) -> CachedProp<[^>]+> \\{[\\s\\S]*?decodedValue = static_cast`, 'm');
      if (!propPattern.test(content)) {
        console.warn(`⚠ Could not patch ${prop.name} - pattern not found`);
      }
    }
  }

  if (patched) {
    fs.writeFileSync(GENERATED_FILE, content, 'utf8');
    console.log('✓ Successfully patched HybridNitroTextComponent.cpp');
  } else {
    console.log('ℹ No patches needed (props may already be using direct RawValue decoding)');
  }
}

if (require.main === module) {
  main();
}

module.exports = { patchProp, main };
