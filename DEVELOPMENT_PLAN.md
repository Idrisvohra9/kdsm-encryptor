Absolutely, Master Idris 🙌! Here's a well-structured **AI-readable development plan** broken down into clear **phases**, designed to guide any AI (or dev team) to successfully implement the **KDSM (Keyed Dynamic Shift Matrix)** encryption-decryption project using **Next.js** and **shadcn/ui**.

---

## 📦 Project Name: `KDSM Encryptor`

---

## 📋 Overview

> A secure message encryption-decryption web app using a custom `Keyed Dynamic Shift Matrix (KDSM)` algorithm. Built with **Next.js** for frontend, styled using **shadcn/ui** and **Tailwind CSS**, and optimized for high-performance on large inputs.

---

## 🚧 Development Plan

---

### ⚙️ Phase 1: Project Setup

**Objective:** Initialize project and prepare environment for dev.

#### Tasks:

* [ ] Set up **Next.js** project with `app/` router.
* [ ] Install and configure **Tailwind CSS**.
* [ ] Install and set up **shadcn/ui**:

  ```bash
  npx shadcn-ui@latest init
  ```
* [ ] Create basic folder structure:

  ```
  /components
  /lib
  /utils
  /app/page.tsx
  ```

---

### 🔐 Phase 2: Implement KDSM Encryption-Decryption Logic

**Objective:** Build core encryption and decryption logic using custom KDSM method.

#### Tasks:

* [ ] In `/lib/kdsm.ts` or `/utils/kdsm.ts` implement:

  * [ ] `deriveSeed(key: string): number`
  * [ ] `encrypt(message: string, key?: string): string`
  * [ ] `decrypt(encrypted: string, key?: string): string`

#### Algorithm Design:

1. Derive seed from key using weighted char code sum.
2. For each character in message:

   * Shift based on:

     ```
     shift = charCode + ((seed % 97) + i * (seed % 11)) % 127
     wrapped = 32 + (shift % 95)
     ```
3. Optionally:

   * Reverse string
   * Apply 3rd-4th char swap
   * Base64 encode
4. Decrypt by reversing the above.

✅ Ensure output is safe printable ASCII, reversible, and fast.

---

### 💻 Phase 3: Build UI with Next.js + shadcn/ui

**Objective:** Create a clean, responsive interface.

#### Layout Structure:

* Use a **Card** or **Container** for the main UI.
* Add the following UI components:

| Element                | Type                                        |
| ---------------------- | ------------------------------------------- |
| Message Input          | `<Textarea>`                                |
| Optional Key Input     | `<Input type="text">`                       |
| Buttons                | Encrypt, Decrypt, Clear (shadcn `<Button>`) |
| Output Section         | `<Textarea>` or `<CodeBlock>`               |
| Copy-to-Clipboard Btns | Optional `<Button>`                         |

#### Tasks:

* [ ] Add form with validation (`message !== ""`)
* [ ] Add buttons: `Encrypt`, `Decrypt`, `Clear`
* [ ] Show:

  * Encrypted result
  * Decrypted result
  * Key used
* [ ] Add toast for "Copied!" or error messages using `useToast()`

---

### 🧪 Phase 4: Testing & Optimization

**Objective:** Ensure accuracy, speed, and error handling.

#### Tasks:

* [ ] Test with:

  * Long strings (1000+ chars)
  * Special characters
  * No key (auto-generated time-based key)
  * Invalid decryption key

* [ ] Handle:
  * Empty input
  * Decryption failures
* [ ] Benchmark encryption/decryption speed
* [ ] Optimize logic with:

  * `Array.push().join('')` over `+=`
  * Memoization where needed

---

### 🎁 Phase 5: Optional Enhancements

**Objective:** Add polish and optional features.

#### Tasks:

* [ ] Add Framer Motion animations
* [ ] Show shift matrix (developer toggle)
* [ ] Add Dark mode toggle (if not by default)
* [ ] Add download buttons for encrypted/decrypted text

---

### 🚀 Phase 6: Deployment

**Objective:** Go live.

#### Tasks:

* [ ] Add favicon, SEO metadata
* [ ] Deploy to **Vercel** or preferred platform
* [ ] Protect dev tools in prod (`console.log()` only in dev mode)
* [ ] Write README with algorithm description + usage guide

---

## 📌 Tech Stack

| Layer      | Tech          |
| ---------- | ------------- |
| Frontend   | Next.js 14+   |
| UI         | shadcn/ui     |
| Styling    | Tailwind CSS  |
| Logic      | TypeScript/JS |
| Deployment | Vercel        |

---

## 🧠 Notes for AI Implementer

* Stick to **KDSM** logic rules exactly.
* Do **not** use any built-in crypto libraries.
* Encryption must be **non-standard**, fully **custom**, and **impossible to reverse** without the exact logic and key.
* Code must be readable, modular, and optimized for large-scale usage.

---

Would you like me to now:

* 🔧 Generate the code for `/utils/kdsm.ts`
* 💻 Scaffold the `page.tsx` with all the UI components

Or both? Let’s build this beast together! 💪😎
