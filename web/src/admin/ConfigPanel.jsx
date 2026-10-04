import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Film, MonitorPlay, Plus, RotateCcw, Save, Trash2, Type, Users, X } from 'lucide-react'
import {
  MriButton,
  MriCard,
  MriInput,
  MriPageHeader,
  MriSettingField,
  MriSettingToggle,
  MriSlider,
  MriSpinner,
  MriSwitch,
  MriTextarea,
} from '@mriqbox/ui-kit'
import { isEnvBrowser } from '../lib/assets'
import { DEV_CONFIG } from '../lib/devConfig'
import { fetchNui } from '../lib/nui'
import { LoadScreen } from '../loadscreen/LoadScreen'
import { ScaledStage } from '../loadscreen/ScaledStage'

const EMPTY_TRACK = { video: '', useVideoAudio: true, audio: '', title: '', artist: '' }
const EMPTY_MEMBER = { image: '', name: '' }

function Section({ icon: Icon, title, description, action, children }) {
  return (
    <MriCard className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </MriCard>
  )
}

function ListActions({ index, length, onMove, onRemove }) {
  return (
    <div className="flex items-center gap-1">
      <MriButton size="icon" variant="ghost" className="h-8 w-8" disabled={index === 0} onClick={() => onMove(index, -1)} aria-label="Subir">
        <ArrowUp className="h-4 w-4" />
      </MriButton>
      <MriButton size="icon" variant="ghost" className="h-8 w-8" disabled={index === length - 1} onClick={() => onMove(index, 1)} aria-label="Descer">
        <ArrowDown className="h-4 w-4" />
      </MriButton>
      <MriButton size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onRemove(index)} aria-label="Remover">
        <Trash2 className="h-4 w-4" />
      </MriButton>
    </div>
  )
}

const moveItem = (list, index, dir) => {
  const next = [...list]
  const [item] = next.splice(index, 1)
  next.splice(index + dir, 0, item)
  return next
}

