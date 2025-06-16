import {Command} from 'commander'

import {version} from '../package.json'
import {defaultTtl, UsageDatabase} from './lib/db'
import {server} from './server'
import {logger} from './logger'

export function prompt() {
    const usage = new UsageDatabase()
    const program = new Command()
    program
        .version(version)
        .name('resource-provider')
        .description('Antelope Resource Provider Service')
    program.commandsGroup('Service')
    program
        .command('start')
        .description('Run the Resource Provider API service')
        .action(() => {
            server()
        })
    program.commandsGroup('Config')
    // TODO: Implement the permissions command
    // This command should read the cosigner's account information and determine which permissions are needed
    // for the cosigner to operate. It then should create a signing request and embed it in a Unicove URL
    // that can be used to easily update the account.
    program
        .command('permissions')
        .description('Create a signing request to configure the cosigners account permissions')
        .action(() => {
            console.warn('Not yet implemented')
        })
    program.commandsGroup('User Management')
    program
        .command('expire')
        .description('Expire all usage records which are older than the specified seconds')
        .option('-s, --seconds [seconds]', 'Seconds to expire usage records', String(defaultTtl)) // Default to 1 day
        .action(({seconds}) => {
            logger.info(`Cleaning usage records older than ${seconds} seconds`)
            usage.cleanUsage(seconds)
        })
    program
        .command('reset')
        .description('Expire all usage records which are older than the specified seconds')
        .argument('<string>', 'account name to add usage for')
        .action((name) => {
            logger.info(`Resetting all usage records for ${name}`)
            usage.resetUsage(name)
        })
    program
        .command('usage')
        .description('Get the total usage for a specific account name')
        .argument('<string>', 'account name to query')
        .action(async (name) => {
            logger.info(`Counting usage for name: ${name}`)
            console.log(await usage.getUsage(name))
        })
    program.commandsGroup('Database Management')
    program
        .command('vacuum')
        .description('Force SQLITE3 database vacuum')
        .action(() => {
            logger.info('Vacuuming database')
            usage.vacuum()
        })
    program.commandsGroup('Debug')
    program
        .command('add')
        .argument('<string>', 'account name to add usage for')
        .action((name) => {
            logger.info(`Adding usage for name: ${name}`)
            usage.addUsage(name, 10)
        })
    program.parse(process.argv)
}
