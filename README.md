# Cyberpunk Settings UI

> **Live Demo**: [https://anacondy.github.io/3-CyperpunkSettings/](https://anacondy.github.io/3-CyperpunkSettings/)

A futuristic Cyberpunk-themed Settings UI built with React and Tailwind CSS. Features immersive procedural audio, responsive design optimized for both mobile (16:9, 20:9) and desktop, and runs at 60 FPS.

![Cyberpunk Settings](https://img.shields.io/badge/React-19-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan) ![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-green)

## Features

### 🎮 Immersive Experience
- **Procedural Audio Engine**: Real-time synthesized sounds for UI interactions
- **Particle Background**: Interactive particle system with mouse/touch interactions
- **Visual Effects**: Scanlines, chromatic aberration, depth of field, motion blur
- **Boot Sequence**: Authentic system boot loading animation

### 📱 Responsive Design
- Optimized for **16:9** aspect ratio (standard displays)
- Optimized for **20:9** aspect ratio (modern smartphones)
- Mobile-first design with touch-friendly controls
- Safe area support for notched devices

### ⚡ Performance
- **60 FPS** animations using requestAnimationFrame
- GPU-accelerated CSS transitions
- Optimized particle count for mobile devices
- Passive event listeners for smooth scrolling

### 🖥️ Device Intelligence
- Real-time system monitoring (CPU, memory simulation)
- Battery status detection
- Network connection type
- GPU detection
- Storage quota information

## Screenshots

### Desktop View
![Desktop View - Attributes](https://github.com/user-attachments/assets/5dfc8ccf-b0d8-4d2a-97be-86ab36e383c2)

### Mobile View
| Stats Screen | Config Screen |
|:---:|:---:|
| ![Mobile Stats](https://github.com/user-attachments/assets/da70f110-0b35-40a9-8bc6-9aa158180a42) | ![Mobile Config](https://github.com/user-attachments/assets/606edcbc-a81c-4be0-92c3-acc972830c80) |

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+

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

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Usage

### Navigation
- **Stats Tab**: View character attributes and stats
- **Device Intel (Center Button)**: View device information
- **Config Tab**: Adjust settings and visual effects

### Keyboard Shortcuts
- `M` - Toggle audio mute

### Settings
| Setting | Description |
|---------|-------------|
| Music Volume | Controls ambient drone volume |
| Effects Volume | Controls UI sound effects |
| Motion Blur | Enables backdrop blur effect |
| Depth of Field | Adds vignette blur effect |
| Chromatic Aberration | RGB split text effect |
| Scanline Overlay | CRT-style scan lines |

## Browser Compatibility

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ 90+ | ✅ |
| Firefox | ✅ 88+ | ✅ |
| Safari | ✅ 14+ | ✅ |
| Edge | ✅ 90+ | ✅ |

## Project Structure

```
3-CyperpunkSettings/
├── src/
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # React entry point
│   └── index.css       # Tailwind CSS and global styles
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies
└── README.md           # This file
```

## Technologies

- **React 19** - UI Framework
- **Tailwind CSS 4** - Utility-first styling
- **Vite 7** - Build tool
- **Lucide React** - Icon library
- **Web Audio API** - Procedural sound generation

## Performance Optimizations

1. **Canvas Particle System**: Uses requestAnimationFrame for smooth 60 FPS animations
2. **Passive Event Listeners**: Touch and mouse events use passive: true
3. **CSS Will-Change**: Optimized for GPU acceleration
4. **Responsive Particle Count**: Fewer particles on mobile for better performance
5. **Debounced Resize**: Efficient window resize handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ and cyberpunk aesthetics**
