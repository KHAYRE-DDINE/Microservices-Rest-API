"use client";

import { useState, useEffect } from "react";

/**
 * SystemStatusIndicator
 * Periodically checks the health of the backend services and updates the UI status.
 */
export function SystemStatusIndicator() {
  const [isLive, setIsLive] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        // We check the affiliate service as a heartbeat for the backend ecosystem
        const res = await fetch("/api/backend/affiliate/api/affiliate", {
          signal: AbortSignal.timeout(3000)
        });
        setIsLive(res.ok);
      } catch (e) {
        setIsLive(false);
      }
    }

    // Initial check
    checkStatus();

    // Poll every 10 seconds for high-fidelity status
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLive === null) {
    return (
       <span className="flex items-center gap-2 text-gray-400">
         <span className="h-3 w-3 rounded-full bg-gray-200 animate-pulse"></span>
         Checking status...
       </span>
    );
  }

  return (
    <span className={`flex items-center gap-2 transition-colors duration-500 ${isLive ? 'text-gray-600' : 'text-red-600 font-medium'}`}>
      <span className="relative flex h-3 w-3">
        {isLive ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
        )}
      </span>
      {isLive ? 'System Live' : 'Server not connected'}
    </span>
  );
}
