import { Client, Databases, ID, Query } from 'node-appwrite';
import { config } from '@/lib/appwrite/kdsm';
import crypto from 'crypto';

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);

const databases = new Databases(client);

export class ApiKeyManager {
  static generateApiKey() {
    return `kdsm_${crypto.randomBytes(32).toString('hex')}`;
  }

  static async createApiKey(userId, keyName) {
    try {
      // Check if user already has 3 keys
      const existingKeys = await databases.listDocuments(
        config.database,
        config.api_keys_collection,
        [
          Query.equal('userId', userId),
          Query.equal('isActive', true)
        ]
      );

      if (existingKeys.total >= 3) {
        throw new Error('Maximum of 3 API keys allowed per user');
      }

      // Check for duplicate key names
      const duplicateName = existingKeys.documents.find(
        key => key.keyName === keyName
      );

      if (duplicateName) {
        throw new Error('API key name already exists');
      }

      const apiKey = this.generateApiKey();
      
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 6);

      const newKey = await databases.createDocument(
        config.database,
        config.api_keys_collection,
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
        config.api_keys_collection,
        [
          Query.equal('apiKey', apiKey),
          Query.equal('isActive', true)
        ]
      );

      if (keys.total === 0) {
        return null;
      }

      const keyDoc = keys.documents[0];
      
      // Update last used timestamp
      await databases.updateDocument(
        config.database,
        config.api_keys_collection,
        keyDoc.$id,
        {
          lastUsed: new Date().toISOString()
        }
      );

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

  static async checkRateLimit(apiKeyId, userId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const usage = await databases.listDocuments(
        config.database,
        config.api_usage_collection,
        [
          Query.equal('apiKeyId', apiKeyId),
          Query.greaterThanEqual('timestamp', today.toISOString()),
          Query.equal('success', true)
        ]
      );

      return usage.total < 10; // 10 requests per day limit
    } catch (error) {
      console.error('Rate limit check error:', error);
      return false;
    }
  }

  static async logApiUsage(apiKeyId, userId, endpoint, success, ipAddress = null) {
    try {
      await databases.createDocument(
        config.database,
        config.api_usage_collection,
        ID.unique(),
        {
          apiKeyId,
          userId,
          endpoint,
          timestamp: new Date().toISOString(),
          ipAddress,
          success
        }
      );
    } catch (error) {
      console.error('Failed to log API usage:', error);
    }
  }

  static async getUserApiKeys(userId) {
    try {
      const keys = await databases.listDocuments(
        config.database,
        config.api_keys_collection,
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
      // Verify ownership
      const key = await databases.getDocument(
        config.database,
        config.api_keys_collection,
        keyId
      );

      if (key.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await databases.updateDocument(
        config.database,
        config.api_keys_collection,
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