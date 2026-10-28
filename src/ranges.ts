/** Adult teaching defaults — inclusive bounds. */
export const VITAL_RANGES = {
  heartRate: { min: 60, max: 100, unit: 'bpm', label: 'Heart rate' },
  systolicBp: { min: 90, max: 120, unit: 'mmHg', label: 'Systolic BP' },
  diastolicBp: { min: 60, max: 80, unit: 'mmHg', label: 'Diastolic BP' },
  spo2: { min: 95, max: 100, unit: '%', label: 'SpO₂' },
  temperatureF: { min: 97.0, max: 99.0, unit: '°F', label: 'Temperature' },
} as const

export type VitalKey = keyof typeof VITAL_RANGES

export function isInRange(key: VitalKey, value: number): boolean {
  const { min, max } = VITAL_RANGES[key]
  return value >= min && value <= max
}

export function isOutOfRange(key: VitalKey, value: number): boolean {
  return !isInRange(key, value)
}

export function readingHasAlert(reading: {
  heartRate: number
  systolicBp: number
  diastolicBp: number
  spo2: number
  temperatureF: number
}): boolean {
  return (
    isOutOfRange('heartRate', reading.heartRate) ||
    isOutOfRange('systolicBp', reading.systolicBp) ||
    isOutOfRange('diastolicBp', reading.diastolicBp) ||
    isOutOfRange('spo2', reading.spo2) ||
    isOutOfRange('temperatureF', reading.temperatureF)
  )
}
