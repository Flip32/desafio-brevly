import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError, getFrontendUrl, LinkItem } from '@/lib/api'
import { LinkForm } from '@/components/LinkForm'
import { LinksList } from '@/components/LinksList'
import Logo from '@/assets/Logo.svg'

export function LinksPage() {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const frontendUrl = useMemo(() => getFrontendUrl(), [])

  const linksQuery = useQuery({
    queryKey: ['links'],
    queryFn: async () => {
      const data = await apiFetch<{ links: LinkItem[] }>('/links')
      return data.links
    }
  })

  const createMutation = useMutation({
    mutationFn: async (payload: { originalUrl: string; shortCode: string }) => {
      return apiFetch<{ link: LinkItem }>('/links', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
    },
    onMutate: () => {
      setFormError(null)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
    onError: error => {
      if (error instanceof ApiError) {
        setFormError(error.message)
      } else {
        setFormError('Não foi possível criar o link')
      }
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
      setTimeout(() => setCopiedCode(null), 2000)
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
          brev.ly
        </div>

        <div className="grid">
          <LinkForm
            onCreate={async payload => {
              await createMutation.mutateAsync(payload)
            }}
            isSubmitting={createMutation.isPending}
            errorMessage={formError}
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
    </div>
  )
}
