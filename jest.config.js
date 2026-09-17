module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-nitro-modules|@react-native-community|@react-native/js-polyfills)/)',
  ],
}
