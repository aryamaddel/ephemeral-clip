/**
 * Main application logic for Ephemeral Clip
 */

class EphemeralClipApp {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.checkCryptoSupport();
    }

    initializeElements() {
        // Form elements
        this.secretInput = document.getElementById('secret-input');
        this.ttlSelect = document.getElementById('ttl-select');
        this.createBtn = document.getElementById('create-btn');
        
        // Result elements
        this.resultSection = document.getElementById('result-section');
        this.secretLink = document.getElementById('secret-link');
        this.copyLinkBtn = document.getElementById('copy-link-btn');
        this.createAnotherBtn = document.getElementById('create-another-btn');
        
        // Status elements
        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
    }

    attachEventListeners() {
        this.createBtn.addEventListener('click', () => this.createSecret());
        this.copyLinkBtn.addEventListener('click', () => this.copyLink());
        this.createAnotherBtn.addEventListener('click', () => this.reset());
        
        // Allow Enter key to submit (with Ctrl/Cmd)
        this.secretInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.createSecret();
            }
        });
    }

    checkCryptoSupport() {
        if (!CryptoUtils.isSupported()) {
            this.showError(
                'Browser Not Supported', 
                'Your browser does not support the required encryption features. Please use a modern browser like Chrome, Firefox, Safari, or Edge.'
            );
            this.createBtn.disabled = true;
        }
    }

    async createSecret() {
        const secret = this.secretInput.value.trim();
        
        if (!secret) {
            this.showError('Input Required', 'Please enter a secret to share.');
            return;
        }

        if (secret.length > 10000) {
            this.showError('Input Too Large', 'Secret must be less than 10,000 characters.');
            return;
        }

        try {
            this.showLoading();
            
            // Generate encryption key
            const key = await window.cryptoUtils.generateKey();
            const keyBase64 = await window.cryptoUtils.exportKey(key);
            
            // Encrypt the secret
            const { ciphertext, iv } = await window.cryptoUtils.encrypt(secret, key);
            
            // Send to server
            const response = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ciphertext,
                    iv,
                    ttl: parseInt(this.ttlSelect.value)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create secret');
            }

            const result = await response.json();
            
            // Create the complete URL with key in fragment
            const baseUrl = window.location.origin;
            const secretUrl = `${baseUrl}/view.html?id=${result.id}#${keyBase64}`;
            
            this.showResult(secretUrl);
            
        } catch (error) {
            console.error('Error creating secret:', error);
            this.showError(
                'Creation Failed', 
                CryptoUtils.getErrorMessage(error)
            );
        }
    }

    async copyLink() {
        try {
            await navigator.clipboard.writeText(this.secretLink.value);
            
            // Visual feedback
            const originalText = this.copyLinkBtn.textContent;
            this.copyLinkBtn.textContent = 'Copied!';
            this.copyLinkBtn.classList.add('copied');
            
            setTimeout(() => {
                this.copyLinkBtn.textContent = originalText;
                this.copyLinkBtn.classList.remove('copied');
            }, 2000);
            
        } catch (error) {
            // Fallback for older browsers
            this.secretLink.select();
            this.secretLink.setSelectionRange(0, 99999);
            document.execCommand('copy');
            
            this.copyLinkBtn.textContent = 'Copied!';
            setTimeout(() => {
                this.copyLinkBtn.textContent = 'Copy';
            }, 2000);
        }
    }

    showLoading() {
        this.hideAllSections();
        this.loading.classList.remove('hidden');
        this.createBtn.disabled = true;
    }

    showResult(url) {
        this.hideAllSections();
        this.secretLink.value = url;
        this.resultSection.classList.remove('hidden');
        
        // Select the link for easy copying
        this.secretLink.focus();
        this.secretLink.select();
    }

    showError(title, message) {
        this.hideAllSections();
        this.error.innerHTML = `
            <h3>❌ ${title}</h3>
            <p>${message}</p>
            <button class="btn primary" onclick="app.reset()">Try Again</button>
        `;
        this.error.classList.remove('hidden');
        this.createBtn.disabled = false;
    }

    hideAllSections() {
        this.loading.classList.add('hidden');
        this.resultSection.classList.add('hidden');
        this.error.classList.add('hidden');
    }

    reset() {
        this.hideAllSections();
        this.secretInput.value = '';
        this.secretInput.focus();
        this.createBtn.disabled = false;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EphemeralClipApp();
});
