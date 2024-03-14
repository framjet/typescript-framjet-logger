export interface FramJetLoggerLevel {
  name: string;
  value: number;
}

function createLevel(name: string, value: number): FramJetLoggerLevel {
  return {
    name,
    value
  };
}

export const Level = {
  OFF: createLevel('off', Number.MAX_SAFE_INTEGER),
  SEVERE: createLevel('severe', 1000),
  WARNING: createLevel('warning', 900),
  INFO: createLevel('info', 800),
  CONFIG: createLevel('config', 700),
  FINE: createLevel('fine', 500),
  FINER: createLevel('finer', 400),
  FINEST: createLevel('finest', 300),
  ALL: createLevel('all', Number.MIN_SAFE_INTEGER)
};

