import { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Zap, Monitor, Activity, Cpu, Shield, Crosshair, Wifi, Menu, 
  Terminal, Database, Battery, BatteryCharging, Smartphone, Maximize 
} from 'lucide-react';

// --- CONSTANTS ---
const AUDIO_CONFIG = {
  DRONE_FREQUENCY: 50,
  FILTER_FREQUENCY: 120,
  FILTER_Q: 5,
  LFO_FREQUENCY: 0.2,
  LFO_GAIN: 20,
  DRONE_GAIN: 0.05,
  CLICK_START_FREQ: 1200,
  CLICK_END_FREQ: 100,
  HOVER_BASE_FREQ: 800,
  HOVER_VARIANCE: 200
};

const RESPONSIVE_BREAKPOINT = 768;

/**
 * AudioEngine - Procedural sound generation for UI interactions
 * Uses Web Audio API to create synthesized cyberpunk-style sounds
 */
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.droneOsc = null;
    this.droneGain = null;
    this.isMuted = false;
    this.initialized = false;
  }

  /** Initialize the audio context and connect audio nodes */
  init() {
    if (this.initialized) return;
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    
    // Master Gain (Global Volume/Mute)
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    
    // Music Bus
    this.musicGain = this.ctx.createGain();
    this.musicGain.connect(this.masterGain);
    
    // SFX Bus
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.connect(this.masterGain);

    this.initialized = true;
    this.startAmbience();
  }

  /** Start the ambient drone sound with LFO modulation */
  startAmbience() {
    if (!this.ctx) return;
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sawtooth';
    this.droneOsc.frequency.value = AUDIO_CONFIG.DRONE_FREQUENCY; 
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = AUDIO_CONFIG.FILTER_FREQUENCY;
    filter.Q.value = AUDIO_CONFIG.FILTER_Q;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = AUDIO_CONFIG.LFO_FREQUENCY; 
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = AUDIO_CONFIG.LFO_GAIN;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = AUDIO_CONFIG.DRONE_GAIN; 

    this.droneOsc.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.musicGain);

    this.droneOsc.start();
    lfo.start();
  }

  /** Set music and SFX volume levels (0-100) */
  setVolumes(musicVol, sfxVol) {
    if (!this.initialized) return;
    const now = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(musicVol / 100, now, 0.1);
    this.sfxGain.gain.setTargetAtTime(sfxVol / 100, now, 0.1);
  }

  /** Toggle mute state and return new mute status */
  toggleMute() {
    if (!this.initialized) return false;
    this.isMuted = !this.isMuted;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 1, now, 0.1);
    return this.isMuted;
  }

  /** Play a metallic click sound for button presses */
  playClickSound() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(AUDIO_CONFIG.CLICK_START_FREQ, t);
    osc.frequency.exponentialRampToValueAtTime(AUDIO_CONFIG.CLICK_END_FREQ, t + 0.1);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  /** Play a soft hover sound for UI feedback */
  playHoverSound() {
    if (!this.initialized || this.isMuted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, t);
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }
}

const audio = new AudioEngine();

// --- CUSTOM HOOKS ---

