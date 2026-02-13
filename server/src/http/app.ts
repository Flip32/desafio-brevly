import cors from '@fastify/cors'
import Fastify from 'fastify'
import { linksRoutes } from '@/http/routes/links.js'

export const app = Fastify({
  logger: true
})

app.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
})

app.register(linksRoutes)

app.get('/health', async () => ({ status: 'ok' }))
