import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import Dashboard from "./pages/Dashboard";
import Kasir from "./pages/Kasir";
import Produksi from "./pages/Produksi";
import Admin from "./pages/Admin";
import Migrate from "./pages/Migrate";
import UpdatePrice from "./pages/UpdatePrice"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/kasir" element={<Kasir />} />
        <Route path="/produksi" element={<Produksi />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/migrate" element={<Migrate />} />
        <Route path="/update-harga" element={<UpdatePrice />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
