import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [config, setConfig] = useState({
    UseOverlayEffect: false,
    DiscordUrl: 'https://discord.gg/PrismScripts',
    videourl: true,
    videofolder: false,
    musicurl: true,
    musicfolder: false,
    Backgrounds: [
      {
        file: 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/Fly.mp4',
        musicName: 'FLY',
        musicAuthor: 'FLYTUE',
        audioLink: 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/Matu-MEUCEMITRIO-30PRAUM(youtube).mp3',
      }
    ],
    Texts: {
      header_1: 'BEM-VINDO MRI QBOX',
      header_2: 'A Primeira temporada de QBOX chegou! Complete missões diárias e semanais para ganhar pontos e recompensas, façam amizades, descubra seu caminho e VOE AFINAL VOCÊ ESTÁ NA QBOX!',
      discord: 'Discord',
      online: 'Online',
      pleasewait: 'AGUARDE',
      gameloading: 'CARREGANDO A CIDADE...'
    },
    ThemeConfig: {
      primaryColor: '#5CE65C',
      primaryBase: '#5CE65C',
      Logo: { file: 'logo.png', width: 300, height: -1 }
    }
  });

  // Utilities to format CSS correctly
  const formatConfigColors = (cfg) => {
    const formatHex = (c) => {
      if (!c) return c;
      return c.startsWith('#') || c.startsWith('rgb') || c.startsWith('hsl') ? c : '#' + c;
    };
    const formatBase = (c) => {
      let hex = formatHex(c);
      return hex && hex.length === 9 && hex.startsWith('#') ? hex.substring(0, 7) : hex;
    };
    
    let newCfg = JSON.parse(JSON.stringify(cfg));
    if (newCfg.ThemeConfig) {
      if (newCfg.ThemeConfig.primaryColor) {
        newCfg.ThemeConfig.primaryBase = formatBase(newCfg.ThemeConfig.primaryColor);
        newCfg.ThemeConfig.primaryColor = formatHex(newCfg.ThemeConfig.primaryColor);
      } else {
        newCfg.ThemeConfig.primaryColor = '#d946ef';
        newCfg.ThemeConfig.primaryBase = '#d946ef';
      }
      if (newCfg.ThemeConfig.DiscordButton) {
        if (newCfg.ThemeConfig.DiscordButton.backgroundColor) {
           newCfg.ThemeConfig.DiscordButton.backgroundColor = formatHex(newCfg.ThemeConfig.DiscordButton.backgroundColor);
        }
        if (newCfg.ThemeConfig.DiscordButton.textColor) {
           newCfg.ThemeConfig.DiscordButton.textColor = formatHex(newCfg.ThemeConfig.DiscordButton.textColor);
        }
      }
    }
    return newCfg;
  };

  // Simulating loading progress if in browser, else use FiveM messages
  useEffect(() => {
    // Escuta mensagens do FiveM
    const handleMessage = (event) => {
      const data = event.data;
      if (data.eventName === 'loadProgress') {
        // Converte o progresso (ex: 0.1 a 1.0) para 0 a 100
        setProgress(Math.floor(data.loadFraction * 100));
      } else if (data.eventName === 'loadConfig') {
        setConfig(formatConfigColors(data.config));
      }
    };

    window.addEventListener('message', handleMessage);

    // Progresso falso e config mock/API local para fins de desenvolvimento apenas se não estiver rodando no FiveM
    let interval;
    if (!window.invokeNative) {
      // Tenta buscar a config pelo plugin do vite em dev
      fetch('/api/config')
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) {
            setConfig(prevConfig => formatConfigColors({ ...prevConfig, ...data }));
          }
        })
        .catch(err => console.log('Running without local config API'));

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Audio Control Handlers
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeChange = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    setVolume(percent);
  };

  return (
    <div className="bg-background-dark text-white font-body italic h-screen w-screen overflow-hidden relative selection:bg-primary selection:text-white">
      <div className="absolute inset-0 z-0">
        {(config.videourl || config.videofolder) && config.Backgrounds && config.Backgrounds[0] && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source 
              src={
                config.videourl 
                  ? config.Backgrounds[0].file
                  : (window.invokeNative ? `../config/video/${config.Backgrounds[0].file}` : `/config/video/${config.Backgrounds[0].file}`)
              } 
              type="video/mp4" 
            />
            Seu navegador não suporta vídeos.
          </video>
        )}
        
        {/* Audio Element */}
        {(config.musicurl || config.musicfolder) && config.Backgrounds && config.Backgrounds[0] && (
          <audio 
            ref={audioRef}
            autoPlay 
            loop
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
          >
             <source 
              src={
                config.musicurl 
                  ? config.Backgrounds[0].audioLink
                  : (window.invokeNative ? `../config/audio/${config.Backgrounds[0].audioLink}` : `/config/audio/${config.Backgrounds[0].audioLink}`)
              } 
              type="audio/mpeg" 
            />
          </audio>
        )}
        {config.UseOverlayEffect && (
          <div className="absolute inset-0 bg-black opacity-40"></div>
        )}
      </div>
      <div className="relative z-20 h-full flex flex-col justify-between p-8 md:p-12">
        <div className="flex justify-end items-start w-full">
          <div className="flex items-center gap-4">
            <div className="flex gap-2 relative">
              <button 
                onClick={togglePlay}
                className="w-8 h-8 rounded bg-primary hover:bg-primary/80 flex items-center justify-center transition-colors neon-box" 
                style={{ backgroundColor: config.ThemeConfig.primaryColor, boxShadow: `0 0 15px ${config.ThemeConfig.primaryBase}66` }}
              >
                <span className="material-icons text-sm">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowVolume(!showVolume)}
                  className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <span className="material-icons text-sm">{volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}</span>
                </button>
                
                {showVolume && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 flex flex-col items-center gap-2">
                    <div 
                      className="w-24 h-2 bg-gray-700 rounded-full cursor-pointer relative"
                      onClick={handleVolumeChange}
                    >
                      <div 
                        className="absolute left-0 top-0 h-full rounded-full shadow-lg pointer-events-none" 
                        style={{ width: `${volume * 100}%`, backgroundColor: config.ThemeConfig.primaryColor }}
                      ></div>
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md pointer-events-none" 
                        style={{ left: `calc(${volume * 100}% - 6px)`, backgroundColor: '#fff' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-md">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center" style={{ backgroundColor: config.ThemeConfig.primaryColor }}>
                <span className="material-icons text-white text-sm">music_note</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white tracking-wide">{config.Backgrounds && config.Backgrounds[0] ? config.Backgrounds[0].musicName : 'Música'}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{config.Backgrounds && config.Backgrounds[0] ? config.Backgrounds[0].musicAuthor : 'Artista'}</span>
              </div>
              <div 
                className="w-24 h-1.5 bg-gray-700/50 rounded-full ml-2 relative cursor-pointer group"
                onClick={handleSeek}
              >
                <div 
                  className="absolute left-0 top-0 h-full rounded-full shadow-lg transition-all" 
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, backgroundColor: config.ThemeConfig.primaryColor, boxShadow: `0 0 10px ${config.ThemeConfig.primaryColor}` }}
                ></div>
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" 
                  style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 4px)`, backgroundColor: '#fff' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start w-full flex-grow relative">
          <div className="w-full md:w-1/3 z-30 pt-4 md:pt-0">
            <div className="mb-2 w-full flex justify-start">
                {config.ThemeConfig.Logo && config.ThemeConfig.Logo.file && (
                  <img 
                    src={window.invokeNative ? `../config/logo/${config.ThemeConfig.Logo.file}` : `/config/logo/${config.ThemeConfig.Logo.file}`} 
                    alt="" 
                    className="object-contain"
                    style={{ 
                      width: config.ThemeConfig.Logo.width > 0 ? `${config.ThemeConfig.Logo.width}px` : 'auto', 
                      height: config.ThemeConfig.Logo.height > 0 ? `${config.ThemeConfig.Logo.height}px` : 'auto',
                      maxHeight: '150px'
                    }} 
                  />
                )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-wide leading-none mb-6 text-white drop-shadow-lg" dangerouslySetInnerHTML={{ __html: config.Texts.header_1 }}>
            </h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md mb-8 font-light border-l-2 border-primary pl-4 bg-gradient-to-r from-primary/10 to-transparent py-2" style={{ borderColor: config.ThemeConfig.primaryColor, backgroundImage: `linear-gradient(to right, ${config.ThemeConfig.primaryBase}1a, transparent)` }}>
              {config.Texts.header_2}
            </p>
            <div className="flex items-center gap-4">
              <a href={config.DiscordUrl} target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all hover:scale-105 flex items-center gap-2" style={{ backgroundColor: config.ThemeConfig.DiscordButton?.backgroundColor || config.ThemeConfig.primaryColor, color: config.ThemeConfig.DiscordButton?.textColor || '#ffffff', boxShadow: `0 0 15px ${config.ThemeConfig.primaryBase}80` }}>
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.025-.32 13.559.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.068 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"></path></svg>
                {config.Texts.discord}
              </a>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/50 border border-white/10 rounded">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" style={{ backgroundColor: config.ThemeConfig.primaryColor }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" style={{ backgroundColor: config.ThemeConfig.primaryColor }}></span>
                </span>
                <span className="text-sm font-semibold tracking-wide">{config.Texts.online}</span>
              </div>
            </div>
          </div>
          {/* Center Graphic Container (Removed hardcoded FLY elements) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30 md:opacity-100">
            {/* If you want to place something in the center, it goes here */}
          </div>
        </div>
        <div className="w-full relative z-30 mt-auto">
          <div className="flex justify-between items-end mb-2 relative">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-white tracking-widest text-sm uppercase">{config.Texts.pleasewait}</span>
                <span className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" style={{ borderColor: `${config.ThemeConfig.primaryColor}`, borderTopColor: 'transparent' }}></span>
              </div>
              <div className="text-xs text-gray-400 font-mono">{config.Texts.gameloading}</div>
            </div>
            {/* Percentage text above the right side of the bar */}
            <div className="absolute right-2 bottom-0 font-mono font-bold text-xl leading-none translate-y-[6px]" style={{ color: config.ThemeConfig.primaryColor }}>
              {progress}%
            </div>
          </div>
          <div className="flex justify-between items-center mb-2 text-xs text-gray-500 font-mono">
            <div className="flex items-center gap-2">
            </div>
          </div>
          <div className="h-4 w-full bg-gray-900 rounded-full overflow-hidden border border-white/10 relative shadow-inner">
            <div className="h-full relative transition-all duration-300 ease-out" style={{ width: `${progress}%`, backgroundColor: config.ThemeConfig.primaryColor, backgroundImage: `linear-gradient(90deg, #ffffff33, ${config.ThemeConfig.primaryColor}, #00000033)`, boxShadow: `0 0 15px ${config.ThemeConfig.primaryBase}cc` }}>
              <div className="absolute inset-0 shimmer"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
