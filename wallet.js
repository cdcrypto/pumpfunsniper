class WalletManager {
    constructor() {
        this.wallet = this.loadWallet();
        this.setupUI();
        // Load QR code script immediately
        this.loadQRCodeScript().catch(error => {
            console.error('Failed to load QR code script:', error);
        });
    }

    loadQRCodeScript() {
        return new Promise((resolve, reject) => {
            try {
                // If QRCode is already available, resolve immediately
                if (typeof QRCode !== 'undefined') {
                    resolve();
                    return;
                }

                // Check if script is already being loaded
                const existingScript = document.getElementById('qrcode-script');
                if (existingScript) {
                    existingScript.addEventListener('load', () => {
                        // Give a small delay for script initialization
                        setTimeout(resolve, 100);
                    });
                    return;
                }

                // Create and load the script
                const script = document.createElement('script');
                script.id = 'qrcode-script';
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
                script.async = true;

                script.onload = () => {
                    // Give a small delay for script initialization
                    setTimeout(resolve, 100);
                };
                script.onerror = () => reject(new Error('Failed to load QR Code script'));

                document.head.appendChild(script);
            } catch (error) {
                reject(error);
            }
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
            
            try {
                if (qrContainer.style.display === 'none') {
                    // Show loading state
                    qrContainer.style.display = 'block';
                    toggleQRButton.textContent = 'Loading...';
                    toggleQRButton.disabled = true;
                    
                    // Clear previous QR code if any
                    const qrCanvas = document.getElementById('qr-code');
                    qrCanvas.innerHTML = '';
                    
                    // Ensure QR code script is loaded
                    await this.loadQRCodeScript();
                    console.log('QR code script loaded successfully');
                    
                    if (!this.wallet || !this.wallet.walletPublicKey) {
                        throw new Error('No wallet public key available');
                    }
                    
                    // Create new QR code with error handling
                    try {
                        // Clear any existing QR code first
                        qrCanvas.innerHTML = '';
                        
                        // Create QR code instance
                        const qr = new QRCode(qrCanvas, {
                            text: this.wallet.walletPublicKey,
                            width: 128,
                            height: 128,
                            colorDark: "#00FF00",
                            colorLight: "#001100",
                            correctLevel: QRCode.CorrectLevel.H
                        });
                        
                        console.log('QR code generated successfully');
                        toggleQRButton.textContent = 'Hide QR Code';
                        
                        // Force a small delay to ensure rendering
                        setTimeout(() => {
                            qrContainer.style.display = 'block';
                        }, 100);
                    } catch (qrError) {
                        console.error('QR code generation failed:', qrError);
                        qrCanvas.innerHTML = 'Failed to generate QR code';
                        qrContainer.style.display = 'none';
                    }
                } else {
                    // Clear and hide QR code
                    qrContainer.style.display = 'none';
                    toggleQRButton.textContent = 'Show QR Code';
                    document.getElementById('qr-code').innerHTML = '';
                }
            } catch (error) {
                console.error('Error in QR code toggle:', error);
                qrContainer.style.display = 'none';
                toggleQRButton.textContent = 'Show QR Code';
                document.getElementById('qr-code').innerHTML = 'Error: ' + error.message;
            } finally {
                toggleQRButton.disabled = false;
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
