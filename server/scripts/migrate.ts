import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sql = postgres(databaseUrl, { max: 1 })

const migrationPath = path.resolve(
  __dirname,
  '..',
  'src',
  'db',
  'migrations',
  '0000_init.sql'
)

async function run() {
  const migration = fs.readFileSync(migrationPath, 'utf-8')
  await sql.unsafe(migration)
  await sql.end()
  console.log('Migrations executed successfully')
}

run().catch(error => {
  console.error('Migration failed', error)
  process.exit(1)
})
