import { createLoggerOptions } from './logger';

export type * from './level';
export type * from './logger';


export * as FramJetLogger from './creator';


if (window) {
  if (window.FramJetLogger === undefined) {
    window.FramJetLogger = createLoggerOptions();
  }
}
