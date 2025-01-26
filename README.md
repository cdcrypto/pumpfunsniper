# PumpSniper

A high-performance token sniping tool for pump.fun, leveraging a custom WebSocket connections for real-time token monitoring and automated trading execution. Built with vanilla JavaScript and HTML for optimal speed performance. Was created since I tried to find a fast sniper to compete with some of the better snipers on chain, but most require investing 1000s of dollars in infrastructure (Geyser websockets etc..) , and require extensive knowledge in transaction sending. This is aimed to be an easy setup, and can start sniping at competitive speeds within minutes when you need it for a token launch or new "meta". 

Example: You know a certain dev or a coin with a certain symbol / name is launching. To snipe this coin near immediately, just 1. Generate wallet 2. Add SOL to wallet based on how much you want to buy 3. Update settings (amount and slippage and priority fees) 4. Add dev wallet, or token name to sniping criteria and click enable sniping. After this, it will buy immediately when matching token is launched on pump.fun 

Note: will add balances and transaction log in near future.

## Overview

PumpSniper enables automated token sniping on pump.fun through a custom monitoring system that tracks new token launches based on multiple criteria. The system utilizes a custom WebSocket feed for real-time updates, providing faster execution compared to traditional UI-based monitoring. Typically you can snipe tokens before they even appear on pump.fun. 

Q: Why cant I import my own wallet? 
The transactions and feed use paid services like geyser RPCs which are costly and limit to one IP address to use. Unless you have these, you would not be able to execute at the same speeds as this repo. I have made a custom backend for streaming token feed and execution, and each wallet generated is correlated with a custom API key. You can still import generated wallets to phantom and use them as you normally would to transfer assets out after sniping or perform swaps on phantom / jupiter. Ensure to backup generated wallets since we do not have access to recover keypairs. 

## Sniping Criteria

The system supports three distinct sniping methods that can be used individually or in combination:

1. **Dev Wallet Monitoring**
   - Track specific wallet addresses known for launching tokens
   - Instant detection of new token deployments from monitored addresses
   - Multiple wallet addresses can be monitored simultaneously (one per line)

2. **Token Name Matching**
   - Case-insensitive partial matching of token names
   - Example: Entering "AI" will match tokens containing "AI", "ai", "Ai", etc.
   - Useful for targeting specific token themes or categories
   - Multiple name patterns can be monitored (one per line)

3. **Symbol Matching**
   - Case-sensitive exact matching of token symbols
   - Particularly useful when specific token symbols are known in advance
   - Multiple symbols can be monitored (one per line)

## How to Use

1. **Initial Setup**
   - Open index.html in your browser to launch the interface
   - Use the Wallet Manager to generate a wallet
   - Configure your trade settings (amount, slippage, priority fee) and click update.

2. **Configure Sniping Parameters**
   - In the Sniper window, enter your target criteria:
     - Dev wallet addresses (one per line)
     - Token names to match (one per line)
     - Token symbols to match (one per line)

     You do not have to have all of them set. For instance if youw want to just a list of 10 dev addresses when they deploy a new token, just leave the others blank. 

3. **Trade Settings Configuration**
   - Set your trade amount in SOL
   - Configure slippage tolerance percentage (reccomend leaving at 100% , since price fluctuations are extreme during low market cap.)
   - Set priority fee for transaction execution (usually 0.005 is enough but set higher if you really want to get in as fast as possible)
   - Click "Update Settings" to save

4. **Monitoring and Execution**
   - Click "Activate Sniper" to begin monitoring
   - Monitor real-time status in the Token Monitor window
   - The system will automatically execute trades when criteria are met

## Technical Details

- **Transaction Routing**: Intelligent routing through multiple providers (Jito, NextBlock)
- **WebSocket Feed**: Custom implementation for real-time token monitoring
- **Local Storage**: Persistent storage of wallet data and trade settings
- **Error Handling**: Comprehensive error checking and validation for trade parameters

## Requirements

- Modern web browser with JavaScript enabled
- Sufficient SOL balance for:
  - Trade amounts
  - Priority fees (network-dependent)
  - Transaction fees

## Notes

- Priority and transaction fees vary based on network conditions
- Maintain adequate SOL balance for successful trade execution
- Monitor the Token Monitor window for real-time status updates and transaction logs
