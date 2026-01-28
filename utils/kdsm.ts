/**
 * KDSM (Keyed Dynamic Shift Matrix) Encryption Algorithm
 *
 * A custom encryption algorithm that uses a key to generate a seed,
 * which then determines character shifts in a dynamic pattern.
 */

import { getWordsByLength } from "./constants";

// Cache for derived seeds to avoid recalculating for the same key
// Limited to prevent memory leaks
const seedCache = new Map();
const MAX_CACHE_SIZE = 1000;

/**
 * Adds an entry to the seed cache with LRU eviction
 * @param key - The key to cache
 * @param value - The seed value
 */
function addToCache(key: string, value: number): void {
  // If cache is full, remove the oldest entry (first one)
  if (seedCache.size >= MAX_CACHE_SIZE) {
    const firstKey = seedCache.keys().next().value;
    seedCache.delete(firstKey);
  }
  seedCache.set(key, value);
}

/**
 * Derives a numeric seed from a string key using weighted character codes
 * @param key - The encryption/decryption key
 * @returns A numeric seed derived from the key
 */
export function deriveSeed(key: string): number {
  // Use cached seed if available
  if (key && seedCache.has(key)) {
    return seedCache.get(key)!;
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
    addToCache(key, finalSeed);
  }

  return finalSeed;
}

// URL-safe characters that need special handling
const URL_CHARS = new Set([
  ":",
  "/",
  "?",
  "#",
  "[",
  "]",
  "@",
  "!",
  "$",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  ";",
  "=",
  "-",
  ".",
  "_",
  "~",
  "%",
]);

/**
 * Encrypts a message using the KDSM algorithm
 * @param message - The message to encrypt
 * @param key - Optional encryption key (timestamp used if not provided)
 * @returns The encrypted message
 */
