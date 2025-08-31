/**
 * Client-side AES-GCM encryption utilities
 * All encryption/decryption happens in the browser
 */

class CryptoUtils {
    constructor() {
        // Check if Web Crypto API is available
        if (!window.crypto || !window.crypto.subtle) {
            throw new Error('Web Crypto API not supported in this browser');
        }
    }

    /**
     * Generate a random encryption key
     * @returns {Promise<CryptoKey>} AES-GCM key
     */
    async generateKey() {
        return await window.crypto.subtle.generateKey(
            {
                name: 'AES-GCM',
                length: 256
            },
            true, // extractable
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Export key to base64 string for URL fragment
     * @param {CryptoKey} key 
     * @returns {Promise<string>} Base64 encoded key
     */
    async exportKey(key) {
        const keyBuffer = await window.crypto.subtle.exportKey('raw', key);
        return this.arrayBufferToBase64(keyBuffer);
    }

    /**
     * Import key from base64 string
     * @param {string} keyBase64 Base64 encoded key
     * @returns {Promise<CryptoKey>} AES-GCM key
     */
    async importKey(keyBase64) {
        const keyBuffer = this.base64ToArrayBuffer(keyBase64);
        return await window.crypto.subtle.importKey(
            'raw',
            keyBuffer,
            {
                name: 'AES-GCM',
                length: 256
            },
            false, // not extractable after import
            ['decrypt']
        );
    }

    /**
     * Encrypt plaintext using AES-GCM
     * @param {string} plaintext Text to encrypt
     * @param {CryptoKey} key Encryption key
     * @returns {Promise<{ciphertext: string, iv: string}>} Encrypted data
     */
    async encrypt(plaintext, key) {
        // Generate random IV (12 bytes for GCM)
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        
        // Convert plaintext to bytes
        const plaintextBuffer = new TextEncoder().encode(plaintext);
        
        // Encrypt
        const ciphertextBuffer = await window.crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            plaintextBuffer
        );
        
        return {
            ciphertext: this.arrayBufferToBase64(ciphertextBuffer),
            iv: this.arrayBufferToBase64(iv)
        };
    }

    /**
     * Decrypt ciphertext using AES-GCM
     * @param {string} ciphertextBase64 Base64 encoded ciphertext
     * @param {string} ivBase64 Base64 encoded IV
     * @param {CryptoKey} key Decryption key
     * @returns {Promise<string>} Decrypted plaintext
     */
    async decrypt(ciphertextBase64, ivBase64, key) {
        try {
            // Convert from base64
            const ciphertextBuffer = this.base64ToArrayBuffer(ciphertextBase64);
            const iv = this.base64ToArrayBuffer(ivBase64);
            
            // Decrypt
            const plaintextBuffer = await window.crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                ciphertextBuffer
            );
            
            // Convert back to string
            return new TextDecoder().decode(plaintextBuffer);
        } catch (error) {
            throw new Error('Failed to decrypt: Invalid key or corrupted data');
        }
    }

    /**
     * Convert ArrayBuffer to base64 string
     * @param {ArrayBuffer} buffer 
     * @returns {string} Base64 string
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Convert base64 string to ArrayBuffer
     * @param {string} base64 
     * @returns {ArrayBuffer} Array buffer
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    /**
     * Generate a secure random string for URLs
     * @param {number} length Length of the string
     * @returns {string} Random string
     */
    generateRandomString(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => chars[byte % chars.length]).join('');
    }

    /**
     * Validate that required crypto features are available
     * @returns {boolean} True if crypto is supported
     */
    static isSupported() {
        try {
            return !!(
                window.crypto &&
                window.crypto.subtle &&
                window.crypto.getRandomValues &&
                window.TextEncoder &&
                window.TextDecoder
            );
        } catch (error) {
            return false;
        }
    }

    /**
     * Get a user-friendly error message for crypto errors
     * @param {Error} error 
     * @returns {string} User-friendly error message
     */
    static getErrorMessage(error) {
        if (error.message.includes('decrypt')) {
            return 'Unable to decrypt the secret. The link may be corrupted or the secret may have been tampered with.';
        }
        if (error.message.includes('not supported')) {
            return 'Your browser does not support the required encryption features. Please use a modern browser.';
        }
        return 'An encryption error occurred. Please try again.';
    }
}

// Global instance
window.cryptoUtils = new CryptoUtils();
