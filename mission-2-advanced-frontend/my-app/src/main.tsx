import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './store/redux/store.ts'
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
    {/* Provider menghubungkan Redux store ke seluruh komponen anak */}
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
