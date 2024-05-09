import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";
import "./style.css";

const root = ReactDOM.createRoot(document.getElementById("bookme-assistance"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
