import { useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import type { QRRecord } from '../types'
import styles from './Collection.module.css'

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

const RecordCard = ({ record }: { record: QRRecord }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={styles.card} onClick={() => setExpanded(e => !e)}>
      <div className={styles.cardHeader}>
        <span className={styles.number}>#{record.number}</span>
        <div className={styles.cardInfo}>
          <span className={styles.domain}>{record.domain}</span>
          <span className={styles.date}>{formatDate(record.scannedAt)}</span>
        </div>
      </div>
      {expanded && (
        <div className={styles.expanded}>
          <p className={styles.url}>{record.url}</p>
          <a
            className={styles.openBtn}
            href={record.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
          >
            URLを開く →
          </a>
        </div>
      )}
    </div>
  )
}

export const Collection = () => {
  const { records } = useCollection()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>コレクション</h2>
        <span className={styles.total}>{records.length}個発見</span>
      </div>

      {records.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>📭</p>
          <p>まだQRコードを発見していません</p>
          <p className={styles.emptyHint}>スキャン画面から始めよう</p>
        </div>
      ) : (
        <div className={styles.list}>
          {records.map(r => <RecordCard key={r.id} record={r} />)}
        </div>
      )}
    </div>
  )
}
