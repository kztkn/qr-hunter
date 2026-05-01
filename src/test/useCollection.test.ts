import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCollection } from '../hooks/useCollection'

// In-memory store shared between mock calls
const store: {
  id: string; url: string; domain: string; scanned_at: string; number: number; user_id: string
}[] = []

vi.mock('../lib/supabase', () => {
  const makeFromChain = () => ({
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockImplementation(async () => ({ data: [...store], error: null })),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockImplementation((row: { url: string; domain: string; number: number; user_id: string }) => ({
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => {
        // Simulate unique violation if url already exists
        if (store.some(r => r.url === row.url && r.user_id === row.user_id)) {
          return { data: null, error: { code: '23505', message: 'duplicate' } }
        }
        const record = {
          id: `id-${store.length}`,
          url: row.url,
          domain: row.domain,
          scanned_at: new Date().toISOString(),
          number: row.number,
          user_id: row.user_id,
        }
        store.push(record)
        return { data: record, error: null }
      }),
    })),
  })

  return {
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: 'mock-user' } } },
        }),
      },
      from: vi.fn().mockImplementation(() => makeFromChain()),
    },
  }
})

beforeEach(() => {
  store.length = 0
})

describe('useCollection', () => {
  it('初期状態は空', async () => {
    const { result } = renderHook(() => useCollection())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.records).toHaveLength(0)
  })

  it('新しいURLをスキャンするとコレクションに追加される', async () => {
    const { result } = renderHook(() => useCollection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    let ret: { isNew: boolean; record: { url: string; number: number } }
    await act(async () => {
      ret = await result.current.addRecord('https://example.com')
    })

    expect(ret!.isNew).toBe(true)
    expect(ret!.record.url).toBe('https://example.com')
    expect(ret!.record.number).toBe(1)
    expect(result.current.records).toHaveLength(1)
  })

  it('同じURLを再スキャンしても追加されない', async () => {
    const { result } = renderHook(() => useCollection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.addRecord('https://example.com') })
    let ret: { isNew: boolean }
    await act(async () => { ret = await result.current.addRecord('https://example.com') })

    expect(ret!.isNew).toBe(false)
    expect(result.current.records).toHaveLength(1)
  })

  it('異なるURLはそれぞれ追加される', async () => {
    const { result } = renderHook(() => useCollection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.addRecord('https://example.com') })
    await act(async () => { await result.current.addRecord('https://other.com') })

    expect(result.current.records).toHaveLength(2)
  })

  it('number は発見順に連番になる', async () => {
    const { result } = renderHook(() => useCollection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.addRecord('https://a.com') })
    await act(async () => { await result.current.addRecord('https://b.com') })
    await act(async () => { await result.current.addRecord('https://c.com') })

    const numbers = result.current.records.map(r => r.number).sort((a, b) => a - b)
    expect(numbers).toEqual([1, 2, 3])
  })

  it('domainが正しく抽出される', async () => {
    const { result } = renderHook(() => useCollection())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => { await result.current.addRecord('https://www.example.co.jp/path?q=1') })

    expect(result.current.records[0].domain).toBe('example.co.jp')
  })

  it('Supabaseに永続化され、再マウント時に復元される', async () => {
    const { result: r1 } = renderHook(() => useCollection())
    await waitFor(() => expect(r1.current.loading).toBe(false))
    await act(async () => { await r1.current.addRecord('https://example.com') })

    // New hook instance reads from the in-memory store (simulating Supabase)
    const { result: r2 } = renderHook(() => useCollection())
    await waitFor(() => expect(r2.current.loading).toBe(false))

    expect(r2.current.records).toHaveLength(1)
    expect(r2.current.records[0].url).toBe('https://example.com')
  })
})
