import { useState, useCallback } from 'react'
import type { QRRecord } from '../types'

const STORAGE_KEY = 'qr-hunter-collection'

const load = (): QRRecord[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const save = (records: QRRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url.slice(0, 30)
  }
}

export const useCollection = () => {
  const [records, setRecords] = useState<QRRecord[]>(load)

  const addRecord = useCallback((url: string): { isNew: boolean; record: QRRecord } => {
    const current = load()
    const existing = current.find(r => r.url === url)
    if (existing) return { isNew: false, record: existing }

    const record: QRRecord = {
      id: crypto.randomUUID(),
      url,
      domain: getDomain(url),
      scannedAt: new Date().toISOString(),
      number: current.length + 1,
    }
    const next = [record, ...current]
    save(next)
    setRecords(next)
    return { isNew: true, record }
  }, [])

  return { records, addRecord }
}
