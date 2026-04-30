export interface QRRecord {
  id: string
  url: string
  domain: string
  scannedAt: string
  number: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  check: (records: QRRecord[]) => boolean
  unlockedAt?: string
}
