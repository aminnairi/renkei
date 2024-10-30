import { createRoot } from 'react-dom/client'
import App from './App'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { NotificationProvider } from './components/notification-provider';

createRoot(document.getElementById('root')!).render(
  <NotificationProvider>
    <App />
  </NotificationProvider>
)
