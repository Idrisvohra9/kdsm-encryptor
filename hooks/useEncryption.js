import { useMemo } from 'react';
import { encrypt, decrypt } from '@/utils/kdsm';
import crypto from 'crypto';

export const useEncryption = (roomKey) => {
  const encryptionUtils = useMemo(() => {
    if (!roomKey) {
      return {
        encrypt: null,
        decrypt: null,
        sign: null,
        verify: null
      };
    }

    return {
      encrypt: (message) => {
        try {
          return encrypt(message, roomKey);
        } catch (error) {
          console.error('Encryption error:', error);
          throw new Error('Failed to encrypt message');
        }
      },

      decrypt: (encryptedMessage) => {
        try {
          return decrypt(encryptedMessage, roomKey);
        } catch (error) {
          console.error('Decryption error:', error);
          throw new Error('Failed to decrypt message');
        }
      },

      sign: (message, timestamp) => {
        try {
          const data = `${message}${timestamp}${roomKey}`;
          return crypto.createHash('sha256').update(data).digest('hex');
        } catch (error) {
          console.error('Signing error:', error);
          throw new Error('Failed to sign message');
        }
      },

      verify: (message, timestamp, signature) => {
        try {
          const expectedSignature = crypto.createHash('sha256')
            .update(`${message}${timestamp}${roomKey}`)
            .digest('hex');
          return expectedSignature === signature;
        } catch (error) {
          console.error('Verification error:', error);
          return false;
        }
      }
    };
  }, [roomKey]);

  return encryptionUtils;
};