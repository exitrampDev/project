import React, { useEffect, useState } from "react";

const PWAInstallButton = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const updateInstallPrompt = () => {
      setInstallPrompt(
        window.deferredPWAInstallPrompt || null
      );
    };

    updateInstallPrompt();

    window.addEventListener(
      "pwa-install-available",
      updateInstallPrompt
    );

    const handleInstalled = () => {
      console.log("PWA installed");

      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener(
      "pwa-installed",
      handleInstalled
    );

    // Check whether the app is currently installed
    const checkInstalled = () => {
      const standalone =
        window.matchMedia(
          "(display-mode: standalone)"
        ).matches;

      const iosStandalone =
        window.navigator.standalone === true;

      setIsInstalled(
        standalone || iosStandalone
      );
    };

    checkInstalled();

    return () => {
      window.removeEventListener(
        "pwa-install-available",
        updateInstallPrompt
      );

      window.removeEventListener(
        "pwa-installed",
        handleInstalled
      );
    };
  }, []);

  const handleInstall = async () => {
    // Native browser install prompt available
    if (installPrompt) {
      try {
        await installPrompt.prompt();

        const { outcome } =
          await installPrompt.userChoice;

        console.log(
          "PWA install result:",
          outcome
        );

        // Prompt can only be used once
        window.deferredPWAInstallPrompt = null;
        setInstallPrompt(null);
      } catch (error) {
        console.error(
          "PWA installation failed:",
          error
        );
      }

      return;
    }

    // Native prompt isn't currently available
    setShowInstructions(true);
  };

  // Don't show the button if the app is currently installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <div className="pwa-install-button">
        <button
          type="button"
          onClick={handleInstall}
        >
         <i className="pi pi-download"></i> Install ExitRamp
        </button>
      </div>

      {showInstructions && (
        <div className="install-popup">
          <div className="install-popup-content">

            <h2>Install ExitRamp</h2>

            <p>
              The automatic installation prompt is
              currently unavailable.
            </p>

            <p>
              Open your browser menu and choose:
            </p>

            <strong>
              Install and create shortcut
            </strong>

            <br />
            <br />

            <button
              type="button"
              onClick={() =>
                setShowInstructions(false)
              }
            >
              Close
            </button>

          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallButton;