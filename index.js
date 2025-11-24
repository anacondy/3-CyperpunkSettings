import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, X, Shield, Zap, Activity, Cpu, Disc, Volume2, Monitor, Eye } from 'lucide-react';

/**
 * MATH-BASED AUDIO ENGINE
 * Generates procedural sounds using Web Audio API to simulate
 * "mathematical code" noises (glitches, chirps, sine sweeps).
 */
const useSoundEngine = (volume = 0.5) => {
  const audioContextRef = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const playSound = useCallback((type = 'click') => {
    if (!audioContextRef.current) return;
    
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;
    
    if (type === 'click') {
      // High pitched metallic click
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gainNode.gain.setValueAtTime(volume * 0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'hover') {
      // Soft data purr
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.05);
      gainNode.gain.setValueAtTime(volume * 0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'scan') {
      // Computing noise
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.2);
      gainNode.gain.setValueAtTime(volume * 0.2, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  }, [volume]);

  return { initAudio, playSound };
};

/**
 * COMPONENT: LOADING SCREEN
 * Replicates the "Loading... 43%" reference with cyan/red aesthetic
 */
const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const { playSound, initAudio } = useSoundEngine(0.5);

  useEffect(() => {
    initAudio(); // Try to init audio context early
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        // Random increments for "hacking" feel
        const jump = Math.random() > 0.8 ? 15 : 2;
        if (Math.random() > 0.5) playSound('scan'); 
        return Math.min(prev + jump, 100);
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete, playSound, initAudio]);

  return (
    <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center font-mono">
      <div className="w-full max-w-md px-8 relative">
        <h1 className="text-[#00f0ff] text-2xl mb-2 tracking-widest animate-pulse font-bold text-center">
          LOADING... <span className="text-[#00f0ff]">{Math.floor(progress)}%</span>
        </h1>
        
        {/* Loading Bar Container - Cyan Brackets */}
        <div className="relative h-12 w-full flex items-center p-1 border-x-4 border-[#00f0ff] border-opacity-80">
          <div className="absolute -top-1 -left-1 w-4 h-1 bg-[#00f0ff]"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-1 bg-[#00f0ff]"></div>
          <div className="absolute -top-1 -right-1 w-4 h-1 bg-[#00f0ff]"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-1 bg-[#00f0ff]"></div>

          {/* Red Progress Blocks */}
          <div className="flex h-full w-full gap-1 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i}
                className={`h-full flex-1 transition-colors duration-75 ${
                  (i / 40) * 100 < progress ? 'bg-[#ff2a2a] shadow-[0_0_10px_#ff2a2a]' : 'bg-[#1a1a1a]'
                }`}
              />
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-xs text-[#ff2a2a] text-center opacity-70 tracking-[0.3em]">
          INITIALIZING NEURAL LINK...
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENT: SETTINGS PANEL
 * Replicates the "Settings" reference image
 */
const SettingsPanel = ({ active, onClose, playSound, volume, setVolume }) => {
  if (!active) return null;

  const SettingRow = ({ label, type = "toggle", value, onChange }) => (
    <div className="flex items-center justify-between py-4 border-l-2 border-[#ff2a2a] pl-4 bg-gradient-to-r from-[#ff2a2a10] to-transparent mb-4 hover:bg-[#ff2a2a20] transition-all group">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-[#ff2a2a] opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="text-white font-mono tracking-widest text-sm md:text-base uppercase">{label}</span>
      </div>
      
      {type === "slider" ? (
        <div className="flex items-center gap-4 w-1/2 justify-end pr-4">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              playSound('click');
            }}
            className="w-full h-2 bg-[#1a1a1a] appearance-none cursor-pointer cyberpunk-slider"
          />
          <span className="text-[#00f0ff] font-mono w-12 text-right">{value}%</span>
        </div>
      ) : (
        <div className="flex items-center gap-8 pr-4 font-mono text-xs md:text-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { onChange(true); playSound('click'); }}>
            <span className={value ? "text-[#ff2a2a]" : "text-gray-500"}>ON</span>
            <div className={`w-4 h-4 border border-[#ff2a2a] flex items-center justify-center transition-all ${value ? 'bg-[#ff2a2a]' : ''}`}>
              {value && <div className="w-2 h-2 bg-black" />}
            </div>
          </div>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { onChange(false); playSound('click'); }}>
            <span className={!value ? "text-[#ff2a2a]" : "text-gray-500"}>OFF</span>
            <div className={`w-4 h-4 border border-[#ff2a2a] flex items-center justify-center transition-all ${!value ? 'bg-[#ff2a2a]' : ''}`}>
              {!value && <div className="w-2 h-2 bg-black" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute inset-0 z-40 bg-[#050505]/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl border border-[#333] relative p-1 md:p-8 bg-black">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ff2a2a]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ff2a2a]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff2a2a]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ff2a2a]" />

        {/* Title */}
        <div className="text-center mb-12 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 flex gap-2">
            <div className="w-2 h-2 bg-[#ff2a2a] rounded-full" />
            <div className="w-2 h-2 bg-[#ff2a2a] rounded-full" />
          </div>
          <h2 className="text-2xl font-mono text-white tracking-[0.5em] uppercase">Settings</h2>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <SettingRow label="Music Volume" type="slider" value={volume} onChange={setVolume} />
          <SettingRow label="Effects Volume" type="slider" value={90} onChange={() => {}} />
          <SettingRow label="Motion Blur" type="toggle" value={true} onChange={() => {}} />
          <SettingRow label="Field of Depth" type="toggle" value={true} onChange={() => {}} />
          <SettingRow label="Deep Color" type="toggle" value={false} onChange={() => {}} />
        </div>

        {/* Difficulty Selector */}
        <div className="mt-12 mb-8">
          <div className="bg-[#ff2a2a] text-black font-bold text-center py-1 tracking-widest mb-6">
            DIFFICULTY
          </div>
          <div className="flex justify-center gap-12 font-mono text-sm text-[#ff2a2a]">
            <label className="flex items-center gap-2 cursor-pointer">
              <span>EASY</span>
              <div className="w-4 h-4 border border-[#ff2a2a] bg-[#ff2a2a]" />
            </label>
            <label className="flex items-center gap-2 cursor-pointer opacity-50">
              <span>MEDIUM</span>
              <div className="w-4 h-4 border border-[#ff2a2a]" />
            </label>
            <label className="flex items-center gap-2 cursor-pointer opacity-50">
              <span>HARD</span>
              <div className="w-4 h-4 border border-[#ff2a2a]" />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8 px-8">
          <button 
            onClick={() => { playSound('click'); onClose(); }}
            className="border border-[#ff2a2a] text-white px-8 py-2 font-mono text-sm hover:bg-[#ff2a2a] hover:text-black transition-colors relative"
          >
            [ BACK ]
          </button>
          <button 
            onClick={() => { playSound('click'); onClose(); }}
            className="border border-[#ff2a2a] text-white px-8 py-2 font-mono text-sm hover:bg-[#ff2a2a] hover:text-black transition-colors relative"
          >
            [ ACCEPT ]
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * COMPONENT: STAT DIAMOND
 * Renders the rotated square stats from the "Attributes" reference
 */
const StatDiamond = ({ label, value, color = "red", delay = 0 }) => {
  return (
    <div 
      className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center m-2 group cursor-pointer"
      style={{ animation: `fadeIn 0.5s ease-out ${delay}s backwards` }}
    >
      {/* Rotated Container */}
      <div className={`absolute inset-0 transform rotate-45 border-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#ff2a2a]/20
        ${color === 'red' ? 'border-[#ff2a2a] bg-[#ff2a2a]/10' : 'border-[#00f0ff] bg-[#00f0ff]/10'}`}>
        
        {/* Inner Glitch Pattern */}
        <div className="absolute inset-2 border border-dashed border-white/20" />
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-2 h-2 bg-current" />
        <div className="absolute bottom-0 right-0 w-2 h-2 bg-current" />
      </div>

      {/* Content (Counter-rotated to stay straight) */}
      <div className="relative z-10 text-center pointer-events-none">
        <div className="text-2xl md:text-3xl font-bold font-mono text-white mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
          {value}
        </div>
        <div className={`text-[10px] md:text-xs font-mono uppercase tracking-widest ${color === 'red' ? 'text-[#ff2a2a]' : 'text-[#00f0ff]'}`}>
          {label}
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN APP COMPONENT
 */
const App = () => {
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(50);
  const { initAudio, playSound } = useSoundEngine(volume / 100);

  // Initialize audio on first user interaction to bypass browser autoplay policy
  useEffect(() => {
    const handleInteraction = () => initAudio();
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [initAudio]);

  const toggleSettings = () => {
    playSound('click');
    setShowSettings(!showSettings);
  };

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-[#ff2a2a] selection:text-black">
      {/* Global CSS for CRT lines and Scrollbars */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        
        body { font-family: 'Share Tech Mono', monospace; }
        
        .cyberpunk-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 15px;
          height: 25px;
          background: #ff2a2a;
          cursor: pointer;
          border: 1px solid white;
        }

        .scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0,0,0,0.2) 50%,
            rgba(0,0,0,0.2)
          );
          background-size: 100% 4px;
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          pointer-events: none;
          z-index: 100;
          opacity: 0.6;
        }

        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        
        .glow-text { text-shadow: 0 0 10px currentColor; }
      `}</style>

      <div className="scanlines" />

      {/* Navigation / Header */}
      <nav className="fixed top-0 w-full z-30 flex justify-between items-center p-4 md:p-6 border-b border-[#333] bg-[#050505]/90 backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#ff2a2a] rounded-sm flex items-center justify-center animate-pulse">
            <Cpu className="text-[#ff2a2a]" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white">NEURAL_OS</h1>
            <div className="text-[10px] text-[#00f0ff]">SYS.VER.2.4.9</div>
          </div>
        </div>
        
        <button 
          onClick={toggleSettings}
          className="p-2 hover:bg-[#ff2a2a]/20 border border-transparent hover:border-[#ff2a2a] transition-all group"
        >
          <Settings className={`text-white group-hover:rotate-90 transition-transform duration-500`} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto relative z-10">
        
        {/* Background Grid Decoration */}
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', 
               backgroundSize: '30px 30px' 
             }} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          
          {/* LEFT COLUMN: Attributes (Matching Reference 1000100907) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-4 mb-8 border-b border-[#333] pb-4">
              <Activity className="text-[#ff2a2a]" />
              <h2 className="text-2xl font-bold tracking-[0.2em] text-[#ff2a2a] glow-text">ATTRIBUTES</h2>
              <span className="text-xs border border-[#ff2a2a] px-2 py-1 ml-auto">10 POINTS SPENT</span>
            </div>

            {/* Diamond Grid Layout */}
            <div className="relative py-8 pl-4 md:pl-12">
               {/* Connecting Lines (SVG) */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0">
                  <path d="M100 100 L200 200 L300 100" stroke="#ff2a2a" strokeWidth="1" fill="none" />
                  <path d="M200 200 L200 350" stroke="#ff2a2a" strokeWidth="1" fill="none" />
                  <circle cx="200" cy="200" r="3" fill="#ff2a2a" />
               </svg>

               <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-8">
                  <div className="flex flex-col gap-4">
                     <StatDiamond label="Reflex" value="10" delay={0.1} />
                     <StatDiamond label="Strength" value="10" delay={0.2} />
                  </div>
                  <div className="flex flex-col gap-4 mt-12 md:mt-16">
                     <StatDiamond label="Intel" value="10" delay={0.3} />
                     <StatDiamond label="Tech" value="10" delay={0.4} />
                  </div>
                  <div className="flex flex-col gap-4">
                     <StatDiamond label="Const" value="10" delay={0.5} />
                     <StatDiamond label="Cool" value="10" delay={0.6} />
                  </div>
               </div>
            </div>

            {/* Description Box */}
            <div className="border-l-4 border-[#ff2a2a] bg-[#ff2a2a]/5 p-6 mt-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-1">
                 <div className="w-2 h-2 bg-[#ff2a2a]"></div>
               </div>
               <h3 className="text-[#ff2a2a] font-bold mb-2 tracking-wider">STRENGTH</h3>
               <p className="text-sm text-gray-400 leading-relaxed font-sans">
                 How well you work with hardware. Unlocks technical ability interactions in environment. Increases jury rig possibilities.
               </p>
               <div className="mt-4 flex gap-2">
                 <span className="bg-[#ff2a2a] text-black text-xs font-bold px-2 py-1">LEVEL 10</span>
                 <span className="border border-[#ff2a2a] text-[#ff2a2a] text-xs font-bold px-2 py-1">MAXED</span>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Statistics/Skills Tree */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4 mb-8 border-b border-[#333] pb-4">
              <Shield className="text-[#ff2a2a]" />
              <h2 className="text-2xl font-bold tracking-[0.2em] text-[#ff2a2a] glow-text">STATISTICS</h2>
              <span className="text-xs text-gray-500 ml-auto">V.0.91</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
               {/* Smaller Skill Diamonds */}
               <div className="col-span-2 md:col-span-1 flex flex-col items-center gap-6">
                  <div className="w-full flex justify-end">
                     <StatDiamond label="Hand Guns" value="5/9" color="red" delay={0.7} />
                  </div>
                  <div className="w-full flex justify-center">
                     <StatDiamond label="Rifles" value="5/10" color="red" delay={0.8} />
                  </div>
                  <div className="w-full flex justify-start">
                     <StatDiamond label="Blades" value="6/10" color="red" delay={0.9} />
                  </div>
               </div>

               {/* Right Side Stats List */}
               <div className="space-y-4 font-mono text-sm pt-4">
                 {[
                   { name: "CRIT CHANCE", val: "12%" },
                   { name: "CRIT DAMAGE", val: "140%" },
                   { name: "ARMOR", val: "324" },
                   { name: "EVASION", val: "440" },
                   { name: "THERMAL RES", val: "15%" },
                   { name: "EMP RES", val: "5%" }
                 ].map((stat, idx) => (
                   <div key={idx} className="flex justify-between items-center border-b border-[#333] pb-1 hover:border-[#ff2a2a] transition-colors group cursor-crosshair" 
                        onMouseEnter={() => playSound('hover')}>
                     <span className="text-gray-500 group-hover:text-white transition-colors">{stat.name}</span>
                     <span className="text-[#00f0ff] font-bold">{stat.val}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 w-full bg-[#050505] border-t border-[#333] p-2 flex justify-between items-center z-30 text-[10px] md:text-xs text-gray-500 font-mono">
         <div className="flex gap-4">
           <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> ONLINE</span>
           <span>LAT: 35.021</span>
           <span>LON: 139.12</span>
         </div>
         <div className="flex gap-4">
           <span>MEMORY: 64%</span>
           <span>CPU: 12%</span>
         </div>
      </footer>

      {/* Settings Overlay */}
      <SettingsPanel 
        active={showSettings} 
        onClose={() => setShowSettings(false)} 
        playSound={playSound}
        volume={volume}
        setVolume={setVolume}
      />

    </div>
  );
};

export default App;
