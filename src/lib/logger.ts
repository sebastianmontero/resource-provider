import { createLogger, format, transports } from 'winston';

import { SERVICE_INFO_LOG, SERVICE_LOG_LEVEL, SERVICE_ERROR_LOG, ENVIRONMENT } from 'src/config';

const { metadata, combine, timestamp, printf, prettyPrint, label } = format;

type TransportTypes = transports.ConsoleTransportInstance | transports.FileTransportInstance;

const defaultTransports: TransportTypes[] = [new transports.Console()];

const logformat = printf(({ label, level, message, timestamp, ...rest }) => {
	return `${timestamp} ${label} ${level}: ${message} ${JSON.stringify({ ...rest })}`;
});

if (SERVICE_INFO_LOG) {
	defaultTransports.push(
		new transports.File({
			level: SERVICE_LOG_LEVEL || 'info',
			filename: SERVICE_INFO_LOG,
			format: logformat
		})
	);
}

if (SERVICE_ERROR_LOG) {
	defaultTransports.push(
		new transports.File({
			level: 'error',
			filename: SERVICE_ERROR_LOG,
			format: logformat
		})
	);
}

function makeLogger(labelName: string) {
	return createLogger({
		level: SERVICE_LOG_LEVEL || 'info',
		format:
			ENVIRONMENT === 'development'
				? combine(
						label({ label: labelName }),
						metadata({ key: 'data' }),
						timestamp(),
						prettyPrint({ colorize: true, depth: 10 })
					)
				: combine(label({ label: labelName }), timestamp(), logformat),
		transports: defaultTransports
	});
}

export const generalLog = makeLogger('general');
export const providerLog = makeLogger('provider');
export const managerLog = makeLogger('manager');
