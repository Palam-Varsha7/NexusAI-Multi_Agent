import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { installApiFetchFallback } from "./lib/apiFetchFallback.js";
import "./index.css";

installApiFetchFallback();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
