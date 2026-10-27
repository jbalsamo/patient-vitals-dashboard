import type { Dataset, Patient, VitalReading } from './types'

const PATIENT_NAMES = [
  'Ava Chen',
  'Noah Patel',
  'Mia Lopez',
  'Liam Brooks',
  'Emma Nguyen',
  'Oliver Kim',
  'Sophia Diaz',
  'Elijah Wright',
  'Isabella Torres',
  'Lucas Martin',
  'Amelia Scott',
  'James Rivera',
  'Harper Lee',
  'Benjamin Cruz',
  'Evelyn Adams',
  'Henry Foster',
  'Charlotte Bell',
  'Alexander Gray',
  'Mia Quinn',
  'William Reed',
] as const

/** Fixed window start so the seed is stable across runs. */
export const SYNTHETIC_WINDOW_START = '2026-03-01T00:00:00.000Z'
export const READINGS_PER_PATIENT = 18
export const PATIENT_COUNT = 20
export const HOURS_BETWEEN_READINGS = 4

function seededUnit(seed: number): number {
  // Simple deterministic LCG-ish hash → [0, 1)
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function buildReading(
  patientId: string,
  patientName: string,
  timestamp: string,
  seed: number,
  forceOutlier: 'none' | 'hr' | 'temp' | 'sys' | 'spo2',
): VitalReading {
  const u = (offset: number) => seededUnit(seed + offset)

  let heartRate = Math.round(60 + u(1) * 40) // 60–100
  let systolicBp = Math.round(90 + u(2) * 30) // 90–120
  let diastolicBp = Math.round(60 + u(3) * 20) // 60–80
  let spo2 = Math.round(95 + u(4) * 5) // 95–100
  let temperatureF = Number((97 + u(5) * 2).toFixed(1)) // 97.0–99.0

  if (forceOutlier === 'hr') heartRate = 112
  if (forceOutlier === 'temp') temperatureF = 100.4
  if (forceOutlier === 'sys') systolicBp = 142
  if (forceOutlier === 'spo2') spo2 = 91

  heartRate = clamp(heartRate, 40, 160)
  systolicBp = clamp(systolicBp, 70, 200)
  diastolicBp = clamp(diastolicBp, 40, 120)
  spo2 = clamp(spo2, 80, 100)
  temperatureF = clamp(temperatureF, 95, 105)

  return {
    patientId,
    patientName,
    timestamp,
    heartRate,
    systolicBp,
    diastolicBp,
    spo2,
    temperatureF,
  }
}

/** Build the teaching synthetic dataset: 20 patients × 18 readings (3 days × 4h). */
export function createSyntheticDataset(): Dataset {
  const start = new Date(SYNTHETIC_WINDOW_START)
  const patients: Patient[] = []

  for (let i = 0; i < PATIENT_COUNT; i++) {
    const id = `P${String(i + 1).padStart(3, '0')}`
    const name = PATIENT_NAMES[i] ?? `Patient ${i + 1}`
    const readings: VitalReading[] = []

    for (let r = 0; r < READINGS_PER_PATIENT; r++) {
      const ts = new Date(start.getTime() + r * HOURS_BETWEEN_READINGS * 60 * 60 * 1000)
      // Sprinkle a few outliers so alerts demo: patient 3 last-day HR, patient 7 temp, patient 12 sys, patient 15 spo2
      let force: 'none' | 'hr' | 'temp' | 'sys' | 'spo2' = 'none'
      const isLastDay = r >= 12 // days 0,1,2 → last calendar day starts at reading 12
      if (isLastDay && i === 2 && r === 15) force = 'hr'
      if (isLastDay && i === 6 && r === 16) force = 'temp'
      if (isLastDay && i === 11 && r === 17) force = 'sys'
      if (isLastDay && i === 14 && r === 14) force = 'spo2'
      // One mid-window outlier that should NOT count as "today" if last day is day 3
      if (i === 4 && r === 5) force = 'hr'

      readings.push(buildReading(id, name, ts.toISOString(), (i + 1) * 1000 + r, force))
    }

    patients.push({ id, name, readings })
  }

  return { patients, source: 'synthetic' }
}

export function flattenReadings(dataset: Dataset): VitalReading[] {
  return dataset.patients.flatMap((p) => p.readings)
}
