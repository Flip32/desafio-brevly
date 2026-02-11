import 'dotenv/config'
import { app } from '@/http/app.js'
import { env } from '@/env.js'

app
    .listen({
        port: env.PORT,
        host: '0.0.0.0'
    })
    .then(() => {
        app.log.info(`Server running on port ${env.PORT}`)
    })
    .catch(error => {
        app.log.error(error)
        process.exit(1)
    })
