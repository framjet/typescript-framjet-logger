import { createLoggerOptions } from './logger';

export type * from './level';
export type * from './logger';

export * as FramJetLogger from './creator';

if (globalThis) {
  if (globalThis.FramJetLogger === undefined) {
    globalThis.FramJetLogger = createLoggerOptions();
  }
}
