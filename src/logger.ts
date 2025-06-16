import winston from 'winston'

const {combine, timestamp, printf, prettyPrint} = winston.format

type TransportTypes =
    | winston.transports.ConsoleTransportInstance
    | winston.transports.FileTransportInstance

const transports: TransportTypes[] = [new winston.transports.Console()]

const logformat = printf(({level, message, timestamp}) => {
    return `${timestamp} ${level}: ${message}`
})

if (Bun.env.SERVICE_INFO_LOG) {
    transports.push(
        new winston.transports.File({
            level: Bun.env.SERVICE_LOG_LEVEL || 'info',
            filename: Bun.env.SERVICE_INFO_LOG,
            format: logformat,
        })
    )
}

if (Bun.env.SERVICE_ERROR_LOG) {
    transports.push(
        new winston.transports.File({
            level: 'error',
            filename: Bun.env.SERVICE_ERROR_LOG,
            format: logformat,
        })
    )
}

export const logger = winston.createLogger({
    level: Bun.env.SERVICE_LOG_LEVEL || 'info',
    format: combine(timestamp(), prettyPrint()),
    transports,
})
