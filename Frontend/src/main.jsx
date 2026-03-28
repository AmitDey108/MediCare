import React from "react";
import ReactDOM from "react-dom/client";
import AppProvider from "./context/AppProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProvider />
  </React.StrictMode>
);
