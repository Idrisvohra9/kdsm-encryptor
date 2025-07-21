import { useMemo } from 'react';
import { encrypt, decrypt } from '@/utils/kdsm';
/**
 * Custom hook to provide encryption and decryption utilities based on the room key.
 * 
 * @param {string} roomKey - The encryption key for the room.
 * @returns {Object} An object containing `encrypt` and `decrypt` functions.
 */
export const useEncryption = (roomKey) => {
  const encryptionUtils = useMemo(() => {
    if (!roomKey) {
      return {
        encrypt: null,
        decrypt: null,
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
    };
  }, [roomKey]);

  return encryptionUtils;
};