import React, { useState } from 'react';
import { useRadio } from '../context/RadioContext';
import { AudioWaveform } from './AudioWaveform';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RadioTower,
  LogIn
} from 'lucide-react';

export const LivePlayer: React.FC = () => {
  const {
    isPlayingLive,
    togglePlayLive,
    liveVolume,
    setLiveVolume,
    setIsAuthModalOpen,
    setAuthDefaultTab,
    station,
    listenersCount
  } = useRadio();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(liveVolume);

  const handleToggleMute = () => {
    if (isMuted) {
      setLiveVolume(prevVolume || 0.85);
      setIsMuted(false);
    } else {
      setPrevVolume(liveVolume);
      setLiveVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#070b12] text-slate-100 select-none px-4 sm:px-8 py-6">
      
      {/* 1. Header: Brand on Left & Discreet Login Button on Top Right */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <RadioTower className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">RÁDIO WEB PRO</span>
        </div>

        {/* Discreet Top Right Login Button */}
        <button
          onClick={() => {
            setAuthDefaultTab('login');
            setIsAuthModalOpen(true);
          }}
          className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-800 transition-all flex items-center gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Entrar / Login</span>
        </button>
      </header>

      {/* 2. Center: Ultra-Clean Player Screen */}
      <main className="flex-1 flex flex-col items-center justify-center text-center my-8 max-w-lg mx-auto w-full space-y-8">
        
        {/* Badge: ● AO VIVO */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-mono font-bold tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>AO VIVO</span>
        </div>

        {/* Center Big Play / Pause Button with Reactive Waves */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing Aura Rings */}
          <div
            className={`absolute -inset-6 rounded-full transition-all duration-700 ${
              isPlayingLive
                ? 'bg-sky-500/20 scale-110 blur-xl animate-pulse'
                : 'bg-transparent scale-90 opacity-0'
            }`}
          />

          <button
            onClick={togglePlayLive}
            className={`relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
              isPlayingLive
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_40px_rgba(244,63,94,0.6)]'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_40px_rgba(56,189,248,0.5)]'
            }`}
            aria-label={isPlayingLive ? 'Pausar Rádio' : 'Ouvir Rádio ao Vivo'}
          >
            {isPlayingLive ? (
              <Pause className="w-14 h-14 fill-current" />
            ) : (
              <Play className="w-14 h-14 fill-current ml-2" />
            )}
          </button>
        </div>

        {/* Real-time Spectrum Waveform */}
        <div className="w-full max-w-xs sm:max-w-sm">
          <AudioWaveform isActive={isPlayingLive} height={44} mode="bars" />
        </div>

        {/* Current Status Text */}
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            {isPlayingLive ? 'Transmitindo em Tempo Real' : 'Toque para Ouvir'}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {isPlayingLive ? `${listenersCount} ouvinte(s) conectado(s) · Baixa Latência` : 'Áudio direto do estúdio'}
          </p>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center justify-center gap-3 w-full max-w-xs pt-2">
          <button
            onClick={handleToggleMute}
            className="text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Desmutar' : 'Mutar'}
          >
            {isMuted || liveVolume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5 text-sky-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.01"
            value={liveVolume}
            onChange={(e) => {
              setLiveVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="studio-fader flex-1"
          />
        </div>
      </main>

      {/* 3. Footer: Subtle copyright */}
      <footer className="w-full text-center text-[11px] font-mono text-slate-600">
        RÁDIO WEB PRO · STREAMING AO VIVO
      </footer>

    </div>
  );
};
