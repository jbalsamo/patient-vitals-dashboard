import type { AlertsTodayResult } from '../alerts'

type Props = {
  alerts: AlertsTodayResult
}

export function SummaryCard({ alerts }: Props) {
  const dayLabel = alerts.day ?? 'n/a'
  return (
    <section
      aria-label="Alerts summary"
      className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
        Patients with alerts today
      </h2>
      <p className="mt-2 text-3xl font-bold text-rose-400" aria-live="polite">
        <span data-testid="alerts-today-count">{alerts.count}</span>
      </p>
      <p className="mt-1 text-sm text-slate-400">
        Latest day in dataset: <time dateTime={dayLabel}>{dayLabel}</time>
      </p>
      {alerts.count === 0 ? (
        <p className="mt-2 text-sm text-emerald-400">No out-of-range vitals on that day.</p>
      ) : (
        <ul className="mt-2 list-inside list-disc text-sm text-slate-300">
          {alerts.patientsWithAlerts.map((p) => (
            <li key={p.id}>
              {p.name} ({p.id})
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