const useSystemMonitor = () => {
  const [stats, setStats] = useState({
    cpuUsage: 0,
    memory: '0GB',
    cores: 0,
    userAgent: '',
    platform: '',
    online: true,
    connection: 'UNKNOWN',
    batteryLevel: null,
    batteryCharging: false,
    storageQuota: 'CALCULATING...',
    storageUsage: '...',
    screenRes: 'UNKNOWN',
    gpu: 'UNKNOWN GPU'
  });

  useEffect(() => {
    const nav = window.navigator;
    
    // 1. Basic Info
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    // 2. GPU Detection
    let gpuInfo = 'GENERIC DISPLAY ADAPTER';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    } catch (e) { console.warn('GPU Detect Failed', e); }

    // 3. Battery API
    let batteryUnsub = () => {};
    if (nav.getBattery) {
      nav.getBattery().then(battery => {
        const updateBattery = () => {
          setStats(prev => ({
             ...prev,
             batteryLevel: Math.round(battery.level * 100),
             batteryCharging: battery.charging
          }));
        };
        updateBattery();
        battery.addEventListener('levelchange', updateBattery);
        battery.addEventListener('chargingchange', updateBattery);
        batteryUnsub = () => {
          battery.removeEventListener('levelchange', updateBattery);
          battery.removeEventListener('chargingchange', updateBattery);
        };
      });
    }

    // 4. Storage API
    const updateStorage = async () => {
       if (nav.storage && nav.storage.estimate) {
         try {
           const estimate = await nav.storage.estimate();
           const quota = estimate.quota ? (estimate.quota / (1024 * 1024 * 1024)).toFixed(1) + ' GB' : 'UNKNOWN';
           const usage = estimate.usage ? (estimate.usage / (1024 * 1024)).toFixed(1) + ' MB' : '0 MB';
           setStats(prev => ({ ...prev, storageQuota: quota, storageUsage: usage }));
         } catch (e) { console.warn('Storage Estimate Failed', e); }
       }
    };
    updateStorage();

    // 5. Live Simulation Loop
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        cpuUsage: Math.floor(Math.random() * (45 - 5) + 5),
        memory: nav.deviceMemory ? `${nav.deviceMemory}GB` : '8GB',
        cores: nav.hardwareConcurrency || 4,
        userAgent: nav.userAgent,
        platform: nav.platform || 'UNKNOWN OS',
        online: nav.onLine,
        connection: connection ? connection.effectiveType.toUpperCase() : 'WIFI',
        screenRes: `${window.screen.width}x${window.screen.height}`,
        gpu: gpuInfo
      }));
    }, 2000);

    return () => {
      clearInterval(interval);
      batteryUnsub();
    };
  }, []);

  return stats;
};

// --- COMPONENTS ---

const NotificationToast = ({ message, type, show }) => {
  if (!show) return null;
  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn pointer-events-none">
      <div className="bg-black/90 border border-red-500 px-6 py-3 flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
        {type === 'mute' ? <VolumeX className="text-red-500" /> : <Volume2 className="text-cyan-400" />}
        <span className="font-mono text-white tracking-widest">{message}</span>
      </div>
    </div>
  );
};

