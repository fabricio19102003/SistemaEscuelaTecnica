import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Buffer } from 'buffer';

// @ts-ignore
window.global = window;
// @ts-ignore
window.Buffer = window.Buffer || Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
