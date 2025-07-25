import './style.css'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ThemeProvider } from '@/integrations/theme/ThemeProvider'
import { ShadowProvider } from '@/integrations/shadow/ShadowProvider'

createRoot(document.getElementById('root')!).render(
  <ShadowProvider container={document.body}>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </ShadowProvider>,
)
