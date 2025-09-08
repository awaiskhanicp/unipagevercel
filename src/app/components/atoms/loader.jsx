import React from "react";

const Loader = () => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(255, 255, 255, 0.3)",
      // Removed: backdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
    }}
  >
    <div className="simple-spinner"></div>
    <style jsx>{`
      .simple-spinner {
        width: 60px;
        height: 60px;
        border: 6px solid rgba(0, 0, 0, 0.1);
        border-top: 6px solid #3498db; /* Single color */
        border-radius: 50%;
        animation: spin 0.8s ease-in-out infinite;
        box-shadow: 0 0 15px rgba(52, 152, 219, 0.5);
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

export default Loader;