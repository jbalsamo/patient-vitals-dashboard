import { describe, expect, it } from 'vitest'
import { parseVitalsCsv } from './csv'

const HEADER =
  'patient_id,patient_name,timestamp,heart_rate,systolic_bp,diastolic_bp,spo2,temperature_f'

describe('CSV parse', () => {
  it('happy path replaces with temperature_f column', () => {
    const csv = [
      HEADER,
      'X1,Test Patient,2026-04-01T08:00:00.000Z,72,110,70,98,98.6',
      'X1,Test Patient,2026-04-01T12:00:00.000Z,75,112,72,97,98.2',
    ].join('\n')

    const result = parseVitalsCsv(csv)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.skippedRows).toBe(0)
    expect(result.dataset.source).toBe('csv')
    expect(result.dataset.patients).toHaveLength(1)
    expect(result.dataset.patients[0]!.readings).toHaveLength(2)
    expect(result.dataset.patients[0]!.readings[0]!.temperatureF).toBe(98.6)
  })

  it('skips bad rows and reports a count', () => {
    const csv = [
      HEADER,
      'X1,Ok,2026-04-01T08:00:00.000Z,72,110,70,98,98.6',
      'X1,Bad,,72,110,70,98,98.6',
      'X1,BadNums,2026-04-01T12:00:00.000Z,nope,110,70,98,98.6',
      'X2,Ok2,2026-04-01T08:00:00.000Z,80,100,65,99,97.5',
    ].join('\n')

    const result = parseVitalsCsv(csv)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.skippedRows).toBe(2)
    expect(result.dataset.patients).toHaveLength(2)
  })

  it('totally bad file returns a clear error message', () => {
    const empty = parseVitalsCsv('')
    expect(empty.ok).toBe(false)
    if (empty.ok) return
    expect(empty.error.toLowerCase()).toMatch(/empty|invalid|no valid/)

    const wrongHeader = parseVitalsCsv('a,b,c\n1,2,3')
    expect(wrongHeader.ok).toBe(false)
    if (wrongHeader.ok) return
    expect(wrongHeader.error).toMatch(/temperature_f|required columns|Invalid CSV/i)

    const onlyBad = parseVitalsCsv(`${HEADER}\nbad,,,,,,`)
    expect(onlyBad.ok).toBe(false)
    if (onlyBad.ok) return
    expect(onlyBad.error).toMatch(/no valid/i)
  })
})
