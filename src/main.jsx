import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Dashboard from "./pages/Dashboard";
import Kasir from "./pages/Kasir";
import Produksi from "./pages/Produksi";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kasir" element={<Kasir />} />
        <Route path="/produksi" element={<Produksi />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
