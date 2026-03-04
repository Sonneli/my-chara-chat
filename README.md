# 🎭 My Chara Chat

A lightweight, immersive roleplay AI assistant built with Vue 3 + Vite + Uni-app. This project supports character card imports via images and is compatible with various AI API relays.

## ✨ Key Features
- **Character Card Support**: Integrated with `ExifReader` to parse PNG Chunk data from character cards (SillyTavern compatible), automatically loading names and prompts.
- **Universal API Compatibility**: Seamlessly works with SiliconFlow, Gemai, DeepSeek, and other OpenAI-format compliant API relays.
- **Smart URL Auto-completion**: Users only need to input the base URL (e.g., `https://api.xxx.com/v1`); the system automatically handles the endpoint path.
- **Local Persistence**: Automatically saves API Keys, URLs, and model configurations to local storage for a seamless experience without data loss on refresh.

## 🗺️ Future Roadmap (Work in Progress)

### 🛠️ Enhanced Features
- [ ] **User Persona**: Allow users to define their own identity so the AI knows "who" it is talking to.
- [ ] **World Info (Lorebook)**: Support keyword-triggered entries to inject world-building details into the context dynamically.
- [ ] **Language Style Presets**: Customize AI response styles (e.g., Ancient Chinese, Sarcastic, Elegant, etc.).
- [ ] **Character Diary & Community**: Record memorable moments and share high-quality character presets with other users.

### 📱 Multi-platform Support
- [ ] **H5 Web**: Current primary development target.
- [ ] **WeChat Mini-Program**: Adapting to mini-program network constraints for on-the-go chatting.
- [ ] **Native App**: Compiling to iOS/Android via Uni-app for better performance and push notifications.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (16.x or higher recommended)
- HBuilderX (Recommended) or VS Code

### 2. Run the Project
```bash
# Install dependencies
npm install

# Run H5 development server
npm run dev:h5

##🛠️ Configuration
API URL: Supports full endpoints or base URLs (e.g., https://api.gemai.cc/v1).
API Key: Enter your secret key.
Model Name: Recommended: gemini-2.5-pro, deepseek-v3, etc.

##🔒 Security & Privacy
This project prioritizes API security. Your API Key is stored exclusively in your browser's localStorage and is never uploaded to any server. Please ensure no sensitive information is hardcoded when committing to public repositories.

##🤝 Contribution
This project is in its early exploration phase (0 to 1). Welcome any suggestions, bug reports, or feature requests. If you're a fan of Wen Zhaoyu or AI Roleplay, let's build this together!
