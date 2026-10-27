import { readingHasAlert } from './ranges'
import type { Dataset, Patient } from './types'

/** Calendar day key (UTC YYYY-MM-DD) for a timestamp. */
export function calendarDayKey(isoTimestamp: string): string {
  return new Date(isoTimestamp).toISOString().slice(0, 10)
}

/** Latest calendar day present in the dataset (not wall-clock today). */
export function latestDayInDataset(dataset: Dataset): string | null {
  let latest: string | null = null
  for (const patient of dataset.patients) {
    for (const reading of patient.readings) {
      const day = calendarDayKey(reading.timestamp)
      if (!latest || day > latest) latest = day
    }
  }
  return latest
}

export type AlertsTodayResult = {
  day: string | null
  patientsWithAlerts: Patient[]
  count: number
}

/**
 * Patients with any out-of-range vital on the latest calendar day in the dataset.
 * Zero is a valid result and still renders.
 */
export function patientsWithAlertsOnLatestDay(dataset: Dataset): AlertsTodayResult {
  const day = latestDayInDataset(dataset)
  if (!day) {
    return { day: null, patientsWithAlerts: [], count: 0 }
  }

  const patientsWithAlerts: Patient[] = []
  for (const patient of dataset.patients) {
    const hasAlert = patient.readings.some(
      (r) => calendarDayKey(r.timestamp) === day && readingHasAlert(r),
    )
    if (hasAlert) patientsWithAlerts.push(patient)
  }

  return {
    day,
    patientsWithAlerts,
    count: patientsWithAlerts.length,
  }
}
