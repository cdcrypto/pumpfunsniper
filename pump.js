class PumpTrader { 
    constructor() {
        // Default settings
        this.defaultSettings = {
            amount: 0.1,
            slippage: 100, // 1%
            priorityFee: 0.005,
            denominatedInSol: "true",
            pool: "pump",
            action: "buy" // Always buy
        };

        // Load saved settings or use defaults
        this.settings = this.loadSettings();

        // Update UI with current settings
        this.updateUI();

        // Bind methods
        this.handleTokenClick = this.handleTokenClick.bind(this);
        this.updateSettings = this.updateSettings.bind(this);
        this.saveSettings = this.saveSettings.bind(this);

        // Setup settings listeners
        this.setupSettingsListeners();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('tradeSettings');
        if (!savedSettings) return this.defaultSettings;
        
        try {
            return JSON.parse(savedSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.defaultSettings;
        }
    }

    saveSettings() {
        // Get current values from inputs
        const amount = parseFloat(document.getElementById('trade-amount').value);
        const slippage = parseFloat(document.getElementById('trade-slippage').value);
        const priorityFee = parseFloat(document.getElementById('trade-priority-fee').value);

        // Update settings
        this.settings = {
            ...this.defaultSettings,
            amount,
            slippage,
            priorityFee
        };

        // Save to local storage
        localStorage.setItem('tradeSettings', JSON.stringify(this.settings));

        // Show success message
        this.displayMessage('Trade settings updated successfully', 'success');
    }

    updateUI() {
        // Update input values with current settings
        document.getElementById('trade-amount').value = this.settings.amount;
        document.getElementById('trade-slippage').value = this.settings.slippage;
        document.getElementById('trade-priority-fee').value = this.settings.priorityFee;
    }

    setupSettingsListeners() {
        // Add update button listener
        document.getElementById('update-settings').addEventListener('click', this.saveSettings);
    }

    async createPumpSwap(params) {
        try {
            const response = await fetch('https://pumpfun-sniper-backend-production.up.railway.app/pump-swap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating swap:', error);
            throw error;
        }
    }

    async handleTokenClick(tokenData) {
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

        try {
            // Create swap parameters
            const swapParams = {
                ...this.settings,
                mint: tokenData.mint,
                apiKey: wallet.apiKey
            };

            // Display attempting message
            this.displayMessage(`Attempting to swap ${this.settings.amount} SOL for ${tokenData.symbol}...`, 'info');

            // Create the swap
            const result = await this.createPumpSwap(swapParams);
            
            // Display success message
            this.displayMessage(`Swap created successfully! Transaction: ${result.transaction}`, 'success');
        } catch (error) {
            this.displayMessage(`Failed to create swap: ${error.message}`, 'error');
        }
    }

    displayMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = `[${new Date().toISOString()}] ${type.toUpperCase()}: ${message}`;
        
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

// Initialize trader and expose globally
window.trader = new PumpTrader();

// (Optional) Function to add token to trade list if needed
window.addTokenToTradeList = function(tokenData) {
    // Example usage if you had a list:
    // window.trader.addToken(tokenData);
    console.log('addTokenToTradeList called with:', tokenData);
};
