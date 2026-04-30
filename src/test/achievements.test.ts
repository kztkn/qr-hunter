import { describe, it, expect } from 'vitest'
import { ACHIEVEMENTS } from '../data/achievements'
import type { QRRecord } from '../types'

const makeRecord = (overrides: Partial<QRRecord> = {}): QRRecord => ({
  id: crypto.randomUUID(),
  url: 'https://example.com',
  domain: 'example.com',
  scannedAt: new Date('2024-06-15T10:00:00').toISOString(),
  number: 1,
  ...overrides,
})

const at = (hour: number, date = '2024-06-15') =>
  new Date(`${date}T${String(hour).padStart(2, '0')}:00:00`).toISOString()

const find = (id: string) => ACHIEVEMENTS.find(a => a.id === id)!

describe('数量系実績', () => {
  it('はじめての発見: 1個でアンロック', () => {
    expect(find('first').check([makeRecord()])).toBe(true)
    expect(find('first').check([])).toBe(false)
  })

  it('コレクター: 10個でアンロック', () => {
    const r10 = Array.from({ length: 10 }, () => makeRecord())
    expect(find('collector10').check(r10)).toBe(true)
    expect(find('collector10').check(r10.slice(0, 9))).toBe(false)
  })

  it('ハンター: 50個でアンロック', () => {
    const r50 = Array.from({ length: 50 }, () => makeRecord())
    expect(find('hunter50').check(r50)).toBe(true)
    expect(find('hunter50').check(r50.slice(0, 49))).toBe(false)
  })

  it('レジェンド: 100個でアンロック', () => {
    const r100 = Array.from({ length: 100 }, () => makeRecord())
    expect(find('legend100').check(r100)).toBe(true)
  })

  it('QR神: 200個でアンロック', () => {
    const r200 = Array.from({ length: 200 }, () => makeRecord())
    expect(find('god200').check(r200)).toBe(true)
    expect(find('god200').check(r200.slice(0, 199))).toBe(false)
  })
})

describe('時間帯系実績', () => {
  it('深夜の探索者: 0〜4時', () => {
    expect(find('midnight').check([makeRecord({ scannedAt: at(2) })])).toBe(true)
    expect(find('midnight').check([makeRecord({ scannedAt: at(0) })])).toBe(true)
    expect(find('midnight').check([makeRecord({ scannedAt: at(4) })])).toBe(false)
    expect(find('midnight').check([makeRecord({ scannedAt: at(10) })])).toBe(false)
  })

  it('早朝ハンター: 4〜7時', () => {
    expect(find('early_bird').check([makeRecord({ scannedAt: at(5) })])).toBe(true)
    expect(find('early_bird').check([makeRecord({ scannedAt: at(4) })])).toBe(true)
    expect(find('early_bird').check([makeRecord({ scannedAt: at(7) })])).toBe(false)
    expect(find('early_bird').check([makeRecord({ scannedAt: at(3) })])).toBe(false)
  })

  it('ランチスキャナー: 12〜13時', () => {
    expect(find('lunch').check([makeRecord({ scannedAt: at(12) })])).toBe(true)
    expect(find('lunch').check([makeRecord({ scannedAt: at(13) })])).toBe(false)
    expect(find('lunch').check([makeRecord({ scannedAt: at(11) })])).toBe(false)
  })

  it('夜活ハンター: 21〜24時', () => {
    expect(find('night_active').check([makeRecord({ scannedAt: at(22) })])).toBe(true)
    expect(find('night_active').check([makeRecord({ scannedAt: at(20) })])).toBe(false)
  })

  it('時間帯は互いに重複しない', () => {
    const timeIds = ['midnight', 'early_bird', 'lunch', 'night_active']
    const hours = [2, 5, 12, 22]
    hours.forEach((h, i) => {
      const record = [makeRecord({ scannedAt: at(h) })]
      timeIds.forEach((id, j) => {
        expect(find(id).check(record)).toBe(i === j)
      })
    })
  })
})

