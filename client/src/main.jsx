import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";

import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
  duration: 900,
  once: true,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <ThemeProvider>

      <UserProvider>

        <App />

        <Toaster
          position="top-right"
          reverseOrder={false}
        />

      </UserProvider>

    </ThemeProvider>

  </StrictMode>
);