/**
 * KDSM (Keyed Dynamic Shift Matrix) Encryption Algorithm
 * 
 * A custom encryption algorithm that uses a key to generate a seed,
 * which then determines character shifts in a dynamic pattern.
 */

// Cache for derived seeds to avoid recalculating for the same key
const seedCache = new Map();

/**
 * Derives a numeric seed from a string key using weighted character codes
 * @param key - The encryption/decryption key
 * @returns A numeric seed derived from the key
 */
export function deriveSeed(key: string): number {
  // Use cached seed if available
  if (key && seedCache.has(key)) {
    return seedCache.get(key);
  }

  if (!key || key.length === 0) {
    // If no key is provided, use current timestamp as seed
    return Date.now() % 10000;
  }

  // Calculate weighted sum of character codes
  let seed = 0;
  const len = key.length;
  
  // Unrolled loop for better performance with common key lengths
  if (len <= 16) {
    for (let i = 0; i < len; i++) {
      seed += key.charCodeAt(i) * (i + 1);
    }
  } else {
    // For longer keys, process in chunks for better performance
    for (let i = 0; i < len; i += 4) {
      if (i < len) seed += key.charCodeAt(i) * (i + 1);
      if (i + 1 < len) seed += key.charCodeAt(i + 1) * (i + 2);
      if (i + 2 < len) seed += key.charCodeAt(i + 2) * (i + 3);
      if (i + 3 < len) seed += key.charCodeAt(i + 3) * (i + 4);
    }
  }

  // Ensure seed is positive and reasonably sized
  const finalSeed = Math.abs(seed) % 10000;
  
  // Cache the result for future use
  if (key) {
    seedCache.set(key, finalSeed);
  }
  
  return finalSeed;
}

// URL-safe characters that need special handling
const URL_CHARS = new Set([':', '/', '?', '#', '[', ']', '@', '!', '$', '&', "'", '(', ')', '*', '+', ',', ';', '=', '-', '.', '_', '~', '%']);

/**
 * Encrypts a message using the KDSM algorithm
 * @param message - The message to encrypt
 * @param key - Optional encryption key (timestamp used if not provided)
 * @returns The encrypted message
 */
export function encrypt(message: string, key?: string): string {
  if (!message) return '';
  
  const seed = deriveSeed(key || '');
  
  // Pre-calculate common modulo values for performance
  const seedMod97 = seed % 97;
  const seedMod11 = seed % 11;
  
  // Convert message to an array of character codes
  const charCodes = Array.from(message).map(char => char.codePointAt(0) || 0);
  
  // Store character codes and their encrypted versions
  const encryptedCodes = new Array(charCodes.length);
  
  // Process each character in the message
  for (let i = 0; i < charCodes.length; i++) {
    const charCode = charCodes[i];
    const char = message[i];
    
    // Apply the dynamic shift based on seed and position
    const dynamicShift = seedMod97 + i * seedMod11;
    
    // Special handling for backslash and pipe characters
    if (char === '\\' || char === '|') {
      // Use a special range (300-399) to mark these characters
      encryptedCodes[i] = 300 + charCode;
    }
    // Special handling for URL characters - preserve them with a marker
    else if (URL_CHARS.has(char)) {
      // Use a special range (300-399) to mark URL characters
      encryptedCodes[i] = 300 + charCode;
    }
    // For ASCII printable range (32-126), use our standard algorithm
    else if (charCode >= 32 && charCode <= 126) {
      let shiftedCode = charCode + dynamicShift;
      
      // Wrap around within printable ASCII range (32-126)
      while (shiftedCode > 126) {
        shiftedCode = 31 + (shiftedCode - 126);
      }
      
      encryptedCodes[i] = shiftedCode;
    } 
    // For whitespace characters (tab, newline, carriage return)
    else if (charCode === 9 || charCode === 10 || charCode === 13) {
      // Special handling: add a marker (200 + original code) to identify these
      encryptedCodes[i] = 200 + charCode;
    }
    // For Unicode and other non-ASCII characters
    else {
      // For Unicode, we'll use a different approach:
      // 1. Take modulo of the shift to get a reasonable value
      const modShift = dynamicShift % 100;
      // 2. Apply a reversible transformation that preserves the high bits
      encryptedCodes[i] = charCode ^ modShift;
    }
  }
  
  // Convert encrypted codes back to a string
  const result = encryptedCodes.map(code => String.fromCodePoint(code));
  
  // Optional: Reverse the string for additional security
  let encrypted = result.reverse().join('');
  
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
  
  // Pre-calculate common modulo values for performance
  const seedMod97 = seed % 97;
  const seedMod11 = seed % 11;
  
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
  
  // Convert to array of character codes
  const charCodes = Array.from(decrypting).map(char => char.codePointAt(0) || 0);
  const decryptedCodes = new Array(charCodes.length);
  
  // Process each character
  for (let i = 0; i < charCodes.length; i++) {
    const charCode = charCodes[i];
    
    // Calculate the same dynamic shift used during encryption
    const dynamicShift = seedMod97 + i * seedMod11;
    
    // Check if this is a URL character marker (300-426 range)
    if (charCode >= 300 && charCode <= 426) { // Changed 399 to 426
      // Extract the original URL character
      decryptedCodes[i] = charCode - 300;
    }
    // Check if this is a special whitespace marker (200-213 range)
    else if (charCode >= 200 && charCode <= 213) {
      // Extract the original whitespace character
      decryptedCodes[i] = charCode - 200;
    }
    // For ASCII printable range
    else if (charCode >= 32 && charCode <= 126) {
      // Reverse the shift operation with proper wrapping
      let unshiftedCode = charCode - dynamicShift;
      
      // Ensure proper wrapping in the printable ASCII range (32-126)
      while (unshiftedCode < 32) {
        unshiftedCode = 127 - (32 - unshiftedCode);
      }
      
      decryptedCodes[i] = unshiftedCode;
    }
    // For Unicode and other non-ASCII characters
    else {
      // Reverse the XOR operation with the same modShift
      const modShift = dynamicShift % 100;
      decryptedCodes[i] = charCode ^ modShift;
    }
  }
  
  // Convert decrypted codes back to a string
  return decryptedCodes.map(code => String.fromCodePoint(code)).join('');
}

/**
 * Generates a random key that can be used for encryption/decryption
 * @param length - Length of the key to generate (default: 10)
 * @returns A random string key
 */
export function generateKey(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  const charsLength = chars.length;
  const result = new Array(length);
  
  // Use Crypto API for better randomness if available
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
      result[i] = chars.charAt(randomValues[i] % charsLength);
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charsLength);
      result[i] = chars.charAt(randomIndex);
    }
  }
  
  return result.join('');
}

// Clear the seed cache when the module is hot reloaded (for development)
if (typeof module !== 'undefined' && (module as any).hot) {
  (module as any).hot?.dispose(() => {
    seedCache.clear();
  });
}