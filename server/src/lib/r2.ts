import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { env } from '@/env.js'

function ensureR2Config() {
  if (
    !env.CLOUDFLARE_ACCOUNT_ID ||
    !env.CLOUDFLARE_ACCESS_KEY_ID ||
    !env.CLOUDFLARE_SECRET_ACCESS_KEY ||
    !env.CLOUDFLARE_BUCKET ||
    !env.CLOUDFLARE_PUBLIC_URL
  ) {
    throw new Error('R2 environment variables are not configured')
  }
}

export async function uploadCsvToR2(content: string) {
  ensureR2Config()

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID,
      secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY
    }
  })

  const key = `${randomUUID()}.csv`

  await client.send(
    new PutObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET,
      Key: key,
      Body: content,
      ContentType: 'text/csv'
    })
  )

  const base = env.CLOUDFLARE_PUBLIC_URL.endsWith('/')
    ? env.CLOUDFLARE_PUBLIC_URL
    : `${env.CLOUDFLARE_PUBLIC_URL}/`

  return {
    key,
    url: new URL(key, base).toString()
  }
}
