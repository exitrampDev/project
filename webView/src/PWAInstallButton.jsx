import React, { useEffect, useState } from "react";

const PWAInstallButton = () => {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const updateInstallPrompt = () => {
      setInstallPrompt(window.deferredPWAInstallPrompt || null);
    };

    updateInstallPrompt();

    window.addEventListener(
      "pwa-install-available",
      updateInstallPrompt
    );

    const handleInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener("pwa-installed", handleInstalled);

    return () => {
      window.removeEventListener(
        "pwa-install-available",
        updateInstallPrompt
      );

      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();

    const { outcome } = await installPrompt.userChoice;

    console.log("PWA install result:", outcome);

    window.deferredPWAInstallPrompt = null;
    setInstallPrompt(null);
  };

  if (!installPrompt) {
    return null;
  }

  return (
    <button onClick={handleInstall}>
      Install ExitRamp App
    </button>
  );
};

export default PWAInstallButton;