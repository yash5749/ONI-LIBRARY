import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
import { AuthProvider } from "./context/AuthContext.tsx";
import AppRouter from './router/AppRouter.tsx';
import { Toaster } from "react-hot-toast";
import "./index.css";




createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <StrictMode>
      <AppRouter />
      <Toaster position="top-right" />
    </StrictMode>
  </AuthProvider>,
)
