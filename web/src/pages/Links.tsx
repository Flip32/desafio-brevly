import Logo from '@/assets/Logo.svg'
import { LinkForm } from '@/components/LinkForm'
import { LinksList } from '@/components/LinksList'
import { ApiError, type LinkItem, apiFetch, getFrontendUrl } from '@/lib/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

export function LinksPage() {
  const queryClient = useQueryClient()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    variant: 'info' | 'error'
    title: string
    message: string
  } | null>(null)
  const frontendUrl = useMemo(() => getFrontendUrl(), [])

  const linksQuery = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const data = await apiFetch<{ links: LinkItem[] }>('/links')
      return data.links
    },
    refetchOnWindowFocus: true,
    refetchInterval: 10000, // Fake snapshot real-time updates. Implement WebSocket for real-time in a production app ??
    refetchIntervalInBackground: true
  })

  const createMutation = useMutation({
    mutationFn: async (payload: { originalUrl: string; shortCode: string }) => {
      return apiFetch<{ link: LinkItem }>('/links', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
    onError: error => {
      if (error instanceof ApiError) {
        setToast({
          variant: 'error',
          title: 'Erro no cadastro',
          message:
            error.status === 409
              ? 'Essa URL encurtada já existe.'
              : error.message
        })
      } else {
        setToast({
          variant: 'error',
          title: 'Erro no cadastro',
          message: 'Não foi possível criar o link.'
        })
      }
      setTimeout(() => {
        setToast(null)
      }, 2000)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (shortCode: string) => {
      return apiFetch<void>(`/links/${shortCode}`, {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    }
  })

  const exportMutation = useMutation({
    mutationFn: async () => {
      return apiFetch<{ url: string }>('/links/export')
    },
    onSuccess: data => {
      window.open(data.url, '_blank')
    }
  })

  function handleCopy(shortCode: string) {
    const value = `${frontendUrl}/${shortCode}`
    navigator.clipboard.writeText(value).then(() => {
      setCopiedCode(shortCode)
      setToast({
        variant: 'info',
        title: 'Link copiado com sucesso',
        message: `O link ${shortCode} foi copiado para a área de transferência.`
      })
      setTimeout(() => {
        setCopiedCode(null)
        setToast(null)
      }, 2000)
    })
  }

  const listError = linksQuery.isError
    ? linksQuery.error instanceof ApiError
      ? linksQuery.error.message
      : 'Não foi possível carregar os links'
    : null

  return (
    <div className="page">
      <div className="container">
        <div className="logo">
          <img src={Logo} alt="Brev.ly" height={28} />
        </div>

        <div className="grid">
          <LinkForm
            onCreate={async payload => {
              await createMutation.mutateAsync(payload)
            }}
            isSubmitting={createMutation.isPending}
          />

          <LinksList
            links={linksQuery.data ?? []}
            isLoading={linksQuery.isLoading}
            errorMessage={listError}
            isDeleting={deleteMutation.isPending}
            deletingShortCode={deleteMutation.variables}
            onDelete={shortCode => deleteMutation.mutate(shortCode)}
            onCopy={handleCopy}
            copiedShortCode={copiedCode}
            onDownload={() => exportMutation.mutate()}
            isDownloading={exportMutation.isPending}
          />
        </div>
      </div>
      {toast ? (
        <div className={`toast toast--${toast.variant}`}>
          <div className={`toast-icon toast-icon--${toast.variant}`}>
            {toast.variant === 'error' ? '!' : 'i'}
          </div>
          <div>
            <div className="toast-title">{toast.title}</div>
            <div className="toast-text">{toast.message}</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
