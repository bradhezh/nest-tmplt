import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import {setupAxiosInterceptor} from '@/lib/axios'
import {Toaster} from '@/components/ui/sonner'
import Items from '@/components/Items'
import Login from '@/components/Login'
import NotFound from '@/components/NotFound'

export const App = () => {
  setupAxiosInterceptor()

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Items />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </>
  )
}

export default App
