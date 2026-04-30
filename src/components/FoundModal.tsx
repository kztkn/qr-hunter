import type { Achievement, QRRecord } from '../types'
import styles from './FoundModal.module.css'

interface Props {
  record: QRRecord
  isNew: boolean
  newAchievements: Achievement[]
  onClose: () => void
  onOpenUrl: () => void
}

export const FoundModal = ({ record, isNew, newAchievements, onClose, onOpenUrl }: Props) => (
  <div className={styles.overlay} onClick={onClose}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      {isNew ? (
        <>
          <div className={styles.badge}>#{record.number}</div>
          <div className={styles.emoji}>🎉</div>
          <h2 className={styles.title}>発見！</h2>
          <p className={styles.domain}>{record.domain}</p>
          {newAchievements.length > 0 && (
            <div className={styles.achievements}>
              {newAchievements.map(a => (
                <div key={a.id} className={styles.achievementBadge}>
                  {a.icon} 実績解除: {a.name}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className={styles.emoji}>👀</div>
          <h2 className={styles.title}>既発見</h2>
          <p className={styles.domain}>#{record.number} {record.domain}</p>
        </>
      )}

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onClose}>
          閉じる
        </button>
        <button className={styles.btnPrimary} onClick={onOpenUrl}>
          URLを開く
        </button>
      </div>
    </div>
  </div>
)
