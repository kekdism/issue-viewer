import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import GithubProvider from "./apollo/GithubProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <GithubProvider>
      <App />
    </GithubProvider>
  </React.StrictMode>
);
