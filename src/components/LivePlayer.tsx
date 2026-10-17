import React from 'react';
import { useRadio } from '../context/RadioContext';
import bgVideo from '../assets/5102-182962908.mp4';
import broadcastGif from '../assets/images/ekkant-broadcast-8440_512.gif';
import {
  RadioTower,
  LogIn,
  Volume2,
  VolumeX,
  Radio,
  Music
} from 'lucide-react';

export const LivePlayer: React.FC = () => {
  const {
    setIsAuthModalOpen,
    setAuthDefaultTab,
    isPlayingLive,
    togglePlayLive,
    station,
    liveVolume,
    setLiveVolume,
  } = useRadio();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-slate-100 select-none px-4 sm:px-8 py-6 overflow-hidden bg-[#070b12]">
      {/* Background Video & Dark Overlay */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-25 scale-105 filter blur-[0.5px]"
          src={bgVideo}
        />
        <div className="absolute inset-0 bg-[#070b12]/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto">
      
      {/* 1. Header: Brand on Left & Discreet Login Button on Top Right */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <RadioTower className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-white">RÁDIO WEB PRO</span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {station.isOnAir ? 'AO VIVO NO AR' : 'STANDBY'}
            </span>
          </div>
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

      {/* 2. Center: GIF, Play Control, Track Info & Volume */}
      <main className="flex-1 flex flex-col items-center justify-start pt-32 sm:pt-56 text-center max-w-lg mx-auto w-full space-y-6">
        
        {/* Center GIF */}
        <div className="relative flex items-center justify-center">
          <img
            src={broadcastGif}
            alt="Transmissão Ao Vivo"
            className="relative w-64 h-64 sm:w-80 sm:h-80 object-contain"
          />
        </div>

        {/* Live Play / Pause Button */}
        <button
          onClick={togglePlayLive}
          className={`px-8 py-4 rounded-full font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2.5 shadow-2xl active:scale-95 ${
            isPlayingLive
              ? 'bg-rose-500 text-white hover:bg-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.5)] border border-rose-400/50'
              : 'bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-[0_0_35px_rgba(14,165,233,0.6)] animate-pulse'
          }`}
        >
          <Radio className="w-5 h-5" />
          <span>{isPlayingLive ? 'Pausar Áudio da Rádio' : 'Ligar Áudio / Ouvir Rádio'}</span>
        </button>

        {/* Track info card if on air */}
        {station.currentTrack?.title && (
          <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-2.5 max-w-sm text-left">
            <Music className="w-4 h-4 text-sky-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-white truncate block">{station.currentTrack.title}</span>
              <span className="text-[11px] text-slate-400 truncate block">{station.currentTrack.artist}</span>
            </div>
          </div>
        )}

        {/* Volume Control Slider */}
        <div className="w-full max-w-xs flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <button
            onClick={() => setLiveVolume(liveVolume === 0 ? 0.85 : 0)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {liveVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={liveVolume}
            onChange={(e) => setLiveVolume(parseFloat(e.target.value))}
            className="studio-fader w-full"
            title="Volume dos Ouvintes"
          />
          <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
            {Math.round((liveVolume / 1.5) * 100)}%
          </span>
        </div>

      </main>

      {/* 3. Footer: Subtle copyright */}
      <footer className="w-full text-center text-[11px] font-mono text-slate-600">
        RÁDIO WEB PRO · STREAMING AO VIVO
      </footer>

      </div>
    </div>
  );
};
