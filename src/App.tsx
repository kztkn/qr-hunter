import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Scanner } from './pages/Scanner'
import { Collection } from './pages/Collection'
import { Achievements } from './pages/Achievements'

export type Page = 'scanner' | 'collection' | 'achievements'

function App() {
  const [page, setPage] = useState<Page>('scanner')

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
