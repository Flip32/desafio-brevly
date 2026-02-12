import LinkIcon from '@/assets/Link.svg'

export function EmptyState() {
  return (
    <div className="empty-state">
      <img src={LinkIcon} alt="Sem links" height={24} />
      Ainda não existem links cadastrados
    </div>
  )
}
