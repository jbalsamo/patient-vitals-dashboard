import { describe, expect, it } from 'vitest'
import { isInRange, isOutOfRange } from './ranges'

describe('vital range helpers (inclusive)', () => {
  it('marks in-range values true for each vital', () => {
    expect(isInRange('heartRate', 60)).toBe(true)
    expect(isInRange('heartRate', 100)).toBe(true)
    expect(isInRange('heartRate', 80)).toBe(true)
    expect(isInRange('systolicBp', 90)).toBe(true)
    expect(isInRange('systolicBp', 120)).toBe(true)
    expect(isInRange('diastolicBp', 60)).toBe(true)
    expect(isInRange('diastolicBp', 80)).toBe(true)
    expect(isInRange('spo2', 95)).toBe(true)
    expect(isInRange('spo2', 100)).toBe(true)
    expect(isInRange('temperatureF', 97.0)).toBe(true)
    expect(isInRange('temperatureF', 99.0)).toBe(true)
    expect(isInRange('temperatureF', 98.6)).toBe(true)
  })

  it('marks just-out values false (temp 96.9/99.1, HR 59/101)', () => {
    expect(isInRange('temperatureF', 96.9)).toBe(false)
    expect(isInRange('temperatureF', 99.1)).toBe(false)
    expect(isOutOfRange('temperatureF', 96.9)).toBe(true)
    expect(isOutOfRange('temperatureF', 99.1)).toBe(true)

    expect(isInRange('heartRate', 59)).toBe(false)
    expect(isInRange('heartRate', 101)).toBe(false)
    expect(isOutOfRange('heartRate', 59)).toBe(true)
    expect(isOutOfRange('heartRate', 101)).toBe(true)

    expect(isInRange('systolicBp', 89)).toBe(false)
    expect(isInRange('systolicBp', 121)).toBe(false)
    expect(isInRange('diastolicBp', 59)).toBe(false)
    expect(isInRange('diastolicBp', 81)).toBe(false)
    expect(isInRange('spo2', 94)).toBe(false)
    expect(isInRange('spo2', 101)).toBe(false)
  })

  it('treats systolic and diastolic independently', () => {
    expect(isInRange('systolicBp', 110)).toBe(true)
    expect(isInRange('diastolicBp', 90)).toBe(false)
    expect(isInRange('systolicBp', 130)).toBe(false)
    expect(isInRange('diastolicBp', 70)).toBe(true)
  })
})
