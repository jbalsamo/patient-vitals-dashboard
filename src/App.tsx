import { useMemo, useState } from 'react'
import { patientsWithAlertsOnLatestDay } from './alerts'
import { Banner } from './components/Banner'
import { PatientList } from './components/PatientList'
import { ReadingsTable } from './components/ReadingsTable'
import { SummaryCard } from './components/SummaryCard'
import { TrendChart } from './components/TrendChart'
import { UploadControls } from './components/UploadControls'
import { parseVitalsCsv } from './csv'
import { createSyntheticDataset } from './synthetic'
import type { Dataset } from './types'

function App() {
  const [dataset, setDataset] = useState<Dataset>(() => createSyntheticDataset())
  const [selectedId, setSelectedId] = useState<string | null>(
    () => createSyntheticDataset().patients[0]?.id ?? null,
  )
  const [error, setError] = useState<string | null>(null)
  const [skippedRows, setSkippedRows] = useState<number | null>(null)

  const alerts = useMemo(() => patientsWithAlertsOnLatestDay(dataset), [dataset])
  const selected =
    dataset.patients.find((p) => p.id === selectedId) ?? dataset.patients[0] ?? null

  function handleUpload(text: string) {
    const result = parseVitalsCsv(text)
    if (!result.ok) {
      setError(result.error)
      setSkippedRows(null)
      return
    }
    setError(null)
    setSkippedRows(result.skippedRows)
    setDataset(result.dataset)
    setSelectedId(result.dataset.patients[0]?.id ?? null)
  }

  function handleReset() {
    const next = createSyntheticDataset()
    setDataset(next)
    setSelectedId(next.patients[0]?.id ?? null)
    setError(null)
    setSkippedRows(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Banner />
      <main className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            Patient Vitals Monitoring Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Select a patient to view trends and readings. Out-of-range values are flagged.
          </p>
        </div>

        <UploadControls
          onFileText={handleUpload}
          onReset={handleReset}
          skippedRows={skippedRows}
          error={error}
          source={dataset.source}
        />

        <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
          <div className="flex flex-col gap-4">
            <SummaryCard alerts={alerts} />
            <PatientList
              patients={dataset.patients}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
            />
          </div>

          <div className="flex flex-col gap-4">
            {selected ? (
              <>
                <TrendChart readings={selected.readings} patientName={selected.name} />
                <ReadingsTable readings={selected.readings} />
              </>
            ) : (
              <p role="status">No patients in the current dataset.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
