import type { Page } from '../App'
import styles from './BottomNav.module.css'

interface Props {
  current: Page
  onChange: (page: Page) => void
}

const TABS: { id: Page; label: string; icon: string }[] = [
  { id: 'scanner', label: 'スキャン', icon: '📷' },
  { id: 'collection', label: 'コレクション', icon: '📚' },
  { id: 'achievements', label: '実績', icon: '🏆' },
]

export const BottomNav = ({ current, onChange }: Props) => (
  <nav className={styles.nav}>
    {TABS.map(tab => (
      <button
        key={tab.id}
        className={`${styles.tab} ${current === tab.id ? styles.active : ''}`}
        onClick={() => onChange(tab.id)}
      >
        <span className={styles.icon}>{tab.icon}</span>
        <span className={styles.label}>{tab.label}</span>
      </button>
    ))}
  </nav>
)
