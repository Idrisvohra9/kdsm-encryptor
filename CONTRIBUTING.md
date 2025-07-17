# Contributing to KDSM Encryptor

Thank you for your interest in contributing to **KDSM Encryptor**! 🎉 We're excited to have you join our mission to democratize advanced cryptography and build the future of secure messaging.

---

## 🌟 Before You Start

Please take a moment to read through these guidelines to ensure a smooth contribution process. These guidelines help maintain code quality, consistency, and the overall vision of the project.

---

## 📋 General Guidelines

### 1. **Branch Management**

- **Always create a new branch** for your changes
- Use descriptive branch names:
  ```bash
  git checkout -b feature/add-dark-mode
  git checkout -b fix/encryption-bug
  git checkout -b docs/update-readme
  ```
- Never push directly to `main` or `develop` branches

### 2. **UI/UX Guidelines**

- **DO NOT modify the font family** - we maintain consistency across the application
- **Make all pages responsive** - ensure your changes work on mobile, tablet, and desktop
- **Feel free to enhance the UI** according to your creative vision
- **DO NOT change theme colors** - maintain the existing color palette
- **Preserve the overall vibe** - keep the modern, security-focused aesthetic
- **Modify the existing components and make them feather light** - Coz, we want our platform to be as fast as possible!

### 3. **Code Standards**

- Follow the existing code style and patterns
- Use JavaScript or TypeScript for all new files
- Ensure proper error handling
- Add comments for complex logic
- Write meaningful commit messages

### 4. **Testing Requirements**

- Test your changes thoroughly across different devices
- Ensure no existing functionality is broken
- Add unit tests for new features when applicable
- Verify accessibility standards are met

---

## 🚫 Restricted Areas

### ⚠️ **DO NOT Modify `kdsm.ts`**

The core encryption algorithm in `kdsm.ts` is **off-limits** for direct modifications. This ensures:

- Algorithm integrity and security
- Consistent encryption/decryption behavior
- Proper testing and validation of cryptographic functions

**If you have suggestions for the KDSM algorithm:**

- Add comments in the file explaining your suggestions
- Open a GitHub Discussion to propose improvements
- Create an issue with detailed explanations and potential benefits

---

## 🎯 Contribution Areas

### 🔥 High-Priority Areas

- **Frontend Features**: GO NUTS ON THE UI! New UI components, user experience improvements (Use any frontend component libraries you want, as long as it doesn't disrupt the vibe of the project and it isn't resource heavy)
- **Backend Integration**: Appwrite functionality, API enhancements
- **Performance**: Optimization for large inputs, caching strategies
- **Security**: Additional security measures (non-algorithm related)
- **Documentation**: Tutorials, API docs, code comments

### 🌐 Related Projects

You can also contribute to our **messaging server**:

- **Repository**: [KDSM Messaging Server](https://github.com/Idrisvohra9/kdsm-messaging-server)
- **Focus**: Real-time messaging, WebSocket implementation, server optimization

---

## 📝 Development Workflow

### 1. **Setup**

```bash
# Fork the repository
git clone https://github.com/yourusername/kdsm-encryptor.git
cd kdsm-encryptor

# Install dependencies
npm install

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. **Development**

```bash
# Start development server
npm run dev

# Run tests
npm test

# Check linting
npm run lint
```

### 3. **Before Submitting**

- [ ] Test on multiple screen sizes
- [ ] Verify no console errors
- [ ] Check that existing features still work
- [ ] Ensure proper TypeScript typing
- [ ] Follow the established code patterns

### 4. **Pull Request**

```bash
# Commit your changes
git add .
git commit -m "feat: add awesome new feature"

# Push to your fork
git push origin feature/your-feature-name

# Open a Pull Request on GitHub
```

---

## 🎨 Design Guidelines

### **Color Palette** (DO NOT CHANGE)

- Primary: Keep existing primary colors
- Secondary: Maintain current secondary colors
- Accent: Preserve accent colors
- Background: Keep current background themes

### **Typography** (DO NOT CHANGE)

- Font family must remain consistent
- Font sizes should follow existing scale
- Font weights should match current usage

### **Spacing & Layout**

- Use Tailwind CSS classes consistently
- Follow existing spacing patterns
- Maintain responsive design principles

---

## 🛠️ Technical Requirements

### **Environment Setup**

- Node.js 18+
- npm or yarn
- Appwrite instance (for backend features)

### **Dependencies**

- Follow the existing package.json structure
- Avoid adding unnecessary dependencies
- Prefer built-in solutions when possible

## 📚 Resources

### **Documentation**

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Appwrite Documentation](https://appwrite.io/docs)

### **Getting Help**

- 💬 **GitHub Discussions**: For feature requests and general questions
- 🐛 **GitHub Issues**: For bug reports and specific problems
- 📧 **Email**: For sensitive security-related concerns

---

## 🏆 Recognition

Contributors will be recognized in:

- README.md contributors section
- GitHub contributors page
- Release notes for significant contributions

---

## 📄 License

By contributing to KDSM Encryptor, you agree that your contributions will be licensed under the same Business Source License 1.1.

---

## 🚀 Let's Build Something Amazing!

Ready to make your mark on the future of encryption? We can't wait to see what you'll bring to the project!

**Happy coding!** 🎉

---

_"Every great developer started with a single commit. Make yours count!"_ - KDSM Team
