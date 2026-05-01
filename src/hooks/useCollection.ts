import { useState, useEffect, useCallback } from 'react'
import type { QRRecord } from '../types'
import { supabase } from '../lib/supabase'

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url.slice(0, 30)
  }
}

export const useCollection = () => {
  const [records, setRecords] = useState<QRRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('qr_records')
        .select('id, url, domain, scanned_at, number')
        .order('number', { ascending: false })

      if (data) {
        setRecords(data.map(row => ({
          id: row.id,
          url: row.url,
          domain: row.domain,
          scannedAt: row.scanned_at,
          number: row.number,
        })))
      }
      setLoading(false)
    }

    fetchRecords()
  }, [])

  const addRecord = useCallback(async (url: string): Promise<{ isNew: boolean; record: QRRecord }> => {
    const existing = records.find(r => r.url === url)
    if (existing) return { isNew: false, record: existing }

    const { data: { session } } = await supabase.auth.getSession()

    const { data, error } = await supabase
      .from('qr_records')
      .insert({
        user_id: session?.user?.id,
        url,
        domain: getDomain(url),
        number: records.length + 1,
      })
      .select('id, url, domain, scanned_at, number')
      .single()

    if (error) {
      // unique violation — URL already exists server-side
      if (error.code === '23505') {
        const dup = records.find(r => r.url === url)
        if (dup) return { isNew: false, record: dup }
      }
      throw new Error(error.message)
    }

    const record: QRRecord = {
      id: data.id,
      url: data.url,
      domain: data.domain,
      scannedAt: data.scanned_at,
      number: data.number,
    }
    setRecords(prev => [record, ...prev])
    return { isNew: true, record }
  }, [records])

  return { records, addRecord, loading }
}
