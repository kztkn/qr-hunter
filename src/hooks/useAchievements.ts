import { useState, useCallback } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import type { Achievement, QRRecord } from '../types'

const STORAGE_KEY = 'qr-hunter-achievements'

const loadUnlocked = (): Record<string, string> => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

export const useAchievements = () => {
  const [unlocked, setUnlocked] = useState<Record<string, string>>(loadUnlocked)

  const checkAndUnlock = useCallback((records: QRRecord[]): Achievement[] => {
    const current = loadUnlocked()
    const newlyUnlocked: Achievement[] = []

    ACHIEVEMENTS.forEach(a => {
      if (!current[a.id] && a.check(records)) {
        current[a.id] = new Date().toISOString()
        newlyUnlocked.push(a)
      }
    })

    if (newlyUnlocked.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
      setUnlocked({ ...current })
    }

    return newlyUnlocked
  }, [])

  const achievements: Achievement[] = ACHIEVEMENTS.map(a => ({
    ...a,
    unlockedAt: unlocked[a.id],
  }))

  return { achievements, checkAndUnlock }
}
