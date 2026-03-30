import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UrbanFarm from './UrbanFarm'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UrbanFarm />
  </StrictMode>,
)
