import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { env } from '@/env.js'
import * as schema from '@/db/schema.js'

export const client = postgres(env.DATABASE_URL, {
  max: 10
})

export const db = drizzle(client, { schema })
