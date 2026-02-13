import NotFoundIcon from '@/assets/404.svg'

export function NotFoundPage() {
  return (
    <div className="page page-centered">
      <div className="container">
        <div className="status-card card">
          <img src={NotFoundIcon} alt="404" height={64} />
          <div className="status-title">Link não encontrado</div>
          <div className="status-text">
            O link que você está tentando acessar não existe, foi removido ou é
            uma URL inválida. Saiba mais em{' '}
            <a className="link-inline" href="/">
              brev.ly
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  )
}
