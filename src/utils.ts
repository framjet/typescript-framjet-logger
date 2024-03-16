export function getSourceFilePath(): string {
  const esModuleUrl = import.meta.url;

  if (esModuleUrl !== undefined && typeof esModuleUrl === 'string') {
    const pathName = new URL(esModuleUrl).pathname;

    if (pathName !== undefined) {
      return pathName;
    }
  }

  return 'unknown';
}

export function getSourceFileName(): string {
  const path = getSourceFilePath();

  return path.split('/').pop() ?? 'unknown';
}

export function msgFormat(
  fmt: string,
  ...args: unknown[]
): [string, unknown[]] {
  const re = /(%?)(%([ojds]))/g;
  if (args.length) {
    fmt = fmt.replace(re, (match, ...props): string => {
      const [escaped, , flag] = props;

      let arg = args.shift();
      switch (flag) {
        case 'o':
          if (Array.isArray(arg)) {
            arg = JSON.stringify(arg);
            break;
          }
        // eslint-disable-next-line no-fallthrough
        case 's':
          arg = '' + arg;
          break;
        case 'd':
          arg = String(Number(arg));
          break;
        case 'j':
          arg = JSON.stringify(arg);
          break;
      }

      if (!escaped) {
        return String(arg);
      }

      args.unshift(arg);

      return match;
    });
  }

  // update escaped %% values
  fmt = fmt.replace(/%{2}/g, '%');

  return ['' + fmt, args];
}

export function formatPerformanceTime(time: number) {
  if (time > 3) {
    return `${Math.round(time * 1000) / 1000}ms`;
  } else {
    return `${Math.round(time * 100000) / 100}µs`;
  }
}
