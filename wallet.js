class WalletManager {
    constructor() {
        this.loadQRCodeScript();
        this.wallet = this.loadWallet();
        this.setupUI();
    }

    loadQRCodeScript() {
        return new Promise((resolve, reject) => {
            if (window.QRCode) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.id = 'qrcode-script';
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load QR Code script'));
            document.head.appendChild(script);
        });
    }

    loadWallet() {
        const walletData = localStorage.getItem('wallet');
        if (!walletData) return null;
        
        try {
            const wallet = JSON.parse(walletData);
            // Verify all required fields are present
            if (wallet.apiKey && wallet.walletPublicKey && wallet.privateKey) {
                return wallet;
            }
        } catch (error) {
            console.error('Error loading wallet:', error);
        }
        return null;
    }

    saveWallet(wallet) {
        // Ensure all required fields are present
        if (!wallet.apiKey || !wallet.walletPublicKey || !wallet.privateKey) {
            throw new Error('Invalid wallet data');
        }
        localStorage.setItem('wallet', JSON.stringify(wallet));
        this.wallet = wallet;
        this.updateUI();
    }

    async createWallet() {
        try {
            const response = await fetch('https://pumpfun-sniper-backend-production.up.railway.app/create-wallet', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add error handling for network timeouts
                signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const wallet = await response.json();
            
            // Validate wallet data before saving
            if (!wallet || !wallet.apiKey || !wallet.walletPublicKey || !wallet.privateKey) {
                throw new Error('Invalid wallet data received from server');
            }

            // Save complete wallet data including private key and API key
            this.saveWallet(wallet);
            return wallet;
        } catch (error) {
            console.error('Error creating wallet:', error);
            throw error;
        }
    }

    downloadWallet() {
        if (!this.wallet) return;
        
        const data = JSON.stringify({
            walletPublicKey: this.wallet.walletPublicKey,
            privateKey: this.wallet.privateKey
        }, null, 2);
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallet-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    setupUI() {
        // Event Listeners
        document.getElementById('generate-wallet').addEventListener('click', async () => {
            try {
                const button = document.getElementById('generate-wallet');
                button.disabled = true;
                button.textContent = 'Generating...';
                
                const wallet = await this.createWallet();
                document.getElementById('backup-wallet').disabled = false;
                document.getElementById('toggle-qr').disabled = false;
                
                button.disabled = false;
                button.textContent = 'Generate New Wallet';
            } catch (error) {
                console.error('Failed to generate wallet:', error);
                document.getElementById('wallet-status').textContent = `Failed to generate wallet: ${error.message}`;
                document.getElementById('wallet-status').style.color = 'red';
                
                const button = document.getElementById('generate-wallet');
                button.disabled = false;
                button.textContent = this.wallet ? 'Generate New Wallet' : 'Generate Wallet';
            }
        });

        document.getElementById('backup-wallet').addEventListener('click', () => {
            this.downloadWallet();
        });

        document.getElementById('toggle-qr').addEventListener('click', async () => {
            const qrContainer = document.getElementById('qr-container');
            const toggleQRButton = document.getElementById('toggle-qr');
            
            if (qrContainer.style.display === 'none') {
                // Generate QR code
                qrContainer.style.display = 'block';
                toggleQRButton.textContent = 'Hide QR Code';
                // Clear previous QR code if any
                document.getElementById('qr-code').innerHTML = '';
                
                try {
                    // Ensure QR code script is loaded
                    await this.loadQRCodeScript();
                    
                    // Create new QR code
                    if (this.wallet) {
                        new QRCode(document.getElementById('qr-code'), {
                            text: this.wallet.walletPublicKey,
                            width: 128,
                            height: 128,
                            colorDark: "#00FF00",
                            colorLight: "#001100"
                        });
                    }
                } catch (error) {
                    console.error('Failed to generate QR code:', error);
                    qrContainer.textContent = 'Failed to generate QR code';
                }
            } else {
                // Clear and hide QR code
                qrContainer.style.display = 'none';
                toggleQRButton.textContent = 'Show QR Code';
                document.getElementById('qr-code').innerHTML = '';
            }
        });

        // Initial UI update
        this.updateUI();
    }

    updateUI() {
        const statusElement = document.getElementById('wallet-status');
        const backupButton = document.getElementById('backup-wallet');
        const generateButton = document.getElementById('generate-wallet');
        const toggleQRButton = document.getElementById('toggle-qr');
        const qrContainer = document.getElementById('qr-container');
        
        if (this.wallet) {
            const publicKey = this.wallet.walletPublicKey;
            statusElement.textContent = `Public Key: ${publicKey}`;
            statusElement.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(publicKey);
                    const originalText = statusElement.textContent;
                    statusElement.textContent = 'Copied!';
                    setTimeout(() => {
                        statusElement.textContent = originalText;
                    }, 1000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                }
            };
            
            backupButton.disabled = false;
            generateButton.textContent = 'Generate New Wallet';
            toggleQRButton.disabled = false;
        } else {
            statusElement.textContent = 'No wallet found';
            statusElement.onclick = null;
            backupButton.disabled = true;
            generateButton.textContent = 'Generate Wallet';
            toggleQRButton.disabled = true;
            toggleQRButton.textContent = 'Show QR Code';
            qrContainer.style.display = 'none';
        }
    }
}

// Initialize wallet manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.walletManager) {
        window.walletManager = new WalletManager();
    }
});
