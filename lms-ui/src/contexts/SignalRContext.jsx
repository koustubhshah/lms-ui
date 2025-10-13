import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import * as signalR from "@microsoft/signalr";

const SignalRContext = createContext(null);

export const useSignalR = () => {
  const ctx = useContext(SignalRContext);
  if (!ctx) throw new Error("useSignalR must be used within SignalRProvider");
  return ctx;
};

export const SignalRProvider = ({ children }) => {
  const connectionRef = useRef(null);

  useEffect(() => {
    console.log("🔍 Starting SignalR connection setup...");
    
    // TEMPORARY: Testing without authentication
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5284/hubs/notifications", {
        transport: signalR.HttpTransportType.LongPolling // Force long polling as fallback
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          console.log(`🔄 Reconnect attempt ${retryContext.previousRetryCount + 1}`);
          if (retryContext.previousRetryCount === 0) {
            return 0;
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        }
      })
      .configureLogging(signalR.LogLevel.Debug) // Enable debug logging temporarily
      .build();

    connectionRef.current = conn;

    conn.onreconnecting((err) => {
      console.warn("SignalR reconnecting...", err?.message);
    });
    conn.onreconnected((id) => {
      console.info("SignalR reconnected", id);
    });
    conn.onclose((err) => {
      if (err) console.error("SignalR closed with error", err.message);
      else console.info("SignalR closed");
    });

    conn
      .start()
      .then(() => {
        console.log(" SignalR connected successfully");
        console.log(` Connection ID: ${conn.connectionId}`);
        console.log(` Connection State: ${conn.state}`);
      })
      .catch((err) => {
        console.error(" SignalR connection failed:", err.message);
        if (err.message.includes('negotiate')) {
          console.error(" Possible causes:");
          console.error("  1. Backend server is not running");
          console.error("  2. CORS policy mismatch");
          console.error("  3. Authentication token issues");
          console.error("  4. Network connectivity problems");
        }
      });

    return () => {
      conn.stop().catch(() => {});
    };
  }, []);

  const api = useMemo(
    () => ({
      on: (event, handler) => connectionRef.current?.on(event, handler),
      off: (event, handler) => connectionRef.current?.off(event, handler),
      connection: () => connectionRef.current,
    }),
    []
  );

  return (
    <SignalRContext.Provider value={api}>
      {children}
    </SignalRContext.Provider>
  );
};
