/**
 * Lightweight structured logger.
 *
 * Wraps console methods so the rest of the codebase doesn't depend directly
 * on `console.*`, making it easy to swap in a real logger (pino, winston,
 * etc.) later without touching every call site.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

function formatPrefix(level: LogLevel): string {
    const ts = new Date().toISOString();
    return `[${ts}] [${level.toUpperCase()}]`;
}

export const logger = {
    info: (...args: unknown[]) => console.log(formatPrefix('info'), ...args),
    warn: (...args: unknown[]) => console.warn(formatPrefix('warn'), ...args),
    error: (...args: unknown[]) => console.error(formatPrefix('error'), ...args),
    debug: (...args: unknown[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(formatPrefix('debug'), ...args);
        }
    },
};
