"use client";

import { useState, useEffect, useCallback } from "react";
import { TokenData, TokenMessage } from "../types";

const MAX_TOKENS = 20; // Limit stored tokens for performance
const WS_URL = "wss://pumpfun-sniper-backend-production.up.railway.app:8080";

export function useTokenStream() {
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToken = useCallback((newToken: TokenData) => {
    setTokens(prev => {
      const updated = [newToken, ...prev].slice(0, MAX_TOKENS);
      return updated;
    });
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setError("WebSocket connection closed");
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        setError("Attempting to reconnect...");
      }, 3000);
    };

    ws.onerror = () => {
      setError("WebSocket error occurred");
    };

    ws.onmessage = (event) => {
      try {
        const message: TokenMessage = JSON.parse(event.data);
        if (message.type === "tokenFound") {
          addToken(message.data);
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [addToken]);

  return { tokens, isConnected, error };
}
