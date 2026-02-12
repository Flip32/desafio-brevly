import cors from '@fastify/cors'
import Fastify from 'fastify'
import { linksRoutes } from '@/http/routes/links'

export const app = Fastify({
  logger: true
})

app.register(cors, {
  origin: true
})

app.register(linksRoutes)

app.get('/health', async () => ({ status: 'ok' }))
