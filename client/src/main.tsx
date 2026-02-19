import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Swap SSR shell with React root when React has fully rendered
const onReady = () => {
  requestAnimationFrame(() => {
    // Show React root
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.classList.add('ready');
    }
    // Hide SSR shell
    const shell = document.getElementById('ssr-shell');
    if (shell) {
      shell.classList.add('hidden');
      setTimeout(() => shell.remove(), 50);
    }
  });
};

const root = createRoot(document.getElementById("root")!);
root.render(<App onReady={onReady} />);
