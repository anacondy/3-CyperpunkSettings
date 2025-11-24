import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Shield, Activity, Cpu } from 'lucide-react';

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
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
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
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gainNode.gain.setValueAtTime(volume * 0.5, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.05);
      gainNode.gain.setValueAtTime(volume * 0.1, now);
      gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'scan') {
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
    initAudio();
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        const jump = Math.random() > 0.8 ? 15 : 2;
        if (Math.random() > 0.5) playSound('scan'); 
        return Math.min(prev + jump, 100);
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onComplete, playSound, initAudio]);

  return (
    <div className="fixed inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center font-mono" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
      <div className="w-full max-w-md px-8 relative">
        <h1 className="text-[#00f0ff] text-2xl mb-2 tracking-widest animate-pulse font-bold text-center">
          LOADING... <span className="text-[#00f0ff]">{Math.floor(progress)}%</span>
        </h1>
        
        <div className="relative h-12 w-full flex items-center p-1 border-x-4 border-[#00f0ff] border-opacity-80">
          <div className="absolute -top-1 -left-1 w-4 h-1 bg-[#00f0ff]"></div>
          <div className="absolute -bottom-1 -left-1 w-4 h-1 bg-[#00f0ff]"></div>
          <div className="absolute -top-1 -right-1 w-4 h-1 bg-[#00f0ff]"></div>
          <div className="absolute -bottom-1 -right-1 w-4 h-1 bg-[#00f0ff]"></div>

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
 * COMPONENT: SETTING ROW
 * Individual setting row with toggle or slider
 */
const SettingRow = ({ label, type = "toggle", value, onChange, playSound, isFocused, onFocus, tabIndex }) => {
  const rowRef = useRef(null);

  useEffect(() => {
    if (isFocused && rowRef.current) {
      rowRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e) => {
    if (type === 'slider') {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        const newValue = Math.max(0, value - 5);
        onChange(newValue);
        playSound('click');
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        const newValue = Math.min(100, value + 5);
        onChange(newValue);
        playSound('click');
      }
    } else {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onChange(!value);
        playSound('click');
      }
    }
  };

  return (
    <div 
      ref={rowRef}
      className={`flex items-center justify-between py-4 border-l-2 border-[#ff2a2a] pl-4 bg-gradient-to-r from-[#ff2a2a10] to-transparent mb-4 transition-all group cursor-pointer ${isFocused ? 'bg-[#ff2a2a30] outline outline-2 outline-[#00f0ff]' : 'hover:bg-[#ff2a2a20]'}`}
      tabIndex={tabIndex}
      role={type === 'slider' ? 'slider' : 'switch'}
      aria-label={label}
      aria-valuenow={type === 'slider' ? value : undefined}
      aria-valuemin={type === 'slider' ? 0 : undefined}
      aria-valuemax={type === 'slider' ? 100 : undefined}
      aria-checked={type === 'toggle' ? value : undefined}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    >
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
              onChange(Number(e.target.value));
              playSound('click');
            }}
            className="w-full h-2 bg-[#1a1a1a] appearance-none cursor-pointer cyberpunk-slider"
            tabIndex={-1}
            aria-hidden="true"
          />
          <span className="text-[#00f0ff] font-mono w-12 text-right">{value}%</span>
        </div>
      ) : (
        <div className="flex items-center gap-8 pr-4 font-mono text-xs md:text-sm">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); onChange(true); playSound('click'); }}
          >
            <span className={value ? "text-[#ff2a2a]" : "text-gray-500"}>ON</span>
            <div className={`w-4 h-4 border border-[#ff2a2a] flex items-center justify-center transition-all ${value ? 'bg-[#ff2a2a]' : ''}`}>
              {value && <div className="w-2 h-2 bg-black" />}
            </div>
          </div>
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={(e) => { e.stopPropagation(); onChange(false); playSound('click'); }}
          >
            <span className={!value ? "text-[#ff2a2a]" : "text-gray-500"}>OFF</span>
            <div className={`w-4 h-4 border border-[#ff2a2a] flex items-center justify-center transition-all ${!value ? 'bg-[#ff2a2a]' : ''}`}>
              {!value && <div className="w-2 h-2 bg-black" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * COMPONENT: SETTINGS PANEL
 * Replicates the "Settings" reference image with keyboard navigation
 */
const SettingsPanel = ({ active, onClose, playSound, volume, setVolume }) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const [settings, setSettings] = useState({
    effectsVolume: 90,
    motionBlur: true,
    fieldOfDepth: true,
    deepColor: false
  });
  const [difficulty, setDifficulty] = useState('easy');
  const panelRef = useRef(null);

  const settingsCount = 5; // 2 sliders + 3 toggles
  const totalFocusableItems = settingsCount + 3 + 2; // settings + difficulties + buttons

  useEffect(() => {
    if (active) {
      setFocusIndex(0);
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusIndex(prev => Math.min(prev + 1, totalFocusableItems - 1));
          playSound('hover');
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusIndex(prev => Math.max(prev - 1, 0));
          playSound('hover');
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          playSound('click');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, onClose, playSound, totalFocusableItems]);

  if (!active) return null;

  const handleDifficultyKeyDown = (e, diff) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setDifficulty(diff);
      playSound('click');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const diffs = ['easy', 'medium', 'hard'];
      const currentIndex = diffs.indexOf(diff);
      if (currentIndex > 0) {
        setDifficulty(diffs[currentIndex - 1]);
        setFocusIndex(settingsCount + currentIndex - 1);
        playSound('hover');
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const diffs = ['easy', 'medium', 'hard'];
      const currentIndex = diffs.indexOf(diff);
      if (currentIndex < diffs.length - 1) {
        setDifficulty(diffs[currentIndex + 1]);
        setFocusIndex(settingsCount + currentIndex + 1);
        playSound('hover');
      }
    }
  };

  return (
    <div 
      className="absolute inset-0 z-40 bg-[#050505]/95 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Settings Panel"
      ref={panelRef}
    >
      <div className="w-full max-w-3xl border border-[#333] relative p-4 md:p-8 bg-black">
        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#ff2a2a]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ff2a2a]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ff2a2a]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#ff2a2a]" />

        {/* Title */}
        <div className="text-center mb-12 relative">
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 md:-top-10 flex gap-2">
            <div className="w-2 h-2 bg-[#ff2a2a] rounded-full" />
            <div className="w-2 h-2 bg-[#ff2a2a] rounded-full" />
          </div>
          <h2 className="text-xl md:text-2xl font-mono text-white tracking-[0.5em] uppercase">Settings</h2>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <SettingRow 
            label="Music Volume" 
            type="slider" 
            value={volume} 
            onChange={setVolume} 
            playSound={playSound}
            isFocused={focusIndex === 0}
            onFocus={() => setFocusIndex(0)}
            tabIndex={0}
          />
          <SettingRow 
            label="Effects Volume" 
            type="slider" 
            value={settings.effectsVolume} 
            onChange={(val) => setSettings(prev => ({ ...prev, effectsVolume: val }))}
            playSound={playSound}
            isFocused={focusIndex === 1}
            onFocus={() => setFocusIndex(1)}
            tabIndex={0}
          />
          <SettingRow 
            label="Motion Blur" 
            type="toggle" 
            value={settings.motionBlur} 
            onChange={(val) => setSettings(prev => ({ ...prev, motionBlur: val }))}
            playSound={playSound}
            isFocused={focusIndex === 2}
            onFocus={() => setFocusIndex(2)}
            tabIndex={0}
          />
          <SettingRow 
            label="Field of Depth" 
            type="toggle" 
            value={settings.fieldOfDepth} 
            onChange={(val) => setSettings(prev => ({ ...prev, fieldOfDepth: val }))}
            playSound={playSound}
            isFocused={focusIndex === 3}
            onFocus={() => setFocusIndex(3)}
            tabIndex={0}
          />
          <SettingRow 
            label="Deep Color" 
            type="toggle" 
            value={settings.deepColor} 
            onChange={(val) => setSettings(prev => ({ ...prev, deepColor: val }))}
            playSound={playSound}
            isFocused={focusIndex === 4}
            onFocus={() => setFocusIndex(4)}
            tabIndex={0}
          />
        </div>

        {/* Difficulty Selector */}
        <div className="mt-8 md:mt-12 mb-6 md:mb-8">
          <div className="bg-[#ff2a2a] text-black font-bold text-center py-1 tracking-widest mb-6 text-sm md:text-base">
            DIFFICULTY
          </div>
          <div className="flex justify-center gap-6 md:gap-12 font-mono text-xs md:text-sm text-[#ff2a2a]" role="radiogroup" aria-label="Difficulty level">
            {['easy', 'medium', 'hard'].map((diff, idx) => (
              <label 
                key={diff}
                className={`flex items-center gap-2 cursor-pointer transition-opacity ${difficulty === diff ? '' : 'opacity-50'} ${focusIndex === settingsCount + idx ? 'outline outline-2 outline-[#00f0ff] outline-offset-2' : ''}`}
                tabIndex={0}
                role="radio"
                aria-checked={difficulty === diff}
                onKeyDown={(e) => handleDifficultyKeyDown(e, diff)}
                onClick={() => { setDifficulty(diff); playSound('click'); }}
                onFocus={() => setFocusIndex(settingsCount + idx)}
              >
                <span className="uppercase">{diff}</span>
                <div className={`w-4 h-4 border border-[#ff2a2a] ${difficulty === diff ? 'bg-[#ff2a2a]' : ''}`} />
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 md:mt-8 px-4 md:px-8">
          <button 
            onClick={() => { playSound('click'); onClose(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playSound('click');
                onClose();
              }
            }}
            className={`border border-[#ff2a2a] text-white px-4 md:px-8 py-2 font-mono text-xs md:text-sm hover:bg-[#ff2a2a] hover:text-black transition-colors relative ${focusIndex === totalFocusableItems - 2 ? 'bg-[#ff2a2a] text-black outline outline-2 outline-[#00f0ff]' : ''}`}
            tabIndex={0}
            onFocus={() => setFocusIndex(totalFocusableItems - 2)}
          >
            [ BACK ]
          </button>
          <button 
            onClick={() => { playSound('click'); onClose(); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playSound('click');
                onClose();
              }
            }}
            className={`border border-[#ff2a2a] text-white px-4 md:px-8 py-2 font-mono text-xs md:text-sm hover:bg-[#ff2a2a] hover:text-black transition-colors relative ${focusIndex === totalFocusableItems - 1 ? 'bg-[#ff2a2a] text-black outline outline-2 outline-[#00f0ff]' : ''}`}
            tabIndex={0}
            onFocus={() => setFocusIndex(totalFocusableItems - 1)}
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
const StatDiamond = ({ label, value, color = "red", delay = 0, isFocused, onFocus, tabIndex, onValueChange }) => {
  const diamondRef = useRef(null);

  useEffect(() => {
    if (isFocused && diamondRef.current) {
      diamondRef.current.focus();
    }
  }, [isFocused]);

  const handleKeyDown = (e) => {
    if (!onValueChange) return;
    
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      onValueChange(1);
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onValueChange(-1);
    }
  };

  return (
    <div 
      ref={diamondRef}
      className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 flex items-center justify-center m-1 sm:m-2 group cursor-pointer ${isFocused ? 'scale-110' : ''}`}
      style={{ animation: `fadeIn 0.5s ease-out ${delay}s backwards` }}
      tabIndex={tabIndex}
      role="button"
      aria-label={`${label}: ${value}`}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    >
      {/* Rotated Container */}
      <div className={`absolute inset-0 transform rotate-45 border-2 transition-all duration-300 group-hover:scale-110 group-hover:bg-[#ff2a2a]/20
        ${color === 'red' ? 'border-[#ff2a2a] bg-[#ff2a2a]/10' : 'border-[#00f0ff] bg-[#00f0ff]/10'}
        ${isFocused ? 'scale-110 border-[#00f0ff] shadow-[0_0_20px_#00f0ff]' : ''}`}>
        
        {/* Inner Glitch Pattern */}
        <div className="absolute inset-2 border border-dashed border-white/20" />
        
        {/* Corner Accents */}
        <div className={`absolute top-0 left-0 w-2 h-2 ${color === 'red' ? 'bg-[#ff2a2a]' : 'bg-[#00f0ff]'}`} />
        <div className={`absolute bottom-0 right-0 w-2 h-2 ${color === 'red' ? 'bg-[#ff2a2a]' : 'bg-[#00f0ff]'}`} />
      </div>

      {/* Content (Counter-rotated to stay straight) */}
      <div className="relative z-10 text-center pointer-events-none">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold font-mono text-white mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
          {value}
        </div>
        <div className={`text-[8px] sm:text-[10px] md:text-xs font-mono uppercase tracking-widest ${color === 'red' ? 'text-[#ff2a2a]' : 'text-[#00f0ff]'}`}>
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
  const [focusedDiamond, setFocusedDiamond] = useState(-1);
  const [attributes, setAttributes] = useState({
    reflex: 10,
    strength: 10,
    intel: 10,
    tech: 10,
    const: 10,
    cool: 10
  });
  const [skills, setSkills] = useState({
    handGuns: { current: 5, max: 9 },
    rifles: { current: 5, max: 10 },
    blades: { current: 6, max: 10 }
  });
  const { initAudio, playSound } = useSoundEngine(volume / 100);

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleInteraction = () => initAudio();
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [initAudio]);

  // Global keyboard navigation
  useEffect(() => {
    if (loading || showSettings) return;

    const handleKeyDown = (e) => {
      const attributeKeys = Object.keys(attributes);
      const totalDiamonds = attributeKeys.length + Object.keys(skills).length;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedDiamond(prev => {
            const next = prev + 1;
            if (next >= totalDiamonds) return 0;
            return next;
          });
          playSound('hover');
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedDiamond(prev => {
            const next = prev - 1;
            if (next < 0) return totalDiamonds - 1;
            return next;
          });
          playSound('hover');
          break;
        case 'Enter':
        case ' ':
          if (e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            toggleSettings();
          }
          break;
        case 's':
        case 'S':
          e.preventDefault();
          toggleSettings();
          break;
        case 'Escape':
          if (showSettings) {
            e.preventDefault();
            setShowSettings(false);
            playSound('click');
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, showSettings, attributes, skills, playSound]);

  const toggleSettings = () => {
    playSound('click');
    setShowSettings(!showSettings);
  };

  const handleAttributeChange = (attr, delta) => {
    setAttributes(prev => ({
      ...prev,
      [attr]: Math.max(1, Math.min(20, prev[attr] + delta))
    }));
    playSound('click');
  };

  const handleSkillChange = (skill, delta) => {
    setSkills(prev => ({
      ...prev,
      [skill]: {
        ...prev[skill],
        current: Math.max(1, Math.min(prev[skill].max, prev[skill].current + delta))
      }
    }));
    playSound('click');
  };

  const stats = [
    { name: "CRIT CHANCE", val: `${10 + Math.floor(attributes.reflex / 2)}%` },
    { name: "CRIT DAMAGE", val: `${100 + attributes.strength * 4}%` },
    { name: "ARMOR", val: `${300 + attributes.const * 2}` },
    { name: "EVASION", val: `${400 + attributes.reflex * 4}` },
    { name: "THERMAL RES", val: `${5 + attributes.tech}%` },
    { name: "EMP RES", val: `${attributes.intel}%` }
  ];

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-[#ff2a2a] selection:text-black">
      <div className="scanlines" aria-hidden="true" />

      {/* Navigation / Header */}
      <nav className="fixed top-0 w-full z-30 flex justify-between items-center p-3 md:p-6 border-b border-[#333] bg-[#050505]/90 backdrop-blur" role="navigation">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-[#ff2a2a] rounded-sm flex items-center justify-center animate-pulse">
            <Cpu className="text-[#ff2a2a]" size={20} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-widest text-white">NEURAL_OS</h1>
            <div className="text-[8px] md:text-[10px] text-[#00f0ff]">SYS.VER.2.4.9</div>
          </div>
        </div>
        
        <button 
          onClick={toggleSettings}
          className="p-2 hover:bg-[#ff2a2a]/20 border border-transparent hover:border-[#ff2a2a] transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
          aria-label="Open Settings (Press S)"
          title="Open Settings (Press S)"
        >
          <Settings className="text-white group-hover:rotate-90 transition-transform duration-500" size={24} />
        </button>
      </nav>

      {/* Main Content */}
      <main className="pt-20 md:pt-24 pb-16 md:pb-12 px-3 md:px-4 max-w-7xl mx-auto relative z-10" role="main">
        
        {/* Background Grid Decoration */}
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', 
               backgroundSize: '30px 30px' 
             }} 
             aria-hidden="true"
        />

        {/* Keyboard Navigation Hint */}
        <div className="text-center mb-4 text-[10px] md:text-xs text-gray-500 font-mono">
          <span className="hidden md:inline">Use Arrow Keys to navigate • Enter/Space to interact • S for Settings</span>
          <span className="md:hidden">Tap elements to interact • Swipe to scroll</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 relative z-10">
          
          {/* LEFT COLUMN: Attributes */}
          <section className="lg:col-span-7 space-y-6 md:space-y-8" aria-labelledby="attributes-heading">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 border-b border-[#333] pb-4">
              <Activity className="text-[#ff2a2a]" size={20} />
              <h2 id="attributes-heading" className="text-xl md:text-2xl font-bold tracking-[0.2em] text-[#ff2a2a] glow-text">ATTRIBUTES</h2>
              <span className="text-[10px] md:text-xs border border-[#ff2a2a] px-2 py-1 ml-auto whitespace-nowrap">
                {Object.values(attributes).reduce((a, b) => a + b, 0)} PTS
              </span>
            </div>

            {/* Diamond Grid Layout */}
            <div className="relative py-4 md:py-8 pl-2 md:pl-12">
               {/* Connecting Lines (SVG) */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 z-0" aria-hidden="true">
                  <path d="M100 100 L200 200 L300 100" stroke="#ff2a2a" strokeWidth="1" fill="none" />
                  <path d="M200 200 L200 350" stroke="#ff2a2a" strokeWidth="1" fill="none" />
                  <circle cx="200" cy="200" r="3" fill="#ff2a2a" />
               </svg>

               <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-8">
                  <div className="flex flex-col gap-2 md:gap-4">
                     <StatDiamond 
                       label="Reflex" 
                       value={attributes.reflex} 
                       delay={0.1}
                       isFocused={focusedDiamond === 0}
                       onFocus={() => setFocusedDiamond(0)}
                       tabIndex={0}
                       onValueChange={(delta) => handleAttributeChange('reflex', delta)}
                     />
                     <StatDiamond 
                       label="Strength" 
                       value={attributes.strength} 
                       delay={0.2}
                       isFocused={focusedDiamond === 1}
                       onFocus={() => setFocusedDiamond(1)}
                       tabIndex={0}
                       onValueChange={(delta) => handleAttributeChange('strength', delta)}
                     />
                  </div>
                  <div className="flex flex-col gap-2 md:gap-4 mt-8 md:mt-16">
                     <StatDiamond 
                       label="Intel" 
                       value={attributes.intel} 
                       delay={0.3}
                       isFocused={focusedDiamond === 2}
                       onFocus={() => setFocusedDiamond(2)}
                       tabIndex={0}
                       onValueChange={(delta) => handleAttributeChange('intel', delta)}
                     />
                     <StatDiamond 
                       label="Tech" 
                       value={attributes.tech} 
                       delay={0.4}
                       isFocused={focusedDiamond === 3}
                       onFocus={() => setFocusedDiamond(3)}
                       tabIndex={0}
                       onValueChange={(delta) => handleAttributeChange('tech', delta)}
                     />
                  </div>
                  <div className="flex flex-col gap-2 md:gap-4">
                     <StatDiamond 
                       label="Const" 
                       value={attributes.const} 
                       delay={0.5}
                       isFocused={focusedDiamond === 4}
                       onFocus={() => setFocusedDiamond(4)}
                       tabIndex={0}
                       onValueChange={(delta) => handleAttributeChange('const', delta)}
                     />
                     <StatDiamond 
                       label="Cool" 
                       value={attributes.cool} 
                       delay={0.6}
                       isFocused={focusedDiamond === 5}
                       onFocus={() => setFocusedDiamond(5)}
                       tabIndex={0}
                       onValueChange={(delta) => handleAttributeChange('cool', delta)}
                     />
                  </div>
               </div>
            </div>

            {/* Description Box */}
            <div className="border-l-4 border-[#ff2a2a] bg-[#ff2a2a]/5 p-4 md:p-6 mt-6 md:mt-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-1" aria-hidden="true">
                 <div className="w-2 h-2 bg-[#ff2a2a]"></div>
               </div>
               <h3 className="text-[#ff2a2a] font-bold mb-2 tracking-wider text-sm md:text-base">STRENGTH</h3>
               <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                 How well you work with hardware. Unlocks technical ability interactions in environment. Increases jury rig possibilities.
               </p>
               <div className="mt-3 md:mt-4 flex gap-2 flex-wrap">
                 <span className="bg-[#ff2a2a] text-black text-[10px] md:text-xs font-bold px-2 py-1">LEVEL {attributes.strength}</span>
                 {attributes.strength >= 20 && <span className="border border-[#ff2a2a] text-[#ff2a2a] text-[10px] md:text-xs font-bold px-2 py-1">MAXED</span>}
               </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Statistics/Skills Tree */}
          <section className="lg:col-span-5 space-y-6 md:space-y-8" aria-labelledby="statistics-heading">
            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8 border-b border-[#333] pb-4">
              <Shield className="text-[#ff2a2a]" size={20} />
              <h2 id="statistics-heading" className="text-xl md:text-2xl font-bold tracking-[0.2em] text-[#ff2a2a] glow-text">STATISTICS</h2>
              <span className="text-[10px] md:text-xs text-gray-500 ml-auto">V.0.91</span>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-6">
               {/* Smaller Skill Diamonds */}
               <div className="col-span-2 md:col-span-1 flex flex-col items-center gap-4 md:gap-6">
                  <div className="w-full flex justify-end">
                     <StatDiamond 
                       label="Hand Guns" 
                       value={`${skills.handGuns.current}/${skills.handGuns.max}`} 
                       color="red" 
                       delay={0.7}
                       isFocused={focusedDiamond === 6}
                       onFocus={() => setFocusedDiamond(6)}
                       tabIndex={0}
                       onValueChange={(delta) => handleSkillChange('handGuns', delta)}
                     />
                  </div>
                  <div className="w-full flex justify-center">
                     <StatDiamond 
                       label="Rifles" 
                       value={`${skills.rifles.current}/${skills.rifles.max}`} 
                       color="red" 
                       delay={0.8}
                       isFocused={focusedDiamond === 7}
                       onFocus={() => setFocusedDiamond(7)}
                       tabIndex={0}
                       onValueChange={(delta) => handleSkillChange('rifles', delta)}
                     />
                  </div>
                  <div className="w-full flex justify-start">
                     <StatDiamond 
                       label="Blades" 
                       value={`${skills.blades.current}/${skills.blades.max}`} 
                       color="red" 
                       delay={0.9}
                       isFocused={focusedDiamond === 8}
                       onFocus={() => setFocusedDiamond(8)}
                       tabIndex={0}
                       onValueChange={(delta) => handleSkillChange('blades', delta)}
                     />
                  </div>
               </div>

               {/* Right Side Stats List */}
               <div className="space-y-3 md:space-y-4 font-mono text-xs md:text-sm pt-2 md:pt-4">
                 {stats.map((stat, idx) => (
                   <div 
                     key={idx} 
                     className="flex justify-between items-center border-b border-[#333] pb-1 hover:border-[#ff2a2a] transition-colors group cursor-crosshair" 
                     onMouseEnter={() => playSound('hover')}
                     tabIndex={0}
                     role="listitem"
                   >
                     <span className="text-gray-500 group-hover:text-white transition-colors">{stat.name}</span>
                     <span className="text-[#00f0ff] font-bold">{stat.val}</span>
                   </div>
                 ))}
               </div>
            </div>
          </section>
        </div>

      </main>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 w-full bg-[#050505] border-t border-[#333] p-2 flex justify-between items-center z-30 text-[8px] md:text-xs text-gray-500 font-mono">
         <div className="flex gap-2 md:gap-4">
           <span className="flex items-center gap-1 md:gap-2"><div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"/> ONLINE</span>
           <span className="hidden sm:inline">LAT: 35.021</span>
           <span className="hidden sm:inline">LON: 139.12</span>
         </div>
         <div className="flex gap-2 md:gap-4">
           <span>MEM: 64%</span>
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
