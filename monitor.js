class MessageQueue {
    constructor(maxSize = 20) {
        this.queue = [];
        this.maxSize = maxSize;
    }

    enqueue(item) {
        this.queue.push(item);
        if (this.queue.length > this.maxSize) {
            this.queue.shift();
        }
        return this.queue.length;
    }

    clear() {
        this.queue = [];
    }

    get size() {
        return this.queue.length;
    }
}

class PerformanceMonitor {
    constructor() {
        this.messageCount = 0;
        this.lastCheck = performance.now();
        this.messageRate = 0;
        this.latencySum = 0;
        this.latencyCount = 0;
        
        setInterval(() => this.calculateMetrics(), 1000);
    }

    recordMessage() {
        this.messageCount++;
    }

    recordLatency(latency) {
        this.latencySum += latency;
        this.latencyCount++;
    }

    calculateMetrics() {
        const now = performance.now();
        const elapsed = (now - this.lastCheck) / 1000;
        this.messageRate = Math.round(this.messageCount / elapsed);
        this.messageCount = 0;
        this.lastCheck = now;

        // Update UI
        document.getElementById('msg-rate').textContent = `MSG/s: ${this.messageRate}`;
        
        // Calculate average latency
        if (this.latencyCount > 0) {
            const avgLatency = Math.round(this.latencySum / this.latencyCount);
            document.getElementById('latency').textContent = `LAT: ${avgLatency}ms`;
            this.latencySum = 0;
            this.latencyCount = 0;
        }

        // Update memory usage (only works if browser supports performance.memory)
        const memory = performance.memory?.usedJSHeapSize;
        if (memory) {
            const memoryMB = Math.round(memory / (1024 * 1024));
            document.getElementById('memory').textContent = `MEM: ${memoryMB}MB`;
        }
    }
}

class WebSocketMonitor {
    constructor(url) {
        this.url = url;
        this.queue = new MessageQueue();
        this.performance = new PerformanceMonitor();
        this.messagesContainer = document.getElementById('messages');
        
        // Add startup message
        const startupMsg = document.createElement('div');
        startupMsg.className = 'message';
        startupMsg.textContent = `[${new Date().toISOString()}] WebSocket Monitor v1.0 initializing...`;
        this.messagesContainer.appendChild(startupMsg);
        
        // Add connection message
        const connMsg = document.createElement('div');
        connMsg.className = 'message';
        connMsg.textContent = `[${new Date().toISOString()}] Connecting to ${url}...`;
        this.messagesContainer.appendChild(connMsg);
        
        this.connect();
    }

    connect() {
        try {
            console.log('Attempting to connect to WebSocket:', this.url);
            this.ws = new WebSocket(this.url);
            this.setupEventHandlers();
            this.updateStatus('CONNECTING');
        } catch (error) {
            this.updateStatus('ERROR');
            console.error('WebSocket connection error:', error);
        }
    }

    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('WebSocket connection established');
            this.updateStatus('CONNECTED');
            const connectedMsg = document.createElement('div');
            connectedMsg.className = 'message';
            connectedMsg.textContent = `[${new Date().toISOString()}] Connected successfully`;
            this.messagesContainer.insertBefore(connectedMsg, this.messagesContainer.firstChild);
        };

        this.ws.onclose = () => {
            console.log('WebSocket connection closed');
            this.updateStatus('DISCONNECTED');
            const disconnectMsg = document.createElement('div');
            disconnectMsg.className = 'message';
            disconnectMsg.textContent = `[${new Date().toISOString()}] Connection lost. Attempting to reconnect in 5s...`;
            this.messagesContainer.insertBefore(disconnectMsg, this.messagesContainer.firstChild);
            // Attempt to reconnect after 5 seconds
            setTimeout(() => this.connect(), 5000);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateStatus('ERROR');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'message';
            errorMsg.textContent = `[${new Date().toISOString()}] WebSocket error occurred`;
            this.messagesContainer.insertBefore(errorMsg, this.messagesContainer.firstChild);
        };

        this.ws.onmessage = (event) => {
            const receiveTime = performance.now();
            try {
                console.log('Received WebSocket message:', event.data);
                const data = JSON.parse(event.data);
                this.handleMessage(data, receiveTime);

                // Send token to sniper if it's a token event
                if (data.type === 'tokenFound' && window.sniper) {
                    console.log('Token found, sending to sniper:', data);
                    window.sniper.handleTokenFound(data.data);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
                this.displayMessage({ type: 'error', data: 'Failed to parse WebSocket message' });
            }
        };
    }

    handleMessage(data, receiveTime) {
        try {
            const queueSize = this.queue.enqueue({
                timestamp: new Date().toISOString(),
                data: data,
                receiveTime
            });

            // Update queue size display
            document.getElementById('queue').textContent = `QUEUE: ${queueSize}`;

            // Record performance metrics
            this.performance.recordMessage();
            if (data.timestamp) {
                const sendTime = new Date(data.timestamp).getTime();
                const latency = receiveTime - sendTime;
                this.performance.recordLatency(latency);
            }

            // Display message
            this.displayMessage(data);
        } catch (error) {
            console.error('Error handling message:', error);
            this.displayMessage({ type: 'error', data: 'Failed to process message' });
        }
    }

    displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        
        // Format message based on type
        if (message.type === 'tokenFound') {
            const symbol = message.data.symbol || 'N/A';
            const name = message.data.name || 'Unknown';
            const solAmount = message.data.solAmount ? `${message.data.solAmount} SOL` : 'N/A';
            const trader = message.data.traderPublicKey || 'N/A';
            messageElement.textContent = `[${new Date().toISOString()}] ► ${symbol.padEnd(8)} | ${name.padEnd(25)} | ${solAmount.padEnd(12)} | DEV: ${trader}`;
        } else {
            messageElement.textContent = `[${new Date().toISOString()}] ${JSON.stringify(message)}`;
        }

        this.messagesContainer.insertBefore(messageElement, this.messagesContainer.firstChild);
        
        // Limit DOM nodes to prevent memory issues
        while (this.messagesContainer.children.length > 20) {
            this.messagesContainer.removeChild(this.messagesContainer.lastChild);
        }
    }

    updateStatus(status) {
        document.getElementById('status').textContent = `STATUS: ${status}`;
    }
}

// Initialize the monitor with the WebSocket URL
const monitor = new WebSocketMonitor('wss://pumpfun-sniper-backend-production.up.railway.app');
