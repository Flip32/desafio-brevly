import { desc, eq, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '@/db/index.js'
import { links } from '@/db/schema.js'
import { toCsv } from '@/lib/csv.js'
import { uploadCsvToR2 } from '@/lib/r2.js'

const shortCodeRegex = /^[a-zA-Z0-9-]{3,64}$/

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`
  }
  return trimmed
}

function isValidUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export async function linksRoutes(app: FastifyInstance) {
  app.post('/links', async (request, reply) => {
    const bodySchema = z.object({
      originalUrl: z.string().min(1),
      shortCode: z.string().min(3).max(64).regex(shortCodeRegex)
    })

    const { originalUrl: rawOriginalUrl, shortCode } = bodySchema.parse(
      request.body
    )

    const originalUrl = normalizeUrl(rawOriginalUrl)

    if (!isValidUrl(originalUrl)) {
      return reply.status(400).send({
        message: 'URL original inválida'
      })
    }

    const existing = await db.query.links.findFirst({
      where: eq(links.shortCode, shortCode)
    })

    if (existing) {
      return reply.status(409).send({
        message: 'Encurtamento já existe'
      })
    }

    const [created] = await db
      .insert(links)
      .values({
        originalUrl,
        shortCode
      })
      .returning()

    return reply.status(201).send({ link: created })
  })

  app.get('/links', async () => {
    const data = await db.select().from(links).orderBy(desc(links.createdAt))

    return { links: data }
  })

  app.get('/links/:shortCode', async (request, reply) => {
    const paramsSchema = z.object({
      shortCode: z.string().min(1)
    })

    const { shortCode } = paramsSchema.parse(request.params)

    const [updated] = await db
      .update(links)
      .set({
        accessCount: sql`${links.accessCount} + 1`
      })
      .where(eq(links.shortCode, shortCode))
      .returning()

    if (!updated) {
      return reply.status(404).send({ message: 'Link não encontrado' })
    }

    return { link: updated }
  })

  app.delete('/links/:shortCode', async (request, reply) => {
    const paramsSchema = z.object({
      shortCode: z.string().min(1)
    })

    const { shortCode } = paramsSchema.parse(request.params)

    const deleted = await db
      .delete(links)
      .where(eq(links.shortCode, shortCode))
      .returning()

    if (!deleted.length) {
      return reply.status(404).send({ message: 'Link não encontrado' })
    }

    return reply.status(204).send()
  })

  app.patch('/links/:shortCode/access', async (request, reply) => {
    const paramsSchema = z.object({
      shortCode: z.string().min(1)
    })

    const { shortCode } = paramsSchema.parse(request.params)

    const [updated] = await db
      .update(links)
      .set({
        accessCount: sql`${links.accessCount} + 1`
      })
      .where(eq(links.shortCode, shortCode))
      .returning()

    if (!updated) {
      return reply.status(404).send({ message: 'Link não encontrado' })
    }

    return { accessCount: updated.accessCount }
  })

  app.get('/links/export', async (request, reply) => {
    const data = await db
      .select({
        id: links.id,
        originalUrl: links.originalUrl,
        shortCode: links.shortCode,
        accessCount: links.accessCount,
        createdAt: links.createdAt
      })
      .from(links)
      .orderBy(desc(links.createdAt))

    const originHeader =
      typeof request.headers.origin === 'string'
        ? request.headers.origin
        : typeof request.headers.referer === 'string'
          ? request.headers.referer
          : ''

    const shortBase = originHeader
      ? new URL(originHeader).origin.replace(/\/$/, '')
      : ''

    const csv = toCsv(
      ['id', 'original_url', 'short_url', 'access_count', 'created_at'],
      data.map(link => [
        link.id,
        link.originalUrl,
        shortBase ? `${shortBase}/${link.shortCode}` : link.shortCode,
        link.accessCount,
        link.createdAt.toISOString()
      ])
    )

    try {
      const { url } = await uploadCsvToR2(csv)
      return { url }
    } catch (error) {
      request.log.error({ error }, 'Failed to upload CSV')
      return reply.status(500).send({
        message: 'Falha ao exportar links'
      })
    }
  })
}
