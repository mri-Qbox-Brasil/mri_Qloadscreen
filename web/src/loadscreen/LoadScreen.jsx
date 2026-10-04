import { useEffect, useRef, useState } from 'react'
import { Clapperboard, Music2, Pause, Play, SkipBack, SkipForward, Volume1, Volume2, VolumeX } from 'lucide-react'
import { MriSlider } from '@mriqbox/ui-kit'
import { assetUrl, openUrl } from '../lib/assets'
import { useStaff } from '../lib/useStaff'

const STAFF_INTERVAL_MS = 5000

function DiscordIcon({ className }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.025-.32 13.559.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.068 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
    </svg>
  )
}

function IconButton({ label, onClick, children, primary }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${
        primary ? 'bg-primary text-primary-foreground hover:bg-primary/85' : 'text-muted-foreground hover:bg-foreground/10 hover:text-foreground'
      }`}
    >
      {children}
    </button>
  )
}

function Kbd({ children }) {
  return (
    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded border border-border bg-card/70 px-1.5 text-[11px] font-semibold text-foreground">
      {children}
    </span>
  )
}

function StaffChip({ staff }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (staff.length < 2) return
    const timer = setInterval(() => setTick((t) => t + 1), STAFF_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [staff.length])

  const index = staff.length ? tick % staff.length : 0
  const member = staff[index]
  if (!member) return null

  return (
    <div className="mri-surface-card flex h-12 items-center gap-3 rounded-lg border border-border bg-card/70 pl-1.5 pr-5">
      <img key={`img-${index}`} src={assetUrl(member.image, 'staffs')} alt="" className="ls-fade h-9 w-9 rounded-md bg-muted object-cover" />
      <div key={`name-${index}`} className="ls-fade flex flex-col leading-tight">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Staff</span>
        <span className="text-sm font-medium text-foreground">{member.name}</span>
      </div>
    </div>
  )
}

/**
 * The loading screen itself, laid out for a 1080 px tall stage (see ScaledStage).
 * `preview` = inside the panel: silent, no keyboard, no audio element.
 */
export function LoadScreen({ config, progress, stage, preview = false }) {
  const tracks = config.tracks.filter((t) => t.video || t.audio)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  // Null until the player moves the slider, so the panel's initial volume shows live in the preview.
  const [userVolume, setUserVolume] = useState(null)
  const [hudVisible, setHudVisible] = useState(true)
  const [time, setTime] = useState({ src: '', current: 0, duration: 0 })
  const [readyVideo, setReadyVideo] = useState('')
  const videoRef = useRef(null)
  const audioRef = useRef(null)
  const staff = useStaff(config.staff)

  const track = tracks.length ? tracks[index % tracks.length] : null
  const usesVideoAudio = Boolean(track?.useVideoAudio && track.video)
  const hasAudioFile = !preview && !usesVideoAudio && Boolean(track?.audio)
  const mediaSrc = usesVideoAudio ? track.video : track?.audio
  const position = time.src === mediaSrc ? time : { current: 0, duration: 0 }
  const canSeek = hasAudioFile && position.duration > 0
  const videoReady = Boolean(track?.video) && readyVideo === track.video
  const volume = userVolume ?? config.volume
  const activeMedia = () => (usesVideoAudio ? videoRef.current : audioRef.current)

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = volume
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume, track])

  useEffect(() => {
    if (preview) return
    const el = activeMedia()
    if (!el) return
    if (!playing) {
      el.pause()
      return
    }
    el.play().catch(() => {
      // CEF blocks unmuted autoplay on video: start muted, then unmute.
      if (el !== videoRef.current) return
      el.muted = true
      el.play().then(() => setTimeout(() => { el.muted = false }, 1000)).catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing, preview, track?.video, track?.audio, usesVideoAudio])

  const restart = () => {
    const el = activeMedia()
    if (!el) return
    el.currentTime = 0
    if (playing) el.play().catch(() => {})
  }

  const step = (dir) => {
    if (tracks.length > 1) setIndex((i) => (i + dir + tracks.length) % tracks.length)
    else restart()
  }

  const onTime = (e) => setTime({ src: mediaSrc, current: e.currentTarget.currentTime, duration: e.currentTarget.duration || 0 })

  const seek = (e) => {
    if (!canSeek) return
    const bounds = e.currentTarget.getBoundingClientRect()
    audioRef.current.currentTime = Math.max(0, Math.min(1, (e.clientX - bounds.left) / bounds.width)) * position.duration
  }

  const keys = useRef(null)
  useEffect(() => {
    keys.current = { step, nudgeVolume: (d) => setUserVolume(Math.min(1, Math.max(0, volume + d))) }
  })
  useEffect(() => {
    if (preview) return
    const onKey = (e) => {
      const key = e.key.toLowerCase()
      if (key === 'o') setHudVisible((v) => !v)
      else if (key === 'p') setPlaying((p) => !p)
      else if (e.key === 'ArrowUp') keys.current.nudgeVolume(0.05)
      else if (e.key === 'ArrowDown') keys.current.nudgeVolume(-0.05)
      else if (e.key === 'ArrowRight') keys.current.step(1)
      else if (e.key === 'ArrowLeft') keys.current.step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [preview])

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2
  const percent = Math.round(progress)
  const hud = `transition-opacity duration-500 ${hudVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`

  return (
    <div className="relative h-full w-full select-none overflow-hidden bg-[hsl(var(--background))] text-foreground">
      {track?.video && (
        <video
          key={track.video}
          ref={videoRef}
          src={assetUrl(track.video, 'video')}
          autoPlay
          playsInline
          disablePictureInPicture
          loop={!usesVideoAudio}
          muted={preview || !usesVideoAudio}
          onLoadedData={() => setReadyVideo(track.video)}
          onTimeUpdate={usesVideoAudio ? onTime : undefined}
          onEnded={usesVideoAudio ? () => step(1) : undefined}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {hasAudioFile && (
        <audio key={track.audio} ref={audioRef} src={assetUrl(track.audio, 'audio')} autoPlay onTimeUpdate={onTime} onLoadedMetadata={onTime} onEnded={() => step(1)} />
      )}

      {config.overlay && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/10 to-transparent" />
        </>
      )}

      {track && (
        <div className={`absolute right-16 top-14 ${hud}`}>
          <div className="ls-rise mri-surface-card w-[380px] overflow-hidden rounded-xl border border-border bg-card/70" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                {usesVideoAudio ? <Clapperboard className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{track.title || 'Sem título'}</p>
                <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
              </div>
              <div className="flex items-center gap-0.5">
                <IconButton label="Anterior" onClick={() => step(-1)}><SkipBack className="h-4 w-4" /></IconButton>
                <IconButton label={playing ? 'Pausar' : 'Tocar'} onClick={() => setPlaying((p) => !p)} primary>
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </IconButton>
                <IconButton label="Próxima" onClick={() => step(1)}><SkipForward className="h-4 w-4" /></IconButton>
              </div>
            </div>
            <div className="flex items-center gap-3 px-3 pb-3">
              <VolumeIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <MriSlider value={volume} onChange={setUserVolume} min={0} max={1} step={0.01} size="sm" glow={false} className="flex-1" aria-label="Volume" />
            </div>
            <div className={`h-1 bg-foreground/10 ${canSeek ? 'cursor-pointer' : ''}`} onClick={seek}>
              <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${position.duration > 0 ? (position.current / position.duration) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className={`absolute bottom-40 left-16 flex max-w-[760px] flex-col items-start ${hud}`}>
        {config.logo.file && (
          <img
            src={assetUrl(config.logo.file, 'logo')}
            alt=""
            className="ls-rise mb-6 max-h-[220px] object-contain object-left drop-shadow-xl"
            style={{ width: config.logo.width }}
          />
        )}
        {config.texts.title && (
          <h1 className="ls-rise whitespace-pre-line text-[68px] font-bold uppercase leading-[0.95] tracking-tight drop-shadow-lg" style={{ animationDelay: '120ms' }}>
            {config.texts.title}
          </h1>
        )}
        {config.texts.subtitle && (
          <p className="ls-rise mt-5 max-w-[600px] whitespace-pre-line text-lg leading-relaxed text-foreground/75" style={{ animationDelay: '240ms' }}>
            {config.texts.subtitle}
          </p>
        )}
        <div className="ls-rise mt-8 flex items-center gap-4" style={{ animationDelay: '360ms' }}>
          {config.discordUrl && (
            <button
              type="button"
              onClick={() => !preview && openUrl(config.discordUrl)}
              className="flex h-12 items-center gap-2.5 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
            >
              <DiscordIcon className="h-5 w-5" />
              {config.texts.discord}
            </button>
          )}
          <StaffChip staff={staff} />
        </div>
      </div>

      {config.showHints && (
        <div className={`absolute bottom-[104px] right-16 ${hud}`}>
          <div className="ls-fade flex items-center gap-5 text-xs text-muted-foreground" style={{ animationDelay: '900ms' }}>
            <span className="flex items-center gap-2"><Kbd>O</Kbd> Esconder interface</span>
            <span className="flex items-center gap-2"><Kbd>P</Kbd> Pausar</span>
            <span className="flex items-center gap-2"><Kbd>↑</Kbd><Kbd>↓</Kbd> Volume</span>
            <span className="flex items-center gap-2"><Kbd>←</Kbd><Kbd>→</Kbd> Faixa</span>
          </div>
        </div>
      )}

      <div className="ls-fade absolute inset-x-16 bottom-14">
        <div className="flex items-baseline justify-between gap-6">
          <p className="truncate text-sm font-medium">
            {config.texts.loading}
            {stage && <span className="text-muted-foreground"> · {stage}</span>}
          </p>
          <span className="text-sm font-semibold tabular-nums text-primary">{percent}%</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-foreground/15">
          <div className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  )
}
