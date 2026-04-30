import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCollection } from '../hooks/useCollection'

beforeEach(() => {
  localStorage.clear()
})

describe('useCollection', () => {
  it('初期状態は空', () => {
    const { result } = renderHook(() => useCollection())
    expect(result.current.records).toHaveLength(0)
  })

  it('新しいURLをスキャンするとコレクションに追加される', () => {
    const { result } = renderHook(() => useCollection())

    act(() => {
      const r = result.current.addRecord('https://example.com')
      expect(r.isNew).toBe(true)
      expect(r.record.url).toBe('https://example.com')
      expect(r.record.number).toBe(1)
    })

    expect(result.current.records).toHaveLength(1)
  })

  it('同じURLを再スキャンしても追加されない', () => {
    const { result } = renderHook(() => useCollection())

    act(() => { result.current.addRecord('https://example.com') })
    act(() => {
      const r = result.current.addRecord('https://example.com')
      expect(r.isNew).toBe(false)
    })

    expect(result.current.records).toHaveLength(1)
  })

  it('異なるURLはそれぞれ追加される', () => {
    const { result } = renderHook(() => useCollection())

    act(() => { result.current.addRecord('https://example.com') })
    act(() => { result.current.addRecord('https://other.com') })

    expect(result.current.records).toHaveLength(2)
  })

  it('number は発見順に連番になる', () => {
    const { result } = renderHook(() => useCollection())

    act(() => { result.current.addRecord('https://a.com') })
    act(() => { result.current.addRecord('https://b.com') })
    act(() => { result.current.addRecord('https://c.com') })

    const numbers = result.current.records.map(r => r.number).sort((a, b) => a - b)
    expect(numbers).toEqual([1, 2, 3])
  })

  it('domainが正しく抽出される', () => {
    const { result } = renderHook(() => useCollection())

    act(() => { result.current.addRecord('https://www.example.co.jp/path?q=1') })

    expect(result.current.records[0].domain).toBe('example.co.jp')
  })

  it('localStorageに永続化される', () => {
    const { result: r1 } = renderHook(() => useCollection())
    act(() => { r1.current.addRecord('https://example.com') })

    const { result: r2 } = renderHook(() => useCollection())
    expect(r2.current.records).toHaveLength(1)
    expect(r2.current.records[0].url).toBe('https://example.com')
  })
})
