import { Route, Routes } from 'react-router-dom'
import { LinksPage } from '@/pages/Links.tsx'
import { NotFoundPage } from '@/pages/NotFound.tsx'
import { RedirectPage } from '@/pages/Redirect.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LinksPage />} />
      <Route path="/:shortCode" element={<RedirectPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
