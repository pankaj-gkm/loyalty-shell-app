import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/loyalty-shell-app">
      <Routes>
        <Route path="/" element={<div />} />
        <Route path=":storeIdentifier" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