// Factory function to create a particle class with closure over canvas/ctx/mouseRef
const createParticleClass = (canvas, ctx, mouseRef) => {
  return class Particle {
    constructor(isBurst = false) {
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.size = 0;
      this.alpha = 0;
      this.reset(isBurst);
    }

    reset(isBurst = false) {
      if (isBurst) {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 15 + 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
      } else {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (mouseRef.current.active) {
        const dx = this.x - mouseRef.current.x;
        const dy = this.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 250;
        if (dist < maxDist && dist > 0) {
          const force = (maxDist - dist) / maxDist;
          this.vx += (dx / dist) * force * 0.4;
          this.vy += (dy / dist) * force * 0.4;
        }
      }

      this.vx *= 0.96;
      this.vy *= 0.96;

      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }

    draw() {
      ctx.fillStyle = `rgba(220, 38, 38, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  };
};

// Optimized Particle Background with requestAnimationFrame for 60 FPS
const ParticleBackground = ({ burstMode }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = particlesRef.current;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const Particle = createParticleClass(canvas, ctx, mouseRef);

    // Responsive particle count
    const count = window.innerWidth < 768 ? 60 : 150;
    if (particles.length === 0) {
      for (let i = 0; i < count; i++) particles.push(new Particle());
    }
    particlesRef.current = particles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      
      // Draw Grid with optimized rendering
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for(let x = 0; x < canvas.width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
      for(let y = 0; y < canvas.height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Burst Logic
    if (burstMode) {
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(true));
      }
      setTimeout(() => {
        particles.splice(count);
      }, 2000);
    }

    const moveHandler = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      mouseRef.current = { x, y, active: true };
    };
    const endHandler = () => mouseRef.current.active = false;

    window.addEventListener('mousemove', moveHandler, { passive: true });
    window.addEventListener('touchmove', moveHandler, { passive: true });
    window.addEventListener('mouseup', endHandler, { passive: true });
    window.addEventListener('touchend', endHandler, { passive: true });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('mouseup', endHandler);
      window.removeEventListener('touchend', endHandler);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [burstMode]);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      <div className="w-4/5 max-w-md relative">
        <div className="text-center mb-4 font-mono flex justify-between items-end">
          <span className="text-red-500 text-xs tracking-widest">SYSTEM_BOOT_SEQ</span>
          <span className="text-cyan-400 text-xl tracking-widest font-bold">{Math.min(progress, 100)}%</span>
        </div>
        <div className="relative h-12 w-full flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-4 border-l-2 border-t-2 border-b-2 border-cyan-400" />
          <div className="absolute right-0 top-0 bottom-0 w-4 border-r-2 border-t-2 border-b-2 border-cyan-400" />
          <div className="flex-1 mx-6 h-8 flex gap-1 overflow-hidden">
             {Array.from({ length: 40 }).map((_, i) => (
               <div 
                  key={i}
                  className={`h-full flex-1 transition-all duration-75 ${
                    (i / 40) * 100 < progress 
                      ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)] scale-y-100' 
                      : 'bg-red-900/10 scale-y-50'
                  }`}
               />
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CyberCheckbox = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 group cursor-pointer hover:bg-white/5 px-2 transition-colors" onClick={() => {
    audio.playClickSound();
    onChange(!checked);
  }}>
    <div className="flex items-center gap-3">
      <div className={`w-1 h-4 ${checked ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-red-900/50'} transition-all`} />
      <span className="text-red-100 font-mono tracking-widest text-sm sm:text-base group-hover:text-red-400 transition-colors">
        {label}
      </span>
    </div>
    <div className="flex gap-4">
      <div className={`flex items-center gap-2 ${checked ? 'opacity-100' : 'opacity-30 blur-[1px]'}`}>
        <span className="text-[10px] text-red-500 font-bold">ON</span>
        <div className={`w-4 h-4 border border-red-500 flex items-center justify-center bg-black`}>
          {checked && <div className="w-2 h-2 bg-red-500 shadow-[0_0_5px_red]" />}
        </div>
      </div>
      <div className={`flex items-center gap-2 ${!checked ? 'opacity-100' : 'opacity-30 blur-[1px]'}`}>
        <span className="text-[10px] text-red-500 font-bold">OFF</span>
        <div className={`w-4 h-4 border border-red-500 flex items-center justify-center bg-black`}>
          {!checked && <div className="w-2 h-2 bg-red-500 shadow-[0_0_5px_red]" />}
        </div>
      </div>
    </div>
  </div>
);

// CyberSlider with robust event handling
const CyberSlider = ({ label, value, onChange }) => (
  <div className="mb-6 select-none">
    <div className="flex justify-between items-center mb-2">
      <span className="bg-red-500/10 px-2 py-0.5 text-xs text-red-400 border-l-2 border-red-500 font-bold tracking-wider uppercase">
        {label}
      </span>
      <span className="font-mono text-cyan-400 shadow-cyan-400/50">{value}%</span>
    </div>
    <div className="relative h-8 w-full flex items-center cursor-pointer group touch-none" 
      onMouseDown={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        
        const update = (ev) => {
          const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
          const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
          onChange(Math.round(pct));
        };
        
        update(e);
        
        const move = (ev) => { update(ev); };
        const up = () => { 
          window.removeEventListener('mousemove', move);
          window.removeEventListener('mouseup', up);
          window.removeEventListener('touchmove', move);
          window.removeEventListener('touchend', up);
          audio.playClickSound();
        };
        
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', up);
      }}
      onTouchStart={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const update = (ev) => {
          const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
          const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
          onChange(Math.round(pct));
        };
        update(e);
        const move = (ev) => { update(ev); };
        const up = () => { 
          window.removeEventListener('touchmove', move);
          window.removeEventListener('touchend', up);
          audio.playClickSound();
        };
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', up);
      }}
    >
      <div className="absolute w-full h-2 bg-red-900/20 border border-red-900/50" />
      <div className="absolute h-2 bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.6)] transition-all duration-75" style={{ width: `${value}%` }} />
      <div 
        className="absolute h-5 w-3 bg-black border border-red-400 group-hover:bg-red-950 transition-all z-10"
        style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-full h-[1px] bg-red-500 mt-2" />
      </div>
    </div>
  </div>
);

