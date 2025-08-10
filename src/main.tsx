import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('Service worker registered:', reg))
      .catch(err => console.log('Service worker registration failed:', err));
  });
}

// Optional: offline badge logic
window.addEventListener('offline', () => {
  const status = document.getElementById('offline-status');
  if (status) status.style.display = 'inline';
});
window.addEventListener('online', () => {
  const status = document.getElementById('offline-status');
  if (status) status.style.display = 'none';
});
