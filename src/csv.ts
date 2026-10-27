import Papa from 'papaparse'
import type { Dataset, Patient, VitalReading } from './types'

export const CSV_HEADERS = [
  'patient_id',
  'patient_name',
  'timestamp',
  'heart_rate',
  'systolic_bp',
  'diastolic_bp',
  'spo2',
  'temperature_f',
] as const

export type CsvParseResult =
  | { ok: true; dataset: Dataset; skippedRows: number }
  | { ok: false; error: string }

function isValidIsoTimestamp(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  const d = new Date(value)
  return !Number.isNaN(d.getTime())
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).trim())
  return Number.isFinite(n) ? n : null
}

function rowToReading(row: Record<string, unknown>): VitalReading | null {
  const patientId = String(row.patient_id ?? '').trim()
  const patientName = String(row.patient_name ?? '').trim()
  const timestamp = String(row.timestamp ?? '').trim()
  const heartRate = toNumber(row.heart_rate)
  const systolicBp = toNumber(row.systolic_bp)
  const diastolicBp = toNumber(row.diastolic_bp)
  const spo2 = toNumber(row.spo2)
  const temperatureF = toNumber(row.temperature_f)

  if (!patientId || !patientName || !isValidIsoTimestamp(timestamp)) return null
  if (
    heartRate === null ||
    systolicBp === null ||
    diastolicBp === null ||
    spo2 === null ||
    temperatureF === null
  ) {
    return null
  }

  return {
    patientId,
    patientName,
    timestamp: new Date(timestamp).toISOString(),
    heartRate,
    systolicBp,
    diastolicBp,
    spo2,
    temperatureF,
  }
}

function hasExpectedHeaders(fields: string[] | undefined): boolean {
  if (!fields || fields.length === 0) return false
  const normalized = fields.map((f) => f.trim().toLowerCase())
  return CSV_HEADERS.every((h) => normalized.includes(h))
}

function groupPatients(readings: VitalReading[]): Patient[] {
  const map = new Map<string, Patient>()
  for (const reading of readings) {
    let patient = map.get(reading.patientId)
    if (!patient) {
      patient = { id: reading.patientId, name: reading.patientName, readings: [] }
      map.set(reading.patientId, patient)
    }
    patient.readings.push(reading)
  }
  for (const patient of map.values()) {
    patient.readings.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id))
}

/** Parse CSV text. Bad rows are skipped; a file with no valid rows is an error. */
export function parseVitalsCsv(text: string): CsvParseResult {
  const trimmed = text?.trim() ?? ''
  if (!trimmed) {
    return { ok: false, error: 'CSV file is empty. Expected header row and vital readings.' }
  }

  const parsed = Papa.parse<Record<string, unknown>>(trimmed, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  })

  if (!hasExpectedHeaders(parsed.meta.fields)) {
    return {
      ok: false,
      error: `Invalid CSV: missing required columns. Expected: ${CSV_HEADERS.join(', ')}`,
    }
  }

  const readings: VitalReading[] = []
  let skippedRows = 0

  for (const row of parsed.data) {
    const reading = rowToReading(row)
    if (reading) readings.push(reading)
    else skippedRows += 1
  }

  if (readings.length === 0) {
    return {
      ok: false,
      error: 'No valid vital readings found. Check that rows include ISO timestamps and numeric vitals (temperature_f in °F).',
    }
  }

  return {
    ok: true,
    dataset: { patients: groupPatients(readings), source: 'csv' },
    skippedRows,
  }
}

export function datasetToCsv(dataset: Dataset): string {
  const lines = [CSV_HEADERS.join(',')]
  for (const patient of dataset.patients) {
    for (const r of patient.readings) {
      lines.push(
        [
          r.patientId,
          `"${r.patientName.replaceAll('"', '""')}"`,
          r.timestamp,
          r.heartRate,
          r.systolicBp,
          r.diastolicBp,
          r.spo2,
          r.temperatureF,
        ].join(','),
      )
    }
  }
  return lines.join('\n') + '\n'
}
