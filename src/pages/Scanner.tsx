import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { FoundModal } from '../components/FoundModal'
import { useCollection } from '../hooks/useCollection'
import { useAchievements } from '../hooks/useAchievements'
import type { Achievement, QRRecord } from '../types'
import styles from './Scanner.module.css'

export const Scanner = () => {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [found, setFound] = useState<{ record: QRRecord; isNew: boolean; achievements: Achievement[] } | null>(null)

  const { records, addRecord } = useCollection()
  const { checkAndUnlock } = useAchievements()

  const startScan = async () => {
    setError('')
    try {
      const scanner = new Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const { isNew, record } = addRecord(decodedText)
          const newAchievements = isNew ? checkAndUnlock([record, ...records]) : []
          setFound({ record, isNew, achievements: newAchievements })
          scanner.stop().catch(() => {})
          setScanning(false)
        },
        () => {}
      )
      setScanning(true)
    } catch {
      setError('カメラへのアクセスを許可してください')
    }
  }

  const stopScan = () => {
    scannerRef.current?.stop().catch(() => {})
    setScanning(false)
  }

  useEffect(() => () => { scannerRef.current?.stop().catch(() => {}) }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.logo}>QRハンター</h1>
        <div className={styles.count}>
          <span className={styles.countNum}>{records.length}</span>
          <span className={styles.countLabel}>発見</span>
        </div>
      </div>

      <div className={styles.viewfinder}>
        <div id="qr-reader" className={styles.qrReader} />
        {!scanning && (
          <div className={styles.placeholder}>
            <div className={styles.corner} />
            <p className={styles.placeholderText}>QRコードを探そう</p>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.controls}>
        {scanning ? (
          <button className={styles.btnStop} onClick={stopScan}>停止</button>
        ) : (
          <button className={styles.btnStart} onClick={startScan}>📷 スキャン開始</button>
        )}
      </div>

      {found && (
        <FoundModal
          record={found.record}
          isNew={found.isNew}
          newAchievements={found.achievements}
          onClose={() => setFound(null)}
          onOpenUrl={() => { window.open(found.record.url, '_blank'); setFound(null) }}
        />
      )}
    </div>
  )
}
