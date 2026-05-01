import { Lock, CheckCircle } from 'lucide-react'
import { useAchievements } from '../hooks/useAchievements'
import styles from './Achievements.module.css'

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export const Achievements = () => {
  const { achievements } = useAchievements()
  const unlockedCount = achievements.filter(a => a.unlockedAt).length

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>実績</h2>
        <span className={styles.progress}>{unlockedCount}/{achievements.length}</span>
      </div>

      <div className={styles.grid}>
        {achievements.map(a => (
          <div key={a.id} className={`${styles.card} ${a.unlockedAt ? styles.unlocked : styles.locked}`}>
            <div className={styles.icon}>
              {a.unlockedAt ? a.icon : <Lock size={28} strokeWidth={1.5} />}
            </div>
            <div className={styles.info}>
              <p className={styles.name}>{a.name}</p>
              <p className={styles.desc}>{a.description}</p>
              {a.unlockedAt
                ? <p className={styles.date}><CheckCircle size={11} style={{ display: 'inline', marginRight: 3 }} />{formatDate(a.unlockedAt)}</p>
                : <p className={styles.lockedLabel}>未解除</p>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
