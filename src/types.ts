export type VitalReading = {
  patientId: string
  patientName: string
  timestamp: string
  heartRate: number
  systolicBp: number
  diastolicBp: number
  spo2: number
  temperatureF: number
}

export type Patient = {
  id: string
  name: string
  readings: VitalReading[]
}

export type Dataset = {
  patients: Patient[]
  source: 'synthetic' | 'csv'
}
