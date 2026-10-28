type Props = {
  onFileText: (text: string) => void
  onReset: () => void
  skippedRows: number | null
  error: string | null
  source: 'synthetic' | 'csv'
}

async function readFileAsText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    return file.text()
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

export function UploadControls({ onFileText, onReset, skippedRows, error, source }: Props) {
  return (
    <section
      aria-label="Dataset controls"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 p-4"
    >
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-100 ring-1 ring-slate-600 hover:bg-slate-700">
        <span aria-hidden="true">Upload CSV</span>
        <input
          type="file"
          accept=".csv,text/csv"
          aria-label="Upload vitals CSV"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const text = await readFileAsText(file)
            onFileText(text)
            e.target.value = ''
          }}
        />
      </label>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-cyan-800 px-3 py-2 text-sm font-medium text-cyan-50 hover:bg-cyan-700"
      >
        Reset to synthetic
      </button>
      <span className="text-sm text-slate-400" aria-live="polite">
        Source: {source === 'synthetic' ? 'synthetic seed' : 'uploaded CSV'}
      </span>
      {skippedRows !== null && skippedRows > 0 ? (
        <p role="status" className="w-full text-sm text-amber-300">
          Skipped {skippedRows} bad row{skippedRows === 1 ? '' : 's'}.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="w-full text-sm text-rose-300">
          {error}
        </p>
      ) : null}
    </section>
  )
}
