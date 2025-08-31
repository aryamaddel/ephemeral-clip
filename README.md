# 🔐 Ephemeral Clip

A secure, ephemeral password transfer service with client-side AES-GCM encryption. Share sensitive information safely with automatic expiration and one-time access.

## Features

- **Client-side encryption**: All encryption/decryption happens in the browser using AES-GCM
- **Zero-knowledge**: Server never sees unencrypted data
- **Automatic expiration**: Secrets expire based on TTL (60 seconds to 24 hours)
- **One-time access**: Secrets can be deleted after first viewing
- **Secure key sharing**: Encryption keys are stored in URL fragments (#) and never sent to server
- **Modern security**: Uses Web Crypto API for cryptographically secure operations

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: Redis for TTL-based storage
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Encryption**: Web Crypto API (AES-GCM 256-bit)
- **Deployment**: Vercel-ready configuration

## Quick Start

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd ephemeral-clip
   bun install
   ```

2. **Start Redis (required for production, optional for development):**
   ```bash
   # Using Docker
   docker run -p 6379:6379 redis:alpine
   
   # Or install Redis locally
   # Windows: https://redis.io/docs/getting-started/installation/install-redis-on-windows/
   # macOS: brew install redis && brew services start redis
   # Linux: sudo apt-get install redis-server
   ```

3. **Set environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env if needed (defaults work for local development)
   ```

4. **Start the development server:**
   ```bash
   bun start
   ```

5. **Open your browser:**
   Navigate to `http://localhost:3000`

### Deployment to Vercel

1. **Connect your repository to Vercel:**
   - Push your code to GitHub
   - Connect the repository in Vercel dashboard

2. **Configure environment variables in Vercel:**
   - Go to your project settings in Vercel
   - Add environment variable: `REDIS_URL` with your Redis connection string
   - For development: Use Upstash Redis or Redis Cloud (free tiers available)

3. **Deploy:**
   - Vercel will automatically deploy on every push to main branch
   - The `vercel.json` configuration is already included

### Redis Setup for Production

For production deployment, you'll need a Redis instance. Here are some options:

**Free Options:**
- [Upstash Redis](https://upstash.com/) - Serverless Redis with free tier
- [Redis Cloud](https://redis.com/redis-enterprise-cloud/) - Free 30MB instance

**Self-hosted:**
- DigitalOcean, AWS ElastiCache, Google Cloud Memorystore

Set the `REDIS_URL` environment variable to your Redis connection string:
```
redis://username:password@host:port
```

## API Documentation

### POST /api/create
Create a new encrypted secret.

**Request Body:**
```json
{
  "ciphertext": "base64-encoded-encrypted-data",
  "iv": "base64-encoded-initialization-vector",
  "ttl": 60
}
```

**Response:**
```json
{
  "id": "32-character-hex-string",
  "ttl": 60,
  "message": "Secret stored successfully"
}
```

### GET /api/secret/:id
Retrieve an encrypted secret.

**Response:**
```json
{
  "ciphertext": "base64-encoded-encrypted-data",
  "iv": "base64-encoded-initialization-vector"
}
```

### DELETE /api/secret/:id
Delete a secret from storage.

**Response:**
```json
{
  "message": "Secret deleted successfully"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "redis": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security Features

### Client-Side Encryption
- **Algorithm**: AES-GCM with 256-bit keys
- **Key Generation**: Cryptographically secure random keys
- **IV**: Random 12-byte initialization vector for each encryption
- **Key Storage**: Encryption keys are only stored in URL fragments (#)

### Server Security
- **Zero Knowledge**: Server only stores encrypted data
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Built-in protection against abuse
- **CORS**: Properly configured for secure cross-origin requests

### Transport Security
- **HTTPS Only**: All production traffic should use HTTPS
- **Fragment Security**: Encryption keys in URL fragments are never sent to server
- **Memory Clearing**: Secrets are cleared from memory after use

## Usage Flow

1. **Create Secret:**
   - User pastes secret into form
   - JavaScript generates random AES-GCM key
   - Secret is encrypted locally in browser
   - Only ciphertext + IV sent to server
   - Server stores encrypted data with TTL
   - User gets link with encryption key in fragment

2. **Share Link:**
   - Full URL contains secret ID and encryption key
   - Key is in fragment (#) so it's never sent to server
   - Link can be shared via secure channels

3. **Retrieve Secret:**
   - Recipient opens link
   - JavaScript extracts ID and key from URL
   - Fetches encrypted data from server
   - Decrypts locally using key from URL fragment
   - Shows plaintext secret to user
   - Option to delete from server immediately

## Browser Compatibility

Requires browsers with Web Crypto API support:
- Chrome 37+
- Firefox 34+
- Safari 7+
- Edge 79+

## Development Notes

### Fallback Storage
The application includes a memory-based fallback when Redis is unavailable, making it easy to develop locally without Redis.

### Security Considerations
- Never log or store encryption keys server-side
- Clear sensitive data from memory after use
- Use HTTPS in production
- Consider implementing rate limiting
- Monitor for unusual access patterns

### Performance
- Encryption/decryption is fast for typical password/token sizes
- Redis TTL automatically handles cleanup
- Minimal server resources required

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
- Check the GitHub issues
- Review the security considerations
- Ensure your browser supports Web Crypto API