export function ConfigPanel({ onClose }) {
  const [defaults, setDefaults] = useState(null)
  const [saved, setSaved] = useState(null)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const load = isEnvBrowser() ? Promise.resolve({ config: DEV_CONFIG, defaults: DEV_CONFIG }) : fetchNui('getConfig')
    load.then((res) => {
      if (!res) {
        setStatus({ type: 'error', text: 'Sem permissão para editar a tela de carregamento.' })
        return
      }
      setDefaults(res.defaults)
      setSaved(res.config)
      setDraft(res.config)
    })
  }, [])

  if (!draft) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {status ? status.text : <MriSpinner />}
      </div>
    )
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const patch = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const patchIn = (key, field, value) => setDraft((d) => ({ ...d, [key]: { ...d[key], [field]: value } }))
  const setTrack = (index, field, value) => patch('tracks', draft.tracks.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  const setMember = (index, field, value) =>
    patchIn('staff', 'members', draft.staff.members.map((m, i) => (i === index ? { ...m, [field]: value } : m)))

  const save = async () => {
    setSaving(true)
    setStatus(null)
    const res = isEnvBrowser() ? { ok: true, config: draft } : await fetchNui('saveConfig', draft)
    setSaving(false)
    if (res?.ok) {
      setSaved(res.config)
      setDraft(res.config)
      setStatus({ type: 'ok', text: 'Salvo. Vale a partir da próxima conexão.' })
    } else {
      setStatus({ type: 'error', text: res?.error ? `Não foi possível salvar: ${res.error}` : 'Não foi possível salvar.' })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <MriPageHeader
        title="Tela de carregamento"
        icon={MonitorPlay}
        description="O que o jogador vê enquanto conecta. As mudanças valem a partir da próxima conexão."
        className="shrink-0 border-b border-border px-5 py-4"
      >
        <div className="flex items-center gap-2">
          {status && <span className={`text-xs ${status.type === 'ok' ? 'text-primary' : 'text-destructive'}`}>{status.text}</span>}
          <MriButton variant="ghost" size="sm" onClick={() => setDraft(defaults)}>
            <RotateCcw className="mr-1.5 h-4 w-4" /> Padrão
          </MriButton>
          <MriButton variant="outline" size="sm" disabled={!dirty} onClick={() => setDraft(saved)}>
            Descartar
          </MriButton>
          <MriButton size="sm" disabled={!dirty} isLoading={saving} onClick={save}>
            <Save className="mr-1.5 h-4 w-4" /> Salvar
          </MriButton>
          <MriButton variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" />
          </MriButton>
        </div>
      </MriPageHeader>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(380px,1fr)_minmax(0,1.3fr)]">
        <div className="min-h-0 space-y-4 overflow-y-auto p-5">
          <Section icon={Type} title="Textos e Discord" description="Título, subtítulo, texto de carregamento e botão do Discord.">
            <MriSettingField label="Título" description="Quebra de linha vira quebra na tela.">
              <MriTextarea resize="auto" rows={1} value={draft.texts.title} onChange={(e) => patchIn('texts', 'title', e.target.value)} />
            </MriSettingField>
            <MriSettingField label="Subtítulo">
              <MriTextarea resize="auto" rows={2} value={draft.texts.subtitle} onChange={(e) => patchIn('texts', 'subtitle', e.target.value)} />
            </MriSettingField>
            <MriSettingField label="Texto de carregamento" description="Aparece acima da barra, junto da etapa do jogo.">
              <MriInput value={draft.texts.loading} onChange={(e) => patchIn('texts', 'loading', e.target.value)} />
            </MriSettingField>
            <div className="grid grid-cols-[1fr_2fr] gap-3">
              <MriSettingField label="Botão do Discord">
                <MriInput value={draft.texts.discord} onChange={(e) => patchIn('texts', 'discord', e.target.value)} />
              </MriSettingField>
              <MriSettingField label="Convite" description="Vazio esconde o botão.">
                <MriInput value={draft.discordUrl} placeholder="https://discord.gg/..." onChange={(e) => patch('discordUrl', e.target.value)} />
              </MriSettingField>
            </div>
          </Section>

          <Section icon={MonitorPlay} title="Visual" description="Logo, escurecimento do vídeo e som.">
            <MriSettingField label="Logo" description="Arquivo em config/logo/ ou link. Vazio esconde a logo.">
              <MriInput value={draft.logo.file} placeholder="logo.png" onChange={(e) => patchIn('logo', 'file', e.target.value)} />
            </MriSettingField>
            <MriSettingField label={`Largura da logo: ${draft.logo.width}px`}>
              <MriSlider value={draft.logo.width} min={40} max={600} step={10} size="sm" onChange={(v) => patchIn('logo', 'width', v)} />
            </MriSettingField>
            <MriSettingField label={`Volume inicial: ${Math.round(draft.volume * 100)}%`}>
              <MriSlider value={draft.volume} min={0} max={1} step={0.05} size="sm" onChange={(v) => patch('volume', v)} />
            </MriSettingField>
            <MriSettingToggle
              label="Escurecer o vídeo"
              description="Gradiente atrás dos textos, ajuda a ler sobre vídeo claro."
              checked={draft.overlay}
              onCheckedChange={(v) => patch('overlay', v)}
            />
            <MriSettingToggle
              label="Mostrar atalhos"
              description="Teclas de esconder interface, pausar, volume e faixa."
              checked={draft.showHints}
              onCheckedChange={(v) => patch('showHints', v)}
            />
          </Section>

          <Section
            icon={Film}
            title="Vídeos e músicas"
            description="Tocam em sequência. Arquivo em config/video/ e config/audio/, ou link."
            action={
              <MriButton size="sm" variant="outline" onClick={() => patch('tracks', [...draft.tracks, { ...EMPTY_TRACK }])}>
                <Plus className="mr-1 h-4 w-4" /> Faixa
              </MriButton>
            }
          >
            {draft.tracks.length === 0 && <p className="text-xs text-muted-foreground">Sem faixa: a tela fica só com a cor de fundo.</p>}
            {draft.tracks.map((track, i) => (
              <div key={i} className="space-y-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Faixa {i + 1}</span>
                  <ListActions
                    index={i}
                    length={draft.tracks.length}
                    onMove={(index, dir) => patch('tracks', moveItem(draft.tracks, index, dir))}
                    onRemove={(index) => patch('tracks', draft.tracks.filter((_, j) => j !== index))}
                  />
                </div>
                <MriInput value={track.video} placeholder="Vídeo: video.mp4 ou https://..." onChange={(e) => setTrack(i, 'video', e.target.value)} />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm">Usar o som do vídeo</span>
                  <MriSwitch size="sm" checked={track.useVideoAudio} onCheckedChange={(v) => setTrack(i, 'useVideoAudio', v)} aria-label="Usar o som do vídeo" />
                </div>
                {!track.useVideoAudio && (
                  <MriInput value={track.audio} placeholder="Música: musica.mp3 ou https://..." onChange={(e) => setTrack(i, 'audio', e.target.value)} />
                )}
                <div className="grid grid-cols-2 gap-3">
                  <MriInput value={track.title} placeholder="Nome" onChange={(e) => setTrack(i, 'title', e.target.value)} />
                  <MriInput value={track.artist} placeholder="Artista" onChange={(e) => setTrack(i, 'artist', e.target.value)} />
                </div>
              </div>
            ))}
          </Section>

          <Section
            icon={Users}
            title="Staff"
            description="Passa um por vez ao lado do Discord. Lista vazia mostra os membros da org MRI no GitHub."
            action={<MriSwitch checked={draft.staff.enabled} onCheckedChange={(v) => patchIn('staff', 'enabled', v)} aria-label="Mostrar staff" />}
          >
            {draft.staff.enabled && (
              <>
                {draft.staff.members.map((member, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <MriInput className="flex-1" value={member.name} placeholder="Nome" onChange={(e) => setMember(i, 'name', e.target.value)} />
                    <MriInput className="flex-1" value={member.image} placeholder="Foto: nome.png ou https://..." onChange={(e) => setMember(i, 'image', e.target.value)} />
                    <ListActions
                      index={i}
                      length={draft.staff.members.length}
                      onMove={(index, dir) => patchIn('staff', 'members', moveItem(draft.staff.members, index, dir))}
                      onRemove={(index) => patchIn('staff', 'members', draft.staff.members.filter((_, j) => j !== index))}
                    />
                  </div>
                ))}
                <MriButton size="sm" variant="outline" onClick={() => patchIn('staff', 'members', [...draft.staff.members, { ...EMPTY_MEMBER }])}>
                  <Plus className="mr-1 h-4 w-4" /> Membro
                </MriButton>
              </>
            )}
          </Section>
        </div>

        <div className="min-h-0 border-l border-border p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prévia</p>
          <ScaledStage className="aspect-video w-full rounded-lg border border-border">
            <LoadScreen config={draft} progress={62} stage="Carregando o mapa" preview />
          </ScaledStage>
          <p className="mt-2 text-xs text-muted-foreground">Sem som na prévia. Arquivos locais vêm das pastas em config/ do resource.</p>
        </div>
      </div>
    </div>
  )
}
