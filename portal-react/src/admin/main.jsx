import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/inter/index.css';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/admin.css';
import AdminApp from './AdminApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
