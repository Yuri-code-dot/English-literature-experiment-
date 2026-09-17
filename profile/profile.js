import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../auth/config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
const $ = (id) => document.getElementById(id)

const PROFILE_TIMEOUT_MS = 10000

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char]))
}

function roleLabel(role) {
  const labels = {
    founder: 'FOUNDER', administrator: 'ADMINISTRATOR', curator: 'CURATOR', editor: 'EDITOR',
    researcher: 'RESEARCHER', contributor: 'CONTRIBUTOR', reader: 'READER'
  }
  return labels[role] || 'READER'
}

function roleLine(role) {
  const lines = {
    founder: 'Founder · Curator · Developer · Researcher · TensoraMax Studio',
    administrator: 'Administrator · Curator · Library Member',
    curator: 'Curator · Literature · Library Member',
    editor: 'Editor · Literature · Library Member',
    researcher: 'Researcher · Literature · Library Member',
    contributor: 'Contributor · Literature · Library Member',
    reader: 'Reader · Learner · Library Member'
  }
  return lines[role] || lines.reader
}

function catalogueCount() {
  return Array.isArray(window.LIBRARY_DATA?.books) ? window.LIBRARY_DATA.books.length : 0
}

function setLoading(loading) {
  document.body.classList.toggle('profile-loading', loading)
  document.body.setAttribute('aria-busy', String(loading))
  ;['logout', 'editProfile'].forEach((id) => {
    const element = $(id)
    if (element) element.disabled = loading
  })
}

function setProfile(profile, user) {
  const role = profile?.role || 'reader'
  const founder = role === 'founder' || profile?.public_uid === 'TENSORAMAX LAB'
  const name = founder ? 'TENSORAMAX LAB' : (profile?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || profile?.username || 'Library Member')
  const handle = profile?.username ? `@${profile.username}` : (founder ? '@tensoramax' : '@member')

  $('displayName').textContent = name
  $('displayName').classList.toggle('founder-name', founder)
  $('handle').textContent = handle
  $('roles').textContent = roleLine(role)
  $('roleBadge').textContent = roleLabel(role)
  $('idRole').textContent = roleLabel(role)
  $('publicId').textContent = founder ? 'TENSORAMAX LAB' : (profile?.public_uid || 'TL-XXXXXX')
  $('bio').textContent = profile?.bio || (founder ? 'Building a library for curious minds. Where literature meets technology.' : 'A reader exploring the world of literature, one page at a time.')
  $('aboutText').textContent = founder
    ? 'TensoraMax Lab is an independent research and development studio building tools, experiments, and spaces where literature, technology, and human creativity can coexist.'
    : 'A member of the English Literature Library exploring literature, learning, and ideas through the shared catalogue.'
  $('identityNote').textContent = founder ? 'Founder identity for the English Literature Library experiment.' : 'A member identity connected to the English Literature Library.'
  $('joined').textContent = profile?.created_at ? `Joined ${new Date(profile.created_at).toLocaleDateString(undefined, { month:'short', year:'numeric' })}` : 'Joined recently'
  $('emailLabel').textContent = 'Verified account'
  $('avatar').src = profile?.avatar_url || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eee9dc&color=11110f&size=320`
  document.body.classList.toggle('founder', founder)

  const count = catalogueCount()
  $('bookCount').textContent = count
  $('libraryHeadline').textContent = count ? `${count} works in the catalogue.` : 'The complete catalogue.'
}

function showError(message, canRetry = true) {
  const box = $('error')
  if (!box) return

  box.hidden = false
  box.classList.add('visible')
  box.querySelector('[data-error-message]').textContent = message
  const retry = box.querySelector('[data-retry]')
  if (retry) retry.hidden = !canRetry

  clearTimeout(showError.timer)
  if (!canRetry) {
    showError.timer = setTimeout(() => {
      box.hidden = true
      box.classList.remove('visible')
    }, 6000)
  }
}

function clearError() {
  const box = $('error')
  if (!box) return
  box.hidden = true
  box.classList.remove('visible')
  clearTimeout(showError.timer)
}

function withTimeout(promise, label) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(`${label} timed out. Check your connection and try again.`)), PROFILE_TIMEOUT_MS)
  })
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timer))
}

async function loadProfile() {
  const { data: { session }, error: sessionError } = await withTimeout(
    supabase.auth.getSession(),
    'Authentication'
  )
  if (sessionError) throw sessionError

  if (!session?.user) {
    window.location.replace(new URL('../auth/login.html', window.location.href).href)
    return false
  }

  const { data: profile, error } = await withTimeout(
    supabase
      .from('profiles')
      .select('id,public_uid,username,display_name,avatar_url,bio,role,created_at')
      .eq('id', session.user.id)
      .maybeSingle(),
    'Profile'
  )

  if (error) throw error
  setProfile(profile, session.user)
  return true
}

async function init() {
  setLoading(true)
  clearError()

  try {
    const loaded = await loadProfile()
    if (!loaded) return

    $('logout').addEventListener('click', async () => {
      $('logout').disabled = true
      try {
        await withTimeout(supabase.auth.signOut(), 'Sign out')
        window.location.replace(new URL('../auth/login.html', window.location.href).href)
      } catch (error) {
        $('logout').disabled = false
        showError(error?.message || 'Could not sign out.')
      }
    })

    $('editProfile').addEventListener('click', () => showError('Profile editing is the next profile-system layer.', false))
    document.querySelectorAll('.tabs button').forEach((button) => {
      button.addEventListener('click', () => {
        document.querySelectorAll('.tabs button').forEach((item) => item.classList.remove('active'))
        button.classList.add('active')
      })
    })

    setLoading(false)
  } catch (error) {
    setLoading(false)
    showError(error?.message || 'Could not load your profile.')
  }
}

$('error')?.querySelector('[data-retry]')?.addEventListener('click', () => init())
window.addEventListener('error', (event) => showError(event.error?.message || event.message || 'Profile error.'))
window.addEventListener('unhandledrejection', (event) => showError(event.reason?.message || 'Profile request failed.'))
init()