const AttributeNode = ({ label, value, icon: IconComponent, active, onClick }) => (
  <button 
    onClick={() => {
      audio.playClickSound();
      onClick();
    }}
    onMouseEnter={() => audio.playHoverSound()}
    className={`group relative flex items-center justify-center w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 m-1 sm:m-2 transition-all duration-300 transform outline-none`}
  >
    <div className={`absolute inset-0 transform rotate-45 border-2 transition-all duration-300 ${
      active 
        ? 'bg-red-600/20 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)] scale-110' 
        : 'bg-black/80 border-red-900/50 hover:border-red-500/80 hover:scale-105'
    }`}></div>
    <div className="relative z-10 flex flex-col items-center justify-center text-red-500">
      <IconComponent size={20} className={`mb-1 transition-all ${active ? 'text-white drop-shadow-[0_0_5px_white]' : 'text-red-600'}`} />
      <span className="text-[9px] sm:text-[10px] font-bold tracking-wider uppercase text-red-400">{label}</span>
      <span className="text-base sm:text-lg font-mono font-bold text-white">{value}</span>
    </div>
  </button>
);

// --- MAIN APP ---
const App = () => {
  const [booted, setBooted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('home'); // 'home', 'settings', 'device'
  const [activeAttr, setActiveAttr] = useState('reflex');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [burst, setBurst] = useState(false);
  
  const [settings, setSettings] = useState({
    musicVol: 40,
    sfxVol: 80,
    motionBlur: false,
    dof: false,
    chromatic: true,
    scanlines: true
  });

  const systemStats = useSystemMonitor();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'm') {
        const isMuted = audio.toggleMute();
        setNotification({
          show: true,
          message: isMuted ? 'AUDIO MUTED' : 'AUDIO RESTORED',
          type: isMuted ? 'mute' : 'info'
        });
        setTimeout(() => setNotification(n => ({...n, show: false})), 2000);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (booted) {
      audio.setVolumes(settings.musicVol, settings.sfxVol);
    }
  }, [settings.musicVol, settings.sfxVol, booted]);

  const triggerBurst = () => {
    setBurst(true);
    setTimeout(() => setBurst(false), 200);
  };

  if (!booted) {
    return (
      <div 
        className="h-screen w-screen bg-black flex items-center justify-center cursor-pointer overflow-hidden relative"
        onClick={() => {
          audio.init();
          audio.playClickSound();
          setBooted(true);
          setLoading(true);
        }}
      >
        <ParticleBackground burstMode={false} />
        <div className="z-10 border border-red-500/50 p-8 sm:p-12 bg-black/90 backdrop-blur-md text-center group hover:border-red-500 transition-colors shadow-[0_0_50px_rgba(220,38,38,0.2)] mx-4">
          <h1 className="text-3xl sm:text-5xl font-black text-red-600 tracking-tighter mb-4 group-hover:text-red-500 transition-colors cyberpunk-heading">SYSTEM OFFLINE</h1>
          <p className="text-cyan-400 font-mono text-xs sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] animate-pulse">TAP TO INITIALIZE NEURAL LINK</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <ParticleBackground burstMode={false} />
        <LoadingScreen onComplete={() => setLoading(false)} />
      </>
    );
  }

  const frostClass = settings.motionBlur ? "backdrop-blur-sm bg-black/60" : "bg-black/80";
  const glowClass = settings.motionBlur ? "text-shadow-glow" : "";

  return (
    <div className="min-h-screen bg-black text-red-500 font-sans selection:bg-red-500 selection:text-black overflow-hidden relative transition-all duration-300">
      <style>{`
        .chromatic-text {
          text-shadow: ${settings.chromatic ? '2px 0 rgba(255,0,0,0.7), -2px 0 rgba(0,255,255,0.7)' : 'none'};
        }
        
        .text-shadow-glow {
          text-shadow: 0 0 5px rgba(220, 38, 38, 0.8), 0 0 10px rgba(220, 38, 38, 0.4);
        }

        .scanline-overlay {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
          background-size: 100% 4px;
          pointer-events: none;
        }

        .dof-vignette {
          background: radial-gradient(circle, transparent 60%, rgba(0,0,0,0.8) 120%);
          backdrop-filter: ${settings.dof ? 'blur(2px)' : 'none'};
          mask-image: radial-gradient(circle, transparent 50%, black 100%);
          -webkit-mask-image: radial-gradient(circle, transparent 50%, black 100%);
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Responsive aspect ratio optimization for 16:9 and 20:9 */
        @media (min-aspect-ratio: 16/9) {
          .main-content {
            max-width: 90vw;
            margin: 0 auto;
          }
        }
        
        @media (min-aspect-ratio: 20/9) {
          .main-content {
            max-width: 85vw;
            margin: 0 auto;
          }
        }
        
        /* Mobile landscape optimization */
        @media (max-height: 500px) and (orientation: landscape) {
          .nav-bar {
            height: 60px !important;
          }
          .main-content {
            padding-top: 70px !important;
            padding-bottom: 70px !important;
          }
        }
      `}</style>
      
      <ParticleBackground burstMode={burst} />
      {settings.scanlines && <div className="fixed inset-0 z-50 scanline-overlay opacity-30 pointer-events-none" />}
      
      <div className={`fixed inset-0 z-40 pointer-events-none transition-all duration-700 ${settings.dof ? 'backdrop-blur-[1px]' : ''}`} style={{ maskImage: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)' }} />
      
      <NotificationToast {...notification} />

      {/* Header with REAL Stats */}
      <header className="fixed top-0 w-full z-30 p-2 sm:p-4 px-3 sm:px-6 flex justify-between items-start bg-gradient-to-b from-black via-black/90 to-transparent">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${systemStats.online ? 'bg-green-500' : 'bg-red-500'} animate-ping`} />
            <span className={`text-[10px] sm:text-xs tracking-[0.2em] text-red-400/80 ${glowClass}`}>NET: {systemStats.connection}</span>
          </div>
          <span className="text-[8px] sm:text-[10px] text-red-800 font-mono hidden sm:block">{systemStats.platform} // {systemStats.userAgent.substring(0, 15)}...</span>
        </div>
        <div className="text-right">
          <div className={`font-mono text-cyan-400 text-xs sm:text-sm tracking-wider flex items-center justify-end gap-2 sm:gap-4 ${glowClass}`}>
             <span className="flex items-center gap-1"><Cpu size={12}/> {systemStats.cpuUsage}%</span>
             <span className="flex items-center gap-1"><Terminal size={12}/> {systemStats.memory}</span>
          </div>
          <div className="text-[8px] sm:text-[10px] text-red-600 mt-1">
            {systemStats.batteryLevel !== null ? (
              <span className="flex items-center justify-end gap-1">
                PWR: {systemStats.batteryLevel}% {systemStats.batteryCharging ? '(CHRG)' : ''}
              </span>
            ) : 'PWR: EXTERNAL'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content relative z-20 pt-16 sm:pt-24 pb-24 sm:pb-32 px-2 sm:px-4 min-h-screen overflow-y-auto overflow-x-hidden">
        
        {view === 'home' && (
          <div className="animate-fadeIn max-w-6xl mx-auto">
             <div className="mb-6 sm:mb-10 pl-3 sm:pl-6 border-l-4 border-red-600 flex justify-between items-end">
               <div>
                 <h2 className={`text-2xl sm:text-4xl font-black text-white tracking-widest uppercase mb-1 ${settings.chromatic ? 'chromatic-text' : ''} ${glowClass}`}>Attributes</h2>
                 <p className="text-red-400/60 text-xs sm:text-sm tracking-wider">NEURAL LINK STATUS: STABLE</p>
               </div>
               <div className="hidden sm:block text-right">
                 <div className="text-4xl font-mono text-red-600 font-bold">LVL 50</div>
                 <div className="text-[10px] text-red-400">MAX REPUTATION</div>
               </div>
             </div>

             <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center justify-center">
               <div className="relative p-4 sm:p-10">
                 <div className="absolute inset-0 bg-red-900/5 rotate-45 transform scale-75 blur-3xl rounded-full"></div>
                 <div className="grid grid-cols-3 sm:grid-cols-3 gap-1 sm:gap-6 transform sm:-rotate-45 sm:scale-90 origin-center relative z-10">
                    <div className="transform sm:rotate-45"><AttributeNode icon={Zap} label="Reflex" value="20" active={activeAttr === 'reflex'} onClick={() => setActiveAttr('reflex')} /></div>
                    <div className="transform sm:rotate-45"><AttributeNode icon={Cpu} label="Intel" value="18" active={activeAttr === 'intel'} onClick={() => setActiveAttr('intel')} /></div>
                    <div className="transform sm:rotate-45"><AttributeNode icon={Shield} label="Body" value="15" active={activeAttr === 'body'} onClick={() => setActiveAttr('body')} /></div>
                    <div className="transform sm:rotate-45 col-start-1 sm:col-start-auto"><AttributeNode icon={Wifi} label="Tech" value="20" active={activeAttr === 'tech'} onClick={() => setActiveAttr('tech')} /></div>
                    <div className="transform sm:rotate-45"><AttributeNode icon={Crosshair} label="Cool" value="12" active={activeAttr === 'cool'} onClick={() => setActiveAttr('cool')} /></div>
                 </div>
               </div>

               <div className={`w-full max-w-md border border-red-900/30 p-4 sm:p-8 relative group hover:border-red-500/50 transition-all duration-300 ${frostClass}`}>
                 <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-red-500/30"></div>
                 <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-red-500/30"></div>
                 
                 <div className="absolute top-0 right-0 p-2 sm:p-3 text-[8px] sm:text-[10px] text-red-600 font-bold border-b border-l border-red-900/30 bg-red-950/20">
                   ID: {activeAttr.toUpperCase()}_KERNEL
                 </div>

                 <h3 className={`text-xl sm:text-3xl text-cyan-400 mb-4 sm:mb-6 heading uppercase border-b-2 border-red-900/50 pb-4 ${settings.chromatic ? 'chromatic-text' : ''} ${glowClass}`}>
                   {activeAttr} NODE
                 </h3>
                 
                 <div className="space-y-4 sm:space-y-6 font-mono text-xs sm:text-sm text-red-300/80">
                   <p className="leading-relaxed">
                     Hardware interface protocol for the {activeAttr} subsystem. Enhances signal propagation speed and neural plasticity.
                   </p>
                   
                   <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="bg-red-950/10 p-2 sm:p-3 border border-red-900/50 hover:bg-red-900/20 transition-colors">
                        <div className="text-[8px] sm:text-[10px] uppercase text-red-500 mb-1">Current Output</div>
                        <div className="text-xl sm:text-2xl text-white font-bold">98.4%</div>
                      </div>
                      <div className="bg-red-950/10 p-2 sm:p-3 border border-red-900/50 hover:bg-red-900/20 transition-colors">
                        <div className="text-[8px] sm:text-[10px] uppercase text-red-500 mb-1">Next Threshold</div>
                        <div className="text-xl sm:text-2xl text-cyan-400 font-bold animate-pulse">2050 XP</div>
                      </div>
                   </div>

                   <button 
                    onClick={() => audio.playClickSound()}
                    className="w-full bg-red-600 hover:bg-red-500 text-black font-black text-base sm:text-lg py-3 sm:py-4 uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all active:scale-95"
                    style={{ clipPath: 'polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)' }}
                   >
                     Inject Code
                   </button>
                 </div>
               </div>
             </div>
          </div>
        )}

        {view === 'device' && (
          <div className="animate-fadeIn max-w-4xl mx-auto pt-4">
             <div className={`border-2 border-red-600/50 p-4 sm:p-6 relative ${frostClass}`}>
               <div className="absolute top-0 left-0 bg-red-600 text-black font-bold px-3 sm:px-4 py-1 text-xs sm:text-sm tracking-widest">DEVICE_INTEL</div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8">
                  {/* Left Column: Visual Representation */}
                  <div className="flex flex-col items-center justify-center p-4 sm:p-8 bg-black/40 border border-red-900/30">
                     <Smartphone size={80} className="text-red-600 animate-pulse drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] sm:w-[120px] sm:h-[120px]" />
                     <div className="mt-4 sm:mt-6 text-center">
                       <h3 className="text-lg sm:text-2xl text-white font-bold tracking-widest">{systemStats.platform}</h3>
                       <p className="text-red-400 text-[10px] sm:text-xs mt-1 break-all">{systemStats.userAgent.substring(0, 50)}...</p>
                     </div>
                  </div>

                  {/* Right Column: Data Grid */}
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    
                    <div className="bg-red-950/10 p-3 sm:p-4 border-l-4 border-cyan-400">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                         <Database className="text-cyan-400" size={16}/>
                         <span className="text-xs sm:text-sm font-bold text-cyan-100 uppercase">Storage Subsystem</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] sm:text-xs text-red-400">USED: {systemStats.storageUsage}</span>
                         <span className="text-lg sm:text-xl font-mono text-white">{systemStats.storageQuota} TOTAL</span>
                      </div>
                      <div className="w-full h-1 bg-red-900/30 mt-2">
                        <div className="h-full bg-cyan-400" style={{width: '25%'}}></div>
                      </div>
                    </div>

                    <div className="bg-red-950/10 p-3 sm:p-4 border-l-4 border-red-500">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                         <Maximize className="text-red-500" size={16}/>
                         <span className="text-xs sm:text-sm font-bold text-red-100 uppercase">Display Matrix</span>
                      </div>
                      <div className="text-lg sm:text-xl font-mono text-white">{systemStats.screenRes}</div>
                      <div className="text-[10px] sm:text-xs text-red-400 mt-1 break-all">{systemStats.gpu.substring(0, 40)}</div>
                    </div>

                    <div className="bg-red-950/10 p-3 sm:p-4 border-l-4 border-green-500">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                         {systemStats.batteryCharging ? <BatteryCharging className="text-green-500" size={16}/> : <Battery className="text-green-500" size={16}/>}
                         <span className="text-xs sm:text-sm font-bold text-green-100 uppercase">Power Core</span>
                      </div>
                      <div className="flex justify-between items-end">
                         <span className="text-lg sm:text-xl font-mono text-white">{systemStats.batteryLevel ? `${systemStats.batteryLevel}%` : 'EXT'}</span>
                         <span className="text-[10px] sm:text-xs text-green-400">{systemStats.batteryCharging ? 'CHARGING' : 'DISCHARGING'}</span>
                      </div>
                    </div>

                  </div>
               </div>

               <button 
                  onClick={() => { audio.playClickSound(); setView('home'); }}
                  className="mt-6 sm:mt-8 w-full border border-red-600 text-red-500 hover:bg-red-600 hover:text-black py-2 sm:py-3 uppercase tracking-widest font-bold transition-all text-sm"
               >
                 Close Diagnostics
               </button>
             </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="animate-fadeIn max-w-3xl mx-auto pt-4 sm:pt-8">
            <div className={`border border-red-600/30 p-1 relative shadow-[0_0_100px_rgba(220,38,38,0.1)] ${frostClass}`}>
              <div className="absolute top-1/2 -left-4 w-1 h-32 bg-red-900/50 transform -translate-y-1/2 hidden sm:block"></div>
              <div className="absolute top-1/2 -right-4 w-1 h-32 bg-red-900/50 transform -translate-y-1/2 hidden sm:block"></div>

              <div className="border border-red-900/50 p-4 sm:p-8 lg:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500"></div>

                <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-red-900/50 pb-4">
                  <h2 className={`text-xl sm:text-3xl tracking-[0.1em] sm:tracking-[0.2em] text-red-100 heading ${settings.chromatic ? 'chromatic-text' : ''} ${glowClass}`}>SYSTEM_CONFIG</h2>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>

                <div className="space-y-6 sm:space-y-10">
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 mb-4">
                       <Volume2 className="text-red-500" size={16} />
                       <span className="text-xs sm:text-sm font-bold text-red-500 uppercase tracking-widest">Audio Output</span>
                     </div>
                     <CyberSlider 
                        label="Music Volume" 
                        value={settings.musicVol} 
                        onChange={(val) => setSettings(s => ({...s, musicVol: val}))} 
                     />
                     <CyberSlider 
                        label="Effects Volume" 
                        value={settings.sfxVol} 
                        onChange={(val) => setSettings(s => ({...s, sfxVol: val}))} 
                     />
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-transparent via-red-900/50 to-transparent my-8"></div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                       <Monitor className="text-red-500" size={16} />
                       <span className="text-xs sm:text-sm font-bold text-red-500 uppercase tracking-widest">Graphics Engine</span>
                     </div>
                    <CyberCheckbox label="MOTION BLUR" checked={settings.motionBlur} onChange={(v) => setSettings(s => ({...s, motionBlur: v}))} />
                    <CyberCheckbox label="DEPTH OF FIELD" checked={settings.dof} onChange={(v) => setSettings(s => ({...s, dof: v}))} />
                    <CyberCheckbox label="CHROMATIC ABERRATION" checked={settings.chromatic} onChange={(v) => setSettings(s => ({...s, chromatic: v}))} />
                    <CyberCheckbox label="SCANLINE OVERLAY" checked={settings.scanlines} onChange={(v) => setSettings(s => ({...s, scanlines: v}))} />
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-8 text-center">
                  <p className="text-[9px] sm:text-[10px] text-red-800 font-mono mb-4">PRESS 'M' TO TOGGLE AUDIO MUTE</p>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-6">
                  <button onClick={() => { audio.playClickSound(); setView('home'); }} className="flex-1 border border-red-600 text-red-500 py-2 sm:py-3 hover:bg-red-600 hover:text-black transition-colors uppercase tracking-widest text-xs sm:text-sm font-bold">
                    Discard
                  </button>
                  <button onClick={() => { audio.playClickSound(); setView('home'); }} className="flex-1 bg-red-600 text-black font-bold py-2 sm:py-3 hover:bg-white hover:text-black transition-colors uppercase tracking-widest text-xs sm:text-sm shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="nav-bar fixed bottom-0 w-full z-40 bg-black/90 border-t border-red-900/50 backdrop-blur-lg pb-safe">
         <div className="flex justify-around items-center h-16 sm:h-20 max-w-lg mx-auto relative">
            <button 
              onClick={() => { audio.playClickSound(); setView('home'); }} 
              className={`flex flex-col items-center gap-1 w-16 sm:w-20 ${view === 'home' ? 'text-red-500 drop-shadow-[0_0_8px_red]' : 'text-red-900 hover:text-red-400'}`}
            >
              <Activity size={20} />
              <span className={`text-[8px] sm:text-[10px] uppercase tracking-widest font-bold ${glowClass}`}>Stats</span>
              {view === 'home' && <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>}
            </button>
            
            {/* Center Decorative Button - Triggers Device View */}
            <div className="relative -top-6 sm:-top-8 group">
              <button 
                onClick={() => {
                  audio.playClickSound();
                  triggerBurst();
                  setView('device');
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-black rotate-45 border-2 border-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)] group-hover:scale-110 group-hover:border-red-400 group-hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all duration-300"
              >
                <div className="-rotate-45 bg-red-600 p-2 sm:p-3 shadow-inner">
                  <Crosshair className="text-black" size={24} />
                </div>
              </button>
            </div>

            <button 
              onClick={() => { audio.playClickSound(); setView('settings'); }} 
              className={`flex flex-col items-center gap-1 w-16 sm:w-20 ${view === 'settings' ? 'text-red-500 drop-shadow-[0_0_8px_red]' : 'text-red-900 hover:text-red-400'}`}
            >
              <Menu size={20} />
              <span className={`text-[8px] sm:text-[10px] uppercase tracking-widest font-bold ${glowClass}`}>Config</span>
              {view === 'settings' && <div className="w-1 h-1 bg-red-500 rounded-full mt-1"></div>}
            </button>
         </div>
      </nav>

    </div>
  );
};

export default App;
