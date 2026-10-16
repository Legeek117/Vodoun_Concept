import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RootRouter from './RootRouter.jsx'
import { SoundProvider } from './context/SoundContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'

// Empêche le navigateur de restaurer la position du scroll automatiquement.
// On gère ça manuellement via SmoothScroll (Lenis) pour toujours commencer en haut.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CurrencyProvider>
      <SoundProvider>
        <RootRouter />
      </SoundProvider>
    </CurrencyProvider>
  </StrictMode>,
)
