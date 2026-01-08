import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./hooks/use-pwa";

// Register service worker for PWA support
if (import.meta.env.PROD) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      console.log("PWA: Service worker registered successfully");
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
