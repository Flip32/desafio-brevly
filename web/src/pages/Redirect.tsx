import LogoIcon from '@/assets/Logo_Icon.svg'
import { type LinkItem, apiFetch } from '@/lib/api'
import { NotFoundPage } from '@/pages/NotFound'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export function RedirectPage() {
  const { shortCode } = useParams()
  const [link, setLink] = useState<LinkItem | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!shortCode) return

    let active = true

    async function load() {
      try {
        const data = await apiFetch<{ link: LinkItem }>(`/links/${shortCode}`)
        if (!active) return

        setLink(data.link)

        setTimeout(() => {
          window.location.href = data.link.originalUrl
        }, 1200)
      } catch (error) {
        if (active) {
          setFailed(true)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [shortCode])

  if (failed) {
    return <NotFoundPage />
  }

  return (
    <div className="page page-centered">
      <div className="container">
        <div className="status-card card">
          <img src={LogoIcon} alt="Brev.ly" height={32} />
          <div className="status-title">Redirecionando...</div>
          <div className="status-text">
            O link será aberto automaticamente em alguns instantes.
          </div>
          {link ? (
            <div className="status-text">
              Não foi redirecionado?{' '}
              <a className="link-inline" href={link.originalUrl}>
                Acesse aqui
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
