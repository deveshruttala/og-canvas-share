import type { CatalogWidget } from '@/widgets/catalog'

type Props = {
  widget: CatalogWidget
  onClick: () => void
}

export function WidgetCard({ widget, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="widget-card group text-left transition hover:-translate-y-0.5"
    >
      <div className="widget-card-preview">
        <span className="text-3xl">{widget.icon}</span>
      </div>
      <p className="mt-2 truncate text-sm font-semibold text-[var(--text-primary)]">{widget.name}</p>
      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[var(--text-secondary)]">
        {widget.description}
      </p>
    </button>
  )
}
