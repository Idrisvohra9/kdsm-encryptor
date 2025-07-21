# KDSM Encryptor

---

## (\*\^▽\^\*) Overview

> A secure message encryption-decryption web app using a custom `Keyed Dynamic Shift Matrix (KDSM)` algorithm. Built with **Next.js** for frontend, styled using **shadcn/ui** and **Tailwind CSS**, and optimized for high-performance on large inputs.

> Note: You will probably see a lot of kaomojis as KDSM adopts this as a new trend and they are better than emojis. (◔‿◔)
---

![BSL License](https://img.shields.io/badge/license-BSL%201.1-blue)
<a href="https://kdsm.vercel.app" target="_blank"><img src="./public/assets/kdsm-banner.gif" alt="KDSM banner, with logo and text saying 'Built for security'"></a>
<br />

## (ง •̀\_•́)ง Join the Revolution!

Hey there, crypto enthusiasts and security-minded developers! (｡◕‿◕｡)

Are you passionate about **cutting-edge encryption** and **innovative security solutions**? Do you believe in creating tools that put privacy back in the hands of users? Then **KDSM Encryptor** is calling your name!

We're building something **extraordinary** - a next-generation encryption system that's not just secure, but blazingly fast and user-friendly. This isn't just another project; it's a movement towards democratizing advanced cryptography.

(＄\_＄) The core contributors and maintainers will also get hired by us to work remotely on another project and will be paid handsomely! (\*￣︶￣\*)

### ヾ(＾∇＾) Why KDSM is Cool

![KDSM Algorithm Visualization](./public/assets/kdsm-algorithm-demo.gif)
_Watch the Keyed Dynamic Shift Matrix in action - where mathematics meets artistry_

![Performance Benchmarks](./public/assets/performance-comparison.gif)
_Lightning-fast encryption that scales with your needs_

### (ﾉ◕ヮ◕)ﾉ\*:･ﾟ✧ Performance Benchmarks

Our KDSM algorithm delivers exceptional performance across various input sizes:

| Operation      | Input Size  | Processing Time | Throughput      |
| -------------- | ----------- | --------------- | --------------- |
| **Encryption** | 1,000 words | 0.9 ms          | ~1.1M words/sec |
| **Decryption** | 1,000 words | 0.5 ms          | ~2.0M words/sec |
| **Round Trip** | 1,000 words | 1.4 ms          | ~714K words/sec |

_Benchmarks performed on modern hardware with optimized KDSM implementation_

**Key Performance Highlights:**

- (ﾉ◕ヮ◕)ﾉ\*:･ﾟ✧ **Sub-millisecond processing** for typical message sizes
- (￣▽￣)ノ **Linear scaling** with input size
- (◔‿◔) **Faster decryption** than encryption by design
- ヽ(´▽\`)/ **Production-ready performance** for real-time applications


![User Experience](./public/assets/ui-showcase.gif)
_Beautiful, intuitive interface that makes security accessible to everyone_

### (＾◡＾) What Makes You a Perfect Fit?

- **(╯°□°）╯ Problem Solver**: You love tackling complex cryptographic challenges
- **(｡◕‿◕｡) Full-Stack Enthusiast**: Next.js, React, and modern web technologies excite you
- **(ಠ_ಠ) Security First**: You understand that privacy isn't optional
- **(\*\^▽\^\*) Design Conscious**: You believe great security should look beautiful too
- **ヾ(＾∇＾) Innovation Driven**: You're excited about pushing the boundaries of what's possible

---

## (＾◡＾) Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Appwrite instance (local or cloud)
- Basic knowledge of React/Next.js

### (´∀｀) Setting Up the Appwrite Backend

1. **Install Appwrite CLI**

   ```bash
   npm install -g appwrite-cli
   ```

2. **Initialize Appwrite Project**

   ```bash
   appwrite init project
   ```

3. **Create Database & Collections**

   ```bash
   # Create main database
   appwrite databases create --databaseId "kdsm-main" --name "KDSM Main Database"

   # Create messages collection
   appwrite databases createCollection \
     --databaseId "kdsm-main" \
     --collectionId "messages" \
     --name "Encrypted Messages" \
     --permissions "read(\"any\")" "write(\"any\")"

   # Create users collection for additional user data
   appwrite databases createCollection \
     --databaseId "kdsm-main" \
     --collectionId "user-profiles" \
     --name "User Profiles" \
     --permissions "read(\"any\")" "write(\"any\")"
   ```

4. **Set up Authentication**

   ```bash
   # Enable email/password auth
   appwrite users create --userId "unique()" --email "test@example.com" --password "testpass123"
   ```

5. **Configure Environment Variables**

   ```bash
   # Copy example env file
   cp .env.example .env.local

   # Add your Appwrite credentials
   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   ```

6. **Database Schema Setup**
   ```bash
   # Run the database initialization script
   npm run setup:database
   ```

### ヽ(´▽\`)/ Local Development

```bash
# Clone the repository
git clone https://github.com/Idrisvohra9/kdsm-encryptor.git
cd kdsm-encryptor

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## (づ￣ ³￣)づ Contributing

We welcome contributions of all sizes! Whether you're fixing a typo, adding a feature, or proposing architectural improvements, your input is valuable.

**(｡◕‿◕｡) Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) file for detailed guidelines before making any contributions.**

### (´∀｀) Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### (ง •̀\_•́)ง Current Focus Areas

- **Backend Integration**: Expanding Appwrite backend functionality
- **KDSM Algorithm**: Optimizing the encryption performance
- **UI/UX**: Enhancing the user experience
- **Testing**: Building comprehensive test coverage
- **Documentation**: Making the project more accessible

---

## (￣▽￣)ノ Development Roadmap

### Phase 1: (✧◡✧) Core Algorithm

- [x] KDSM algorithm implementation
- [x] Basic encryption/decryption functionality

### Phase 2: (✧◡✧) Frontend Foundation

- [x] Next.js setup with shadcn/ui
- [x] Responsive design implementation

### Phase 3: (✧◡✧) Backend Integration

- [x] Appwrite setup and configuration
- [x] User authentication system

### Phase 4: (◔‿◔) Current Phase

- [ ] Real-time messaging system
- [ ] Advanced security features (SSO using third party providers and MFA)

### Phase 5: (ง •̀\_•́)ง Upcoming

- [ ] KDSM CLI (For encrypting and decrypting entire files using a secret key)
- [ ] Paper extraction and decryption of secret messages (Secret Extraction)

For more information on the DEVELOPMENT_PLAN please See the [DEVELOPMENT_PLAN](./DEVELOPMENT_PLAN.md) file for full details.

---

## (\*\^▽\^\*) Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Appwrite (Database, Auth, Storage)
- **Deployment**: Vercel/Netlify ready
- **Testing**: Jest, React Testing Library

---

## (´∀｀) License

KDSM Encryptor is licensed under the Business Source License 1.1.  
Production use is **not allowed** until **Jan 1, 2028**, when it will be automatically re-licensed under AGPL-3.0+.  
See the [LICENSE](./LICENSE) file for full details.

---

## (｡◕‿◕｡) Join Our Community

Ready to be part of something bigger? We'd love to have you aboard!

**Let's build the future of encryption together!** ヽ(´▽\`)/(\*\^▽\^\*)

---

_"In a world where privacy is becoming a luxury, we're making it a right."_ - KDSM Team

