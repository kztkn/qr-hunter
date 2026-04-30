import type { Achievement, QRRecord } from '../types'

const getDomains = (records: QRRecord[]) => [...new Set(records.map(r => r.domain))]

const getHour = (iso: string) => new Date(iso).getHours()

const getDateStr = (iso: string) => iso.slice(0, 10)

const hasConsecutiveDays = (records: QRRecord[], days: number) => {
  const dates = [...new Set(records.map(r => getDateStr(r.scannedAt)))].sort()
  if (dates.length < days) return false
  for (let i = 0; i <= dates.length - days; i++) {
    let consecutive = true
    for (let j = 1; j < days; j++) {
      const prev = new Date(dates[i + j - 1])
      const curr = new Date(dates[i + j])
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff !== 1) { consecutive = false; break }
    }
    if (consecutive) return true
  }
  return false
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first',
    name: 'はじめての発見',
    description: '初めてQRコードをスキャンした',
    icon: '🔍',
    check: (r) => r.length >= 1,
  },
  {
    id: 'collector10',
    name: 'コレクター',
    description: '10個のQRコードを発見した',
    icon: '📦',
    check: (r) => r.length >= 10,
  },
  {
    id: 'hunter50',
    name: 'ハンター',
    description: '50個のQRコードを発見した',
    icon: '🏃',
    check: (r) => r.length >= 50,
  },
  {
    id: 'legend100',
    name: 'レジェンド',
    description: '100個のQRコードを発見した',
    icon: '💯',
    check: (r) => r.length >= 100,
  },
  {
    id: 'domain_master',
    name: 'ドメインマスター',
    description: '同じドメインのQRを5個以上発見した',
    icon: '🌐',
    check: (r) => {
      const counts: Record<string, number> = {}
      r.forEach(rec => { counts[rec.domain] = (counts[rec.domain] || 0) + 1 })
      return Object.values(counts).some(c => c >= 5)
    },
  },
  {
    id: 'variety',
    name: 'バラエティ',
    description: '5種類の異なるドメインを発見した',
    icon: '🎨',
    check: (r) => getDomains(r).length >= 5,
  },
  {
    id: 'early_bird',
    name: '早起きハンター',
    description: '朝6時前にQRコードをスキャンした',
    icon: '🌅',
    check: (r) => r.some(rec => getHour(rec.scannedAt) < 6),
  },
  {
    id: 'night_owl',
    name: '夜の探索者',
    description: '深夜0時以降にQRコードをスキャンした',
    icon: '🌙',
    check: (r) => r.some(rec => getHour(rec.scannedAt) >= 0 && getHour(rec.scannedAt) < 4),
  },
  {
    id: 'speed',
    name: '爆速コレクター',
    description: '1日に5個以上スキャンした',
    icon: '⚡',
    check: (r) => {
      const counts: Record<string, number> = {}
      r.forEach(rec => { const d = getDateStr(rec.scannedAt); counts[d] = (counts[d] || 0) + 1 })
      return Object.values(counts).some(c => c >= 5)
    },
  },
  {
    id: 'streak',
    name: '継続は力なり',
    description: '3日連続でQRコードをスキャンした',
    icon: '📅',
    check: (r) => hasConsecutiveDays(r, 3),
  },
]
