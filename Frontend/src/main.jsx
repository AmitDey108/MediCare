import React from "react";
import ReactDOM from "react-dom/client";
import AppProvider from "./context/AppProvider";

document.documentElement.dataset.build = "2026-03-29-01";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider />
  </React.StrictMode>
);
