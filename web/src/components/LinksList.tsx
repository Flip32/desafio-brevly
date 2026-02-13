import CopyIcon from '@/assets/Copy.svg'
import DownloadIcon from '@/assets/DownloadSimple.svg'
import TrashIcon from '@/assets/Trash.svg'
import { EmptyState } from '@/components/EmptyState'
import { type LinkItem, getFrontendUrl } from '@/lib/api'

type LinksListProps = {
  links: LinkItem[]
  isLoading: boolean
  errorMessage?: string | null
  onCopy: (shortCode: string) => void
  copiedShortCode: string | null
  onDelete: (shortCode: string) => void
  isDeleting: boolean
  deletingShortCode?: string
  onDownload: () => void
  isDownloading: boolean
}

export function LinksList({
  links,
  isLoading,
  errorMessage,
  onCopy,
  copiedShortCode,
  onDelete,
  isDeleting,
  deletingShortCode,
  onDownload,
  isDownloading
}: LinksListProps) {
  const baseUrl = getFrontendUrl()
  const hasLinks = links.length > 0

  return (
    <div className="card">
      <div className="list-header">
        <h2 className="card-title">Meus links</h2>
        <button
          type="button"
          className="button-secondary"
          onClick={onDownload}
          disabled={!hasLinks || isDownloading}
        >
          <img src={DownloadIcon} alt="Baixar CSV" height={14} />
          {isDownloading ? 'Gerando...' : 'Baixar CSV'}
        </button>
      </div>
      <div className="list-divider" />

      {isLoading ? (
        <div className="empty-state">Carregando links...</div>
      ) : errorMessage ? (
        <div className="empty-state">{errorMessage}</div>
      ) : !hasLinks ? (
        <EmptyState />
      ) : (
        <div className="list">
          {links.map(link => {
            const shortUrl = `${baseUrl}/${link.shortCode}`
            const displayShortUrl = `brev.ly/${link.shortCode}`
            const displayOriginal = link.originalUrl.replace(/^https?:\/\//, '')
            const isDeletingItem =
              isDeleting && deletingShortCode === link.shortCode
            const isCopied = copiedShortCode === link.shortCode

            return (
              <div key={link.id} className="link-item">
                <div className="link-info">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    title={shortUrl}
                  >
                    {displayShortUrl}
                  </a>
                  <span title={link.originalUrl}>{displayOriginal}</span>
                </div>

                <div className="link-actions">
                  <span className="link-count">{link.accessCount} acessos</span>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => onCopy(link.shortCode)}
                    title={isCopied ? 'Copiado' : 'Copiar'}
                  >
                    <img src={CopyIcon} alt="Copiar" height={14} />
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => onDelete(link.shortCode)}
                    disabled={isDeletingItem}
                    title="Excluir"
                  >
                    <img src={TrashIcon} alt="Excluir" height={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
