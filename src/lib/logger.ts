import { createLogger, format, transports } from 'winston';

const { simple, metadata, combine, timestamp, printf, prettyPrint, label } = format;

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

function makeLogger(labelName: string) {
	return createLogger({
		level: Bun.env.SERVICE_LOG_LEVEL || 'info',
		format:
			Bun.env.SERVICE_ENVIRONMENT === 'development'
				? combine(
						label({ label: labelName }),
						metadata({ key: 'data' }),
						timestamp(),
						prettyPrint({ colorize: true, depth: 10 })
					)
				: combine(label({ label: labelName }), timestamp(), simple()),
		transports: defaultTransports
	});
}

export const generalLog = makeLogger('general');
export const providerLog = makeLogger('provider');
export const managerLog = makeLogger('manager');
