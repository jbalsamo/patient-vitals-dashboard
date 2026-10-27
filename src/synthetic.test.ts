import { describe, expect, it } from 'vitest'
import {
  HOURS_BETWEEN_READINGS,
  PATIENT_COUNT,
  READINGS_PER_PATIENT,
  createSyntheticDataset,
} from './synthetic'

describe('synthetic seed', () => {
  it('creates exactly 20 patients × 18 readings', () => {
    const dataset = createSyntheticDataset()
    expect(dataset.patients).toHaveLength(PATIENT_COUNT)
    expect(PATIENT_COUNT).toBe(20)
    expect(READINGS_PER_PATIENT).toBe(18)
    for (const patient of dataset.patients) {
      expect(patient.readings).toHaveLength(18)
      expect(patient.id).toBeTruthy()
      expect(patient.name).toBeTruthy()
    }
  })

  it('uses a contiguous 3-day window with 4-hour spacing', () => {
    const dataset = createSyntheticDataset()
    const readings = dataset.patients[0]!.readings
    expect(readings).toHaveLength(18)

    for (let i = 1; i < readings.length; i++) {
      const prev = new Date(readings[i - 1]!.timestamp).getTime()
      const curr = new Date(readings[i]!.timestamp).getTime()
      expect(curr - prev).toBe(HOURS_BETWEEN_READINGS * 60 * 60 * 1000)
    }

    const spanMs =
      new Date(readings[17]!.timestamp).getTime() - new Date(readings[0]!.timestamp).getTime()
    // 17 intervals × 4h = 68 hours (just under 3 full days of samples covering 3 calendar days)
    expect(spanMs).toBe(17 * 4 * 60 * 60 * 1000)

    const days = new Set(readings.map((r) => r.timestamp.slice(0, 10)))
    expect(days.size).toBe(3)
  })

  it('has a stable shape across calls', () => {
    const a = createSyntheticDataset()
    const b = createSyntheticDataset()
    expect(a.patients.map((p) => p.id)).toEqual(b.patients.map((p) => p.id))
    expect(a.patients[0]!.readings[0]).toEqual(b.patients[0]!.readings[0])
    expect(a.source).toBe('synthetic')
  })
})
