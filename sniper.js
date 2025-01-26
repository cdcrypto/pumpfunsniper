class TokenSniper {
    constructor() {
        // Default settings
        this.targetDevWallets = [];
        this.targetTokenNames = [];
        this.isActive = false;

        // Bind methods
        this.handleTokenFound = this.handleTokenFound.bind(this);
        this.toggleSniper = this.toggleSniper.bind(this);
        this.updateDevWallets = this.updateDevWallets.bind(this);
        this.updateTokenNames = this.updateTokenNames.bind(this);

        // Setup UI and listeners
        this.setupUI();
        this.setupListeners();

        // Load saved settings
        this.loadSavedWallet();
        this.loadSavedTokenNames();
        this.loadTradeSettings();
    }

    setupUI() {
        // Store UI elements
        this.popup = document.querySelector('.sniper-popup');
        this.statusText = document.getElementById('sniper-status');
        this.toggleButton = document.getElementById('toggle-sniper');
        
        // Dev wallet input
        this.devWalletsInput = document.getElementById('dev-wallet');
        this.devWalletsInput.placeholder = 'Enter wallet addresses (one per line)';
        
        // Token name input
        this.tokenNamesInput = document.getElementById('token-names');
        this.tokenNamesInput.placeholder = 'Enter token names to snipe (one per line)';
    }

    setupListeners() {
        // Toggle sniper
        this.toggleButton.addEventListener('click', this.toggleSniper);

        // Save dev wallets on change
        this.devWalletsInput.addEventListener('change', this.updateDevWallets);
        this.devWalletsInput.addEventListener('input', this.updateDevWallets);

        // Save token names on change
        this.tokenNamesInput.addEventListener('change', this.updateTokenNames);
        this.tokenNamesInput.addEventListener('input', this.updateTokenNames);

        // Update trade settings
        document.getElementById('update-settings').addEventListener('click', () => {
            this.updateTradeSettings();
        });
    }

    loadTradeSettings() {
        const defaultSettings = {
            amount: 0.1,
            slippage: 1,
            priorityFee: 0.005,
            denominatedInSol: "true",
            pool: "pump",
            action: "buy"
        };

        const savedSettings = localStorage.getItem('tradeSettings');
        const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

        // Update UI with saved or default settings
        document.getElementById('trade-amount').value = settings.amount;
        document.getElementById('trade-slippage').value = settings.slippage;
        document.getElementById('trade-priority-fee').value = settings.priorityFee;
    }

    updateTradeSettings() {
        try {
            const amount = parseFloat(document.getElementById('trade-amount').value);
            const slippage = parseFloat(document.getElementById('trade-slippage').value);
            const priorityFee = parseFloat(document.getElementById('trade-priority-fee').value);

            // Validate inputs
            if (isNaN(amount) || amount < 0.1) {
                throw new Error('Amount must be at least 0.1 SOL');
            }
            if (isNaN(slippage) || slippage < 0.1) {
                throw new Error('Slippage must be at least 0.1%');
            }
            if (isNaN(priorityFee) || priorityFee < 0.001) {
                throw new Error('Priority fee must be at least 0.001 SOL');
            }

            const settings = {
                amount,
                slippage,
                priorityFee,
                denominatedInSol: "true",
                pool: "pump",
                action: "buy"
            };

            localStorage.setItem('tradeSettings', JSON.stringify(settings));
            this.displayMessage('Trade settings updated successfully', 'success');
        } catch (error) {
            this.displayMessage(`Failed to update settings: ${error.message}`, 'error');
        }
    }

    loadSavedWallet() {
        const saved = localStorage.getItem('sniperDevWallets');
        if (saved) {
            this.targetDevWallets = JSON.parse(saved);
            this.devWalletsInput.value = this.targetDevWallets.join('\n');
        }
    }

    updateDevWallets() {
        const input = this.devWalletsInput.value;
        
        // Check for invalid format (commas)
        if (input.includes(',')) {
            this.displayMessage('Invalid format: Please enter each wallet address on a new line', 'error');
            return;
        }

        const wallets = input
            .split('\n')
            .map(w => w.trim())
            .filter(w => w.length > 0);
            
        // Always update both the instance variable and localStorage
        this.targetDevWallets = wallets;
        localStorage.setItem('sniperDevWallets', JSON.stringify(wallets));
    }

    toggleSniper() {
        if (this.targetDevWallets.length === 0 && this.targetTokenNames.length === 0) {
            this.displayMessage('Please enter at least one dev wallet address or token name', 'error');
            return;
        }

        this.isActive = !this.isActive;
        this.statusText.textContent = `Status: ${this.isActive ? 'Active' : 'Inactive'}`;
        this.toggleButton.textContent = this.isActive ? 'Deactivate Sniper' : 'Activate Sniper';
        this.toggleButton.style.background = this.isActive ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 40, 0, 0.8)';

        this.displayMessage(`Sniper ${this.isActive ? 'activated' : 'deactivated'}`, 'info');
    }

    loadSavedTokenNames() {
        const saved = localStorage.getItem('sniperTokenNames');
        if (saved) {
            this.targetTokenNames = JSON.parse(saved);
            this.tokenNamesInput.value = this.targetTokenNames.join('\n');
        }
    }

    updateTokenNames() {
        const input = this.tokenNamesInput.value;
        
        // Check for invalid format (commas)
        if (input.includes(',')) {
            this.displayMessage('Invalid format: Please enter each token name on a new line', 'error');
            return;
        }

        const names = input
            .split('\n')
            .map(n => n.trim())
            .filter(n => n.length > 0);
            
        // Always update both the instance variable and localStorage
        this.targetTokenNames = names;
        localStorage.setItem('sniperTokenNames', JSON.stringify(names));
    }

    async handleTokenFound(tokenData) {
        if (!this.isActive) return;
        if (this.targetDevWallets.length === 0 && this.targetTokenNames.length === 0) return;

        // Check if token is from any of the target dev wallets
        const isTargetWallet = this.targetDevWallets.includes(tokenData.traderPublicKey);
        
        // Check if token name contains any of the target names (case insensitive)
        const tokenNameLower = tokenData.name.toLowerCase();
        const isTargetName = this.targetTokenNames.some(targetName => 
            tokenNameLower.includes(targetName.toLowerCase())
        );

        if (isTargetWallet || isTargetName) {
            const matchType = isTargetWallet ? 'dev wallet' : 'token name';
            this.displayMessage(`Target ${matchType} detected! Token: ${tokenData.symbol} (${tokenData.name})`, 'info');

            // Get wallet data
            const walletData = localStorage.getItem('wallet');
            if (!walletData) {
                this.displayMessage('No wallet found. Please create a wallet first.', 'error');
                return;
            }

            const wallet = JSON.parse(walletData);
            if (!wallet.apiKey) {
                this.displayMessage('Invalid wallet data. Please create a new wallet.', 'error');
                return;
            }

            // Get trade settings
            const defaultSettings = {
                amount: 0.1,
                slippage: 1,
                priorityFee: 0.005,
                denominatedInSol: "true",
                pool: "pump",
                action: "buy"
            };

            const savedSettings = localStorage.getItem('tradeSettings');
            const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;

            try {
                // Create swap parameters
                const swapParams = {
                    ...settings,
                    mint: tokenData.mint,
                    apiKey: wallet.apiKey
                };

                // Display attempting message
                this.displayMessage(`Attempting to swap ${settings.amount} SOL for ${tokenData.symbol}...`, 'info');

                // Create the swap
                const response = await fetch('https://pumpfun-sniper-backend-production.up.railway.app/pump-swap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(swapParams),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                this.displayMessage(`Swap created successfully! Transaction: ${result.transaction}`, 'success');
            } catch (error) {
                this.displayMessage(`Failed to create swap: ${error.message}`, 'error');
            }
        }
    }

    displayMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = `[${new Date().toISOString()}] SNIPER ${type.toUpperCase()}: ${message}`;
        
        // Add color based on message type
        switch (type) {
            case 'error':
                messageElement.style.color = '#FF4444';
                break;
            case 'success':
                messageElement.style.color = '#44FF44';
                break;
            case 'info':
                messageElement.style.color = '#4444FF';
                break;
        }

        const messagesContainer = document.getElementById('messages');
        messagesContainer.insertBefore(messageElement, messagesContainer.firstChild);
    }
}

// Initialize sniper and expose globally
document.addEventListener('DOMContentLoaded', () => {
    if (!window.sniper) {
        window.sniper = new TokenSniper();
    }
});
