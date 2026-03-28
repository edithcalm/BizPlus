/**
 * Entry point for the BizPlus React application.
 * Bootstraps the root component into the DOM.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
