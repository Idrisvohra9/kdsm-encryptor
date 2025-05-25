"use client";
import ASCIIText from "@/components/ui/AsciiText";
import Silk from "@/components/ui/Silk";
import VariableProximity from "@/components/ui/VariableProximity";
import ScrollToTop from "@/components/ui/ScrollToTop";
import Scrollspy from "@/components/ui/Scrollspy";
import Section from "@/components/ui/Section";
import { useTheme } from "next-themes";
import { useRef, useState, useEffect } from "react"; // Import useState and useEffect

export default function ReadmePage() {
  const { theme } = useTheme();
  const containerRef = useRef(null);
  const [planeBaseHeight, setPlaneBaseHeight] = useState(5); // Default to desktop size

  // Define sections for the scrollspy
  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "how-it-works", title: "How It Works" },
    { id: "features", title: "Features" },
    { id: "security", title: "Security" },
    { id: "usage", title: "Usage" },
    { id: "technical", title: "Technical Details" },
    { id: "faq", title: "FAQ" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // Mobile
        setPlaneBaseHeight(2.5);
      } else if (window.innerWidth < 1024) {
        // Tablet
        setPlaneBaseHeight(4);
      } else {
        // Desktop
        setPlaneBaseHeight(5);
      }
    };

    // Set initial height
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          text="K.D.S.M"
          enableWaves={false}
          asciiFontSize={10}
          planeBaseHeight={planeBaseHeight} // Use state variable here
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

        {/* Scrollspy sidebar */}
        <Scrollspy sections={sections} />

        {/* Main content */}
        <main className="container mx-auto px-4 py-8 max-w-4xl text-primary">
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
                <strong>Emoji Handling:</strong> Automatic removal of emojis
                which could otherwise break the encryption process.
              </li>
              <li>
                <strong>Responsive Design:</strong> Works seamlessly across
                desktop and mobile devices.
              </li>
              <li>
                <strong>Dark/Light Mode:</strong> Choose the theme that suits
                your preference.
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
                <strong>Transport Security:</strong> When sharing encrypted
                messages, use secure channels to prevent interception.
              </li>
              <li>
                <strong>No Backdoors:</strong> The system contains no backdoors
                or master keys - without the original encryption key, the
                message cannot be recovered.
              </li>
              <li>
                <strong>Client-side Security:</strong> Since all processing
                happens in your browser, there's no risk of server-side data
                breaches.
              </li>
            </ul>
            <p>
              While KDSM provides good security for personal communications, for
              highly sensitive data or enterprise applications, consider using
              established encryption standards like AES-256.
            </p>
          </Section>

          <Section id="usage" title="Usage">
            <h3>Encrypting a Message</h3>
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

            <h3>Decrypting a Message</h3>
            <ol>
              <li>Enter the encrypted message in the text area.</li>
              <li>Enter the correct decryption key.</li>
              <li>Click "Decrypt" to reveal the original message.</li>
            </ol>

            <h3>Sharing Encrypted Messages</h3>
            <ol>
              <li>
                Use the "Copy with Key" button to copy both the message and its
                key in a special format.
              </li>
              <li>
                Share this text with your recipient through any messaging
                platform.
              </li>
              <li>
                When the recipient pastes the text into KDSM Encryptor, the key
                will be automatically detected and applied.
              </li>
            </ol>
          </Section>

          <Section id="technical" title="Technical Details">
            <p>KDSM Encryptor is built using modern web technologies:</p>
            <ul>
              <li>
                <strong>Framework:</strong> Next.js for React-based UI and
                routing
              </li>
              <li>
                <strong>UI Components:</strong> Custom components with Tailwind
                CSS for styling
              </li>
              <li>
                <strong>Animations:</strong> Framer Motion for smooth,
                physics-based animations
              </li>
              <li>
                <strong>State Management:</strong> React hooks for local state
                management
              </li>
              <li>
                <strong>Visual Effects:</strong> Three.js for 3D effects and
                WebGL shaders
              </li>
            </ul>
            <p>
              The encryption algorithm itself is a custom implementation that
              uses:
            </p>
            <ul>
              <li>
                Character code manipulation based on the key's numeric values
              </li>
              <li>
                Dynamic shifting patterns that vary based on character position
              </li>
              <li>Multi-pass transformation to increase complexity</li>
            </ul>
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

            <h3>Does KDSM send my data to any servers?</h3>
            <p>
              No. All encryption and decryption happens entirely in your
              browser. Your messages and keys never leave your device.
            </p>

            <h3>Can I encrypt files with KDSM?</h3>
            <p>
              The current implementation is designed for text messages only.
              File encryption may be added in future versions.
            </p>

            <h3>Is the source code available?</h3>
            <p>
              Yes, KDSM Encryptor is an open-source project. You can view the
              source code on GitHub to verify its security and functionality.
            </p>
          </Section>
        </main>
      </div>

      {/* Scroll to top button */}
      <ScrollToTop />
    </div>
  );
}
