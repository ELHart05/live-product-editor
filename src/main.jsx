import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { FontProvider } from './components/fontContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MantineProvider>
      <FontProvider>
        <App />
      </FontProvider>
    </MantineProvider>
  </StrictMode>,
)
