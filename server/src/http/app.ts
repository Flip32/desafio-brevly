import Fastify from 'fastify'
import cors from '@fastify/cors'

export const app = Fastify({
  logger: true
})

app.register(cors, {
  origin: true
})

app.get('/health', async () => ({ status: 'ok' }))
