import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})

// jsdom File may lack .text()
if (typeof File !== 'undefined' && typeof File.prototype.text !== 'function') {
  File.prototype.text = function text(this: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error ?? new Error('FileReader failed'))
      reader.readAsText(this)
    })
  }
}
