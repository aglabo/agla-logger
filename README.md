---
header:
  - src: README.md
  - @(#): Lightweight and pluggable structured logger for TypeScript
title: agla-logger
description: A lightweight and pluggable structured logger for TypeScript with log level management, flexible formatting options, and plugin system
version: 1.0.0
created: 2025-09-19
authors:
  - atsushifx
changes:
  - 2025-09-19: Updated frontmatter to match actual content
copyright:
  - Copyright (c) 2025 atsushifx <https://github.com/atsushifx>
  - This software is released under the MIT License.
  - https://opensource.org/licenses/MIT
---

<!-- textlint-disable ja-technical-writing -->

[English]| [日本語](README.ja.md)

[![npm version](https://badge.fury.io/js/%40aglabo%2Fagla-logger-core.svg)](https://www.npmjs.com/package/@aglabo/agla-logger-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org/)

<!-- textlint-enable -->

## @aglabo/agla-logger

<!-- markdownlint-disable line-length --><!-- textlint-disable ja-technical-writing/sentence-length  -->

A lightweight and pluggable structured logger for TypeScript, featuring log level management, flexible formatting options, and a plugin system.

## 📦 Packages

This repository contains the following packages:

- **[@aglabo/agla-logger-core](https://github.com/aglabo/agla-logger/packages/@aglabo/agla-logger-core)** - Main logger package
- **[@aglabo/agla-error-core](https://github.com/aglabo/agla-logger/packages/@aglabo/agla-error-core)** - Standardized error handling

<!-- markdownlint-enable --><!-- textlint-enable -->

## 🚀 Quick Start

### Installation

```bash
# npm
npm install @aglabo/agla-logger-core

# pnpm
pnpm add @aglabo/agla-logger-core

# yarn
yarn add @aglabo/agla-logger-core

# deno (planned)
# deno add @aglabo/agla-logger-core

# bun (planned)
# bun add @aglabo/agla-logger-core
```

### Basic Usage

```typescript
import { AgLogger, ConsoleLogger, PlainFormatter } from '@aglabo/agla-logger-core';

// Create and get logger
AgLogger.createLogger({
  defaultLogger: ConsoleLogger,
  formatter: PlainFormatter,
});
const logger = AgLogger.getLogger();

// Basic logging
logger.info('Application started');
logger.debug('Debug information', { userId: 123 });
```

## ✨ Key Features

<!-- textlint-disable ja-technical-writing/max-comma  -->

- Log Level Management: TRACE, DEBUG, VERBOSE, INFO, WARN, ERROR, FATAL
- Pluggable Design: Plugin system for formatters and loggers
- Structured Logging: JSON and plain text output
- TypeScript: Full type safety
- Lightweight: Minimal dependencies
- Dual Support: Both ESM and CommonJS compatible

<!-- textlint-enable -->

## 📚 Documentation

### 👥 For Users

- [Getting Started](https://github.com/aglabo/agla-logger/docs/getting-started/) - From installation to first run
- [Basic Usage](https://github.com/aglabo/agla-logger/docs/basic-usage/) - Daily usage patterns
- [User Guides](https://github.com/aglabo/agla-logger/docs/user-guides/) - Examples & best practices
- [API Reference](https://github.com/aglabo/agla-logger/docs/api-reference/) - Detailed specifications
- [Examples](https://github.com/aglabo/agla-logger/docs/examples/) - Sample code collection

### 🔧 For Developers

- [Project Information](https://github.com/aglabo/agla-logger/docs/projects/) - Architecture & roadmap
- [Development Rules](https://github.com/aglabo/agla-logger/docs/rules/) - Coding conventions & workflow

---

## 📄 License

MIT License - see the [LICENSE](https://github.com/aglabo/agla-logger/LICENSE) file for details.

## 🤝 Contributing

<!-- textlint-disable ja-technical-writing/no-exclamation-question-mark -->

We welcome pull requests and issue reports!

<!-- textlint-disable @textlint-ja/ai-writing/no-ai-list-formatting  -->

- [🐛 Report a Bug](https://github.com/aglabo/agla-logger/issues) - If you found a bug or problem
- [✨ Request a Feature](https://github.com/aglabo/agla-logger/issues) - If you have an idea for a new feature
- [💬 Ask Questions & Discuss](https://github.com/aglabo/agla-logger/discussions) - For usage questions and discussions
- [🔀 Create a Pull Request](https://github.com/aglabo/agla-logger/compare) - For code improvements or new features

<!-- textlint-enable -->

For details, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## 📮 Author

**atsushifx** - [GitHub](https://github.com/atsushifx)
