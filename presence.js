import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './auth/config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
const channelName = 'english-literature-library-presence'
const presenceKey = `visitor-${crypto.randomUUID()}`

function injectUI() {
  const style = document.createElement('style')
  style.textContent = `
    .drawer-live{margin:0 0 24px;padding:14px;border:1px solid var(--line);background:rgba(238,233,220,.55)}
    .drawer-live .live-head{display:flex;align-items:center;gap:8px;color:var(--red);font:9px var(--mono);letter-spacing:.11em;text-transform:uppercase}
    .drawer-live .live-dot,.library-live-top .live-dot,.live-strip .live-dot{width:7px;height:7px;border-radius:50%;background:var(--red);box-shadow:0 0 0 5px rgba(233,49,29,.08);flex:none}
    .drawer-live strong{display:block;margin-top:8px;font:italic 28px var(--serif);letter-spacing:-.04em}
    .drawer-live small{display:block;margin-top:4px;color:var(--muted);font:8px var(--mono);text-transform:uppercase;letter-spacing:.08em}
    .library-live-top{display:inline-flex;align-items:center;gap:7px;margin-left:12px;color:var(--muted);font:8px var(--mono);letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
    .community-live{display:inline-flex;align-items:center;gap:7px;color:var(--muted);font:8px var(--mono);letter-spacing:.08em;text-transform:uppercase}
    .community-live i{width:6px;height:6px;border-radius:50%;background:var(--red);box-shadow:0 0 0 4px rgba(233,49,29,.08)}
    .community-live b{color:var(--ink);font-weight:500}
    .live-strip{display:flex;align-items:center;gap:12px;border:1px solid #35332e;background:#151412;padding:15px 16px;margin-bottom:18px}
    .live-strip>div{display:flex;align-items:baseline;gap:9px}
    .live-strip b{font:italic 20px var(--serif);color:var(--paper2)}
    .live-strip small{font:8px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:#aaa69d}
    .live-strip .live-note{margin-left:auto;color:var(--red);font:8px var(--mono);letter-spacing:.1em;text-transform:uppercase}
    @media(max-width:720px){.library-live-top{display:none}.live-strip{align-items:flex-start}.live-strip>div{display:grid;gap:3px}.live-strip .live-note{display:none}}
  `
  document.head.appendChild(style)

  const drawer = document.querySelector('.library-drawer')
  if (drawer && !drawer.querySelector('.drawer-live')) {
    const panel = document.createElement('div')
    panel.className = 'drawer-live'
    panel.innerHTML = '<div class="live-head"><span class="live-dot"></span> LIVE IN LIBRARY</div><strong id="drawerLiveCount">1 person</strong><small>Connected right now</small>'
    const nav = drawer.querySelector('nav')
    if (nav) drawer.insertBefore(panel, nav)
    else drawer.appendChild(panel)
  }

  const top = document.querySelector('.top')
  if (top && !top.querySelector('.library-live-top')) {
    const pill = document.createElement('span')
    pill.className = 'library-live-top'
    pill.innerHTML = '<span class="live-dot"></span><span id="topLiveCount">1 online</span>'
    top.appendChild(pill)
  }
}

function setCount(count) {
  const safeCount = Math.max(0, Number(count) || 0)
  const label = `${safeCount} ${safeCount === 1 ? 'person' : 'people'}`
  const drawerCount = document.querySelector('#drawerLiveCount')
  const topCount = document.querySelector('#topLiveCount')
  const roomCount = document.querySelector('#roomLiveCount')
  const communityCount = document.querySelector('#communityLive b')
  if (drawerCount) drawerCount.textContent = label
  if (topCount) topCount.textContent = `${safeCount} online`
  if (roomCount) roomCount.textContent = label
  if (communityCount) communityCount.textContent = String(safeCount)
}

async function startPresence() {
  injectUI()

  const channel = supabase.channel(channelName, {
    config: { presence: { key: presenceKey } }
  })

  const refresh = () => setCount(Object.keys(channel.presenceState()).length)
  channel.on('presence', { event: 'sync' }, refresh)
  channel.on('presence', { event: 'join' }, refresh)
  channel.on('presence', { event: 'leave' }, refresh)

  const { error } = await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const { error: trackError } = await channel.track({
        online_at: new Date().toISOString(),
        page: location.pathname
      })
      if (trackError) console.warn('Library presence tracking failed:', trackError.message)
    }
  })

  if (error) console.warn('Library presence channel failed:', error.message)

  window.addEventListener('pagehide', () => {
    channel.untrack().catch(() => {})
    supabase.removeChannel(channel)
  }, { once: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startPresence, { once: true })
} else {
  startPresence()
}
