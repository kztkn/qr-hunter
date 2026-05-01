import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const toCredentials = (username: string) => ({
  email: `${username}@qrgo.app`,
  password: `${username}_qrgo_2026`,
})

export const useAuth = () => {
  const [ready, setReady] = useState(false)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user.email) {
        setUsername(session.user.email.replace('@qrgo.app', ''))
      }
      setReady(true)
    }
    init()
  }, [])

  const signIn = async (raw: string): Promise<{ error: string | null }> => {
    const username = raw.trim()
    if (!username) return { error: 'ユーザー名を入力してください' }

    const { email, password } = toCredentials(username)

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (!loginError) {
      setUsername(username)
      return { error: null }
    }

    // 存在しなければ新規作成
    if (loginError.message.includes('Invalid login credentials') || loginError.message.includes('invalid_credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) return { error: signUpError.message }
      setUsername(username)
      return { error: null }
    }

    return { error: loginError.message }
  }

  return { ready, username, signIn }
}
