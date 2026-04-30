import type { Achievement, QRRecord } from '../types'

const getDomains = (records: QRRecord[]) => [...new Set(records.map(r => r.domain))]

const getHour = (iso: string) => new Date(iso).getHours()

const getDayOfWeek = (iso: string) => new Date(iso).getDay()

const getDateStr = (iso: string) => iso.slice(0, 10)

const inRange = (iso: string, from: number, to: number) => {
  const h = getHour(iso)
  return h >= from && h < to
}

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

const SNS_DOMAINS = ['twitter.com', 'x.com', 'instagram.com', 'tiktok.com', 'line.me', 'youtube.com', 'facebook.com']
const SHOP_DOMAINS = ['amazon.co.jp', 'amazon.com', 'rakuten.co.jp', 'yahoo.co.jp', 'zozotown.com', 'mercari.com']

export const ACHIEVEMENTS: Achievement[] = [
  // 数量系
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
    id: 'god200',
    name: 'QR神',
    description: '200個のQRコードを発見した',
    icon: '👑',
    check: (r) => r.length >= 200,
  },

  // 時間帯系（完全に重複なし）
  {
    id: 'midnight',
    name: '深夜の探索者',
    description: '深夜0時〜4時にスキャンした',
    icon: '🌙',
    check: (r) => r.some(rec => inRange(rec.scannedAt, 0, 4)),
  },
  {
    id: 'early_bird',
    name: '早朝ハンター',
    description: '早朝4時〜7時にスキャンした',
    icon: '🌅',
    check: (r) => r.some(rec => inRange(rec.scannedAt, 4, 7)),
  },
  {
    id: 'lunch',
    name: 'ランチスキャナー',
    description: 'お昼12時〜13時にスキャンした',
    icon: '🍱',
    check: (r) => r.some(rec => inRange(rec.scannedAt, 12, 13)),
  },
  {
    id: 'night_active',
    name: '夜活ハンター',
    description: '夜21時〜24時にスキャンした',
    icon: '🌆',
    check: (r) => r.some(rec => inRange(rec.scannedAt, 21, 24)),
  },

  // 曜日系
  {
    id: 'monday',
    name: '月曜ハンター',
    description: '月曜日にスキャンした（やる気あるじゃん）',
    icon: '😤',
    check: (r) => r.some(rec => getDayOfWeek(rec.scannedAt) === 1),
  },
  {
    id: 'weekend',
    name: '週末探索者',
    description: '土日にスキャンした',
    icon: '🎉',
    check: (r) => r.some(rec => [0, 6].includes(getDayOfWeek(rec.scannedAt))),
  },

  // ドメイン系
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
    id: 'variety5',
    name: 'バラエティ',
    description: '5種類の異なるドメインを発見した',
    icon: '🎨',
    check: (r) => getDomains(r).length >= 5,
  },
  {
    id: 'variety10',
    name: 'ワールドトラベラー',
    description: '10種類以上の異なるドメインを発見した',
    icon: '🗺️',
    check: (r) => getDomains(r).length >= 10,
  },
  {
    id: 'sns',
    name: 'SNSハンター',
    description: 'SNS系のQRコードを発見した',
    icon: '📱',
    check: (r) => r.some(rec => SNS_DOMAINS.some(d => rec.domain.includes(d))),
  },
  {
    id: 'shopping',
    name: 'ショッピング探偵',
    description: '通販・ショッピング系のQRを発見した',
    icon: '🛒',
    check: (r) => r.some(rec => SHOP_DOMAINS.some(d => rec.domain.includes(d))),
  },

  // 習慣・スピード系
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
    id: 'streak3',
    name: '継続は力なり',
    description: '3日連続でスキャンした',
    icon: '📅',
    check: (r) => hasConsecutiveDays(r, 3),
  },
  {
    id: 'streak7',
    name: '週間チャレンジャー',
    description: '7日連続でスキャンした',
    icon: '🔥',
    check: (r) => hasConsecutiveDays(r, 7),
  },
]