export function encrypt(message: string, key?: string): string {
  if (!message) return "";

  const seed = deriveSeed(key || "");

  // Pre-calculate common modulo values for performance
  const seedMod97 = seed % 97;
  const seedMod11 = seed % 11;

  // Convert message to an array of character codes
  const charCodes = Array.from(message).map((char) => char.codePointAt(0) || 0);

  // Store character codes and their encrypted versions
  const encryptedCodes = new Array(charCodes.length);

  // Process each character in the message
  for (let i = 0; i < charCodes.length; i++) {
    const charCode = charCodes[i];
    const char = message[i];

    // Apply the dynamic shift based on seed and position
    const dynamicShift = seedMod97 + i * seedMod11;

    // Special handling for backslash and pipe characters
    if (char === "\\" || char === "|") {
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
  const result = encryptedCodes.map((code) => String.fromCodePoint(code));

  // Optional: Reverse the string for additional security
  let encrypted = result.reverse().join("");

  // Optional: Swap 3rd and 4th characters if string is long enough
  if (encrypted.length >= 4) {
    const chars = encrypted.split("");
    [chars[2], chars[3]] = [chars[3], chars[2]];
    encrypted = chars.join("");
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
  if (!encrypted) return "";

  const seed = deriveSeed(key || "");

  // Pre-calculate common modulo values for performance
  const seedMod97 = seed % 97;
  const seedMod11 = seed % 11;

  let decrypting = encrypted;

  // Reverse the optional operations from encryption

  // Swap back 3rd and 4th characters if string is long enough
  if (decrypting.length >= 4) {
    const chars = decrypting.split("");
    [chars[2], chars[3]] = [chars[3], chars[2]];
    decrypting = chars.join("");
  }

  // Reverse the string back
  decrypting = decrypting.split("").reverse().join("");

  // Convert to array of character codes
  const charCodes = Array.from(decrypting).map(
    (char) => char.codePointAt(0) || 0
  );
  const decryptedCodes = new Array(charCodes.length);

  // Process each character
  for (let i = 0; i < charCodes.length; i++) {
    const charCode = charCodes[i];

    // Calculate the same dynamic shift used during encryption
    const dynamicShift = seedMod97 + i * seedMod11;

    // Check if this is a URL character marker (300-426 range)
    if (charCode >= 300 && charCode <= 426) {
      // Changed 399 to 426
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
  return decryptedCodes.map((code) => String.fromCodePoint(code)).join("");
}

/**
 * Helper function to ensure password contains at least one character from each required type
 * Optimized with O(n) time complexity and minimal string operations
 * @param password - The generated password
 * @param prefixLength - Length of the custom prefix (if any)
 * @param charSets - Character sets to validate against
 * @returns Password guaranteed to have all character types
 */
function ensureStrongPassword(
  password: string,
  prefixLength: number,
  charSets: {
    lowercase: string;
    uppercase: string;
    numbers: string;
    specialChars: string;
    excludeSimilar: boolean;
  }
): string {
  const { lowercase, uppercase, numbers, specialChars, excludeSimilar } = charSets;
  
  // Single pass check for missing types - O(n)
  let hasLowercase = false;
  let hasUppercase = false;
  let hasNumber = false;
  let hasSpecial = false;
  
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    if (code >= 97 && code <= 122) hasLowercase = true;
    else if (code >= 65 && code <= 90) hasUppercase = true;
    else if (code >= 48 && code <= 57) hasNumber = true;
    else if ("!@#$%^&*()".indexOf(password[i]) !== -1) hasSpecial = true;
    
    if (hasLowercase && hasUppercase && hasNumber && hasSpecial) {
      return password; // Early exit if all types present
    }
  }

  const editableStart = prefixLength;
  const editableLength = password.length - editableStart;

  if (editableLength < 4) return password;

  // Pre-filter character sets if excluding similar chars - O(1) since sets are small
  const getFilteredSet = (charSet: string): string => {
    if (!excludeSimilar) return charSet;
    const similarChars = "0Ol1I";
    let filtered = "";
    for (let i = 0; i < charSet.length; i++) {
      if (similarChars.indexOf(charSet[i]) === -1) {
        filtered += charSet[i];
      }
    }
    return filtered || charSet;
  };

  const lowerSet = getFilteredSet(lowercase);
  const upperSet = getFilteredSet(uppercase);
  const numberSet = getFilteredSet(numbers);
  const specialSet = getFilteredSet(specialChars);

  // Generate 4 unique random positions efficiently - O(1) expected time
  const positions: number[] = [];
  const missingTypes: string[] = [];
  
  if (!hasLowercase) missingTypes.push(lowerSet);
  if (!hasUppercase) missingTypes.push(upperSet);
  if (!hasNumber) missingTypes.push(numberSet);
  if (!hasSpecial) missingTypes.push(specialSet);

  if (missingTypes.length === 0) return password;

  // Use Fisher-Yates to select random positions - O(k) where k is missing types
  const availablePositions: number[] = [];
  for (let i = editableStart; i < password.length; i++) {
    availablePositions.push(i);
  }

  for (let i = 0; i < missingTypes.length; i++) {
    const randomIndex = Math.floor(Math.random() * (availablePositions.length - i)) + i;
    [availablePositions[i], availablePositions[randomIndex]] = [availablePositions[randomIndex], availablePositions[i]];
    positions.push(availablePositions[i]);
  }

  // Build result efficiently - single allocation
  const chars: string[] = Array.from(password);
  for (let i = 0; i < missingTypes.length; i++) {
    const charSet = missingTypes[i];
    chars[positions[i]] = charSet[Math.floor(Math.random() * charSet.length)];
  }

  return chars.join("");
}

/**
 * Generates a random key that can be used for encryption/decryption or as a strong password
 * @param length - Length of the key to generate (default: 10)
 * @param options - Configuration options for character inclusion
 * @returns A random string key
 */
export async function generateKey(
  length: number = 10,
  options?: {
    includeNumbers?: boolean;
    includeSpecialChars?: boolean;
    includeUppercase?: boolean;
    includeLowercase?: boolean;
    excludeSimilar?: boolean; // Exclude similar looking characters like 0, O, l, 1, I
    customWorded?: string; // Custom character set to use instead
    useReadablePassword?: boolean; // Generate readable password with random word prefix
  }
): Promise<string> {
  // Default character sets
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()";
  const similarChars = "0Ol1I"; // Characters that look similar

  let chars = "";
  let customPrefix = "";

  // Build character set based on options (defaults to all types for encryption keys)
  const includeNumbers = options?.includeNumbers ?? true;
  const includeSpecialChars = options?.includeSpecialChars ?? true;
  const includeUppercase = options?.includeUppercase ?? true;
  const includeLowercase = options?.includeLowercase ?? true;
  const excludeSimilar = options?.excludeSimilar ?? false;
  const useReadablePassword = options?.useReadablePassword ?? false;

  // Build character set efficiently - O(1) since sets are constant size
  const charParts: string[] = [];
  if (includeLowercase) charParts.push(lowercase);
  if (includeUppercase) charParts.push(uppercase);
  if (includeNumbers) charParts.push(numbers);
  if (includeSpecialChars) charParts.push(specialChars);
  
  chars = charParts.join("");

  // Remove similar characters if requested - O(n) where n is charset size
  if (excludeSimilar && chars) {
    let filtered = "";
    for (let i = 0; i < chars.length; i++) {
      if (similarChars.indexOf(chars[i]) === -1) {
        filtered += chars[i];
      }
    }
    chars = filtered || lowercase;
  }

  // Fallback to lowercase if no character types are selected
  if (!chars) chars = lowercase;

  // Handle readable password generation with random word prefix
  if (useReadablePassword) {
    // Formula: word_character_count = (password_length / 2) - 1
    const targetWordLength = Math.floor(length / 2) - 1;

    // Clamp word length between 3 and 14
    const clampedLength = Math.max(3, Math.min(14, targetWordLength));

    // Get words of the calculated length
    const wordsOfLength = getWordsByLength(clampedLength);

    if (wordsOfLength && wordsOfLength.length > 0) {
      // Select random word from the appropriate length category
      customPrefix = wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
    } else {
      // Fallback to closest available length if exact length not available
      let closestLength = clampedLength;
      let minDiff = Infinity;

      for (let len = 3; len <= 14; len++) {
        const words = getWordsByLength(len);
        if (words && words.length > 0) {
          const diff = Math.abs(len - clampedLength);
          if (diff < minDiff) {
            minDiff = diff;
            closestLength = len;
          }
        }
      }

      const fallbackWords = getWordsByLength(closestLength);
      if (fallbackWords && fallbackWords.length > 0) {
        customPrefix = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
      }
    }
  }
  // Process custom word prefix with optimized character checking - O(m) where m is word length
  else if (options?.customWorded) {
    const customWorded = options.customWorded;
    const prefixChars: string[] = new Array(customWorded.length);
    
    for (let i = 0; i < customWorded.length; i++) {
      const char = customWorded[i];
      const code = char.charCodeAt(0);
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      
      if (isLetter) {
        if (includeUppercase && includeLowercase) {
          // Random mixed casing
          prefixChars[i] = Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase();
        } else if (includeUppercase && !includeLowercase) {
          prefixChars[i] = char.toUpperCase();
        } else if (includeLowercase && !includeUppercase) {
          prefixChars[i] = char.toLowerCase();
        } else {
          prefixChars[i] = char;
        }
      } else {
        prefixChars[i] = char;
      }
    }
    
    customPrefix = prefixChars.join("");
  }

  // Apply casing to readable password prefix
  if (useReadablePassword && customPrefix) {
    const prefixChars: string[] = new Array(customPrefix.length);
    
    for (let i = 0; i < customPrefix.length; i++) {
      const char = customPrefix[i];
      const code = char.charCodeAt(0);
      const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
      
      if (isLetter) {
        if (includeUppercase && includeLowercase) {
          // Random mixed casing
          prefixChars[i] = Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase();
        } else if (includeUppercase && !includeLowercase) {
          prefixChars[i] = char.toUpperCase();
        } else if (includeLowercase && !includeUppercase) {
          prefixChars[i] = char.toLowerCase();
        } else {
          prefixChars[i] = char;
        }
      } else {
        prefixChars[i] = char;
      }
    }
    
    customPrefix = prefixChars.join("");
  }

  const charsLength = chars.length;
  const remainingLength = Math.max(0, length - customPrefix.length);

  // Check if we should guarantee strong password (all types enabled, no custom word)
  const shouldGuaranteeStrong = !options?.customWorded && 
    includeNumbers && 
    includeSpecialChars && 
    includeUppercase && 
    includeLowercase &&
    remainingLength >= 4;

  // Pre-allocate result array for better memory efficiency
  const result: string[] = new Array(remainingLength);
  let finalPassword: string;

  // Generate random characters - optimized for performance
  // Check if we're in Node.js environment
  if (typeof window === "undefined") {
    try {
      const { randomBytes } = await import("crypto");
      // Use Uint32 for better performance than reading at offsets
      const byteCount = remainingLength * 4;
      const randomBytesArray = randomBytes(byteCount);
      const view = new Uint32Array(randomBytesArray.buffer, randomBytesArray.byteOffset, remainingLength);

      for (let i = 0; i < remainingLength; i++) {
        result[i] = chars[view[i] % charsLength];
      }

      finalPassword = customPrefix ? customPrefix + result.join("") : result.join("");

      // Ensure strong password if all types are enabled
      if (shouldGuaranteeStrong) {
        finalPassword = ensureStrongPassword(finalPassword, customPrefix.length, {
          lowercase,
          uppercase,
          numbers,
          specialChars,
          excludeSimilar
        });
      }

      return finalPassword;
    } catch (error) {
      // Fall through to browser crypto or Math.random
    }
  }

  // Browser environment - use Web Crypto API (most efficient)
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const randomValues = new Uint32Array(remainingLength);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < remainingLength; i++) {
      result[i] = chars[randomValues[i] % charsLength];
    }
  } else {
    // Final fallback - Math.random (least secure but works everywhere)
    for (let i = 0; i < remainingLength; i++) {
      result[i] = chars[Math.floor(Math.random() * charsLength)];
    }
  }

  finalPassword = customPrefix ? customPrefix + result.join("") : result.join("");

  // Ensure strong password if all types are enabled
  if (shouldGuaranteeStrong) {
    finalPassword = ensureStrongPassword(finalPassword, customPrefix.length, {
      lowercase,
      uppercase,
      numbers,
      specialChars,
      excludeSimilar
    });
  }

  return finalPassword;
}

// Clear the seed cache when the module is hot reloaded (for development)
if (typeof module !== "undefined" && (module as any).hot) {
  (module as any).hot?.dispose(() => {
    seedCache.clear();
  });
}
