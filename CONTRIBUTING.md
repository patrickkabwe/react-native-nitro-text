# Contributing to NitroText

Thank you for your interest in contributing to NitroText! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 18+ (Node 20+ recommended)
- **React Native**: 0.78.0 or higher (Fabric/Nitro Views required)
- **Bun**: Latest version (package manager)
- **Xcode**: Latest version (for iOS development)
- **Android Studio**: Latest version (for Android development)
- **CocoaPods**: Latest version (for iOS dependencies)

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/react-native-nitro-text.git
   cd react-native-nitro-text
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/patrickkabwe/react-native-nitro-text.git
   ```

## Development Setup

### 1. Install Dependencies

```bash
# Install main dependencies
bun install

# Install example app dependencies
cd example
bun install
cd ..
```

### 2. iOS Setup

```bash
# Install iOS dependencies
cd example/ios
pod install
cd ../..
```

### 3. Build the Project

```bash
# Type check and build the package
bun run build

# Regenerate codegen outputs
bun run codegen
```

### 4. Run the Example App

```bash
# Start Metro bundler
cd example
bun start

# In another terminal, run on iOS
bun run ios

# Or run on Android
bun run android
```

## Project Structure

```
react-native-nitro-text/
├── src/                          # TypeScript source code
│   ├── index.ts                  # Main entry point
│   ├── nitro-text.tsx            # Main NitroText component
│   ├── specs/                    # Nitro module specifications
│   ├── types.ts                  # TypeScript type definitions
│   └── utils/                    # Utility functions
├── ios/                          # iOS native implementation
│   ├── NitroTextComponentDescriptor.hpp
│   ├── NitroTextComponentDescriptor.mm
│   ├── NitroTextImpl.swift       # Main iOS implementation
│   ├── NitroTextImpl+*.swift     # Feature-specific implementations
│   └── NitroTextView.swift       # SwiftUI view wrapper
├── cpp/                          # C++ shared code
│   ├── NitroTextShadowNode.hpp
│   └── NitroTextShadowNode.cpp
├── nitrogen/                     # Generated Nitro module code
├── lib/                          # Built output
├── example/                      # Example React Native app
└── .github/                      # GitHub templates and workflows
```

## Development Workflow

### 1. Create a Branch

```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Follow the [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Ensure all existing tests pass

### 3. Test Your Changes

```bash
# Run type checking
bun run typecheck

# Build the project
bun run build

# Test in the example app
cd example
bun run ios  # or bun run android
```

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git commit -m "feat: add support for text selection on Android"
git commit -m "fix: resolve layout issues with nested fragments"
git commit -m "docs: update README with new examples"
```

## Coding Standards

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use Prettier for code formatting
- Write meaningful variable and function names
- Add JSDoc comments for public APIs

### Swift (iOS)

- Follow Swift style guidelines
- Use meaningful variable and function names
- Add documentation comments for public methods
- Handle errors appropriately

### C++

- Follow C++ best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure proper memory management

### Code Style

The project uses:

- **Prettier** for code formatting
- **ESLint** for linting
- **Single quotes** for strings
- **2 spaces** for indentation
- **No semicolons** (except where required)

## Testing

### Manual Testing

1. Test your changes in the example app
2. Verify behavior on both iOS and Android
3. Test with different text styles and layouts
4. Test edge cases (empty text, very long text, etc.)

### Test Cases to Consider

- Simple text rendering
- Rich text with nested styles
- Text selection functionality
- Performance with large amounts of text
- Layout with different font sizes and styles
- Platform-specific behavior

## Submitting Changes

### 1. Update Your Branch

```bash
# Fetch latest changes from upstream
git fetch upstream

# Rebase your branch on the latest main
git rebase upstream/main
```

### 2. Push Your Changes

```bash
git push origin feature/your-feature-name
```

### 3. Create a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill out the PR template
5. Request review from maintainers

### Pull Request Guidelines

- **Title**: Use conventional commit format
- **Description**: Clearly describe what changes you made and why
- **Testing**: Describe how you tested your changes
- **Breaking Changes**: Note any breaking changes
- **Documentation**: Update documentation if needed

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] Added/updated tests
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

## Release Process

Releases are handled automatically using semantic-release. The process:

1. Changes are merged to `main`
2. Semantic-release analyzes commits
3. Version is bumped automatically
4. Changelog is generated
5. Release is published to npm

### Commit Message Format

Use conventional commits for automatic versioning:

- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `BREAKING CHANGE:` - Breaking changes (major version bump)
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/tooling changes

## Platform-Specific Considerations

### iOS Development

- Test on both iOS Simulator and physical devices
- Ensure proper handling of iOS-specific features (selection, accessibility)
- Follow iOS Human Interface Guidelines
- Test with different iOS versions

### Android Development

- Currently falls back to React Native Text component
- Future Android implementation should maintain API compatibility
- Test on different Android versions and screen sizes

## Common Issues and Solutions

### Build Issues

```bash
# Clean and rebuild
bun run clean
bun install
bun run build
```

### iOS Issues

```bash
# Clean iOS build
cd example/ios
rm -rf build
pod install
cd ../..
```

### Codegen Issues

```bash
# Regenerate codegen
bun run codegen
```

## Getting Help

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and general discussion
- **Documentation**: Check the README and inline documentation

## Recognition

Contributors will be recognized in:

- Release notes
- README contributors section
- GitHub contributors page

Thank you for contributing to NitroText! 🚀
