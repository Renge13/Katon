import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CardDemo from './pages/CardDemo.jsx'

/* Pilot route: /?cardDemo=1 renders the standalone image-card demo. */
const isCardDemo = new URLSearchParams(window.location.search).has('cardDemo')
const Root = isCardDemo ? CardDemo : App

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
