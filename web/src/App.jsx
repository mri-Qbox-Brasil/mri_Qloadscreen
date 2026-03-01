import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [showVolume, setShowVolume] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [config, setConfig] = useState({
    UseOverlayEffect: false,
    DiscordUrl: '',
    videourl: true,
    videofolder: false,
    musicurl: true,
    musicfolder: false,
    Backgrounds: [
      {
        file: '',
        musicName: 'MRI',
        musicAuthor: 'MRI',
        audioLink: '',
      }
    ],
    Texts: {
      header_1: 'BEM-VINDO MRI QBOX',
      header_2: 'MRI',
      discord: 'Discord',
      online: 'Online',
      pleasewait: 'AGUARDE',
      gameloading: 'CARREGANDO A CIDADE...'
    },
    ThemeConfig: {
      primaryColor: '#5CE65C',
      primaryBase: '#5CE65C',
      Logo: { file: 'logo.png', width: 80, height: -1 }
    }
  });

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
    // 1. Inicia lendo as configurações
    const initializeConfig = async () => {
      try {
        // Tenta ler os dados injetados via deferrals.handover() pelo server.lua (Método Otimizado do FiveM)
        if (window.nuiHandoverData && window.nuiHandoverData.config) {
          console.log("[mri_Qloadscreen] Configuração lida via nuiHandoverData nativo!");
          const configData = window.nuiHandoverData.config;
          setConfig(formatConfigColors(configData));
          return;
        }

        // Se estiver local, faremos o fetch estático de emergência
        console.log("[mri_Qloadscreen] Tentando fallback do config.lua via fetch...");
        const url = window.invokeNative 
            ? `https://${window.GetParentResourceName ? window.GetParentResourceName() : 'mri_Qloadscreen'}/config/config.lua`
            : '/config/config.lua';
            
        const response = await fetch(url);
        if (!response.ok) return;

        let luaContent = await response.text();
        luaContent = luaContent.split('\n').map(line => {
          const commentIdx = line.indexOf('--');
          return commentIdx >= 0 ? line.substring(0, commentIdx) : line;
        }).join('\n');

        let newCfg = {
          UseOverlayEffect: false, videourl: false, videofolder: true, musicurl: false, musicfolder: false, DiscordUrl: '',
          Backgrounds: [],
          Texts: { header_1: '', header_2: '', discord: '', online: '', pleasewait: '', gameloading: '' },
          ThemeConfig: { primaryColor: '', DiscordButton: { backgroundColor: '', textColor: '' }, Logo: { file: 'logo.png', width: 300, height: -1 } }
        };

        const themeMatch = luaContent.match(/Config\.ThemeConfig\s*=\s*{([\s\S]*?)}/);
        if (themeMatch) {
           const primaryMatch = themeMatch[1].match(/primaryColor\s*=\s*(["'])(.*?)\1/);
           if (primaryMatch) newCfg.ThemeConfig.primaryColor = primaryMatch[2];
           
           const bgMatch = themeMatch[1].match(/backgroundColor\s*=\s*(["'])(.*?)\1/);
           if (bgMatch) newCfg.ThemeConfig.DiscordButton.backgroundColor = bgMatch[2];

           const tcMatch = themeMatch[1].match(/textColor\s*=\s*(["'])(.*?)\1/);
           if (tcMatch) newCfg.ThemeConfig.DiscordButton.textColor = tcMatch[2];

           const logoThemeMatch = luaContent.match(/Logo\s*=\s*{([\s\S]*?)}/);
           if (logoThemeMatch) {
              const fileMatch = logoThemeMatch[1].match(/file\s*=\s*(["'])(.*?)\1/);
              if (fileMatch) newCfg.ThemeConfig.Logo.file = fileMatch[2];
              
              const widthMatch = logoThemeMatch[1].match(/width\s*=\s*(-?\d+)/);
              if (widthMatch) newCfg.ThemeConfig.Logo.width = parseInt(widthMatch[1]);
              
              const heightMatch = logoThemeMatch[1].match(/height\s*=\s*(-?\d+)/);
              if (heightMatch) newCfg.ThemeConfig.Logo.height = parseInt(heightMatch[1]);
           }
        }

        const textMatch = luaContent.match(/Config\.Texts\s*=\s*{([\s\S]*?)}/);
        if (textMatch) {
           const h1Match = textMatch[1].match(/header_1\s*=\s*(["'])(.*?)\1/);
           if (h1Match) newCfg.Texts.header_1 = h1Match[2];
           const h2Match = textMatch[1].match(/header_2\s*=\s*(["'])(.*?)\1/);
           if (h2Match) newCfg.Texts.header_2 = h2Match[2];
           const discordTextMatch = textMatch[1].match(/discord\s*=\s*(["'])(.*?)\1/);
           if (discordTextMatch) newCfg.Texts.discord = discordTextMatch[2];
           const onlineMatch = textMatch[1].match(/online\s*=\s*(["'])(.*?)\1/);
           if (onlineMatch) newCfg.Texts.online = onlineMatch[2];
           const waitMatch = textMatch[1].match(/pleasewait\s*=\s*(["'])(.*?)\1/);
           if (waitMatch) newCfg.Texts.pleasewait = waitMatch[2];
           const loadingMatch = textMatch[1].match(/gameloading\s*=\s*(["'])(.*?)\1/);
           if (loadingMatch) newCfg.Texts.gameloading = loadingMatch[2];
        }

        const discordUrlMatch = luaContent.match(/Config\.DiscordUrl\s*=\s*(["'])(.*?)\1/);
        if (discordUrlMatch) newCfg.DiscordUrl = discordUrlMatch[2];

        const overlayMatch = luaContent.match(/Config\.UseOverlayEffect\s*=\s*(true|false)/);
        if (overlayMatch) newCfg.UseOverlayEffect = overlayMatch[1] === 'true';

        const videoUrlMatch = luaContent.match(/Config\.videourl\s*=\s*(true|false)/);
        if (videoUrlMatch) newCfg.videourl = videoUrlMatch[1] === 'true';

        const videoFolderMatch = luaContent.match(/Config\.videofolder\s*=\s*(true|false)/);
        if (videoFolderMatch) newCfg.videofolder = videoFolderMatch[1] === 'true';

        const musicUrlMatch = luaContent.match(/Config\.musicurl\s*=\s*(true|false)/);
        if (musicUrlMatch) newCfg.musicurl = musicUrlMatch[1] === 'true';

        const musicFolderMatch = luaContent.match(/Config\.musicfolder\s*=\s*(true|false)/);
        if (musicFolderMatch) newCfg.musicfolder = musicFolderMatch[1] === 'true';

        const bgArrayMatch = luaContent.match(/Config\.Backgrounds\s*=\s*{([\s\S]*?)}\s*(\n\n|$|Config)/);
        if (bgArrayMatch) {
           const bgContent = bgArrayMatch[1];
           const blocks = [...bgContent.matchAll(/{([^}]*)}/g)];
           
           blocks.forEach(blockMatch => {
             const block = blockMatch[1];
             const bgItem = { file: '', musicName: '', musicAuthor: '', audioLink: '' };
             
             const fileMatch = block.match(/file\s*=\s*(["'])(.*?)\1/);
             if (fileMatch) bgItem.file = fileMatch[2];
             
             const audioLinkMatch = block.match(/audioLink\s*=\s*(["'])(.*?)\1/);
             if (audioLinkMatch) bgItem.audioLink = audioLinkMatch[2];

             const musicNameMatch = block.match(/musicName\s*=\s*(["'])(.*?)\1/);
             if (musicNameMatch) bgItem.musicName = musicNameMatch[2];

             const musicAuthorMatch = block.match(/musicAuthor\s*=\s*(["'])(.*?)\1/);
             if (musicAuthorMatch) bgItem.musicAuthor = musicAuthorMatch[2];
             
             newCfg.Backgrounds.push(bgItem);
           });
        }
        if (newCfg.Backgrounds.length === 0) newCfg.Backgrounds = [{ file: '', musicName: '', musicAuthor: '', audioLink: '' }];

        setConfig(formatConfigColors(newCfg));
      } catch (e) {
        console.error('Erro detalhado efetuando parse local da config.lua:', e);
      }
    };
    
    initializeConfig();

    // 2. Handle standard loadProgress
    const handleMessage = (event) => {
      const data = event.data;
      if (data.eventName === 'loadProgress') {
        const loadProgress = Math.floor(data.loadFraction * 100);
        // loadProgress alone sometimes loops from 0-100 multiple times during different phases
        setProgress((prev) => {
           // We only want the progress bar to go UP, never backwards
           return loadProgress > prev ? loadProgress : prev;
        });
      }
    };

    window.addEventListener('message', handleMessage);

    let interval;
    if (!window.invokeNative) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 100);
    } else {
      // Running inside FiveM: notify Lua that UI is ready
      if (window.GetParentResourceName) {
         fetch(`https://${window.GetParentResourceName()}/uiLoaded`, {
            method: 'POST',
            body: JSON.stringify({})
         }).catch(e => console.log('uiLoaded callback error:', e));
      }
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, []);

  // Update CSS Variables when config changes
  useEffect(() => {
    if (config.ThemeConfig) {
      const root = document.documentElement;
      if (config.ThemeConfig.primaryColor) {
        root.style.setProperty('--color-primary', config.ThemeConfig.primaryColor);
        // Sometimes Tailwind uses space-separated RGB, but here we'll assume we directly map it unless there's a specific Tailwind config
      }
      if (config.ThemeConfig.DiscordButton) {
        if (config.ThemeConfig.DiscordButton.backgroundColor) {
          root.style.setProperty('--color-discord-bg', config.ThemeConfig.DiscordButton.backgroundColor);
        }
        if (config.ThemeConfig.DiscordButton.textColor) {
          root.style.setProperty('--color-discord-text', config.ThemeConfig.DiscordButton.textColor);
        }
      }
    }
  }, [config.ThemeConfig]);

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
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeDrag = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width));
    setVolume(percent);
  };

  const handleNextTrack = () => {
    if (config.Backgrounds && config.Backgrounds.length > 1) {
      let nextTrackIdx = (currentTrackIndex + 1) % config.Backgrounds.length;
      
      // Keep searching until we find a track with valid audio or we loop back around
      let safetyCounter = 0;
      while ((!config.Backgrounds[nextTrackIdx].audioLink || config.Backgrounds[nextTrackIdx].audioLink === '') && safetyCounter < config.Backgrounds.length) {
         nextTrackIdx = (nextTrackIdx + 1) % config.Backgrounds.length;
         safetyCounter++;
      }
      
      setCurrentTrackIndex(nextTrackIdx);
      
      // Update background video only if the new track specifies a different file
      if (config.Backgrounds[nextTrackIdx].file && config.Backgrounds[nextTrackIdx].file !== '') {
         setCurrentVideoIndex(nextTrackIdx);
      }
    } else if (config.Backgrounds && config.Backgrounds.length === 1) {
      // Loop a single track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Auto-play prevented:', e));
      }
    }
  };

  const handlePrevTrack = () => {
    if (config.Backgrounds && config.Backgrounds.length > 1) {
      let prevTrackIdx = (currentTrackIndex - 1 + config.Backgrounds.length) % config.Backgrounds.length;

      // Keep searching backwards until we find a track with valid audio
      let safetyCounter = 0;
      while ((!config.Backgrounds[prevTrackIdx].audioLink || config.Backgrounds[prevTrackIdx].audioLink === '') && safetyCounter < config.Backgrounds.length) {
         prevTrackIdx = (prevTrackIdx - 1 + config.Backgrounds.length) % config.Backgrounds.length;
         safetyCounter++;
      }

      setCurrentTrackIndex(prevTrackIdx);
      
      // Look back to find nearest active video background leading up to this track
      for(let i = prevTrackIdx; i >= 0; i--) {
        if (config.Backgrounds[i].file && config.Backgrounds[i].file !== '') {
          setCurrentVideoIndex(i);
          return;
        }
      }
      // If we didn't find one looping backwards from prevTrackIdx to 0, loop from the end
      for(let i = config.Backgrounds.length - 1; i > prevTrackIdx; i--) {
        if (config.Backgrounds[i].file && config.Backgrounds[i].file !== '') {
          setCurrentVideoIndex(i);
          return;
        }
      }
    } else if (config.Backgrounds && config.Backgrounds.length === 1) {
      // Loop a single track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log('Auto-play prevented:', e));
      }
    }
  };

  // Auto-play next track when current ends
  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      const handleEnded = () => handleNextTrack();
      audioEl.addEventListener('ended', handleEnded);
      return () => audioEl.removeEventListener('ended', handleEnded);
    }
  }, [currentTrackIndex, config.Backgrounds]);

  // Restart play state when track changes
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.log('Auto-play prevented:', e));
    }
  }, [currentTrackIndex]);

  const currentTrack = config.Backgrounds && config.Backgrounds.length > 0 ? config.Backgrounds[currentTrackIndex] : null;
  const currentVideo = config.Backgrounds && config.Backgrounds.length > 0 ? config.Backgrounds[currentVideoIndex] : null;

  return (
    <div className="bg-background-dark text-white font-body italic h-screen w-screen overflow-hidden relative selection:bg-primary selection:text-white">
      <div className="absolute inset-0 z-0">
        {(config.videourl || config.videofolder) && currentVideo && currentVideo.file && (
          <video
            key={currentVideo.file} // Force React to remount video when source changes
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source 
              src={
                config.videourl 
                  ? currentVideo.file
                  : (window.invokeNative ? `../config/video/${currentVideo.file}` : `/config/video/${currentVideo.file}`)
              } 
              type="video/mp4" 
            />
            Seu navegador não suporta vídeos.
          </video>
        )}
        
        {/* Audio Element */}
        {(config.musicurl || config.musicfolder) && currentTrack && currentTrack.audioLink && (
          <audio 
            key={currentTrack.audioLink} // Force remount to properly trigger new source
            ref={audioRef}
            autoPlay 
            // no loop attribute here, handled by 'ended' event listener
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
          >
             <source 
              src={
                config.musicurl 
                  ? currentTrack.audioLink
                  : (window.invokeNative ? `../config/audio/${currentTrack.audioLink}` : `/config/audio/${currentTrack.audioLink}`)
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
        <div className="flex flex-col md:flex-row justify-between items-start w-full relative z-30 pointer-events-auto gap-4">
          
          {/* Left Block: Logo, Welcome Title, and Text */}
          <div className="w-full md:w-1/3 flex flex-col items-start text-left shrink-0">
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
            <h1 className="text-4xl md:text-6xl font-display font-bold uppercase tracking-wide leading-none mb-6 text-white drop-shadow-lg" dangerouslySetInnerHTML={{ __html: config.Texts.header_1 }}></h1>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed max-w-md mb-8 font-light border-l-2 border-primary pl-4 bg-gradient-to-r from-primary/10 to-transparent py-2" style={{ borderColor: config.ThemeConfig.primaryColor, backgroundImage: `linear-gradient(to right, ${config.ThemeConfig.primaryBase}1a, transparent)` }}>
              {config.Texts.header_2}
            </p>
            <div className="flex items-center gap-4">
              <button onClick={() => {
                if (window.invokeNative && config.DiscordUrl) {
                  window.invokeNative('openUrl', config.DiscordUrl);
                } else if (config.DiscordUrl) {
                  window.open(config.DiscordUrl, '_blank');
                }
              }} className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all hover:scale-105 flex items-center gap-2" style={{ backgroundColor: config.ThemeConfig.DiscordButton?.backgroundColor || config.ThemeConfig.primaryColor, color: config.ThemeConfig.DiscordButton?.textColor || '#ffffff', boxShadow: `0 0 15px ${config.ThemeConfig.primaryBase}80` }}>
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.025-.32 13.559.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.068 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"></path></svg>
                {config.Texts.discord}
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-black/50 border border-white/10 rounded">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" style={{ backgroundColor: config.ThemeConfig.primaryColor }}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" style={{ backgroundColor: config.ThemeConfig.primaryColor }}></span>
                </span>
                <span className="text-sm font-semibold tracking-wide">{config.Texts.online}</span>
              </div>
            </div>
          </div>
          
          {/* Right Block: Audio Controls */}
          <div className="flex items-center justify-end gap-4 shrink-0 mt-4 md:mt-0 z-30">
            <div className="flex gap-2 relative">
              <button 
                onClick={handlePrevTrack}
                className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" 
              >
                <span className="material-icons text-sm">skip_previous</span>
              </button>

              <button 
                onClick={togglePlay}
                className="w-8 h-8 rounded bg-primary hover:bg-primary/80 flex items-center justify-center transition-colors neon-box" 
                style={{ backgroundColor: config.ThemeConfig.primaryColor, boxShadow: `0 0 15px ${config.ThemeConfig.primaryBase}66` }}
              >
                <span className="material-icons text-sm">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </button>

              <button 
                onClick={handleNextTrack}
                className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" 
              >
                <span className="material-icons text-sm">skip_next</span>
              </button>
              
              <div className="relative ml-2">
                <button 
                  onClick={() => setShowVolume(!showVolume)}
                  className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <span className="material-icons text-sm">{volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}</span>
                </button>
                
                {showVolume && (
                  <div className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 flex flex-col items-center gap-2">
                    <div 
                      className="w-24 h-2 bg-gray-700 rounded-full cursor-pointer relative"
                      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handleVolumeDrag(e); }}
                      onPointerMove={(e) => { if (e.buttons === 1) handleVolumeDrag(e); }}
                      onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
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
                <span className="text-xs font-bold text-white tracking-wide">{currentTrack ? currentTrack.musicName : 'Música'}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{currentTrack ? currentTrack.musicAuthor : 'Artista'}</span>
              </div>
              <div 
                className="w-24 h-1.5 bg-gray-700/50 rounded-full ml-2 relative cursor-pointer group"
                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handleSeek(e); }}
                onPointerMove={(e) => { if (e.buttons === 1) handleSeek(e); }}
                onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
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

        {/* Empty Space Filler */}
        <div className="flex-grow"></div>
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
