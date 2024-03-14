/// <reference types="vite/client" />
import { FramJetLoggerLevel, Level } from './level';
import { msgFormat } from './utils';
import { mapLogLevel } from './console';
import * as console from 'console';
import { InspectOptions } from 'node:util';

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

  timed(label: string): FramJetTimedApi;

  assert(condition: boolean, format: string, ...args: unknown[]): void;

  assert(condition: boolean, ...args: unknown[]): void;

  clear(): void;

  count(label?: string): FramJetCountApi;

  dir(obj: unknown, options?: InspectOptions): void;

  dirxml(...obj: unknown[]): void;

  group(label?: string, ...args: unknown[]): FramJetGroupApi;

  groupCollapsed(label?: string, ...args: unknown[]): FramJetGroupApi;

  table(data: unknown, columns?: string[]): void;

  trace(...args: unknown[]): void;
}

export interface FramJetLogger {
  getName(): string;

  at(level: FramJetLoggerLevel): FramJetLoggerApi;

  at(level: string): FramJetLoggerApi;

  atTrace(): FramJetLoggerApi;

  atDebugLow(): FramJetLoggerApi;

  atDebug(): FramJetLoggerApi;

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

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    FramJetLogger: FramJetLoggerOptions;
  }
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

  return {
    isEnabled(): boolean {
      return loggerLevel.value >= window.FramJetLogger.getLevel(name).value;
    },
    log(format: string, ...args: unknown[]): void {
      if (this.isEnabled()) {
        const [content, leftArgs] = formatText(format, ...args);

        mapLogLevel(loggerLevel)(content, ...leftArgs);
      }
    },
    timed(label: string): FramJetTimedApi {
      if (!this.isEnabled()) {
        return {
          end() {
            // noop
          },
          log() {
            // noop
          },
        };
      }

      const [content] = formatText(label);

      console.time(content);

      return {
        end() {
          console.timeEnd(content);
        },
        log(...data: unknown[]): void {
          if (this.isEnabled()) {
            console.timeLog(content, ...data);
          }
        },
      };
    },
    assert(condition: boolean, ...args: unknown[]): void {
      if (this.isEnabled()) {
        if (args.length > 0 && typeof args[0] === 'string') {
          const [content, leftArgs] = formatText(args[0], ...args.slice(1));

          console.assert(condition, content, ...leftArgs);

          return;
        }

        console.assert(condition, ...args);
      }
    },
    clear(): void {
      if (this.isEnabled()) {
        console.clear();
      }
    },
    count(label?: string): FramJetCountApi {
      if (!this.isEnabled()) {
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
    dir(obj: unknown, options?: InspectOptions): void {
      if (this.isEnabled()) {
        console.dir(obj, options);
      }
    },
    dirxml(...obj: unknown[]): void {
      if (this.isEnabled()) {
        console.dirxml(...obj);
      }
    },
    group(label?: string, ...args: unknown[]): FramJetGroupApi {
      const [content, ...rest] =
        label !== undefined ? formatText(label, ...args) : [undefined, []];

      console.group(content, ...rest);

      return {
        ...this,
        getLabel() {
          return label;
        },
        end() {
          console.groupEnd();
        },
      };
    },
    groupCollapsed(label?: string, ...args: unknown[]): FramJetGroupApi {
      const [content, ...rest] =
        label !== undefined ? formatText(label, ...args) : [undefined, []];

      console.groupCollapsed(content, ...rest);

      return {
        ...this,
        getLabel() {
          return label;
        },
        end() {
          console.groupEnd();
        },
      };
    },
    table(data: unknown, columns?: string[]): void {
      if (this.isEnabled()) {
        console.table(data, columns);
      }
    },
    trace(...args: unknown[]): void {
      if (this.isEnabled()) {
        console.trace(...args);
      }
    },
  };
}
