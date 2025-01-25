class TokenSniper {
    constructor() {
        // Default settings
        this.targetDevWallet = '';
        this.isActive = false;

        // Bind methods
        this.handleTokenFound = this.handleTokenFound.bind(this);
        this.toggleSniper = this.toggleSniper.bind(this);
        this.updateDevWallet = this.updateDevWallet.bind(this);

        // Setup UI and listeners
        this.setupUI();
        this.setupListeners();

        // Load saved dev wallet if any
        this.loadSavedWallet();
    }

    setupUI() {
        // Store UI elements
        this.popup = document.querySelector('.sniper-popup');
        this.statusText = document.getElementById('sniper-status');
        this.toggleButton = document.getElementById('toggle-sniper');
        this.devWalletInput = document.getElementById('dev-wallet');
    }

    setupListeners() {
        // Toggle sniper
        this.toggleButton.addEventListener('click', this.toggleSniper);

        // Save dev wallet on change
        this.devWalletInput.addEventListener('change', this.updateDevWallet);
        this.devWalletInput.addEventListener('input', this.updateDevWallet);
    }

    loadSavedWallet() {
        const saved = localStorage.getItem('sniperDevWallet');
        if (saved) {
            this.targetDevWallet = saved;
            this.devWalletInput.value = saved;
        }
    }

    updateDevWallet() {
        const wallet = this.devWalletInput.value.trim();
        if (wallet) {
            this.targetDevWallet = wallet;
            localStorage.setItem('sniperDevWallet', wallet);
        }
    }

    toggleSniper() {
        if (!this.targetDevWallet) {
            this.displayMessage('Please enter a dev wallet address first', 'error');
            return;
        }

        this.isActive = !this.isActive;
        this.statusText.textContent = `Status: ${this.isActive ? 'Active' : 'Inactive'}`;
        this.toggleButton.textContent = this.isActive ? 'Deactivate Sniper' : 'Activate Sniper';
        this.toggleButton.style.background = this.isActive ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 40, 0, 0.8)';

        this.displayMessage(`Sniper ${this.isActive ? 'activated' : 'deactivated'}`, 'info');
    }

    async handleTokenFound(tokenData) {
        if (!this.isActive || !this.targetDevWallet) return;

        // Check if token is from target dev wallet
        if (tokenData.traderPublicKey === this.targetDevWallet) {
            this.displayMessage(`Target dev wallet detected! Token: ${tokenData.symbol}`, 'info');

            // Get trade settings
            const settings = window.trader.settings;
            if (!settings) {
                this.displayMessage('No trade settings found', 'error');
                return;
            }

            try {
                // Execute trade
                await window.trader.handleTokenClick(tokenData);
            } catch (error) {
                this.displayMessage(`Failed to execute trade: ${error.message}`, 'error');
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
