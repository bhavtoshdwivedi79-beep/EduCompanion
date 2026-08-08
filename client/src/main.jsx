import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./context/ThemeContext";
import { UserProvider } from "./context/UserContext";
import { NotificationProvider } from "./context/NotificationContext";

import AOS from "aos";
import "aos/dist/aos.css";

AOS.init({
  duration: 900,
  once: true,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>

    <ThemeProvider>

      <NotificationProvider>

        <UserProvider>

          <App />

          <Toaster
            position="top-right"
            reverseOrder={false}
          />

        </UserProvider>

      </NotificationProvider>

    </ThemeProvider>

  </StrictMode>
);