import React, { useState, useEffect } from 'react';
import { useRadio } from '../context/RadioContext';
import { globalAudioEngine } from '../utils/audioEngine';
import { VUMeter } from './VUMeter';
import { AudioWaveform } from './AudioWaveform';
import {
  Mic,
  MicOff,
  Radio,
  Sliders,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  Users,
  Activity,
  Layers,
  Music,
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  RadioTower,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Square,
  X
} from 'lucide-react';
import { RadioTrack } from '../types';

export const BroadcasterStudio: React.FC = () => {
  const {
    user,
    station,
    updateStationStatus,
    tracks,
    addCustomTrack,
    currentAutomationTrack,
    playTrackAutomation,
    crossfadeToNextTrack,
    stopTrackAutomation,
    isAutomationPlaying,
    soundboard,
    triggerSoundboard,
    listenersCount,
    chatMessages,
    updateRequestStatus,
    setIsAuthModalOpen,
    isNewPodcastModalOpen,
    setIsNewPodcastModalOpen,
    addPodcast,
    startLiveBroadcastAudio,
    stopLiveBroadcastAudio,
  } = useRadio();

  // Studio State
  const [isMicLive, setIsMicLive] = useState(false);
  const [micGainVal, setMicGainVal] = useState(1.0);
  const [musicGainVal, setMusicGainVal] = useState(0.85);
  const [sfxGainVal, setSfxGainVal] = useState(0.9);
  const [masterGainVal, setMasterGainVal] = useState(0.95);
  const [autoDucking, setAutoDucking] = useState(true);
  const [crossfadeSec, setCrossfadeSec] = useState(4);
  const [activeStudioTab, setActiveStudioTab] = useState<'mixer' | 'playlist' | 'soundboard' | 'requests'>('mixer');

  // Real-time VU Levels from AudioEngine
  const [vuLevels, setVuLevels] = useState({
    micPeak: 0,
    micRms: 0,
    musicPeak: 0,
    musicRms: 0,
    masterPeak: 0,
    masterRms: 0,
  });

  // Station Metadata quick edit modal
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editShow, setEditShow] = useState(station.currentShow);
  const [editBroadcaster, setEditBroadcaster] = useState(station.broadcaster);

  // Podcast Creator form state
  const [formPodShow, setFormPodShow] = useState('Conexão Tech');
  const [formPodTitle, setFormPodTitle] = useState('');
  const [formPodDesc, setFormPodDesc] = useState('');
  const [formPodCategory, setFormPodCategory] = useState<any>('Tecnologia');
  const [formPodDuration, setFormPodDuration] = useState('35:00');
  const [formPodCover, setFormPodCover] = useState('/src/assets/images/podcast_conexao_1792189176735.jpg');

  // Broadcast timer
  const [broadcastSeconds, setBroadcastSeconds] = useState(3600);

  // Connect AudioEngine VU loop callback
  useEffect(() => {
    globalAudioEngine.onVuUpdate = (levels) => {
      setVuLevels(levels);
    };

    return () => {
      globalAudioEngine.onVuUpdate = undefined;
    };
  }, []);

  // Broadcast clock
  useEffect(() => {
    const timer = setInterval(() => {
      setBroadcastSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Microphone toggle handler
  const handleToggleMic = async () => {
    if (isMicLive) {
      globalAudioEngine.disableMicrophone();
      setIsMicLive(false);
    } else {
      const success = await globalAudioEngine.enableMicrophone();
      if (success) {
        setIsMicLive(true);
        startLiveBroadcastAudio();
      }
    }
  };

  // Sliders handlers
  const handleMicGainChange = (val: number) => {
    setMicGainVal(val);
    globalAudioEngine.setMicGain(val);
  };

  const handleMusicGainChange = (val: number) => {
    setMusicGainVal(val);
    globalAudioEngine.setMusicGain(val);
  };

  const handleSfxGainChange = (val: number) => {
    setSfxGainVal(val);
    globalAudioEngine.setSfxGain(val);
  };

  const handleMasterGainChange = (val: number) => {
    setMasterGainVal(val);
    globalAudioEngine.setMasterGain(val);
  };

  const handleToggleAutoDucking = () => {
    const nextVal = !autoDucking;
    setAutoDucking(nextVal);
    globalAudioEngine.setAutoDucking(nextVal);
  };

  // File upload for custom tracks
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newTrack: RadioTrack = {
      id: 'custom_' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Upload Local',
      album: 'Arquivo do Radialista',
      duration: 180,
      genre: 'Personalizado',
      bpm: 120,
      customFile: true,
    };

    addCustomTrack(newTrack);
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    updateStationStatus({
      currentShow: editShow,
      broadcaster: editBroadcaster,
    });
    setIsEditingMetadata(false);
  };

  const handleCreatePodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPodTitle.trim()) return;

    const parts = formPodDuration.split(':');
    let durSec = 1800;
    if (parts.length === 2) {
      durSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    await addPodcast({
      podcastTitle: formPodShow,
      title: formPodTitle.trim(),
      description: formPodDesc,
      host: user?.name || station.broadcaster,
      category: formPodCategory,
      coverUrl: formPodCover,
      duration: formPodDuration,
      durationSeconds: durSec,
    });

    setFormPodTitle('');
    setFormPodDesc('');
    setIsNewPodcastModalOpen(false);
  };

  // Song requests from listeners
  const songRequests = chatMessages.filter((m) => m.type === 'song_request');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Studio Header Bar: Glowing ON AIR banner, timer, and master transmission status */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Illuminated ON AIR sign */}
        <div className="flex items-center gap-4">
          <div
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 font-mono font-extrabold text-sm tracking-widest transition-all ${
              station.isOnAir
                ? 'bg-rose-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.8)] border border-rose-400 animate-pulse'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${station.isOnAir ? 'bg-white' : 'bg-slate-600'}`} />
            <span>{station.isOnAir ? 'ON AIR · TRANSMITINDO' : 'OFF AIR · FORA DO AR'}</span>
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-semibold text-white">{station.currentShow}</span>
            <span className="text-[11px] text-slate-400">Radialista: {station.broadcaster}</span>
          </div>
        </div>

        {/* Center: Live Broadcast Stats */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">TEMPO NO AR</span>
            <span className="text-sm font-bold text-sky-400 tabular-nums">{formatTimer(broadcastSeconds)}</span>
          </div>
          <div className="h-7 w-[1px] bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">OUVINTES SIMULTÂNEOS</span>
            <span className="text-sm font-bold text-emerald-400 tabular-nums flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {listenersCount}
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">ESTABILIDADE</span>
            <span className="text-sm font-bold text-emerald-400">{station.streamHealth}</span>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewPodcastModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Novo Podcast</span>
          </button>

          <button
            onClick={() => setIsEditingMetadata(!isEditingMetadata)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Editar Programa</span>
          </button>

          <button
            onClick={() => {
              const nextOnAir = !station.isOnAir;
              updateStationStatus({ isOnAir: nextOnAir });
              if (nextOnAir) {
                startLiveBroadcastAudio();
              } else {
                stopLiveBroadcastAudio();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              station.isOnAir
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
            }`}
          >
            {station.isOnAir ? 'Pausar Transmissão' : 'Iniciar No Ar'}
          </button>
        </div>
      </div>

      {/* Metadata Edit Drawer */}
      {isEditingMetadata && (
        <form onSubmit={handleSaveMetadata} className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Programa</label>
            <input
              type="text"
              value={editShow}
              onChange={(e) => setEditShow(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Radialista</label>
            <input
              type="text"
              value={editBroadcaster}
              onChange={(e) => setEditBroadcaster(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => setIsEditingMetadata(false)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Mobile Switcher Tabs (< lg screens) */}
      <div className="flex lg:hidden rounded-xl bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => setActiveStudioTab('mixer')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeStudioTab === 'mixer' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          Mesa de Som
        </button>
        <button
          onClick={() => setActiveStudioTab('playlist')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeStudioTab === 'playlist' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          Músicas ({tracks.length})
        </button>
        <button
          onClick={() => setActiveStudioTab('soundboard')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeStudioTab === 'soundboard' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          Vinhetas FX
        </button>
        <button
          onClick={() => setActiveStudioTab('requests')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeStudioTab === 'requests' ? 'bg-sky-500 text-slate-950' : 'text-slate-400'
          }`}
        >
          Pedidos ({songRequests.length})
        </button>
      </div>

      {/* Main Studio Grid: Virtual Console & Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Module 1: Virtual Mixer Strips (4 Channels: Mic, Music, SFX, Master Bus) */}
        <div className={`lg:col-span-6 rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-6 shadow-xl ${
          activeStudioTab !== 'mixer' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white tracking-wide">Mesa de Som Virtual</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleAutoDucking}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  autoDucking
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
                title="Abaixa o volume da música automaticamente quando você fala no microfone"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auto-Ducking: {autoDucking ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* 4-Channel Strips Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Channel 1: MICROPHONE */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 flex flex-col items-center justify-between gap-4">
              <div className="text-center w-full">
                <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider">CH 1 · MIC</span>
              </div>

              {/* Big Mic Button */}
              <button
                onClick={handleToggleMic}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                  isMicLive
                    ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.7)] border-2 border-rose-300 animate-pulse'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}
                title={isMicLive ? 'Desativar Microfone' : 'Ativar Microfone ao Vivo'}
              >
                {isMicLive ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
              </button>

              <span className={`text-[10px] font-mono font-bold ${isMicLive ? 'text-rose-400' : 'text-slate-500'}`}>
                {isMicLive ? 'MIC AO VIVO' : 'MIC MUDO'}
              </span>

              {/* VU Meter */}
              <div className="w-full">
                <VUMeter
                  level={isMicLive ? Math.max(0.02, vuLevels.micRms) : 0}
                  peak={isMicLive ? vuLevels.micPeak : 0}
                  channels="single"
                  compact
                />
              </div>

              {/* Gain Fader */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>GANHO</span>
                  <span className="text-sky-400">{Math.round((micGainVal / 2.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.05"
                  value={micGainVal}
                  onChange={(e) => handleMicGainChange(parseFloat(e.target.value))}
                  className="studio-fader w-full"
                />
              </div>
            </div>

            {/* Channel 2: MUSIC AUTOMATION */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 flex flex-col items-center justify-between gap-4">
              <div className="text-center w-full">
                <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider">CH 2 · MÚSICA</span>
              </div>

              {/* Music Toggle */}
              <button
                onClick={() => {
                  if (isAutomationPlaying) {
                    stopTrackAutomation();
                  } else if (tracks.length > 0) {
                    playTrackAutomation(currentAutomationTrack || tracks[0]);
                  }
                }}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                  isAutomationPlaying
                    ? 'bg-sky-500 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)] border-2 border-sky-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isAutomationPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current ml-1" />}
              </button>

              <span className={`text-[10px] font-mono font-bold ${isAutomationPlaying ? 'text-sky-400' : 'text-slate-500'}`}>
                {isAutomationPlaying ? 'TOCANDO' : 'PARADO'}
              </span>

              {/* VU Meter */}
              <div className="w-full">
                <VUMeter
                  level={isAutomationPlaying ? vuLevels.musicRms : 0}
                  peak={isAutomationPlaying ? vuLevels.musicPeak : 0}
                  channels="single"
                  compact
                />
              </div>

              {/* Music Fader */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>VOLUME</span>
                  <span className="text-sky-400">{Math.round((musicGainVal / 1.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={musicGainVal}
                  onChange={(e) => handleMusicGainChange(parseFloat(e.target.value))}
                  className="studio-fader w-full"
                />
              </div>
            </div>

            {/* Channel 3: SOUNDBOARD FX */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 flex flex-col items-center justify-between gap-4">
              <div className="text-center w-full">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">CH 3 · FX/VINHETAS</span>
              </div>

              {/* SFX Quick Trigger */}
              <button
                onClick={() => triggerSoundboard('vinheta_pro')}
                className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500/60 text-amber-400 hover:bg-amber-500 hover:text-slate-950 flex items-center justify-center transition-all active:scale-95"
                title="Disparar Vinheta Rápida"
              >
                <Sparkles className="w-7 h-7" />
              </button>

              <span className="text-[10px] font-mono font-bold text-amber-400">
                DISPARO RÁPIDO
              </span>

              {/* VU Meter SFX simulation */}
              <div className="w-full">
                <VUMeter level={0.05} peak={0.05} channels="single" compact />
              </div>

              {/* SFX Fader */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>VOLUME</span>
                  <span className="text-amber-400">{Math.round((sfxGainVal / 1.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={sfxGainVal}
                  onChange={(e) => handleSfxGainChange(parseFloat(e.target.value))}
                  className="studio-fader w-full"
                />
              </div>
            </div>

            {/* Channel 4: MASTER BUS */}
            <div className="rounded-xl bg-slate-950/80 border border-sky-500/30 p-3.5 flex flex-col items-center justify-between gap-4">
              <div className="text-center w-full">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">CH 4 · MASTER</span>
              </div>

              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 text-emerald-400 flex items-center justify-center">
                <Activity className="w-7 h-7" />
              </div>

              <span className="text-[10px] font-mono font-bold text-emerald-400">
                SAÍDA NO AR
              </span>

              {/* Master VU Meter */}
              <div className="w-full">
                <VUMeter
                  level={station.isOnAir ? vuLevels.masterRms : 0}
                  peak={station.isOnAir ? vuLevels.masterPeak : 0}
                  channels="single"
                  compact
                />
              </div>

              {/* Master Fader */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>MASTER</span>
                  <span className="text-emerald-400">{Math.round((masterGainVal / 1.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={masterGainVal}
                  onChange={(e) => handleMasterGainChange(parseFloat(e.target.value))}
                  className="studio-fader w-full"
                />
              </div>
            </div>

          </div>

          {/* Master Output Waveform */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-slate-400">ESPECTRO DE ÁUDIO TRANSMITIDO</span>
            <AudioWaveform isActive={station.isOnAir && (isMicLive || isAutomationPlaying)} height={60} mode="wave" />
          </div>
        </div>

        {/* Module 2: Deck de Vinhetas e Efeitos (Soundboard) */}
        <div className={`lg:col-span-6 rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-5 shadow-xl ${
          activeStudioTab !== 'soundboard' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-wide">Deck de Vinhetas & Efeitos</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">8 Pads Instantâneos</span>
          </div>

          {/* 8 Soundboard Trigger Pads */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {soundboard.map((fx, idx) => (
              <button
                key={fx.id}
                onClick={() => triggerSoundboard(fx.id)}
                className="group relative p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-800/60 transition-all flex flex-col items-center justify-between min-h-[96px] text-center active:scale-95 shadow-md"
              >
                <div className="flex justify-between w-full text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                  <span className="w-5 h-5 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <span className="uppercase">{fx.category}</span>
                </div>

                <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2">
                  {fx.shortLabel}
                </span>

                <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-sky-400 transition-colors" />
              </button>
            ))}
          </div>

          {/* Automation & Crossfade Deck Controls */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                Crossfade entre Faixas
              </span>
              <span className="text-xs font-mono text-sky-400 font-bold">{crossfadeSec} segundos</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-slate-500">0s</span>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={crossfadeSec}
                onChange={(e) => setCrossfadeSec(parseInt(e.target.value))}
                className="studio-fader flex-1"
              />
              <span className="text-[10px] font-mono text-slate-500">12s</span>

              <button
                onClick={crossfadeToNextTrack}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/40 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Transição Suave</span>
              </button>
            </div>
          </div>
        </div>

        {/* Module 3: Automation Playlist Deck */}
        <div className={`lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl ${
          activeStudioTab !== 'playlist' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white tracking-wide">Automação de Músicas & Cue List</h2>
            </div>

            <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5 text-sky-400" />
              <span>Carregar MP3</span>
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Currently Playing Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <Music className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">TOCANDO NO AR</span>
                <h4 className="text-sm font-bold text-white">{currentAutomationTrack?.title || station.currentTrack.title}</h4>
                <p className="text-xs text-slate-400">{currentAutomationTrack?.artist || station.currentTrack.artist}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isAutomationPlaying) {
                    stopTrackAutomation();
                  } else {
                    playTrackAutomation(currentAutomationTrack || tracks[0]);
                  }
                }}
                className="p-2.5 rounded-lg bg-sky-500 text-slate-950 hover:bg-sky-400 transition-colors"
              >
                {isAutomationPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
              <button
                onClick={crossfadeToNextTrack}
                title="Pular com Crossfade"
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Track List */}
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {tracks.map((track, i) => {
              const isCurrent = currentAutomationTrack?.id === track.id || (!currentAutomationTrack && i === 0);
              return (
                <div
                  key={track.id}
                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-sky-950/40 border-sky-500/50 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-4">{i + 1}</span>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-semibold text-slate-100">{track.title}</span>
                      <span className="text-[11px] text-slate-400">{track.artist} · {track.genre}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 mr-2">
                      {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => playTrackAutomation(track)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isCurrent && isAutomationPlaying
                          ? 'bg-sky-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300'
                      }`}
                    >
                      {isCurrent && isAutomationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 4: Pedidos Musicais dos Ouvintes (Queue) */}
        <div className={`lg:col-span-5 rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl ${
          activeStudioTab !== 'requests' ? 'hidden lg:block' : 'block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-wide">Fila de Pedidos dos Ouvintes</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              {songRequests.length} pedidos
            </span>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {songRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Nenhum pedido de música recebido ainda. Os ouvintes podem pedir pelo chat da rádio!
              </div>
            ) : (
              songRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-300">{req.senderName}</span>
                    <span className="text-[10px] font-mono text-slate-500">{req.timestamp}</span>
                  </div>

                  {req.songDetails && (
                    <div className="font-mono text-white font-bold bg-amber-500/10 p-2 rounded border border-amber-500/20">
                      🎵 {req.songDetails.songTitle} - {req.songDetails.artist}
                    </div>
                  )}

                  {req.text && <p className="text-slate-400 italic">"{req.text}"</p>}

                  <div className="flex items-center justify-between pt-1">
                    <span className={`text-[10px] font-mono ${req.status === 'played' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {req.status === 'played' ? '✓ Atendido' : '⏳ Aguardando'}
                    </span>

                    <button
                      onClick={() => updateRequestStatus(req.id, req.status === 'played' ? 'pending' : 'played')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                        req.status === 'played'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400'
                      }`}
                    >
                      {req.status === 'played' ? 'Marcar Pendente' : 'Marcar Atendido'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Admin Modal: Create / Upload New Podcast */}
      {isNewPodcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewPodcastModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" />
              <span>Publicar Novo Episódio de Podcast</span>
            </h2>

            <form onSubmit={handleCreatePodcast} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Programa / Podcast</label>
                <input
                  type="text"
                  required
                  value={formPodShow}
                  onChange={(e) => setFormPodShow(e.target.value)}
                  placeholder="Ex: Conexão Tech"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Episódio</label>
                <input
                  type="text"
                  required
                  value={formPodTitle}
                  onChange={(e) => setFormPodTitle(e.target.value)}
                  placeholder="Ex: IA e o Futuro das Profissões em 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={formPodCategory}
                    onChange={(e) => setFormPodCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Música & Cultura">Música & Cultura</option>
                    <option value="Jornalismo">Jornalismo</option>
                    <option value="Empreendedorismo">Empreendedorismo</option>
                    <option value="Entretenimento">Entretenimento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duração estimada</label>
                  <input
                    type="text"
                    required
                    value={formPodDuration}
                    onChange={(e) => setFormPodDuration(e.target.value)}
                    placeholder="35:00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Capa do Episódio</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { label: 'Tech Cyan', url: '/src/assets/images/podcast_conexao_1792189176735.jpg' },
                    { label: 'Vinil Beats', url: '/src/assets/images/podcast_cultura_1792189189304.jpg' },
                    { label: 'Notícias Mic', url: '/src/assets/images/podcast_noticias_1792189200864.jpg' },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => setFormPodCover(preset.url)}
                      className={`p-1 rounded-lg border text-left overflow-hidden ${
                        formPodCover === preset.url ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full aspect-square object-cover rounded mb-1" />
                      <span className="text-[10px] text-slate-300 block truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Episódio</label>
                <textarea
                  rows={3}
                  required
                  value={formPodDesc}
                  onChange={(e) => setFormPodDesc(e.target.value)}
                  placeholder="Resumo dos tópicos discutidos..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-md active:scale-95"
              >
                Publicar Episódio
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
