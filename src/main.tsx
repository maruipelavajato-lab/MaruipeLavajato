import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Prevent unhandled rejection crashes from blanking the screen
window.addEventListener('error', (event) => {
  console.warn('Capturado erro global na janela:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Capturada rejeição de promise na janela:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
