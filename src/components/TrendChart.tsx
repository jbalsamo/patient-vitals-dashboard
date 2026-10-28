import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { isOutOfRange } from '../ranges'
import type { VitalReading } from '../types'

type Props = {
  readings: VitalReading[]
  patientName: string
}

function Dot(props: {
  cx?: number
  cy?: number
  payload?: VitalReading
  dataKey?: string
  stroke?: string
}) {
  const { cx = 0, cy = 0, payload, dataKey, stroke } = props
  if (!payload || !dataKey) return null
  const value = payload[dataKey as keyof VitalReading]
  if (typeof value !== 'number') return null

  const vitalMap = {
    heartRate: 'heartRate',
    systolicBp: 'systolicBp',
    diastolicBp: 'diastolicBp',
    spo2: 'spo2',
    temperatureF: 'temperatureF',
  } as const
  const key = vitalMap[dataKey as keyof typeof vitalMap]
  const oor = key ? isOutOfRange(key, value) : false

  return (
    <circle
      cx={cx}
      cy={cy}
      r={oor ? 5 : 3}
      fill={oor ? '#f87171' : stroke}
      stroke={oor ? '#fecaca' : stroke}
      aria-label={oor ? `${dataKey} out of range` : undefined}
    />
  )
}

export function TrendChart({ readings, patientName }: Props) {
  const data = readings.map((r) => ({
    ...r,
    label: new Date(r.timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
    }),
  }))

  return (
    <section
      aria-label={`Vital trends for ${patientName}`}
      className="rounded-xl border border-slate-700 bg-slate-900/80 p-4"
    >
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Trends — {patientName}
      </h3>
      <div className="h-72 w-full" role="img" aria-label="Multi-series vital signs chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="heartRate"
              name="HR"
              stroke="#38bdf8"
              dot={<Dot />}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="systolicBp"
              name="Sys"
              stroke="#a78bfa"
              dot={<Dot />}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="diastolicBp"
              name="Dia"
              stroke="#f472b6"
              dot={<Dot />}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="spo2"
              name="SpO₂"
              stroke="#34d399"
              dot={<Dot />}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="temperatureF"
              name="Temp °F"
              stroke="#fbbf24"
              dot={<Dot />}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
