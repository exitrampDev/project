import React, { useEffect, useState } from "react";

const PWAInstallButton = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    const updateInstallPrompt = () => {
      setInstallPrompt(window.deferredPWAInstallPrompt || null);
    };

    updateInstallPrompt();
    window.addEventListener("pwa-install-available", updateInstallPrompt);

    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
      setShowCustomModal(false);
    };

    window.addEventListener("pwa-installed", handleInstalled);

    const checkInstalled = () => {
      const standalone = window.matchMedia("(display-mode: standalone)").matches;
      const iosStandalone = window.navigator.standalone === true;
      setIsInstalled(standalone || iosStandalone);
    };

    checkInstalled();

    return () => {
      window.removeEventListener("pwa-install-available", updateInstallPrompt);
      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // If native prompt exists (Normal Browsing), show Chrome's native modal directly
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
        }
        window.deferredPWAInstallPrompt = null;
        setInstallPrompt(null);
      } catch (error) {
        console.error("Native installation failed:", error);
      }
      return;
    }

    // Fallback: If in Incognito / unsupported browser, show custom styled dialog
    setShowCustomModal(true);
  };

  if (isInstalled) return null;

  return (
    <>
      <div className="pwa-install-button">
        <button type="button" onClick={handleInstallClick}>
          <i className="pi pi-download"></i> Install ExitRamp
        </button>
      </div>

      {showCustomModal && (
  <div className="chrome-dialog-overlay">
    <div className="chrome-dialog-box">
      <div className="chrome-dialog-header">
        <span className="chrome-dialog-title">Install ExitRamp</span>
      </div>
      
      <div className="chrome-dialog-body">
        
        <div className="app-details">
          <span className="app-name">ExitRamp</span>
          <span className="app-domain">{window.location.host}</span>
        </div>
      </div>

      <div className="incognito-note">
        <strong>PWA installation is disabled in Incognito mode.</strong>
        <p style={{ margin: "4px 0 0 0" }}>
          To install ExitRamp, open standard browsing mode or visit via <strong>HTTPS / localhost</strong>.
        </p>
      </div>

      <div className="chrome-dialog-actions">
        <button 
          type="button" 
          className="btn-install" 
          onClick={() => setShowCustomModal(false)}
        >
          Got it
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default PWAInstallButton;