import { useState } from 'react'
import styles from './Login.module.css'

type Props = {
  onSignIn: (username: string) => Promise<{ error: string | null }>
}

export const Login = ({ onSignIn }: Props) => {
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await onSignIn(input)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.logo}>QRGO</h1>
      <p className={styles.sub}>街中のQRコードを収集しよう</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          className={styles.input}
          type="text"
          placeholder="ユーザー名"
          value={input}
          onChange={e => setInput(e.target.value)}
          autoComplete="off"
          autoCapitalize="none"
        />
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? '接続中...' : 'はじめる'}
        </button>
      </form>
    </div>
  )
}
