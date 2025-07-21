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
      } else if (typeof result === 'object' && result.passed) {
        testResults.passed++;
        testResults.tests.push({ name, passed: true, ...result });
        console.log(`✅ PASSED: ${name}`);
      } else {
        testResults.failed++;
        testResults.tests.push({ name, passed: false, error: typeof result === 'string' ? result : result.error });
        console.error(`❌ FAILED: ${name}`, typeof result === 'string' ? result : result.error);
      }
    } catch (error) {
      testResults.failed++;
      testResults.tests.push({ name, passed: false, error: error.message });
      console.error(`❌ FAILED: ${name}`, error.message);
    }
  }

  // Test: Performance benchmark for long input
  runTest("Performance benchmark - Long input encryption/decryption", () => {
    const message = `Plan to rob a bank ^_~ (Spoof)

Step 1: Planning the Plan to Make a Plan

Hold a secret planning meeting at a public Starbucks.

Use fake mustaches and upside-down blueprints for cover.

The hacker pretends to hack but actually plays Minesweeper.

Say "I'm in!" every few minutes to sound cool.

Step 2: Scouting the Bank

Go undercover in disguises:

Lead wears a grandma outfit with cats in a stroller.

Hacker pretends to be IT support with a suspicious name tag.

Muscle guy fakes being a financial advisor who just says "STOCKS!"

Driver waits outside in his Uber.

Use fake spy gadgets like banana microphones and off sunglasses.

Step 3: Distractions

Unleash 42 rubber chickens in the bank lobby.

Start a flash mob dancing to "Baby Shark."

Host a fake seminar on crypto to lure guards away with confusing jargon.

Step 4: Cracking the Vault

Attempt to open the vault with a plastic spoon and stethoscope.

Hacker uses meaningless tech terms to "hack."

Muscle guy breaks his wrist punching the vault.

Realize the vault is already open during business hours and walk in awkwardly.

Step 5: The Money Mishap

Accidentally grab the wrong bags—filled with confetti and Monopoly money.

Mysterious glowing briefcase is ignored.

Vault janitor watches quietly, unimpressed.

Step 6: The Great Escape

Try to escape in the getaway car but it's booted due to unpaid parking.

Switch to a tandem bicycle not designed for four grown adults.

End up in a drive-thru during the chase.

Police catch up but wait behind them in line.

Step 7: Courtroom Drama

Claim it was a performance art piece or social experiment.

Hacker blames bad Wi-Fi.

Driver asks if this affects his Uber rating.

Sentenced to community service as mall Santas.`;

    const key = "performance-test-key";

    const startEncrypt = performance.now();
    const encrypted = encrypt(message, key);
    const endEncrypt = performance.now();

    const startDecrypt = performance.now();
    const decrypted = decrypt(encrypted, key);
    const endDecrypt = performance.now();

    const encryptTime = endEncrypt - startEncrypt;
    const decryptTime = endDecrypt - startDecrypt;

    console.log(`Encryption time for ${message.length} chars: ${encryptTime.toFixed(2)}ms`);
    console.log(`Decryption time for ${message.length} chars: ${decryptTime.toFixed(2)}ms`);

    if (decrypted !== message) {
      return { passed: false, error: "Long input message decryption failed" };
    }

    // Fail if it takes more than 1 second (1000ms) for either operation
    if (encryptTime > 1000 || decryptTime > 1000) {
      return { 
        passed: false, 
        error: `Performance too slow: Encrypt ${encryptTime.toFixed(2)}ms, Decrypt ${decryptTime.toFixed(2)}ms`,
        encryptTime: encryptTime.toFixed(2),
        decryptTime: decryptTime.toFixed(2)
      };
    }

    return {
      passed: true,
      encryptTime: encryptTime.toFixed(2),
      decryptTime: decryptTime.toFixed(2),
      messageLength: message.length
    };
  });

  return testResults;
}

// Function to run in browser console or test environment
export function runTests() {
  console.log("🧪 Running KDSM Algorithm Performance Test...");
  const results = runKDSMTests();
  console.log(`✅ Passed: ${results.passed}, ❌ Failed: ${results.failed}`);
  return results;
}