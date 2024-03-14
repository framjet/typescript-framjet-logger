import { FramJetLoggerLevel, Level } from './level';

type ConsoleLogType = (...data: unknown[]) => void;

export function mapLogLevel(level: FramJetLoggerLevel): ConsoleLogType {
  switch (level) {
    case Level.SEVERE:
      return console.error;
    case Level.WARNING:
      return console.warn;
    case Level.INFO:
      return console.info;
    case Level.CONFIG:
      return console.debug;
    case Level.FINE:
      return console.debug;
    case Level.FINER:
      return console.debug;
    case Level.FINEST:
      return console.debug;
    default:
      console.warn(
        `Unknown log level for FramJetLogger: ${level.name} with level: ${level.value}`,
      );

      return console.log;
  }
}
