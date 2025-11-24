# 🎮 Cyberpunk Settings - Neural OS Interface

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-ff2a2a?style=for-the-badge)](https://anacondy.github.io/3-CyperpunkSettings/)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646cff?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

> An immersive, interactive Cyberpunk-themed settings interface built with React. Features procedural audio, keyboard navigation, and responsive design optimized for all devices.

---

## 🔗 Live Site

**[➡️ Launch Neural OS Interface](https://anacondy.github.io/3-CyperpunkSettings/)**

---

## 📸 Screenshots

### Main Interface - Desktop View
![Main Interface](https://github.com/user-attachments/assets/5ea47ae8-e977-4694-8a02-214f89b7f073)

*The main attributes and statistics dashboard featuring interactive diamond-shaped stat displays, real-time calculated values, and a cyberpunk-inspired aesthetic with scanline effects.*

### Settings Panel
![Settings Panel](https://github.com/user-attachments/assets/4d455238-b66c-4575-9130-1da39025f9d0)

*Fully keyboard-navigable settings panel with sliders, toggles, and difficulty selection. Supports both mouse/touch and keyboard interactions.*

### Mobile View
![Mobile View](https://github.com/user-attachments/assets/53e3d688-9b7e-4cc2-a803-0c16b908109b)

*Responsive design optimized for mobile devices with touch-friendly controls and adapted layout.*

---

## ✨ Features

### 🎯 Interactive UI Elements
- **Attribute Diamonds**: Rotated square displays for character stats (Reflex, Strength, Intel, Tech, Const, Cool)
- **Skill Trees**: Visual skill progression displays (Hand Guns, Rifles, Blades)
- **Dynamic Statistics**: Real-time calculated stats based on attribute values
- **Settings Panel**: Full-featured settings with sliders, toggles, and difficulty selection

### ⌨️ Keyboard Navigation
Full keyboard support for accessibility and gamepad-style navigation:

| Key | Action |
|-----|--------|
| `↑` `↓` `←` `→` | Navigate between interactive elements |
| `Enter` / `Space` | Interact with focused element |
| `S` | Open/Close Settings panel |
| `Escape` | Close Settings panel |
| Arrow keys in Settings | Adjust sliders and toggle values |

### 🔊 Procedural Audio Engine
- Math-based sound generation using Web Audio API
- Click, hover, and scan sounds
- Volume control through settings
- No external audio files required

### 📱 Responsive Design
Optimized for multiple screen sizes:
- **Mobile**: 320px - 640px (smartphones)
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px - 1920px (including 16-inch displays)
- **Large Displays**: 1920px+ (20-inch and larger monitors)

### 🎨 Visual Effects
- CRT scanline overlay effect
- Glow text animations
- Smooth transitions and hover effects
- Cyberpunk color scheme (Red #ff2a2a, Cyan #00f0ff, Dark #050505)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/anacondy/3-CyperpunkSettings.git
cd 3-CyperpunkSettings

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

## 📁 Project Structure

```
3-CyperpunkSettings/
├── public/
│   └── favicon.svg          # Cyberpunk-themed favicon
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles and Tailwind
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── README.md                # Documentation
```

---

## 🏗️ Architecture

### Component Hierarchy

```
App
├── LoadingScreen          # Initial loading animation
├── Navigation             # Header with Neural OS branding
├── Main Content
│   ├── Attributes Section
│   │   └── StatDiamond[]  # Interactive attribute displays
│   └── Statistics Section
│       ├── StatDiamond[]  # Skill displays
│       └── Stats List     # Calculated statistics
├── Footer                 # Status bar
└── SettingsPanel          # Modal settings dialog
    └── SettingRow[]       # Individual settings
```

### Key Design Decisions

1. **Single-file components**: Kept components in a single file for simplicity and reduced imports
2. **Custom hooks**: `useSoundEngine` hook for audio management
3. **State management**: React useState for local state (no external state library needed)
4. **Styling**: Tailwind CSS for utility-first styling with custom cyberpunk theme
5. **Accessibility**: ARIA roles, keyboard navigation, and focus management

---

## 🔧 Configuration

### Tailwind Theme Customization

The project extends Tailwind with custom cyberpunk colors:

```javascript
// tailwind.config.js
colors: {
  'cyber-red': '#ff2a2a',
  'cyber-cyan': '#00f0ff',
  'cyber-dark': '#050505',
}
```

### Custom Breakpoints

```javascript
screens: {
  'xs': '320px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1920px',  // 20-inch screens
  '4xl': '2560px',  // Large monitors
}
```

---

## 🧪 Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Mobile Safari | ✅ Full |
| Chrome Mobile | ✅ Full |

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- Inspired by Cyberpunk 2077 UI design
- Built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Font: [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono)