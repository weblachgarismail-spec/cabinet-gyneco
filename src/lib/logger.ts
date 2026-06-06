enum LogLevel { DEBUG, INFO, WARN, ERROR }

function log(level: LogLevel, message: string, context?: object) {
  if (process.env.NODE_ENV === "production" && level < LogLevel.WARN) return;
  const entry = { ts: new Date().toISOString(), level: LogLevel[level], message, context };
  queueMicrotask(() => {
    const fn = level <= LogLevel.INFO ? console.log : level === LogLevel.WARN ? console.warn : console.error;
    fn(JSON.stringify(entry));
  });
}

export const logger = {
  info: (msg: string, ctx?: object) => log(LogLevel.INFO, msg, ctx),
  warn: (msg: string, ctx?: object) => log(LogLevel.WARN, msg, ctx),
  error: (msg: string, ctx?: object) => log(LogLevel.ERROR, msg, ctx),
};
