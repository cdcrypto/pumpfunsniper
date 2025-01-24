"use client";

import React from "react";
import { useTokenStream } from "./hooks/useTokenStream";

export default function Home() {
  const { tokens, isConnected, error } = useTokenStream();

  return (
    <main className="min-h-screen p-4 bg-black text-white">
      {/* Connection Status */}
      <div className="fixed top-0 right-0 p-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-sm">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        {error && (
          <div className="text-red-500 text-sm mt-1">
            {error}
          </div>
        )}
      </div>

      {/* Token Stream */}
      <div className="space-y-2">
        <h1 className="text-xl font-bold mb-4">Token Stream</h1>
        <div className="space-y-2">
          {tokens.map((token, index) => (
            <div
              key={`${token.mint}-${index}`}
              className="bg-gray-900 p-3 rounded-lg"
            >
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Mint: </span>
                  <span className="font-mono">{token.mint}</span>
                </div>
                <div>
                  <span className="text-gray-400">Trader: </span>
                  <span className="font-mono">{token.traderPublicKey}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
