import type { Patient } from '../types'

type Props = {
  patients: Patient[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function PatientList({ patients, selectedId, onSelect }: Props) {
  return (
    <nav aria-label="Patient list" className="rounded-xl border border-slate-700 bg-slate-900/80">
      <h2 className="border-b border-slate-700 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Patients ({patients.length})
      </h2>
      <ul className="max-h-[28rem] overflow-y-auto p-2">
        {patients.map((patient) => {
          const selected = patient.id === selectedId
          return (
            <li key={patient.id}>
              <button
                type="button"
                aria-current={selected ? 'true' : undefined}
                aria-label={`Select patient ${patient.name}`}
                onClick={() => onSelect(patient.id)}
                className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  selected
                    ? 'bg-cyan-700/40 text-cyan-100 ring-1 ring-cyan-500'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="font-medium">{patient.name}</span>
                <span className="ml-2 text-xs text-slate-400">{patient.id}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