describe('曜日系実績', () => {
  it('月曜ハンター: 月曜日にスキャン', () => {
    const monday = [makeRecord({ scannedAt: new Date('2024-06-17T10:00:00').toISOString() })]
    const tuesday = [makeRecord({ scannedAt: new Date('2024-06-18T10:00:00').toISOString() })]
    expect(find('monday').check(monday)).toBe(true)
    expect(find('monday').check(tuesday)).toBe(false)
  })

  it('週末探索者: 土日にスキャン', () => {
    const saturday = [makeRecord({ scannedAt: new Date('2024-06-15T10:00:00').toISOString() })]
    const sunday = [makeRecord({ scannedAt: new Date('2024-06-16T10:00:00').toISOString() })]
    const weekday = [makeRecord({ scannedAt: new Date('2024-06-17T10:00:00').toISOString() })]
    expect(find('weekend').check(saturday)).toBe(true)
    expect(find('weekend').check(sunday)).toBe(true)
    expect(find('weekend').check(weekday)).toBe(false)
  })
})

describe('ドメイン系実績', () => {
  it('ドメインマスター: 同じドメイン5個以上', () => {
    const same = Array.from({ length: 5 }, (_, i) =>
      makeRecord({ url: `https://example.com/page${i}`, domain: 'example.com' })
    )
    expect(find('domain_master').check(same)).toBe(true)
    expect(find('domain_master').check(same.slice(0, 4))).toBe(false)
  })

  it('バラエティ: 5種類以上のドメイン', () => {
    const varied = Array.from({ length: 5 }, (_, i) =>
      makeRecord({ domain: `site${i}.com` })
    )
    expect(find('variety5').check(varied)).toBe(true)
    expect(find('variety5').check(varied.slice(0, 4))).toBe(false)
  })

  it('ワールドトラベラー: 10種類以上のドメイン', () => {
    const varied = Array.from({ length: 10 }, (_, i) =>
      makeRecord({ domain: `site${i}.com` })
    )
    expect(find('variety10').check(varied)).toBe(true)
    expect(find('variety10').check(varied.slice(0, 9))).toBe(false)
  })

  it('SNSハンター: SNS系ドメインを発見', () => {
    const twitter = [makeRecord({ domain: 'twitter.com' })]
    const instagram = [makeRecord({ domain: 'instagram.com' })]
    const other = [makeRecord({ domain: 'example.com' })]
    expect(find('sns').check(twitter)).toBe(true)
    expect(find('sns').check(instagram)).toBe(true)
    expect(find('sns').check(other)).toBe(false)
  })

  it('ショッピング探偵: ショッピング系ドメインを発見', () => {
    const amazon = [makeRecord({ domain: 'amazon.co.jp' })]
    const other = [makeRecord({ domain: 'example.com' })]
    expect(find('shopping').check(amazon)).toBe(true)
    expect(find('shopping').check(other)).toBe(false)
  })
})

describe('習慣・スピード系実績', () => {
  it('爆速コレクター: 1日に5個以上', () => {
    const sameDay = Array.from({ length: 5 }, () =>
      makeRecord({ scannedAt: at(10) })
    )
    expect(find('speed').check(sameDay)).toBe(true)
    expect(find('speed').check(sameDay.slice(0, 4))).toBe(false)
  })

  it('継続は力なり: 3日連続', () => {
    const streak = ['2024-06-13', '2024-06-14', '2024-06-15'].map(d =>
      makeRecord({ scannedAt: at(10, d) })
    )
    expect(find('streak3').check(streak)).toBe(true)
    const gap = ['2024-06-13', '2024-06-15'].map(d =>
      makeRecord({ scannedAt: at(10, d) })
    )
    expect(find('streak3').check(gap)).toBe(false)
  })

  it('週間チャレンジャー: 7日連続', () => {
    const week = Array.from({ length: 7 }, (_, i) => {
      const d = new Date('2024-06-10')
      d.setDate(d.getDate() + i)
      return makeRecord({ scannedAt: d.toISOString() })
    })
    expect(find('streak7').check(week)).toBe(true)
    expect(find('streak7').check(week.slice(0, 6))).toBe(false)
  })
})
