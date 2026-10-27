import { describe, expect, it } from 'vitest'
import {
  latestDayInDataset,
  patientsWithAlertsOnLatestDay,
} from './alerts'
import type { Dataset } from './types'

function ds(rows: Array<{
  id: string
  name: string
  timestamp: string
  heartRate?: number
  systolicBp?: number
  diastolicBp?: number
  spo2?: number
  temperatureF?: number
}>): Dataset {
  const byId = new Map<string, Dataset['patients'][number]>()
  for (const row of rows) {
    let p = byId.get(row.id)
    if (!p) {
      p = { id: row.id, name: row.name, readings: [] }
      byId.set(row.id, p)
    }
    p.readings.push({
      patientId: row.id,
      patientName: row.name,
      timestamp: row.timestamp,
      heartRate: row.heartRate ?? 72,
      systolicBp: row.systolicBp ?? 110,
      diastolicBp: row.diastolicBp ?? 70,
      spo2: row.spo2 ?? 98,
      temperatureF: row.temperatureF ?? 98.6,
    })
  }
  return { patients: [...byId.values()], source: 'csv' }
}

describe('alerts today (latest day in dataset)', () => {
  it('uses the latest calendar day in the dataset, not wall clock', () => {
    const dataset = ds([
      { id: 'A', name: 'A', timestamp: '2020-01-01T10:00:00.000Z', heartRate: 150 },
      { id: 'B', name: 'B', timestamp: '2020-01-03T10:00:00.000Z', heartRate: 72 },
      { id: 'C', name: 'C', timestamp: '2020-01-03T14:00:00.000Z', temperatureF: 101 },
    ])
    expect(latestDayInDataset(dataset)).toBe('2020-01-03')
    const alerts = patientsWithAlertsOnLatestDay(dataset)
    expect(alerts.day).toBe('2020-01-03')
    // Patient A alerted on an older day — must not count
    expect(alerts.patientsWithAlerts.map((p) => p.id)).toEqual(['C'])
    expect(alerts.count).toBe(1)
  })

  it('includes OOR patients on that latest day', () => {
    const dataset = ds([
      { id: 'P1', name: 'One', timestamp: '2026-05-10T08:00:00.000Z', heartRate: 55 },
      { id: 'P2', name: 'Two', timestamp: '2026-05-10T08:00:00.000Z', spo2: 92 },
      { id: 'P3', name: 'Three', timestamp: '2026-05-10T08:00:00.000Z' },
    ])
    const alerts = patientsWithAlertsOnLatestDay(dataset)
    expect(alerts.count).toBe(2)
    expect(alerts.patientsWithAlerts.map((p) => p.id).sort()).toEqual(['P1', 'P2'])
  })

  it('returns zero and still has a day when none are OOR', () => {
    const dataset = ds([
      { id: 'P1', name: 'One', timestamp: '2026-06-01T00:00:00.000Z' },
      { id: 'P2', name: 'Two', timestamp: '2026-06-01T04:00:00.000Z' },
    ])
    const alerts = patientsWithAlertsOnLatestDay(dataset)
    expect(alerts.day).toBe('2026-06-01')
    expect(alerts.count).toBe(0)
    expect(alerts.patientsWithAlerts).toEqual([])
  })
})
