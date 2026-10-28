import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { BANNER_TEXT } from './components/Banner'
import { createSyntheticDataset, PATIENT_COUNT, READINGS_PER_PATIENT } from './synthetic'

const HEADER =
  'patient_id,patient_name,timestamp,heart_rate,systolic_bp,diastolic_bp,spo2,temperature_f'

describe('UI contract', () => {
  it('shows the exact teaching banner text', () => {
    render(<App />)
    expect(screen.getByRole('banner', { name: /teaching demo notice/i })).toHaveTextContent(
      BANNER_TEXT,
    )
    expect(screen.getByText(BANNER_TEXT)).toBeInTheDocument()
  })

  it('flags a known outlier reading as out of range (red / aria-invalid)', async () => {
    const user = userEvent.setup()
    render(<App />)

    // P003 Mia Lopez has forced HR=112 on last-day reading in the synthetic seed
    await user.click(screen.getByRole('button', { name: 'Select patient Mia Lopez' }))

    const table = screen.getByRole('table')
    const oorCells = Array.from(table.querySelectorAll('[data-oor="true"]'))
    expect(oorCells.length).toBeGreaterThan(0)
    const hrOutlier = oorCells.find((cell) => cell.textContent?.includes('112'))
    expect(hrOutlier).toBeTruthy()
    expect(hrOutlier).toHaveAttribute('aria-invalid', 'true')
    expect(hrOutlier).toHaveTextContent(/out of range/i)
  })

  it('upload replaces data; Reset to synthetic restores 20×18', async () => {
    const user = userEvent.setup()
    render(<App />)

    const csv = [
      HEADER,
      'Z9,Upload Only,2026-07-01T00:00:00.000Z,72,110,70,98,98.6',
    ].join('\n')

    const input = screen.getByLabelText(/upload vitals csv/i)
    const file = new File([csv], 'upload.csv', { type: 'text/csv' })
    await user.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/Source: uploaded CSV/i)).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: 'Select patient Upload Only' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Select patient Ava Chen' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Reset to synthetic/i }))

    expect(screen.getByText(/Source: synthetic seed/i)).toBeInTheDocument()
    const list = screen.getByRole('navigation', { name: /patient list/i })
    const buttons = within(list).getAllByRole('button')
    expect(buttons).toHaveLength(PATIENT_COUNT)

    await user.click(buttons[0]!)
    const table = screen.getByRole('table')
    const bodyRows = within(table).getAllByRole('row').slice(1)
    expect(bodyRows.length).toBe(READINGS_PER_PATIENT)
  })

  it('renders alerts-today count for synthetic seed (including zero-capable UI)', () => {
    render(<App />)
    const summary = screen.getByRole('region', { name: /alerts summary/i })
    const countEl = within(summary).getByTestId('alerts-today-count')
    const count = Number(countEl.textContent)
    expect(Number.isFinite(count)).toBe(true)
    expect(count).toBeGreaterThanOrEqual(0)

    const seed = createSyntheticDataset()
    expect(seed.patients).toHaveLength(20)
    expect(seed.patients.every((p) => p.readings.length === 18)).toBe(true)
  })
})
