import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
)


//TODO: issue with browser suggesting to save password even tho user just presses the link (not that serious tho)
//TODO: modals
//TODO: add some delays on some actions to make it believable
//TODO: consider throwing out the px for padding/gaps and move to cqw and clamps (and replace all px in clamps with rem)