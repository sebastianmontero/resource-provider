import {Elysia} from 'elysia'
import {BunAdapter} from 'elysia/adapter/bun'
import {swagger} from '@elysiajs/swagger'
import {cors} from '@elysiajs/cors'

import {UsageDatabase} from './lib/db'
import {logger} from './logger'

import {v1} from './v1'

const usage = new UsageDatabase()

const port = Bun.env.SERVICE_HTTP_PORT || 3000

const swaggerConfig = {
    documentation: {
        info: {
            title: 'Resource Provider API',
            description: 'API documentation for Resource Provider',
            version: '0.0.0',
        },
        tags: [{name: 'v1', description: 'Version 1 Endpoints'}],
    },
}

export function server() {
    const app = new Elysia({
        adapter: BunAdapter,
        aot: true,
    })

    if (Bun.env.ENVIRONMENT === 'production') {
        app.use(
            cors({
                origin: true,
            })
        )
    }

    app.use(swagger(swaggerConfig))
    app.decorate('usage', usage)
    app.use(v1)
    app.listen(port)

    logger.info(`Server is running on http://localhost:${port}`)
    return app
}
