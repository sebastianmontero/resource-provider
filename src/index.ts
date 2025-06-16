import {prompt} from './cli'
import {logger} from './logger'
import {server} from './server'

if (Bun.env.ENVIRONMENT === 'testing') {
    // Automatically start the server in testing environment
    logger.debug('Starting server in testing environment...')
    server()
} else {
    // Otherwise use prompt for CLI commands
    prompt()
}
