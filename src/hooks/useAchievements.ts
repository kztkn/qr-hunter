import { useState, useEffect, useCallback } from 'react'
import { ACHIEVEMENTS } from '../data/achievements'
import type { Achievement, QRRecord } from '../types'
import { supabase } from '../lib/supabase'

export const useAchievements = () => {
  const [unlocked, setUnlocked] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchAchievements = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')

      if (data) {
        const map: Record<string, string> = {}
        data.forEach(row => { map[row.achievement_id] = row.unlocked_at })
        setUnlocked(map)
      }
    }

    fetchAchievements()
  }, [])

  const checkAndUnlock = useCallback(async (records: QRRecord[]): Promise<Achievement[]> => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    const now = new Date().toISOString()

    const newlyUnlocked: Achievement[] = []
    const toInsert: { user_id: string; achievement_id: string; unlocked_at: string }[] = []

    ACHIEVEMENTS.forEach(a => {
      if (!unlocked[a.id] && a.check(records)) {
        newlyUnlocked.push({ ...a, unlockedAt: now })
        if (userId) toInsert.push({ user_id: userId, achievement_id: a.id, unlocked_at: now })
      }
    })

    if (toInsert.length > 0) {
      await supabase
        .from('user_achievements')
        .upsert(toInsert, { onConflict: 'user_id,achievement_id', ignoreDuplicates: true })

      const newMap = { ...unlocked }
      toInsert.forEach(r => { newMap[r.achievement_id] = r.unlocked_at })
      setUnlocked(newMap)
    }

    return newlyUnlocked
  }, [unlocked])

  const achievements: Achievement[] = ACHIEVEMENTS.map(a => ({
    ...a,
    unlockedAt: unlocked[a.id],
  }))

  return { achievements, checkAndUnlock }
}
