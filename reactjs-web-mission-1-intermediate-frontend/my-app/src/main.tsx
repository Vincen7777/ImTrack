import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import "./styles/global.css";
import "./styles/layout.css";
import "./styles/pages.css";
import "./styles/toast.css";
import "./styles/auth.css";
import "./styles/components.css";
import "./styles/beranda.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
