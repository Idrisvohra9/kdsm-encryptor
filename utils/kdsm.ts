/**
 * KDSM (Keyed Dynamic Shift Matrix) Encryption Algorithm
 * 
 * A custom encryption algorithm that uses a key to generate a seed,
 * which then determines character shifts in a dynamic pattern.
 */

/**
 * Derives a numeric seed from a string key using weighted character codes
 * @param key - The encryption/decryption key
 * @returns A numeric seed derived from the key
 */
export function deriveSeed(key: string): number {
  if (!key || key.length === 0) {
    // If no key is provided, use current timestamp as seed
    return Date.now() % 10000;
  }

  // Calculate weighted sum of character codes
  let seed = 0;
  for (let i = 0; i < key.length; i++) {
    // Multiply each char code by its position (i+1) for better distribution
    seed += key.charCodeAt(i) * (i + 1);
  }

  // Ensure seed is positive and reasonably sized
  return Math.abs(seed) % 10000;
}

/**
 * Encrypts a message using the KDSM algorithm
 * @param message - The message to encrypt
 * @param key - Optional encryption key (timestamp used if not provided)
 * @returns The encrypted message
 */
export function encrypt(message: string, key?: string): string {
  if (!message) return '';
  
  const seed = deriveSeed(key || '');
  const result = [];
  
  // Process each character in the message
  for (let i = 0; i < message.length; i++) {
    const charCode = message.charCodeAt(i);
    
    // Apply the dynamic shift based on seed and position
    const dynamicShift = (seed % 97) + i * (seed % 11);
    
    // Ensure we're working within the printable ASCII range (32-126)
    // Use a consistent modulo approach to preserve character properties
    let shiftedCode = charCode + dynamicShift;
    
    // Wrap around within printable ASCII range (32-126)
    while (shiftedCode > 126) {
      shiftedCode = 31 + (shiftedCode - 126);
    }
    
    result.push(String.fromCharCode(shiftedCode));
  }
  
  // Optional: Reverse the string for additional security
  let encrypted = result.join('').split('').reverse().join('');
  
  // Optional: Swap 3rd and 4th characters if string is long enough
  if (encrypted.length >= 4) {
    const chars = encrypted.split('');
    [chars[2], chars[3]] = [chars[3], chars[2]];
    encrypted = chars.join('');
  }
  
  // Return the encrypted result
  return encrypted;
}

/**
 * Decrypts a message that was encrypted with the KDSM algorithm
 * @param encrypted - The encrypted message
 * @param key - The decryption key (must match encryption key)
 * @returns The decrypted message
 */
export function decrypt(encrypted: string, key?: string): string {
  if (!encrypted) return '';
  
  const seed = deriveSeed(key || '');
  let decrypting = encrypted;
  
  // Reverse the optional operations from encryption
  
  // Swap back 3rd and 4th characters if string is long enough
  if (decrypting.length >= 4) {
    const chars = decrypting.split('');
    [chars[2], chars[3]] = [chars[3], chars[2]];
    decrypting = chars.join('');
  }
  
  // Reverse the string back
  decrypting = decrypting.split('').reverse().join('');
  
  const result = [];
  
  // Process each character
  for (let i = 0; i < decrypting.length; i++) {
    const charCode = decrypting.charCodeAt(i);
    
    // Calculate the same dynamic shift used during encryption
    const dynamicShift = (seed % 97) + i * (seed % 11);
    
    // Reverse the shift operation with proper wrapping
    let unshiftedCode = charCode - dynamicShift;
    
    // Ensure proper wrapping in the printable ASCII range (32-126)
    while (unshiftedCode < 32) {
      unshiftedCode = 127 - (32 - unshiftedCode);
    }
    
    result.push(String.fromCharCode(unshiftedCode));
  }
  
  return result.join('');
}

/**
 * Generates a random key that can be used for encryption/decryption
 * @param length - Length of the key to generate (default: 10)
 * @returns A random string key
 */
export function generateKey(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    result += chars.charAt(randomIndex);
  }
  
  return result;
}