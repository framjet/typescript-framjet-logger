/// <reference types="vite/client" />
import { FramJetLoggerLevel, Level } from './level';
import { formatPerformanceTime, msgFormat } from './utils';
import { mapLogLevel } from './console';

export interface FramJetTimedApi {
  end(): void;

  log(...data: unknown[]): void;
}

export interface FramJetCountApi {
  tick(): void;

  reset(): void;
}

export interface FramJetGroupApi extends FramJetLoggerApi {
  getLabel(): string;

  end(): void;
}

export interface FramJetLoggerApi {
  isEnabled(): boolean;

  log(...args: unknown[]): void;

  timed(label?: string, ...args: unknown[]): FramJetTimedApi;

  assert(condition: boolean, format: string, ...args: unknown[]): void;

  assert(condition: boolean, ...args: unknown[]): void;

  clear(): void;

  count(label?: string): FramJetCountApi;

  dir(obj: unknown, options?: object): void;

  dirxml(...obj: unknown[]): void;

  group(label?: string, ...args: unknown[]): FramJetGroupApi;

  groupCollapsed(label?: string, ...args: unknown[]): FramJetGroupApi;

  table(data: unknown, columns?: string[]): void;

  trace(...args: unknown[]): void;

  trackExecution(
    label: string,
    ...args: unknown[]
  ): <T>(execution: (log: FramJetLoggerApi) => T) => T;

  trackExecutionFunction<F extends (...args: never) => unknown>(
    func: F,
  ): (
    labelCreator: (...args: Parameters<F>) => [string, unknown[]] | string,
  ) => F;
}

export interface FramJetLogger {
  getName(): string;

  at(level: FramJetLoggerLevel): FramJetLoggerApi;

  at(level: string): FramJetLoggerApi;

  atTrace(): FramJetLoggerApi;

  atDebugLow(): FramJetLoggerApi;

  atDebug(): FramJetLoggerApi;

  atInfo(): FramJetLoggerApi;

  atWarn(): FramJetLoggerApi;

  atError(): FramJetLoggerApi;
}

export interface FramJetLoggerOptions {
  getLevel: (matcher?: string | RegExp) => FramJetLoggerLevel;
  setLevel: (level: FramJetLoggerLevel, matcher?: string | RegExp) => void;
  setOff: (matcher?: string | RegExp) => void;
  setSevere: (matcher?: string | RegExp) => void;
  setWarning: (matcher?: string | RegExp) => void;
  setInfo: (matcher?: string | RegExp) => void;
  setConfig: (matcher?: string | RegExp) => void;
  setFine: (matcher?: string | RegExp) => void;
  setFiner: (matcher?: string | RegExp) => void;
  setFinest: (matcher?: string | RegExp) => void;
  setAll: (matcher?: string | RegExp) => void;
}

export function createLoggerOptions(): FramJetLoggerOptions {
  let globalLevel = Level.FINE;
  const nameLevelMap = new Map<string, FramJetLoggerLevel>();
  const regexLevelMap = new Map<RegExp, FramJetLoggerLevel>();

  if (import.meta?.env?.PROD !== undefined && import.meta?.env?.PROD === true) {
    globalLevel = Level.INFO;
  }

  if (import.meta?.env?.['LOG_LEVEL'] !== undefined) {
    const levelName = import.meta.env['LOG_LEVEL'];
    const level = Object.values(Level).find(
      (level) => level.name === levelName,
    );

    if (level !== undefined) {
      globalLevel = level;
    }
  }

  return {
    getLevel(name?: string): FramJetLoggerLevel {
      if (name === undefined) {
        return globalLevel;
      }

      // Try to find a level for the name
      const level = nameLevelMap.get(name);
      if (level !== undefined) {
        return level;
      }

      for (const [regex, level] of regexLevelMap) {
        if (regex.test(name)) {
          return level;
        }
      }

      return globalLevel;
    },
    setLevel(level: FramJetLoggerLevel, matcher?: string | RegExp): void {
      if (matcher === undefined) {
        globalLevel = level;

        return;
      }

      if (typeof matcher === 'string') {
        nameLevelMap.set(matcher, level);

        return;
      }

      if (matcher instanceof RegExp) {
        regexLevelMap.set(matcher, level);

        return;
      }

      throw new Error(`Invalid matcher type "${typeof matcher}"`);
    },
    setOff(matcher?: string | RegExp): void {
      this.setLevel(Level.OFF, matcher);
    },
    setSevere(matcher?: string | RegExp): void {
      this.setLevel(Level.SEVERE, matcher);
    },
    setWarning(matcher?: string | RegExp): void {
      this.setLevel(Level.WARNING, matcher);
    },
    setInfo(matcher?: string | RegExp): void {
      this.setLevel(Level.INFO, matcher);
    },
    setConfig(matcher?: string | RegExp): void {
      this.setLevel(Level.CONFIG, matcher);
    },
    setFine(matcher?: string | RegExp): void {
      this.setLevel(Level.FINE, matcher);
    },
    setFiner(matcher?: string | RegExp): void {
      this.setLevel(Level.FINER, matcher);
    },
    setFinest(matcher?: string | RegExp): void {
      this.setLevel(Level.FINEST, matcher);
    },
    setAll(matcher?: string | RegExp): void {
      this.setLevel(Level.ALL, matcher);
    },
  };
}

