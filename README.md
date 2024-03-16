# FramJet Logger

This logger is a powerful and flexible logging library designed for javascript projects. It provides a simple and
intuitive API for logging messages at different levels, with support for formatting, grouping, and timing logs. The
library is built with TypeScript and can be easily integrated into any JavaScript or TypeScript project.

## Installation

You can install the package using npm or yarn:

```bash

# With npm

npm install @framjet/logger

# With Yarn

yarn add @framjet/logger

# With PNPM

pnpm install @framjet/logger
```

## Usage

### Basic Usage

To start using the logger, import the `createLogger` or `forEnclosingFile` functions from the package:

```javascript
import { FramJetLogger } from '@framjet/logger';

// Create a logger with a specific name
const myLogger = FramJetLogger.createLogger('MyLogger');

// Or create a logger based on the current file
const logger = FramJetLogger.forEnclosingFile();
```

You can then use the logger to log messages at different levels:

```javascript
logger.atDebug().log('This is a debug message');
logger.atWarn().log('This is a warning message');
logger.atError().log('This is an error message');
```

### Configuring Log Levels

The `@framjet/logger` package provides a global configuration object named `FramJetLogger` that allows you to configure
the log levels for different loggers or patterns. You can access this object in the browser's global
scope (`window.FramJetLogger`).

```javascript
// Set the global log level to 'info'
window.FramJetLogger.setInfo();

// Set the log level for a specific logger name
window.FramJetLogger.setLevel(FramJetLogger.Level.INFO, 'MyLogger');

// Set the log level for loggers matching a regular expression
window.FramJetLogger.setLevel(FramJetLogger.Level.WARNING, /^App/);
```

### Additional Features

The `@framjet/logger` package provides a range of additional features for advanced logging scenarios, such as:

- Formatting log messages with placeholders
- Timing log operations
- Grouping related log messages
- Counting log occurrences
- Inspecting objects and XML structures

For more information on these features, please refer to the [API Reference](#api-reference).

## API Reference

### `FramJetLogger.createLogger(name: string): FramJetLogger`

Creates a new logger instance with the specified name.

### `FramJetLogger.forEnclosingFile(): FramJetLogger`

Creates a new logger instance with a name derived from the current source file.

### `FramJetLogger`

The `FramJetLogger` interface provides the following methods:

- `getName(): string`: Returns the name of the logger.
- `at(level: FramJetLoggerLevel | string): FramJetLoggerApi`: Returns a `FramJetLoggerApi` instance for the specified
  log level.
- `atTrace(): FramJetLoggerApi`: Returns a `FramJetLoggerApi` instance for the `ALL` log level.
- `atDebugLow(): FramJetLoggerApi`: Returns a `FramJetLoggerApi` instance for the `FINEST` log level.
- `atDebug(): FramJetLoggerApi`: Returns a `FramJetLoggerApi` instance for the `FINE` log level.
- `atInfo(): FramJetLoggerApi`: Returns a `FramJetLoggerApi` instance for the `INFO` log level.
- `atWarn(): FramJetLoggerApi`: Returns a `FramJetLoggerApi` instance for the `WARNING` log level.
- `atError(): FramJetLoggerApi`: Returns a `FramJetLoggerApi` instance for the `SEVERE` log level.

### `FramJetLoggerApi`

The `FramJetLoggerApi` interface provides the following methods:

- `isEnabled(): boolean`: Returns `true` if the logger is enabled for the current log level.
- `log(...args: unknown[]): void`: Logs a message with the specified arguments.
- `timed(label: string): FramJetTimedApi`: Starts a new timed operation with the specified label.
- `assert(condition: boolean, format: string, ...args: unknown[]): void`: Asserts that the provided condition is truthy
  and logs the message if the condition is falsy.
- `assert(condition: boolean, ...args: unknown[]): void`: Asserts that the provided condition is truthy and logs the
  arguments if the condition is falsy.
- `clear(): void`: Clears the console.
- `count(label?: string): FramJetCountApi`: Starts a new counter with an optional label.
- `dir(obj: unknown, options?: InspectOptions): void`: Logs the specified object with its properties.
- `dirxml(...obj: unknown[]): void`: Logs the specified XML elements.
- `group(label?: string, ...args: unknown[]): FramJetGroupApi`: Starts a new group with an optional label.
- `groupCollapsed(label?: string, ...args: unknown[]): FramJetGroupApi`: Starts a new collapsed group with an optional
  label.
- `table(data: unknown, columns?: string[]): void`: Logs the specified data as a table.
- `trace(...args: unknown[]): void`: Logs a stack trace with the specified arguments.
- `trackExecution(label: string, ...args: unknown[]): <T>(execution: (log: FramJetLoggerApi) => T) => T`: Wraps a code block with a labeled group and measures its execution time. The label and additional args are used to describe the group. The method returns a function that takes an execution function as an argument. The execution function is called with a log parameter that can be used for logging within the code block. The group and timed operation are automatically ended after the execution function completes.
- `trackExecutionFunction<F extends (...args: I) => O, I extends unknown[], O>(func: F): (labelCreator: (...args: I) => [string, unknown[]] | string) => F`: Wraps a function with a labeled group and measures its execution time. The func parameter is the function to be wrapped. The method returns a function that takes a labelCreator function as an argument. The labelCreator function is used to generate the label and additional arguments for the group based on the arguments passed to the wrapped function. The wrapped function is called within a group and timed operation, which are automatically ended after the function completes.

### `FramJetLoggerOptions`

The `FramJetLoggerOptions` interface provides the following methods for configuring log levels:

- `getLevel(matcher?: string | RegExp): FramJetLoggerLevel`: Returns the log level for the specified matcher (logger
  name or regular expression).
- `setLevel(level: FramJetLoggerLevel, matcher?: string | RegExp): void`: Sets the log level for the specified matcher.
- `setOff(matcher?: string | RegExp): void`: Sets the log level to `OFF` for the specified matcher.
- `setSevere(matcher?: string | RegExp): void`: Sets the log level to `SEVERE` for the specified matcher.
- `setWarning(matcher?: string | RegExp): void`: Sets the log level to `WARNING` for the specified matcher.
- `setInfo(matcher?: string | RegExp): void`: Sets the log level to `INFO` for the specified matcher.
- `setConfig(matcher?: string | RegExp): void`: Sets the log level to `CONFIG` for the specified matcher.
- `setFine(matcher?: string | RegExp): void`: Sets the log level to `FINE` for the specified matcher.
- `setFiner(matcher?: string | RegExp): void`: Sets the log level to `FINER` for the specified matcher.
- `setFinest(matcher?: string | RegExp): void`: Sets the log level to `FINEST` for the specified matcher.
- `setAll(matcher?: string | RegExp): void`: Sets the log level to `ALL` for the specified matcher.

You can access the `FramJetLoggerOptions` object through the global `window.FramJetLogger` object in the browser.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
