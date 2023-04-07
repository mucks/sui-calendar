import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@suiet/wallet-kit/style.css';
import { WalletProvider } from '@suiet/wallet-kit'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </React.StrictMode>,
)
