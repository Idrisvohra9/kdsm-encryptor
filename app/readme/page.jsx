"use client";
import ASCIIText from "@/components/ui/AsciiText";
import Silk from "@/components/ui/Silk";
import VariableProximity from "@/components/ui/VariableProximity";
import ScrollToTop from "@/components/ui/ScrollToTop";
import Scrollspy from "@/components/ui/Scrollspy";
import Section from "@/components/ui/Section";
import { useTheme } from "next-themes";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ReadmePage() {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const [planeBaseHeight, setPlaneBaseHeight] = useState(5);

  // Define sections for the scrollspy
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "how-it-works", title: "How It Works" },
    { id: "features", title: "Features" },
    { id: "security", title: "Security" },
    { id: "usage", title: "Usage" },
    { id: "technical", title: "Technical Details" },
    { id: "api-documentation", title: "API Documentation" },
    { id: "faq", title: "FAQ" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPlaneBaseHeight(2.5);
      } else if (window.innerWidth < 1024) {
        setPlaneBaseHeight(4);
      } else {
        setPlaneBaseHeight(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const CodeBlock = ({ children }) => (
    <div className="relative bg-gray-900 rounded-lg p-4">
      <pre className="text-gray-100 text-sm">
        <code>{children}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
        onClick={() => copyToClipboard(children)}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <Silk
        speed={5}
        scale={1}
        color={theme === "dark" ? "#1d1d1b" : "#fefefe"}
        noiseIntensity={1.5}
        rotation={0}
      />

      <div className="relative z-10">
        <ASCIIText
          text="KDSM"
          enableWaves={true}
          planeBaseHeight={planeBaseHeight}
          textColor={theme === "dark" ? "#fdf9f3" : "#1d1d1b"}
        />
      </div>

      <div className="flex justify-center top-[360px] relative z-10 min-w-full min-h-screen flex-col">
        <header className="flex justify-center items-center h-16 gap-10 mb-10 pt-10 w-full">
          <div
            ref={containerRef}
            style={{
              position: "relative",
              display: "flex",
            }}
          >
            <VariableProximity
              label={"• Keyed Dynamic Shift Matrix •"}
              className={"sm:text-2xl text-lg"}
              fromFontVariationSettings="'wght' 400, 'opsz' 9"
              toFontVariationSettings="'wght' 1000, 'opsz' 40"
              containerRef={containerRef}
              radius={100}
              falloff="gaussian"
            />
          </div>
        </header>

        <Scrollspy sections={sections} />

        <main className="container mx-auto px-4 py-8 max-w-4xl text-primary bg-secondary/30 rounded-xl">
          <Section id="introduction" title="Introduction">
            <p>
              KDSM (Keyed Dynamic Shift Matrix) is an innovative encryption
              system designed to provide secure message encryption with a unique
              approach to cryptography. Unlike traditional encryption methods,
              KDSM uses a dynamic matrix-based algorithm that shifts character
              values based on a unique key.
            </p>
            <p>
              This project was created to offer a lightweight, browser-based
              encryption solution that doesn't require server-side processing or
              complex installations. KDSM Encryptor allows users to securely
              encrypt messages that can only be decrypted with the correct key.
            </p>
          </Section>

          <Section id="how-it-works" title="How It Works">
            <p>
              KDSM encryption operates on a principle of character shifting
              within a dynamic matrix. Here's a simplified explanation of the
              process:
            </p>
            <ol>
              <li>
                <strong>Key Generation:</strong> A unique encryption key is
                either provided by the user or automatically generated.
              </li>
              <li>
                <strong>Matrix Creation:</strong> The key is used to create a
                dynamic shift matrix that determines how each character in the
                message will be transformed.
              </li>
              <li>
                <strong>Character Transformation:</strong> Each character in the
                original message is processed through the matrix, resulting in a
                shifted value.
              </li>
              <li>
                <strong>Encryption Output:</strong> The transformed characters
                are combined to create the encrypted message.
              </li>
            </ol>
            <p>
              Decryption follows the reverse process, using the same key to
              transform the encrypted characters back to their original values.
            </p>
          </Section>

          <Section id="features" title="Features">
            <ul>
              <li>
                <strong>Client-side Encryption:</strong> All
                encryption/decryption happens in your browser - no data is sent
                to any server.
              </li>
              <li>
                <strong>Key Management:</strong> Use your own key or let the
                system generate a secure random key.
              </li>
              <li>
                <strong>Copy with Key:</strong> Share encrypted messages along
                with the key in a special format.
              </li>
              <li>
                <strong>Auto-detection:</strong> When pasting a message with an
                embedded key, the system automatically extracts and applies the
                key.
              </li>
              <li>
                <strong>API Integration:</strong> Use KDSM encryption in your
                own applications via our REST API.
              </li>
              <li>
                <strong>Rate Limited:</strong> Fair usage policy with 10 API
                calls per day per key.
              </li>
              <li>
                <strong>Responsive Design:</strong> Works seamlessly across
                desktop and mobile devices.
              </li>
            </ul>
          </Section>

          <Section id="security" title="Security">
            <p>
              KDSM provides a solid level of security for everyday communication
              needs. However, it's important to understand its security
              characteristics:
            </p>
            <ul>
              <li>
                <strong>Key Importance:</strong> The security of KDSM relies
                entirely on keeping the encryption key secret. Anyone with the
                key can decrypt the message.
              </li>
              <li>
                <strong>API Security:</strong> API keys are required for
                external access and are rate-limited to prevent abuse.
              </li>
              <li>
                <strong>Transport Security:</strong> All API communications
                should use HTTPS to prevent interception.
              </li>
              <li>
                <strong>No Backdoors:</strong> The system contains no backdoors
                or master keys - without the original encryption key, the
                message cannot be recovered.
              </li>
            </ul>
          </Section>

          <Section id="usage" title="Usage">
            <h3>Web Interface</h3>
            <ol>
              <li>Enter your message in the text area.</li>
              <li>
                Optionally enter a custom key or use the "Generate Random Key"
                button.
              </li>
              <li>Click "Encrypt" to generate the encrypted message.</li>
              <li>
                Use the copy buttons to copy either just the encrypted message
                or the message with its key.
              </li>
            </ol>

            <h3>API Integration</h3>
            <p>
              For developers who want to integrate KDSM encryption into their
              applications, we provide a REST API. See the API Documentation
              section below for detailed information.
            </p>
          </Section>

          <Section id="technical" title="Technical Details">
            <p>KDSM Encryptor is built using modern web technologies:</p>
            <ul>
              <li>
                <strong>Framework:</strong> Next.js for React-based UI and
                routing
              </li>
              <li>
                <strong>Backend:</strong> Appwrite for authentication and data
                storage
              </li>
              <li>
                <strong>API:</strong> RESTful API with rate limiting and key
                authentication
              </li>
              <li>
                <strong>UI Components:</strong> Custom components with Tailwind
                CSS for styling
              </li>
              <li>
                <strong>Animations:</strong> Framer Motion for smooth,
                physics-based animations
              </li>
            </ul>
          </Section>

          <Section id="api-documentation" title="API Documentation">
            <div className="flex justify-center items-center w-full mb-5">
              <Image
                src="/dark/5.png"
                width={120}
                height={120}
                className="me-2 object-cover"
                alt="KDSM API"
              />
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                  🚀 Getting Started
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  To use the KDSM API, you'll need to create an API key from
                  your profile page. Navigate to Profile → Developer tab to
                  generate your API keys.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Base URL</h3>
                <CodeBlock>https://kdsm.vercel.app/api/v1</CodeBlock>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Authentication</h3>
                <p className="mb-4">
                  All API requests require an API key to be included in the
                  request headers:
                </p>
                <CodeBlock>x-api-key: your_api_key_here</CodeBlock>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Rate Limits</h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-3">Tier-based Rate Limiting</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Free Users</div>
                        <div className="text-xs text-muted-foreground">
                          10 calls per day
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Premium Users</div>
                        <div className="text-xs text-muted-foreground">
                          100 calls per day
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white/70 dark:bg-gray-800/70 rounded">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li>
                    Rate limits are shared across all API keys for the same user
                  </li>
                  <li>Rate limits reset daily at midnight UTC</li>
                  <li>Maximum 3 API keys per user account</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Endpoints</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-medium mb-2">POST /encrypt</h4>
                    <p className="mb-4">
                      Encrypt a message using KDSM algorithm.
                    </p>

                    <h5 className="font-medium mb-2">Request Body:</h5>
                    <CodeBlock>{`{
  "message": "Hello, World!",
  "key": "optional-custom-key"
}`}</CodeBlock>

                    <h5 className="font-medium mb-2 mt-4">Response:</h5>
                    <CodeBlock>{`{
  "success": true,
  "data": {
    "encryptedMessage": "encrypted_text_here",
    "key": "encryption_key_used",
    "keyGenerated": false
  }
}`}</CodeBlock>

                    <h5 className="font-medium mb-2 mt-4">cURL Example:</h5>
                    <CodeBlock>{`curl -X POST https://kdsm.vercel.app/api/v1/encrypt \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your_api_key_here" \\
  -d '{
    "message": "Hello, World!",
    "key": "my-secret-key"
  }'`}</CodeBlock>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">POST /decrypt</h4>
                    <p className="mb-4">Decrypt a KDSM encrypted message.</p>

                    <h5 className="font-medium mb-2">Request Body:</h5>
                    <CodeBlock>{`{
  "encryptedMessage": "encrypted_text_here",
  "key": "decryption_key"
}`}</CodeBlock>

                    <h5 className="font-medium mb-2 mt-4">Response:</h5>
                    <CodeBlock>{`{
  "success": true,
  "data": {
    "decryptedMessage": "Hello, World!"
  }
}`}</CodeBlock>

                    <h5 className="font-medium mb-2 mt-4">cURL Example:</h5>
                    <CodeBlock>{`curl -X POST https://kdsm.vercel.app/api/v1/decrypt \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your_api_key_here" \\
  -d '{
    "encryptedMessage": "encrypted_text_here",
    "key": "my-secret-key"
  }'`}</CodeBlock>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Error Responses</h3>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">400 Bad Request</h5>
                    <CodeBlock>{`{
  "success": false,
  "error": "Message is required"
}`}</CodeBlock>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">401 Unauthorized</h5>
                    <CodeBlock>{`{
  "success": false,
  "error": "Invalid API key"
}`}</CodeBlock>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">429 Too Many Requests</h5>
                    <CodeBlock>{`{
  "success": false,
  "error": "Rate limit exceeded. Maximum 10 requests per day."
}`}</CodeBlock>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">
                  JavaScript SDK Example
                </h3>
                <p className="mb-4">
                  Here's a simple JavaScript class to interact with the KDSM
                  API:
                </p>
                <CodeBlock>{`class KDSMClient {
  constructor(apiKey, baseUrl = 'https://kdsm.vercel.app/api/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async encrypt(message, key = null) {
    const response = await fetch(\`\${this.baseUrl}/encrypt\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({ message, key })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.data;
  }

  async decrypt(encryptedMessage, key) {
    const response = await fetch(\`\${this.baseUrl}/decrypt\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey
      },
      body: JSON.stringify({ encryptedMessage, key })
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.data;
  }
}

// Usage example
const client = new KDSMClient('your_api_key_here');

// Encrypt a message
try {
  const result = await client.encrypt('Hello, World!');
  console.log('Encrypted:', result.encryptedMessage);
  console.log('Key:', result.key);
} catch (error) {
  console.error('Encryption failed:', error.message);
}

// Decrypt a message
try {
  const result = await client.decrypt('encrypted_text', 'your_key');
  console.log('Decrypted:', result.decryptedMessage);
} catch (error) {
  console.error('Decryption failed:', error.message);
}`}</CodeBlock>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Python Example</h3>
                <CodeBlock>{`import requests
import json

class KDSMClient:
    def __init__(self, api_key, base_url="https://kdsm.vercel.app/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": api_key
        }
    
    def encrypt(self, message, key=None):
        payload = {"message": message}
        if key:
            payload["key"] = key
            
        response = requests.post(
            f"{self.base_url}/encrypt",
            headers=self.headers,
            json=payload
        )
        
        data = response.json()
        if not data["success"]:
            raise Exception(data["error"])
            
        return data["data"]
    
    def decrypt(self, encrypted_message, key):
        payload = {
            "encryptedMessage": encrypted_message,
            "key": key
        }
        
        response = requests.post(
            f"{self.base_url}/decrypt",
            headers=self.headers,
            json=payload
        )
        
        data = response.json()
        if not data["success"]:
            raise Exception(data["error"])
            
        return data["data"]

# Usage example
client = KDSMClient("your_api_key_here")

try:
    # Encrypt a message
    result = client.encrypt("Hello, World!")
    print(f"Encrypted: {result['encryptedMessage']}")
    print(f"Key: {result['key']}")
    
    # Decrypt the message
    decrypted = client.decrypt(result['encryptedMessage'], result['key'])
    print(f"Decrypted: {decrypted['decryptedMessage']}")
    
except Exception as e:
    print(f"Error: {e}")`}</CodeBlock>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Best Practices</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Store API keys securely:</strong> Never expose API
                    keys in client-side code or public repositories
                  </li>
                  <li>
                    <strong>Use environment variables:</strong> Store API keys
                    in environment variables or secure configuration files
                  </li>
                  <li>
                    <strong>Handle rate limits:</strong> Implement proper error
                    handling for rate limit responses
                  </li>
                  <li>
                    <strong>Use HTTPS:</strong> Always use HTTPS when making API
                    requests to protect data in transit
                  </li>
                  <li>
                    <strong>Key management:</strong> Store encryption keys
                    separately from encrypted data
                  </li>
                  <li>
                    <strong>Error handling:</strong> Always check the success
                    field in API responses
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-yellow-900 dark:text-yellow-100">
                  ⚠️ Important Notes
                </h4>
                <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                  <li>
                    • API keys cannot be recovered if lost - store them securely
                  </li>
                  <li>
                    • Encryption keys are separate from API keys - both are
                    required
                  </li>
                  <li>• Rate limits are enforced per API key, not per user</li>
                  <li>
                    • Deleted API keys are immediately revoked and cannot be
                    restored
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="faq" title="FAQ">
            <h3>Is KDSM encryption secure?</h3>
            <p>
              KDSM provides good security for everyday communications. The
              encryption strength depends on the complexity and secrecy of the
              key used.
            </p>

            <h3>Can I recover my message if I lose the key?</h3>
            <p>
              No. Without the exact key used for encryption, it's not possible
              to decrypt the message. There is no recovery mechanism by design.
            </p>

            <h3>How do I get an API key?</h3>
            <p>
              Sign up for an account, go to your Profile page, click on the
              Developer tab, and create a new API key. You can create up to 3
              API keys per account.
            </p>

            <h3>What happens if I exceed the rate limit?</h3>
            <p>
              If you exceed 10 API calls per day, you'll receive a 429 error
              response. Rate limits reset daily at midnight UTC.
            </p>

            <h3>Can I use the API for commercial projects?</h3>
            <p>
              Yes, you can use the KDSM API for both personal and commercial
              projects. However, please respect the rate limits and terms of
              service.
            </p>

            <h3>Is the source code available?</h3>
            <p>
              Yes, KDSM Encryptor is an open-source project. You can view the
              source code on GitHub to verify its security and functionality.
            </p>
          </Section>
        </main>
      </div>

      <ScrollToTop />
    </div>
  );
}
