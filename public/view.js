/**
 * Secret viewing logic for Ephemeral Clip
 */

class SecretViewer {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.loadSecret();
    }

    initializeElements() {
        // Display elements
        this.loading = document.getElementById('loading');
        this.secretDisplay = document.getElementById('secret-display');
        this.secretContent = document.getElementById('secret-content');
        this.copySecretBtn = document.getElementById('copy-secret-btn');
        this.deleteSecretBtn = document.getElementById('delete-secret-btn');
        this.error = document.getElementById('error');
        this.errorMessage = document.getElementById('error-message');
        this.deletedNotice = document.getElementById('deleted-notice');
        
        // Extract ID and key from URL
        this.secretId = this.getSecretIdFromUrl();
        this.encryptionKey = this.getEncryptionKeyFromFragment();
    }

    attachEventListeners() {
        this.copySecretBtn.addEventListener('click', () => this.copySecret());
        this.deleteSecretBtn.addEventListener('click', () => this.deleteSecret());
        
        // Clear secret when page is about to unload for security
        window.addEventListener('beforeunload', () => {
            this.clearSecret();
        });
        
        // Clear secret when page loses focus (optional security measure)
        window.addEventListener('blur', () => {
            // Uncomment if you want to clear on focus loss
            // this.clearSecret();
        });
    }

    getSecretIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    getEncryptionKeyFromFragment() {
        // Key is in the URL fragment (after #)
        return window.location.hash.substring(1);
    }

    async loadSecret() {
        // Check if we have required parameters
        if (!this.secretId) {
            this.showError('Invalid Link', 'No secret ID found in the URL. Please check the link and try again.');
            return;
        }

        if (!this.encryptionKey) {
            this.showError('Invalid Link', 'No encryption key found in the URL fragment. The link may be incomplete.');
            return;
        }

        if (!CryptoUtils.isSupported()) {
            this.showError(
                'Browser Not Supported', 
                'Your browser does not support the required encryption features. Please use a modern browser.'
            );
            return;
        }

        try {
            this.showLoading();
            
            // Fetch encrypted data from server
            const response = await fetch(`/api/secret/${this.secretId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Secret not found or has expired');
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to retrieve secret');
            }

            const { ciphertext, iv } = await response.json();
            
            // Import the decryption key
            const key = await window.cryptoUtils.importKey(this.encryptionKey);
            
            // Decrypt the secret
            const plaintext = await window.cryptoUtils.decrypt(ciphertext, iv, key);
            
            this.showSecret(plaintext);
            
        } catch (error) {
            console.error('Error loading secret:', error);
            
            let errorTitle = 'Retrieval Failed';
            let errorMsg = CryptoUtils.getErrorMessage(error);
            
            if (error.message.includes('not found') || error.message.includes('expired')) {
                errorTitle = 'Secret Not Found';
                errorMsg = 'This secret has expired, been deleted, or the link is invalid.';
            }
            
            this.showError(errorTitle, errorMsg);
        }
    }

    async copySecret() {
        try {
            await navigator.clipboard.writeText(this.secretContent.value);
            
            // Visual feedback
            const originalText = this.copySecretBtn.textContent;
            this.copySecretBtn.textContent = '✅ Copied!';
            this.copySecretBtn.classList.add('copied');
            
            setTimeout(() => {
                this.copySecretBtn.textContent = originalText;
                this.copySecretBtn.classList.remove('copied');
            }, 2000);
            
        } catch (error) {
            // Fallback for older browsers
            this.secretContent.select();
            this.secretContent.setSelectionRange(0, 99999);
            document.execCommand('copy');
            
            this.copySecretBtn.textContent = '✅ Copied!';
            setTimeout(() => {
                this.copySecretBtn.textContent = '📋 Copy Secret';
            }, 2000);
        }
    }

    async deleteSecret() {
        if (!confirm('Are you sure you want to delete this secret from the server? This action cannot be undone.')) {
            return;
        }

        try {
            this.deleteSecretBtn.disabled = true;
            this.deleteSecretBtn.textContent = 'Deleting...';
            
            const response = await fetch(`/api/secret/${this.secretId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete secret');
            }

            this.showDeleted();
            
        } catch (error) {
            console.error('Error deleting secret:', error);
            alert('Failed to delete secret: ' + error.message);
            this.deleteSecretBtn.disabled = false;
            this.deleteSecretBtn.textContent = '🗑️ Delete from Server';
        }
    }

    showLoading() {
        this.hideAllSections();
        this.loading.classList.remove('hidden');
    }

    showSecret(plaintext) {
        this.hideAllSections();
        this.secretContent.value = plaintext;
        this.secretDisplay.classList.remove('hidden');
        
        // Auto-select content for easy copying
        this.secretContent.focus();
        this.secretContent.select();
    }

    showError(title, message) {
        this.hideAllSections();
        this.errorMessage.textContent = message;
        this.error.querySelector('h3').textContent = `❌ ${title}`;
        this.error.classList.remove('hidden');
    }

    showDeleted() {
        this.hideAllSections();
        this.clearSecret();
        this.deletedNotice.classList.remove('hidden');
    }

    hideAllSections() {
        this.loading.classList.add('hidden');
        this.secretDisplay.classList.add('hidden');
        this.error.classList.add('hidden');
        this.deletedNotice.classList.add('hidden');
    }

    clearSecret() {
        // Clear the secret from memory for security
        if (this.secretContent) {
            this.secretContent.value = '';
        }
        
        // Clear the encryption key from URL fragment
        if (window.location.hash) {
            history.replaceState(null, null, window.location.pathname + window.location.search);
        }
    }
}

// Initialize viewer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.viewer = new SecretViewer();
});
