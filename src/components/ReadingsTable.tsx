import { isOutOfRange, type VitalKey } from '../ranges'
import type { VitalReading } from '../types'

type Props = {
  readings: VitalReading[]
}

function Cell({
  vital,
  value,
  display,
}: {
  vital: VitalKey
  value: number
  display: string
}) {
  const oor = isOutOfRange(vital, value)
  return (
    <td
      className={`px-3 py-2 tabular-nums ${oor ? 'font-semibold text-rose-400' : 'text-slate-200'}`}
      aria-invalid={oor ? true : undefined}
      data-oor={oor ? 'true' : 'false'}
    >
      {display}
      {oor ? <span className="sr-only"> (out of range)</span> : null}
    </td>
  )
}

export function ReadingsTable({ readings }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/80">
      <table className="min-w-full text-left text-sm">
        <caption className="border-b border-slate-700 px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide text-slate-400">
          Readings
        </caption>
        <thead className="bg-slate-950/60 text-xs uppercase text-slate-400">
          <tr>
            <th scope="col" className="px-3 py-2">
              Timestamp
            </th>
            <th scope="col" className="px-3 py-2">
              HR
            </th>
            <th scope="col" className="px-3 py-2">
              Sys
            </th>
            <th scope="col" className="px-3 py-2">
              Dia
            </th>
            <th scope="col" className="px-3 py-2">
              SpO₂
            </th>
            <th scope="col" className="px-3 py-2">
              Temp °F
            </th>
          </tr>
        </thead>
        <tbody>
          {readings.map((r) => (
            <tr key={r.timestamp} className="border-t border-slate-800">
              <td className="px-3 py-2 text-slate-300">
                <time dateTime={r.timestamp}>{new Date(r.timestamp).toLocaleString()}</time>
              </td>
              <Cell vital="heartRate" value={r.heartRate} display={String(r.heartRate)} />
              <Cell vital="systolicBp" value={r.systolicBp} display={String(r.systolicBp)} />
              <Cell vital="diastolicBp" value={r.diastolicBp} display={String(r.diastolicBp)} />
              <Cell vital="spo2" value={r.spo2} display={String(r.spo2)} />
              <Cell
                vital="temperatureF"
                value={r.temperatureF}
                display={r.temperatureF.toFixed(1)}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
