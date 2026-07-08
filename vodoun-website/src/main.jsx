import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RootRouter from './RootRouter.jsx'
import { SoundProvider } from './context/SoundContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrencyProvider>
      <SoundProvider>
        <RootRouter />
      </SoundProvider>
    </CurrencyProvider>
  </StrictMode>,
)
