const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Redis client setup
let redisClient;

async function initRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => {
      console.log('Redis Client Error', err);
    });
    
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    // For development, continue without Redis (use in-memory storage)
    redisClient = null;
  }
}

// In-memory fallback storage for development
const memoryStore = new Map();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Utility functions
function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

async function storeSecret(id, data, ttl) {
  if (redisClient) {
    await redisClient.setEx(id, ttl, JSON.stringify(data));
  } else {
    // Fallback to memory storage with setTimeout for TTL
    memoryStore.set(id, data);
    setTimeout(() => {
      memoryStore.delete(id);
    }, ttl * 1000);
  }
}

async function getSecret(id) {
  if (redisClient) {
    const data = await redisClient.get(id);
    return data ? JSON.parse(data) : null;
  } else {
    return memoryStore.get(id) || null;
  }
}

async function deleteSecret(id) {
  if (redisClient) {
    await redisClient.del(id);
  } else {
    memoryStore.delete(id);
  }
}

// API Routes

// Create secret endpoint
app.post('/api/create', async (req, res) => {
  try {
    const { ciphertext, iv, ttl = 60 } = req.body;
    
    // Validate input
    if (!ciphertext || !iv) {
      return res.status(400).json({ 
        error: 'Missing required fields: ciphertext and iv' 
      });
    }
    
    // Validate TTL (max 24 hours for security)
    const maxTtl = 24 * 60 * 60; // 24 hours
    const validTtl = Math.min(Math.max(parseInt(ttl), 1), maxTtl);
    
    const id = generateId();
    
    await storeSecret(id, { ciphertext, iv }, validTtl);
    
    res.json({ 
      id,
      ttl: validTtl,
      message: 'Secret stored successfully'
    });
    
  } catch (error) {
    console.error('Error creating secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get secret endpoint
app.get('/api/secret/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !/^[a-f0-9]{32}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid secret ID' });
    }
    
    const secret = await getSecret(id);
    
    if (!secret) {
      return res.status(404).json({ error: 'Secret not found or expired' });
    }
    
    res.json(secret);
    
  } catch (error) {
    console.error('Error retrieving secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete secret endpoint
app.delete('/api/secret/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !/^[a-f0-9]{32}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid secret ID' });
    }
    
    await deleteSecret(id);
    
    res.json({ message: 'Secret deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting secret:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    redis: redisClient ? 'connected' : 'fallback',
    timestamp: new Date().toISOString()
  });
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function startServer() {
  await initRedis();
  
  app.listen(PORT, () => {
    console.log(`Ephemeral Clip server running on port ${PORT}`);
    console.log(`Redis status: ${redisClient ? 'connected' : 'using memory fallback'}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
