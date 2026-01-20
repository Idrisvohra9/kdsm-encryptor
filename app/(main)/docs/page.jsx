import ScrollToTop from "@/components/ui/ScrollToTop";
import Scrollspy from "@/components/ui/Scrollspy";
import Section from "@/components/ui/Section";
import DocsHeader from "@/components/ui/DocsHeader";
import DocsCodeBlock from "@/components/ui/DocsCodeBlock";
import { Info, TriangleAlert } from "lucide-react";
import Image from "next/image";
import { FAQs } from "@/utils/constants";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
function Faq({ question, answer }) {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger>
        <h3 className="cursor-pointer">{question}</h3>
      </AccordionTrigger>
      <AccordionContent>
        <p className="text-sm text-muted-foreground">{answer}</p>
      </AccordionContent>
    </AccordionItem>
  );
}
export default function ReadmePage() {
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "how-it-works", title: "How It Works" },
    { id: "features", title: "Features" },
    { id: "security", title: "Security" },
    { id: "usage", title: "Usage" },
    { id: "technical", title: "Technical Details" },
    { id: "free-password-generation-api", title: "API Pass Gen. (free)" },
    { id: "encryption-api", title: "Encryption API" },
    { id: "faqs", title: "FAQs" },
  ];

  return (
    <div className="min-h-screen">
      <DocsHeader />

      <div className="flex justify-center top-[360px] relative z-10 min-w-full min-h-screen flex-col">
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
          <Section
            id="free-password-generation-api"
            title="API Pass Gen. (free)"
          >
            <p className="mb-4">
              Integrate the ability to generate a strong password in your
              project with ease with our API for free!
            </p>
            <div className="bg-accent p-4 rounded-lg text-blue-400 mb-4">
              <h4 className="font-medium mb-2 flex">
                <Info className="mr-2 size-5" />
                Important info
              </h4>
              <ul className="text-sm space-y-1">
                <li>• Free for all (No API key required)</li>
                <li>• Usage is not monitored or rate-limited</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">
                GET /password-generator
              </h4>
              <p className="mb-4">
                Generate a strong password via query parameters.
              </p>
              <h5 className="font-medium mb-2">Query Parameters:</h5>
              <DocsCodeBlock>{`length=12&includeNumbers=true&includeSpecialChars=true&includeUppercase=true&includeLowercase=true&excludeSimilar=false&useCustomWord=false&customWord=&useReadablePassword=false`}</DocsCodeBlock>
              <div className="my-4 space-y-2 text-sm">
                <p>
                  <strong>All Parameters:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      length
                    </code>{" "}
                    - Password length (6-30 characters)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      includeNumbers
                    </code>{" "}
                    - Include numbers 0-9 (true/false)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      includeSpecialChars
                    </code>{" "}
                    - Include special characters (true/false)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      includeUppercase
                    </code>{" "}
                    - Include uppercase letters (true/false)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      includeLowercase
                    </code>{" "}
                    - Include lowercase letters (true/false)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      excludeSimilar
                    </code>{" "}
                    - Exclude similar characters like 0, O, l, 1, I (true/false)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      useCustomWord
                    </code>{" "}
                    - Enable custom word prefix (true/false)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      customWord
                    </code>{" "}
                    - Your custom word (3-14 characters, required if
                    useCustomWord=true)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      useReadablePassword
                    </code>{" "}
                    - Generate with random readable word prefix (true/false, mutually exclusive with useCustomWord)
                  </li>
                </ul>
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                  <p className="text-xs">
                    <strong>Note:</strong> When <code className="bg-secondary px-1 rounded">useReadablePassword=true</code>, 
                    the API automatically selects an appropriate word based on password length using the formula: 
                    word_length = (password_length / 2) - 1. This creates memorable passwords with a readable word prefix 
                    followed by random characters.
                  </p>
                </div>
              </div>
              <h5 className="font-medium mb-2 mt-4">Response:</h5>
              <DocsCodeBlock>{`{ "password": "generated_password_here" }`}</DocsCodeBlock>
              <h5 className="font-medium mb-2 mt-4">cURL Examples:</h5>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">Basic password generation:</p>
                  <DocsCodeBlock>{`curl "https://kdsm.tech/api/password-generator?length=12&includeNumbers=true&includeSpecialChars=true"`}</DocsCodeBlock>
                </div>
                <div>
                  <p className="text-sm mb-2">With readable password:</p>
                  <DocsCodeBlock>{`curl "https://kdsm.tech/api/password-generator?length=12&useReadablePassword=true&includeNumbers=true&includeUppercase=true"`}</DocsCodeBlock>
                </div>
                <div>
                  <p className="text-sm mb-2">With custom word:</p>
                  <DocsCodeBlock>{`curl "https://kdsm.tech/api/password-generator?length=15&useCustomWord=true&customWord=secure&includeNumbers=true"`}</DocsCodeBlock>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">
                POST /password-generator
              </h4>

              <p className="mb-4">Generate a strong password via JSON body.</p>
              <h5 className="font-medium mb-2">Request Body:</h5>
              <DocsCodeBlock>{`{
  "length": 12,
  "includeNumbers": true,
  "includeSpecialChars": true,
  "includeUppercase": true,
  "includeLowercase": true,
  "excludeSimilar": false,
  "useCustomWord": false,
  "customWord": "",
  "useReadablePassword": false
}`}</DocsCodeBlock>
              <div className="my-4 space-y-2 text-sm">
                <p>
                  <strong>Request Body Fields:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      length
                    </code>{" "}
                    - Password length (number, 6-30)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      includeNumbers
                    </code>{" "}
                    - Include numbers (boolean)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      includeSpecialChars
                    </code>{" "}
                    - Include special characters (boolean)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      includeUppercase
                    </code>{" "}
                    - Include uppercase letters (boolean)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      includeLowercase
                    </code>{" "}
                    - Include lowercase letters (boolean)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      excludeSimilar
                    </code>{" "}
                    - Exclude similar-looking characters (boolean)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      useCustomWord
                    </code>{" "}
                    - Enable custom word prefix (boolean)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      customWord
                    </code>{" "}
                    - Your custom word, 3-14 characters (string)
                  </li>
                  <li>
                    <code className="bg-secondary px-2 py-1 rounded">
                      useReadablePassword
                    </code>{" "}
                    - Generate with random readable word prefix (boolean)
                  </li>
                </ul>
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                  <p className="text-xs">
                    <strong>Important:</strong> <code className="bg-secondary px-1 rounded">useReadablePassword</code> and{" "}
                    <code className="bg-secondary px-1 rounded">useCustomWord</code> are mutually exclusive. 
                    When <code className="bg-secondary px-1 rounded">useReadablePassword=true</code>, 
                    the system automatically selects a word from a curated list based on the password length, 
                    creating memorable yet secure passwords.
                  </p>
                </div>
              </div>
              <h5 className="font-medium mb-2 mt-4">Response:</h5>
              <DocsCodeBlock>{`{ "password": "generated_password_here" }`}</DocsCodeBlock>
              <h5 className="font-medium mb-2 mt-4">cURL Examples:</h5>
              <div className="space-y-4">
                <div>
                  <p className="text-sm mb-2">Basic password generation:</p>
                  <DocsCodeBlock>{`curl -X POST https://kdsm.tech/api/password-generator \
  -H "Content-Type: application/json" \
  -d '{ "length": 12, "includeNumbers": true }'`}</DocsCodeBlock>
                </div>
                <div>
                  <p className="text-sm mb-2">With readable password:</p>
                  <DocsCodeBlock>{`curl -X POST https://kdsm.tech/api/password-generator \
  -H "Content-Type: application/json" \
  -d '{
    "length": 12,
    "useReadablePassword": true,
    "includeNumbers": true,
    "includeUppercase": true
  }'`}</DocsCodeBlock>
                </div>
                <div>
                  <p className="text-sm mb-2">With custom word:</p>
                  <DocsCodeBlock>{`curl -X POST https://kdsm.tech/api/password-generator \
  -H "Content-Type: application/json" \
  -d '{
    "length": 15,
    "useCustomWord": true,
    "customWord": "moon",
    "includeNumbers": true,
    "includeSpecialChars": true
  }'`}</DocsCodeBlock>
                </div>
              </div>
            </div>
          </Section>
          <Section id="encryption-api" title="Encryption API v1">
            <div className="flex justify-center items-center w-full mb-5">
              <Image
                src="/icons/api.webp"
                width={120}
                height={120}
                className="me-2 object-cover"
                alt="KDSM API"
              />
            </div>
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900">
                  🚀 Getting Started
                </h4>
                <p className="text-sm text-blue-800">
                  To use the KDSM API, you'll need to create an API key from
                  your profile page. Navigate to Profile → Developer tab to
                  generate your API keys.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Base URL</h3>
                <DocsCodeBlock>https://kdsm.tech/api/v1</DocsCodeBlock>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Authentication</h3>
                <p className="mb-4">
                  All API requests require an API key to be included in the
                  request headers:
                </p>
                <DocsCodeBlock>x-api-key: your_api_key_here</DocsCodeBlock>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Rate Limits</h3>
                <div className="bg-secondary p-4 rounded-lg mb-4">
                  <h4 className="font-medium mb-3">
                    Tier-based Rate Limiting (Only applicable to API v1)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 p-3 bg-gray-600 rounded">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Free Users</div>
                        <div className="text-xs text-muted-foreground">
                          10 calls per day
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-gray-600 rounded">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Premium Users</div>
                        <div className="text-xs text-muted-foreground">
                          100 calls per day
                        </div>
                      </div>
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
                    <DocsCodeBlock>{`{
  "message": "Hello, World!",
  "key": "optional-custom-key"
}`}</DocsCodeBlock>

                    <h5 className="font-medium mb-2 mt-4">Response:</h5>
                    <DocsCodeBlock>{`{
  "success": true,
  "data": {
    "encryptedMessage": "encrypted_text_here",
    "key": "encryption_key_used",
    "keyGenerated": false
  }
}`}</DocsCodeBlock>

                    <h5 className="font-medium mb-2 mt-4">cURL Example:</h5>
                    <DocsCodeBlock>{`curl -X POST https://kdsm.tech/api/v1/encrypt \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your_api_key_here" \\
  -d '{
    "message": "Hello, World!",
    "key": "my-secret-key"
  }'`}</DocsCodeBlock>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">POST /decrypt</h4>
                    <p className="mb-4">Decrypt a KDSM encrypted message.</p>

                    <h5 className="font-medium mb-2">Request Body:</h5>
                    <DocsCodeBlock>{`{
  "encryptedMessage": "encrypted_text_here",
  "key": "decryption_key"
}`}</DocsCodeBlock>

                    <h5 className="font-medium mb-2 mt-4">Response:</h5>
                    <DocsCodeBlock>{`{
  "success": true,
  "data": {
    "decryptedMessage": "Hello, World!"
  }
}`}</DocsCodeBlock>

                    <h5 className="font-medium mb-2 mt-4">cURL Example:</h5>
                    <DocsCodeBlock>{`curl -X POST https://kdsm.tech/api/v1/decrypt \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: your_api_key_here" \\
  -d '{
    "encryptedMessage": "encrypted_text_here",
    "key": "my-secret-key"
  }'`}</DocsCodeBlock>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Error Responses</h3>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">400 Bad Request</h5>
                    <DocsCodeBlock>{`{
  "success": false,
  "error": "Message is required"
}`}</DocsCodeBlock>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">401 Unauthorized</h5>
                    <DocsCodeBlock>{`{
  "success": false,
  "error": "Invalid API key"
}`}</DocsCodeBlock>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">429 Too Many Requests</h5>
                    <DocsCodeBlock>{`{
  "success": false,
  "error": "Rate limit exceeded. Maximum 10 requests per day."
}`}</DocsCodeBlock>
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
                <DocsCodeBlock>{`class KDSMClient {
  constructor(apiKey, baseUrl = 'https://kdsm.tech/api/v1') {
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
}`}</DocsCodeBlock>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Python Example</h3>
                <DocsCodeBlock>{`import requests
import json

class KDSMClient:
    def __init__(self, api_key, base_url="https://kdsm.tech/api/v1"):
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
    print(f"Error: {e}")`}</DocsCodeBlock>
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

              <div className="bg-accent p-4 rounded-lg text-orange-400">
                <h4 className="font-medium mb-2 flex">
                  <TriangleAlert className="mr-2 size-5" />
                  Important Notes
                </h4>
                <ul className="text-sm space-y-1">
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

          <Section id="faqs" title="FAQs" className="mb-10">
            <div className="space-y-4">
              <Accordion
                type="single"
                collapsible
                className="w-full"
                defaultValue={FAQs[0].question}
              >
                {FAQs.map((faq, index) => (
                  <Faq
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </Accordion>
            </div>
          </Section>
        </main>
      </div>

      <ScrollToTop />
    </div>
  );
}
