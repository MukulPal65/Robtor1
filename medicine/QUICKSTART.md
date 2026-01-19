# 🚀 Quick Start Guide - Robtor Health Assistant

## Prerequisites
- Node.js (v18 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

## Installation Steps

### Method 1: Automated Setup (Windows)
1. Double-click `setup.bat`
2. Wait for installation to complete
3. Double-click `start.bat` to run the app

### Method 2: Manual Setup
```bash
# Navigate to project directory
cd "d:\robtor assistant"

# Install dependencies
npm install

# Start development server
npm run dev
```

## Available Scripts

- **`npm run dev`** - Start development server (with hot reload)
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build
- **`npm run lint`** - Run ESLint to check code quality

## First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - The app will automatically open at `http://localhost:5173`
   - If not, manually navigate to the URL shown in the terminal

## Application Structure

```
robtor-assistant/
├── src/
│   ├── components/
│   │   ├── SplashScreen.tsx      # 2-second intro screen
│   │   ├── Dashboard.tsx         # Main health dashboard
│   │   ├── ChatAssistant.tsx     # 24/7 AI health chatbot
│   │   ├── ReportTranslator.tsx  # Medical report analyzer
│   │   └── SymptomChecker.tsx    # AI symptom analysis
│   ├── App.tsx                   # Main app with routing
│   ├── main.tsx                  # App entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── tailwind.config.js           # Tailwind CSS config
├── tsconfig.json                # TypeScript config
└── vite.config.ts               # Vite config
```

## Features Overview

### 🏠 Dashboard
- Real-time health metrics (steps, heart rate, blood oxygen, sleep)
- Quick access to all features
- Recent health alerts and notifications
- Health overview cards

### 💬 AI Chat Assistant
- 24/7 health consultation
- Instant answers to health queries
- Personalized health advice
- Conversation history

### 📄 Medical Report Translator
- Upload lab reports (PDF, JPG, PNG)
- AI-powered analysis
- Simplified explanations of medical terms
- Personalized recommendations
- Visual indicators for normal/abnormal ranges

### 🩺 Symptom Checker
- Select multiple symptoms
- AI-powered diagnosis suggestions
- Treatment recommendations
- Warning signs to watch for
- When to seek immediate care

## Design Theme

### Colors
- **Primary Green**: `#10b981` - Health, wellness, trust
- **White**: Background, clean medical aesthetic
- **Accent Colors**: Used for different health metrics
  - Red/Pink: Heart rate, urgent alerts
  - Blue: Oxygen levels, hydration
  - Purple: Sleep quality
  - Yellow/Orange: Warnings, moderate alerts

### Typography
- Clean, modern sans-serif fonts
- Clear hierarchy for readability
- Medical-grade legibility

## Navigation

The app features a bottom navigation bar with 4 main sections:
1. **Home** - Dashboard with health overview
2. **Reports** - Upload and analyze medical reports
3. **Chat** - 24/7 AI health assistant
4. **Symptoms** - Check symptoms and get guidance

## Troubleshooting

### Dependencies won't install
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

### Port already in use
```bash
# The dev server will automatically try the next available port
# Or specify a different port in vite.config.ts
```

### TypeScript errors
```bash
# Make sure TypeScript is installed
npm install -D typescript

# Check tsconfig.json is present
```

## Development Tips

### Hot Reload
- Changes to files are automatically reflected in the browser
- No need to manually refresh

### Component Development
- Each feature is a separate component in `src/components/`
- Components are fully typed with TypeScript
- Use Tailwind CSS utility classes for styling

### Adding New Features
1. Create new component in `src/components/`
2. Import in `App.tsx`
3. Add to navigation if needed
4. Update type definitions

## Production Build

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

The production files will be in the `dist/` folder.

## Browser Support

- Chrome (recommended)
- Firefox
- Edge
- Safari

## Performance

- Initial load: < 2 seconds
- Splash screen: 2 seconds
- Smooth animations at 60fps
- Optimized bundle size

## Next Steps

1. ✅ Install dependencies
2. ✅ Start development server
3. ✅ Explore the features
4. 🔄 Customize for your needs
5. 🚀 Deploy to production

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review component files for implementation details
- Check browser console for error messages

---

**Welcome to Robtor! Your health matters. 💚**
