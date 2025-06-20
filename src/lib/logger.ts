import { createLogger, format, transports } from 'winston';

const { simple, metadata, combine, timestamp, printf, prettyPrint } = format;

type TransportTypes = transports.ConsoleTransportInstance | transports.FileTransportInstance;

const defaultTransports: TransportTypes[] = [new transports.Console()];

const logformat = printf(({ level, message, timestamp }) => {
	return `${timestamp} ${level}: ${message}`;
});

if (Bun.env.SERVICE_INFO_LOG) {
	defaultTransports.push(
		new transports.File({
			level: Bun.env.SERVICE_LOG_LEVEL || 'info',
			filename: Bun.env.SERVICE_INFO_LOG,
			format: logformat
		})
	);
}

if (Bun.env.SERVICE_ERROR_LOG) {
	defaultTransports.push(
		new transports.File({
			level: 'error',
			filename: Bun.env.SERVICE_ERROR_LOG,
			format: logformat
		})
	);
}

export const logger = createLogger({
	level: Bun.env.SERVICE_LOG_LEVEL || 'info',
	format:
		Bun.env.SERVICE_ENVIRONMENT === 'development'
			? combine(metadata({ key: 'data' }), timestamp(), prettyPrint({ colorize: true, depth: 10 }))
			: combine(timestamp(), simple()),
	transports: defaultTransports
});
