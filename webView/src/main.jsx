import React from "react";
import ReactDOM from "react-dom/client";
import AppWrapper from "./AppWrapper";
import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import "./index.css";


registerSW({
  onNeedRefresh() {
    console.log("New version available");
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
});


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <AppWrapper />
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
