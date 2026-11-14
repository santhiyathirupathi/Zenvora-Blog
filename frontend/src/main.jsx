import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import App from "./App.jsx";
import Admin from "./Admin.jsx";
import BlogList from "./BlogList.jsx";
import BlogDetails from "./BlogDetails.jsx";

import "./index.css";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/blogs" element={<BlogList />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
