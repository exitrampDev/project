import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import AppWrapper from "./AppWrapper";
import { RecoilRoot } from "recoil";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import "./index.css";
import PWAInstallButton from "./PWAInstallButton";

registerSW({
  onNeedRefresh() {
    console.log("New version available");
  },
  onOfflineReady() {
    console.log("App is ready to work offline");
  },
});

function PWAInstallManager() {
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();

      // Store the install prompt globally
      window.deferredPWAInstallPrompt = event;

      // Tell React components that installation is available
      window.dispatchEvent(new Event("pwa-install-available"));
    };

    const handleAppInstalled = () => {
      window.deferredPWAInstallPrompt = null;
      window.dispatchEvent(new Event("pwa-installed"));
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );

      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <PWAInstallManager />
        <PWAInstallButton />
        <AppWrapper />
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);