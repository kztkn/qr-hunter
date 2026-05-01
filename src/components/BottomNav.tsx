import { ScanQrCode, Library, Trophy } from 'lucide-react'
import type { Page } from '../App'
import styles from './BottomNav.module.css'

interface Props {
  current: Page
  onChange: (page: Page) => void
}

const TABS: { id: Page; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: 'scanner', label: 'スキャン', Icon: ScanQrCode },
  { id: 'collection', label: 'コレクション', Icon: Library },
  { id: 'achievements', label: '実績', Icon: Trophy },
]

export const BottomNav = ({ current, onChange }: Props) => (
  <nav className={styles.nav}>
    {TABS.map(({ id, label, Icon }) => (
      <button
        key={id}
        className={`${styles.tab} ${current === id ? styles.active : ''}`}
        onClick={() => onChange(id)}
      >
        <Icon size={22} />
        <span className={styles.label}>{label}</span>
      </button>
    ))}
  </nav>
)
