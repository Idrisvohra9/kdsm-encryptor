import { encrypt, decrypt } from "./kdsm";

/**
 * Test suite for KDSM encryption/decryption
 * Runs a series of tests to verify algorithm correctness
 */
export function runKDSMTests() {
  const testResults = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Helper function to run a test
  function runTest(name, test) {
    try {
      const result = test();
      if (result === true) {
        testResults.passed++;
        testResults.tests.push({ name, passed: true });
        console.log(`✅ PASSED: ${name}`);
      } else {
        testResults.failed++;
        testResults.tests.push({ name, passed: false, error: result });
        console.error(`❌ FAILED: ${name}`, result);
      }
    } catch (error) {
      testResults.failed++;
      testResults.tests.push({ name, passed: false, error: error.message });
      console.error(`❌ FAILED: ${name}`, error.message);
    }
  }

  // Test 1: Basic encryption/decryption
  // runTest("Basic encryption/decryption", () => {
  //   const message = "Hello, World!";
  //   const key = "test-key";
  //   const encrypted = encrypt(message, key);
  //   const decrypted = decrypt(encrypted, key);

  //   if (decrypted !== message) {
  //     return `Expected "${message}" but got "${decrypted}"`;
  //   }
  //   return true;
  // });

  // // Test 2: Empty message
  // runTest("Empty message", () => {
  //   const message = "";
  //   const key = "test-key";
  //   const encrypted = encrypt(message, key);
  //   const decrypted = decrypt(encrypted, key);

  //   if (decrypted !== message) {
  //     return `Expected empty string but got "${decrypted}"`;
  //   }
  //   return true;
  // });

  // // Test 3: No key provided (should use auto-generated key)
  // runTest("No key provided", () => {
  //   const message = "Secret message with no key";
  //   const encrypted = encrypt(message);
  //   // We can't decrypt without the same key, so this is just checking it doesn't throw
  //   return encrypted.length > 0;
  // });

  // // Test 4: Long message (1000+ characters)
  // runTest("Long message (1000+ characters)", () => {
  //   let longMessage = "";
  //   for (let i = 0; i < 100; i++) {
  //     longMessage +=
  //       "This is a very long message that needs to be encrypted and decrypted correctly. ";
  //   }
  //   const key = "long-message-key";
  //   const encrypted = encrypt(longMessage, key);
  //   const decrypted = decrypt(encrypted, key);

  //   if (decrypted !== longMessage) {
  //     return `Long message decryption failed. Expected length ${longMessage.length} but got ${decrypted.length}`;
  //   }
  //   return true;
  // });

  // // Test 5: Special characters
  // runTest("Special characters", () => {
  //   const message = "!@#$%^&*()_+{}:\"<>?[];',./-=~`";
  //   const key = "lolamlol^^^";
  //   const encrypted = encrypt(message, key);
  //   const decrypted = decrypt(encrypted, key);

  //   if (decrypted !== message) {
  //     return `Expected "${message}" but got "${decrypted}"`;
  //   }
  //   return true;
  // });

  // // Test 6: Unicode characters
  // runTest("Unicode characters", () => {
  //   const message = "Hello, 世界! こんにちは";
  //   const key = "unicode-key";
  //   const encrypted = encrypt(message, key);
  //   const decrypted = decrypt(encrypted, key);

  //   if (decrypted !== message) {
  //     return `Expected "${message}" but got "${decrypted}"`;
  //   }
  //   return true;
  // });

  // // Test 7: Wrong decryption key
  // runTest("Wrong decryption key", () => {
  //   const message = "This is a secret message";
  //   const encryptKey = "correct-key";
  //   const decryptKey = "wrong-key";
  //   const encrypted = encrypt(message, encryptKey);
  //   const decrypted = decrypt(encrypted, decryptKey);

  //   // This should fail (decrypted should not match original)
  //   if (decrypted === message) {
  //     return "Decryption succeeded with wrong key!";
  //   }
  //   return true;
  // });

  // // Test 8: Spaces and whitespace
  // runTest("Spaces and whitespace", () => {
  //   const message = "   Multiple    spaces   and\ttabs\nand newlines\r\n";
  //   const key = "whitespace-key";
  //   const encrypted = encrypt(message, key);
  //   const decrypted = decrypt(encrypted, key);

  //   if (decrypted !== message) {
  //     return `Expected "${message}" but got "${decrypted}"`;
  //   }
  //   return true;
  // });

  // // Test 9: Case preservation
  // runTest("Case preservation", () => {
  //   const message = "ThIs MeSsAgE hAs MiXeD cAsE";
  //   const key = "case-key";
  //   const encrypted = encrypt(message, key);
  //   const decrypted = decrypt(encrypted, key);

  //   if (decrypted !== message) {
  //     return `Expected "${message}" but got "${decrypted}"`;
  //   }
  //   return true;
  // });

  // Test 10: URL encryption/decryption
  // runTest("URL encryption/decryption", () => {
  //   const urls = [
  //     "https://youtube.com/shorts/CBOOQiB8-cg?si=9iJHnYjrz8COqteH",
  //     "https://youtube.com/shorts/vMNXDeCsk4E?si=RWlYSR7TfW7V6I2k",
  //     "https://youtube.com/shorts/J2Hyh8jyEsE?si=-dzJYOkCOdHrzSIU",
  //     "https://youtube.com/shorts/hDnt5vtZSa4?si=WglbV7aZoEsiv_CD",
  //   ];

  //   // Run 10 iterations with random keys
  //   for (let i = 0; i < 10; i++) {
  //     // Generate random 8 digit key
  //     const randomKey = generateKey()
  //     // Test each URL with the random key
  //     for (const url of urls) {
  //       const encrypted = encrypt(url, randomKey);
  //       const decrypted = decrypt(encrypted, randomKey);
  //       console.log("Decrypted: ", decrypted);
  //       if (decrypted !== url) {
  //         return `Failed on iteration ${
  //           i + 1
  //         } with key ${randomKey}. Expected "${url}" but got "${decrypted}"`;
  //       }
  //     }
  //     console.log(`✓ Iteration ${i + 1} passed with key: ${randomKey}`);
  //   }

  //   return true;
  // });

  // Test 11: Complex URL with special characters
  // runTest("Complex URL with special characters", () => {
  //   const url =
  //     "https://example.com/path/to/resource?query=value&another=123#fragment-id";
  //   const key = "complex-url-key";
  //   const encrypted = encrypt(url, key);
  //   const decrypted = decrypt(encrypted, key);

  //   if (decrypted !== url) {
  //     return `Expected "${url}" but got "${decrypted}"`;
  //   }
  //   return true;
  // });

  // Test 12: Performance benchmark
  // runTest("Performance benchmark", () => {
  //   const message = "A".repeat(10000); // 10,000 character message
  //   const key = "benchmark-key";

  //   const startEncrypt = performance.now();
  //   const encrypted = encrypt(message, key);
  //   const endEncrypt = performance.now();

  //   const startDecrypt = performance.now();
  //   const decrypted = decrypt(encrypted, key);
  //   const endDecrypt = performance.now();

  //   const encryptTime = endEncrypt - startEncrypt;
  //   const decryptTime = endDecrypt - startDecrypt;

  //   console.log(
  //     `Encryption time for 10,000 chars: ${encryptTime.toFixed(2)}ms`
  //   );
  //   console.log(
  //     `Decryption time for 10,000 chars: ${decryptTime.toFixed(2)}ms`
  //   );

  //   if (decrypted !== message) {
  //     return "Benchmark message decryption failed";
  //   }

  //   // Fail if it takes more than 1 second (1000ms) for either operation
  //   // This threshold can be adjusted based on expected performance
  //   if (encryptTime > 1000 || decryptTime > 1000) {
  //     return `Performance too slow: Encrypt ${encryptTime.toFixed(
  //       2
  //     )}ms, Decrypt ${decryptTime.toFixed(2)}ms`;
  //   }

  //   return true;
  // });

  // Test: Alpha-numeric messages with numeric keys
  runTest("Alpha-numeric messages with numeric keys", () => {
    const message = "Hello123World456";
    const key = "789012";
    const encrypted = encrypt(message, key);
    const decrypted = decrypt(encrypted, key);

    if (decrypted !== message) {
      return `Expected "${message}" but got "${decrypted}"`;
    }
    return true;
  });

  // Test: Numeric messages with numeric keys
  runTest("Numeric messages with numeric keys", () => {
    const message = "1234567890";
    const key = "987654";
    const encrypted = encrypt(message, key);
    const decrypted = decrypt(encrypted, key);

    if (decrypted !== message) {
      return `Expected "${message}" but got "${decrypted}"`;
    }
    return true;
  });
  // Test: Numeric messages with string keys
  runTest("Numeric messages with string keys", () => {
    const message = "1234567890";
    const key = "string-key";
    const encrypted = encrypt(message, key);
    const decrypted = decrypt(encrypted, key);

    if (decrypted !== message) {
      return `Expected "${message}" but got "${decrypted}"`;
    }
    return true;
  });

  return testResults;
}

// Function to run in browser console or test environment
export function runTests() {
  console.log("🧪 Running KDSM Algorithm Tests...");
  const results = runKDSMTests();
  console.log(`✅ Passed: ${results.passed}, ❌ Failed: ${results.failed}`);
  return results;
}
