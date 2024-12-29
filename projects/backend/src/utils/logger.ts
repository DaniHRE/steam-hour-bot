import winston, { format, transports } from 'winston';
import path from 'path';

// Custom log levels and colors
const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        verbose: 5,
        debug: 6,
        silly: 7
    },
    colors: {
        fatal: 'magenta',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'cyan',
        verbose: 'blue',
        debug: 'gray',
        silly: 'white'
    }
};

winston.addColors(customLevels.colors);

// Logger configuration
export const logger = winston.createLogger({
    levels: customLevels.levels,
    level: process.env.LOG_LEVEL || 'info', // Default log level (configurable via environment variable)
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamps
        format.errors({ stack: true }), // Log stack traces for errors
        format.splat(), // Support for printf-style formatting
        format.json() // Use JSON format for structured logs
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(), // Add color to console logs
                format.printf(({ timestamp, level, message, stack, ...meta }) => {
                    const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
                    return `${timestamp} [${level}]: ${message} ${stack || ''} ${metaString}`;
                })
            )
        }),
        new transports.File({
            filename: path.join('logs', 'app.log'),
            level: 'info'
        }),
        new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error'
        })
    ],
    exceptionHandlers: [
        new transports.File({ filename: path.join('logs', 'exceptions.log') })
    ],
    rejectionHandlers: [
        new transports.File({ filename: path.join('logs', 'rejections.log') })
    ],
    exitOnError: false // Prevent exiting on exceptions
});