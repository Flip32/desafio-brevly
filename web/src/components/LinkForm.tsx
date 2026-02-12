import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const shortCodeRegex = /^[a-zA-Z0-9-]{3,64}$/

function normalizeShortCode(value: string) {
  const trimmed = value.trim()
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, '')
  const parts = withoutProtocol.split('/').filter(Boolean)
  return parts[parts.length - 1] ?? ''
}

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

const linkFormSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'Informe a URL original')
    .transform(value => normalizeUrl(value))
    .refine(value => isValidUrl(value), {
      message: 'Informe uma URL válida'
    }),
  shortCode: z
    .string()
    .min(1, 'Informe o encurtamento')
    .transform(value => normalizeShortCode(value))
    .refine(value => shortCodeRegex.test(value), {
      message: 'Use apenas letras, números ou hífen'
    })
})

type LinkFormData = z.infer<typeof linkFormSchema>

type LinkFormProps = {
  onCreate: (payload: {
    originalUrl: string
    shortCode: string
  }) => Promise<void>
  isSubmitting: boolean
  errorMessage?: string | null
}

export function LinkForm({
  onCreate,
  isSubmitting,
  errorMessage
}: LinkFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkFormSchema)
  })

  const apiError = Boolean(errorMessage)

  async function onSubmit(data: LinkFormData) {
    await onCreate({
      originalUrl: data.originalUrl,
      shortCode: data.shortCode
    })

    reset()
  }

  return (
    <div className="card">
      <h2 className="card-title">Novo link</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group">
          <label htmlFor="originalUrl">Link original</label>
          <input
            id="originalUrl"
            className={`input ${errors.originalUrl ? 'error' : ''}`}
            placeholder="www.exemplo.com.br"
            {...register('originalUrl')}
          />
          {errors.originalUrl && (
            <span className="helper-text">{errors.originalUrl.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="shortCode">Link encurtado</label>
          <div
            className={`input-prefix ${
              errors.shortCode || apiError ? 'error' : ''
            }`}
          >
            <span className="input-prefix-text">brev.ly/</span>
            <input
              id="shortCode"
              className="input-prefix-field"
              placeholder="sua-url"
              {...register('shortCode')}
            />
          </div>
          {errors.shortCode && (
            <span className="helper-text">{errors.shortCode.message}</span>
          )}
          {!errors.shortCode && errorMessage && (
            <span className="helper-text">{errorMessage}</span>
          )}
        </div>

        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar link'}
        </button>
      </form>
    </div>
  )
}
