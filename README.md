# PumpSniper

A high-performance sniper tool for pump.fun tokens, designed to execute trades with minimal latency by monitoring dev wallet addresses. Written in native JS and HTML for speed comptetitiveness. Let me know if any isssues, this is just first draft. One of main advantages is that it uses a custom websocket feed, which is faster than the pump

## Overview

PumpSniper provides a no-code solution for sniping tokens on pump.fun, often executing trades before they even appear on the pump.fun UI. This is achieved through an advanced backend system that intelligently routes transactions through the most optimal providers (including Jito, NextBlock, and others).
**Sniping Criteria**: Snipe by: Dev wallet address, Token Symbol (If you know one is launching soon, set the symbol) , or token name (for instance if you want to snipe all tokens with "AI", put AI in the token name.) You can set multiple dev wallets or other criteria by entering one per line. 

## Key Features

- **Ultra-Fast Execution**: Snipe tokens near-instantly by monitoring dev wallet addresses
- **Smart Route Optimization**: Automatically routes transactions through the best available provider
- **Provider Support**:
  - Jito
  - NextBlock
  - Additional providers based on network conditions
- **User-Friendly Interface**: No coding required - simple UI for setting up and executing snipes
- **Real-time Monitoring**: Track transactions and network status through an intuitive dashboard

## Requirements

- Sufficient SOL balance to cover:
  - Priority fees (variable based on network conditions)
  - Jito fees (variable based on network conditions)
  - Transaction amount

## How It Works

1. Enter the dev wallet address you want to monitor
2. Configure your trade settings (amount, slippage, priority fee) and click save
3. Activate the sniper
4. The system will detect new mints from the dev wallet and execute trades near instantly

## Coming Soon

- Enhanced sniping criteria (based on symbol or token name)
- Additional monitoring parameters
- Advanced filtering options

## Note

Network conditions can affect priority and Jito fees. Always ensure you have sufficient SOL balance to cover these variable costs for successful transaction execution.
