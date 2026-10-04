// Browser-only stand-in for the server config (vite dev and headless prints).
export const DEV_CONFIG = {
  texts: {
    title: 'BEM-VINDO A MRI',
    subtitle: 'Comunidade BR onde o RP é levado a sério e transformamos suas ideias em realidade!',
    loading: 'Carregando a cidade',
    discord: 'Discord',
  },
  logo: { file: 'logo.png', width: 220 },
  discordUrl: 'https://discord.gg/mriqbox',
  overlay: true,
  showHints: true,
  volume: 0.5,
  staff: { enabled: true, members: [{ image: 'murai.png', name: 'Murai' }, { image: 'snow.png', name: 'Snow' }] },
  tracks: [
    { video: 'video.mp4', useVideoAudio: false, audio: '', title: 'GTA6', artist: 'Rockstar Games' },
    { video: 'https://r2.fivemanage.com/NPYjK3TScd7LGsz8PIbt3/bemvindoa.mp4', useVideoAudio: true, audio: '', title: 'MriQbox', artist: 'mriqbox' },
  ],
}
