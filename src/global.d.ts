import { FramJetLoggerOptions } from './logger';

declare global {
  // eslint-disable-next-line no-var
  var FramJetLogger: FramJetLoggerOptions;

  // noinspection JSUnusedGlobalSymbols
  interface Window {
    FramJetLogger: FramJetLoggerOptions;
  }
}
