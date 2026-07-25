import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from "react-hot-toast";

import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
  duration: 900,
  once: true,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      reverseOrder={false}
    />
  </StrictMode>,
)
