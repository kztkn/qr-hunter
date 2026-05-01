import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Scanner } from './pages/Scanner'
import { Collection } from './pages/Collection'
import { Achievements } from './pages/Achievements'
import { Login } from './pages/Login'
import { useAuth } from './hooks/useAuth'

export type Page = 'scanner' | 'collection' | 'achievements'

function App() {
  const [page, setPage] = useState<Page>('scanner')
  const { ready, username, signIn } = useAuth()

  if (!ready) {
    return (
      <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#888' }}>
        読み込み中...
      </div>
    )
  }

  if (!username) return <Login onSignIn={signIn} />

  return (
    <>
      {page === 'scanner' && <Scanner />}
      {page === 'collection' && <Collection />}
      {page === 'achievements' && <Achievements />}
      <BottomNav current={page} onChange={setPage} />
    </>
  )
}

export default App
