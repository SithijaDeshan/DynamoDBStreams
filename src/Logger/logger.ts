export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private readonly level: LogLevel;
  private readonly service: string;

  constructor(service: string, level: LogLevel = 'info') {
    this.service  = service;
    this.level    = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) ?? level;
  }

  private log(level: LogLevel, message: string, extra?: Record<string, any>): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.level]) return;

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level:     level.toUpperCase(),
      service:   this.service,
      message,
      ...extra,
    }));
  }

  debug(message: string, extra?: Record<string, any>): void { this.log('debug', message, extra); }
  info (message: string, extra?: Record<string, any>): void { this.log('info',  message, extra); }
  warn (message: string, extra?: Record<string, any>): void { this.log('warn',  message, extra); }
  error(message: string, extra?: Record<string, any>): void { this.log('error', message, extra); }
}

const createLogger = (service: string, level: LogLevel = 'info'): Logger =>
  new Logger(service, level);

export default createLogger;