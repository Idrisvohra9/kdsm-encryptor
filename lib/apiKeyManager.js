import { Client, Databases, ID, Query, Users } from 'node-appwrite';
import { config, collections } from '@/lib/appwrite/kdsm';
import crypto from 'crypto';

// Initialize client once
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

const databases = new Databases(client);
const users = new Users(client);

// Cache for user tiers
const userTierCache = new Map();
const TIER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class ApiKeyManager {
  static generateApiKey() {
    return `kdsm_${crypto.randomBytes(16).toString('hex')}`;
  }

  static async createApiKey(userId, keyName) {
    try {
      // Fetch existing keys and check constraints in one query
      const existingKeys = await databases.listDocuments(
        config.database,
        collections.api_keys,
        [
          Query.equal('userId', userId),
          Query.equal('isActive', true)
        ]
      );

      if (existingKeys.total >= 3) {
        throw new Error('Maximum of 3 API keys allowed per user');
      }

      if (existingKeys.documents.some(key => key.keyName === keyName)) {
        throw new Error('API key name already exists');
      }

      const apiKey = this.generateApiKey();
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      const newKey = await databases.createDocument(
        config.database,
        collections.api_keys,
        ID.unique(),
        {
          userId,
          keyName,
          apiKey,
          isActive: true,
          expiresAt: expiresAt.toISOString(),
        }
      );

      return {
        id: newKey.$id,
        keyName: newKey.keyName,
        apiKey: newKey.apiKey,
      };
    } catch (error) {
      throw new Error(`Failed to create API key: ${error.message}`);
    }
  }

  static async validateApiKey(apiKey) {
    try {
      const keys = await databases.listDocuments(
        config.database,
        collections.api_keys,
        [
          Query.equal('apiKey', apiKey),
          Query.equal('isActive', true),
          Query.limit(1)
        ]
      );

      if (keys.total === 0) return null;

      const keyDoc = keys.documents[0];
      
      // Update last used timestamp asynchronously
      databases.updateDocument(
        config.database,
        collections.api_keys,
        keyDoc.$id,
        {
          lastUsed: new Date().toISOString()
        }
      ).catch(console.error);

      return {
        id: keyDoc.$id,
        userId: keyDoc.userId,
        keyName: keyDoc.keyName
      };
    } catch (error) {
      console.error('API key validation error:', error);
      return null;
    }
  }

  static async getUserTier(userId) {
    try {
      // Check cache first
      const cached = userTierCache.get(userId);
      if (cached && Date.now() - cached.timestamp < TIER_CACHE_TTL) {
        return cached.tier;
      }

      const user = await users.get(userId);
      const labels = user.labels || [];
      
      let tier = 'free';
      if (labels.includes('admin')) {
        tier = 'admin';
      } else if (labels.includes('premium')) {
        tier = 'premium';
      }

      // Update cache
      userTierCache.set(userId, {
        tier,
        timestamp: Date.now()
      });

      return tier;
    } catch (error) {
      console.error('Error fetching user tier:', error);
      return 'free';
    }
  }

  static getRateLimitForTier(tier) {
    const limits = {
      admin: -1,
      premium: 100,
      free: 10
    };
    return limits[tier] ?? 10;
  }

  static async checkRateLimit(userId) {
    try {
      const userTier = await this.getUserTier(userId);
      const dailyLimit = this.getRateLimitForTier(userTier);
      
      if (dailyLimit === -1) return true;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const usage = await databases.listDocuments(
        config.database,
        collections.api_usage,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('timestamp', today.toISOString()),
          Query.equal('success', true),
          Query.limit(dailyLimit + 1)
        ]
      );

      return usage.total < dailyLimit;
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  }

  static async getRateLimitStatus(userId) {
    try {
      const [userTier, usage] = await Promise.all([
        this.getUserTier(userId),
        this.getUsageCount(userId)
      ]);
      
      const dailyLimit = this.getRateLimitForTier(userTier);
      
      if (dailyLimit === -1) {
        return {
          tier: userTier,
          limit: 'unlimited',
          used: 0,
          remaining: 'unlimited'
        };
      }

      return {
        tier: userTier,
        limit: dailyLimit,
        used: usage,
        remaining: Math.max(0, dailyLimit - usage)
      };
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      return {
        tier: 'free',
        limit: 10,
        used: 0,
        remaining: 10
      };
    }
  }

  static async getUsageCount(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const usage = await databases.listDocuments(
      config.database,
      collections.api_usage,
      [
        Query.equal('userId', userId),
        Query.greaterThanEqual('timestamp', today.toISOString()),
        Query.equal('success', true)
      ]
    );
    
    return usage.total;
  }

  static async logApiUsage(apiKeyId, userId, endpoint, success, ipAddress = null) {
    try {
      // Fire and forget logging
      databases.createDocument(
        config.database,
        collections.api_usage,
        ID.unique(),
        {
          apiKeyId,
          userId,
          endpoint,
          timestamp: new Date().toISOString(),
          ipAddress,
          success
        }
      ).catch(console.error);
    } catch (error) {
      console.error('Failed to log API usage:', error);
    }
  }

  static async getUserApiKeys(userId) {
    try {
      const keys = await databases.listDocuments(
        config.database,
        collections.api_keys,
        [
          Query.equal('userId', userId),
          Query.equal('isActive', true),
          Query.orderDesc('$createdAt')
        ]
      );

      return keys.documents;
    } catch (error) {
      throw new Error(`Failed to fetch API keys: ${error.message}`);
    }
  }

  static async deleteApiKey(keyId, userId) {
    try {
      const key = await databases.getDocument(
        config.database,
        collections.api_keys,
        keyId
      );

      if (key.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await databases.updateDocument(
        config.database,
        collections.api_keys,
        keyId,
        {
          isActive: false
        }
      );

      return true;
    } catch (error) {
      throw new Error(`Failed to delete API key: ${error.message}`);
    }
  }
}