export function createLoggerApi(
  level: FramJetLoggerLevel,
  name: string,
): FramJetLoggerApi {
  const loggerLevel = level;

  const formatText = (
    format: string,
    ...args: unknown[]
  ): [string, unknown[]] => {
    const colorArgs = [];
    const filteredArgs = [];
    for (const arg of args) {
      if (typeof arg === 'string' && arg.startsWith('#!')) {
        colorArgs.push(arg.substring(2));
      } else {
        filteredArgs.push(arg);
      }
    }

    const [msg, leftArgs] = msgFormat(format, ...filteredArgs);
    const content = `[${name}] ${msg}`;

    return [content, colorArgs.concat(leftArgs)];
  };

  const api: FramJetLoggerApi = {
    isEnabled(): boolean {
      return loggerLevel.value >= globalThis.FramJetLogger.getLevel(name).value;
    },
    log(format: string, ...args: unknown[]): void {
      if (api.isEnabled()) {
        const [content, leftArgs] = formatText(format, ...args);

        if (leftArgs !== undefined && leftArgs.length > 0) {
          mapLogLevel(loggerLevel)(content, ...leftArgs);
        } else {
          mapLogLevel(loggerLevel)(content);
        }
      }
    },
    timed(label = 'Timed', ...args: unknown[]): FramJetTimedApi {
      if (!api.isEnabled()) {
        return {
          end() {
            // noop
          },
          log() {
            // noop
          },
        };
      }

      const startTime = performance.now();

      return {
        end() {
          api.log(
            `${label}: ${formatPerformanceTime(performance.now() - startTime)}`,
            ...args,
          );
        },
        log(...data: unknown[]): void {
          if (api.isEnabled()) {
            if (data.length > 0) {
              api.log(
                `${label}: ${formatPerformanceTime(
                  performance.now() - startTime,
                )}`,
                ...[...args, ...data],
              );
            } else {
              api.log(
                `${label}: ${formatPerformanceTime(
                  performance.now() - startTime,
                )}`,
                ...args,
              );
            }
          }
        },
      };
    },
    assert(condition: boolean, ...args: unknown[]): void {
      if (api.isEnabled()) {
        if (args.length > 0 && typeof args[0] === 'string') {
          const [content, leftArgs] = formatText(args[0], ...args.slice(1));

          if (leftArgs !== undefined && leftArgs.length > 0) {
            console.assert(condition, content, ...leftArgs);
          } else {
            console.assert(condition, content);
          }

          return;
        }

        if (args.length > 0) {
          console.assert(condition, ...args);
        } else {
          console.assert(condition);
        }
      }
    },
    clear(): void {
      if (api.isEnabled()) {
        console.clear();
      }
    },
    count(label?: string): FramJetCountApi {
      if (!api.isEnabled()) {
        return {
          reset() {
            // noop
          },
          tick() {
            // noop
          },
        };
      }

      let text = undefined;
      if (label !== undefined) {
        const [content] = formatText(label);

        text = content;
      }

      console.count(text);

      return {
        reset() {
          console.countReset(text);
        },
        tick() {
          console.count(text);
        },
      };
    },
    dir(obj: unknown, options?: object): void {
      if (api.isEnabled()) {
        console.dir(obj, options);
      }
    },
    dirxml(...obj: unknown[]): void {
      if (api.isEnabled()) {
        console.dirxml(...obj);
      }
    },
    group(label?: string, ...args: unknown[]): FramJetGroupApi {
      const [content, rest] =
        label !== undefined ? formatText(label, ...args) : [undefined, []];

      if (rest !== undefined && rest.length > 0) {
        console.group(content, ...rest);
      } else {
        console.group(content);
      }

      return {
        ...api,
        getLabel() {
          return label;
        },
        end() {
          console.groupEnd();
        },
      };
    },
    groupCollapsed(label?: string, ...args: unknown[]): FramJetGroupApi {
      const [content, rest] =
        label !== undefined ? formatText(label, ...args) : [undefined, []];

      if (rest !== undefined && rest.length > 0) {
        console.groupCollapsed(content, ...rest);
      } else {
        console.groupCollapsed(content);
      }

      return {
        ...api,
        getLabel() {
          return label;
        },
        end() {
          console.groupEnd();
        },
      };
    },
    table(data: unknown, columns?: string[]): void {
      if (api.isEnabled()) {
        console.table(data, columns);
      }
    },
    trace(...args: unknown[]): void {
      if (api.isEnabled()) {
        if (args.length > 0) {
          console.trace(...args);
        } else {
          console.trace();
        }
      }
    },
    trackExecution(
      label: string,
      ...args: unknown[]
    ): <T>(execution: (log: FramJetLoggerApi) => T) => T {
      return function (execution) {
        if (!api.isEnabled()) {
          return execution(api);
        }

        const log = api.groupCollapsed(label, ...args);
        const timed = log.timed('Execution time');

        try {
          return execution(log);
        } finally {
          timed.end();
          log.end();
        }
      };
    },
    trackExecutionFunction<F extends (...args: never) => unknown>(
      func: F,
    ): (
      labelCreator: (...args: Parameters<F>) => [string, unknown[]] | string,
    ) => F {
      return function (labelCreator) {
        return function (...args) {
          if (!api.isEnabled()) {
            return func(...args);
          }

          const labelResult = labelCreator(...args);
          let label: string;
          let labelArgs: unknown[] | undefined;
          if (Array.isArray(labelResult)) {
            [label, labelArgs] = labelResult;
          } else {
            label = labelResult;
          }

          let log: FramJetGroupApi;
          if (labelArgs !== undefined) {
            log = api.groupCollapsed(label, ...labelArgs);
          } else {
            log = api.groupCollapsed(label);
          }

          const timed = log.timed('Execution time');

          try {
            return func(...args);
          } finally {
            timed.end();
            log.end();
          }
        } as F;
      };
    },
  };

  return api;
}
