// noinspection JSUnusedGlobalSymbols

import {
  createLoggerApi,
  FramJetLogger,
  FramJetLoggerApi,
  FramJetLoggerOptions,
} from './logger';
import { getSourceFileName } from './utils';
import { FramJetLoggerLevel, Level as _Level } from './level';

export function createLogger(name: string): FramJetLogger {
  return {
    getName(): string {
      return name;
    },
    at(level: string | FramJetLoggerLevel): FramJetLoggerApi {
      if (typeof level === 'string') {
        const key = level.toUpperCase();
        if (_Level[key] === undefined) {
          throw new Error(`Unknown FramJetLogger level: "${level}"`);
        }

        return createLoggerApi(_Level[key], name);
      }

      return createLoggerApi(level, name);
    },
    atTrace(): FramJetLoggerApi {
      return this.at(_Level.ALL);
    },
    atDebugLow(): FramJetLoggerApi {
      return this.at(_Level.FINEST);
    },
    atDebug(): FramJetLoggerApi {
      return this.at(_Level.FINE);
    },
    atInfo(): FramJetLoggerApi {
      return this.at(_Level.INFO);
    },
    atWarn(): FramJetLoggerApi {
      return this.at(_Level.WARNING);
    },
    atError(): FramJetLoggerApi {
      return this.at(_Level.SEVERE);
    },
  };
}

export function forEnclosingFile(): FramJetLogger {
  return createLogger(getSourceFileName());
}

export function getOptions(): FramJetLoggerOptions {
  const options = globalThis.FramJetLogger;

  if (options === undefined) {
    throw new Error('FramJetLogger options are not defined');
  }

  return options;
}

export const Level = _Level;
