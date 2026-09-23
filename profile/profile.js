import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '../auth/config.js'

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
const $ = (id) => document.getElementById(id)

const PROFILE_TIMEOUT_MS = 10000
const MEDIA_BUCKET = 'profile-media'
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_IMAGE_DIMENSION = 2400

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
  ;['logout', 'editProfile', 'editCover', 'editAvatar'].forEach((id) => {
    const element = $(id)
    if (element) element.disabled = loading
  })
}

function fileExtension(file) {
  const map = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }
  return map[file.type] || 'jpg'
}

async function prepareImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Image is too large. Please choose one under 8 MB.')

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare the image.')
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('Could not prepare the image.')), 'image/webp', 0.86)
  })
  return { blob, width, height }
}

async function uploadProfileImage(file, kind) {
  const sessionResult = await withTimeout(supabase.auth.getSession(), 'Authentication')
  if (sessionResult.error) throw sessionResult.error
  const user = sessionResult.data?.session?.user
  if (!user) {
    window.location.replace(new URL('../auth/login.html', window.location.href).href)
    return
  }

  const { blob } = await prepareImage(file)
  const path = user.id + '/' + kind + '.webp'

  const { error: uploadError } = await withTimeout(
    supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: true,
    }),
    kind + ' image upload'
  )
  if (uploadError) throw uploadError

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  const publicUrl = data.publicUrl + '?v=' + Date.now()

  const column = kind === 'avatar' ? 'avatar_url' : 'cover_url'
  const { error: profileError } = await withTimeout(
    supabase.from('profiles').update({ [column]: publicUrl }).eq('id', user.id),
    'Profile update'
  )
  if (profileError) throw profileError

  return publicUrl
}

async function handleMediaUpload(input, kind) {
  const file = input?.files?.[0]
  if (!file) return

  const target = kind === 'avatar' ? $('avatar') : document.querySelector('.cover-image')
  const section = kind === 'avatar' ? $('editAvatar') : document.querySelector('.cover')
  section?.classList.add('media-uploading')
  clearError()

  try {
    const url = await uploadProfileImage(file, kind)
    if (kind === 'avatar') {
      $('avatar').src = url
    } else {
      target.style.backgroundImage = 'url("' + url + '")'
    }
    showError((kind === 'avatar' ? 'Profile photo' : 'Cover image') + ' updated.', false)
  } catch (error) {
    showError(error?.message || 'Image upload failed.')
  } finally {
    section?.classList.remove('media-uploading')
    input.value = ''
  }
}

function profileCopy(profile, key, fallback) {
  const value = profile?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
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
  $('bio').textContent = profileCopy(profile, 'bio', founder ? 'Building a library for curious minds. Where literature meets technology.' : 'A reader exploring the world of literature, one page at a time.')
  $('aboutTitle').textContent = profileCopy(profile, 'about_title', 'Curiosity drives everything.')
  $('aboutText').textContent = profileCopy(profile, 'about_text', founder ? 'TensoraMax Lab is an independent research and development studio building tools, experiments, and spaces where literature, technology, and human creativity can coexist.' : 'A member of the English Literature Library exploring literature, learning, and ideas through the shared catalogue.')
  $('readingTitle').textContent = profileCopy(profile, 'reading_title', 'Explore the catalogue')
  $('readingText').textContent = profileCopy(profile, 'reading_text', 'Choose a work from the library and begin a reading session.')
  $('libraryDescription').textContent = profileCopy(profile, 'library_description', 'The number here mirrors the books available in the public English Literature Library. It is not a personal “books read” count.')
  $('identityNote').textContent = profileCopy(profile, 'identity_note', founder ? 'Founder identity for the English Literature Library experiment.' : 'A member identity connected to the English Literature Library.')
  $('libraryNote').textContent = '“' + profileCopy(profile, 'library_note', 'Knowledge belongs to everyone.') + '”'
  const tags = Array.isArray(profile?.profile_tags) && profile.profile_tags.length ? profile.profile_tags : ['English Literature','Reading','Learning','Curiosity']
  document.querySelector('.tags').innerHTML = tags.map((tag) => '<span>#' + esc(tag) + '</span>').join('')
  $('joined').textContent = profile?.created_at ? `Joined ${new Date(profile.created_at).toLocaleDateString(undefined, { month:'short', year:'numeric' })}` : 'Joined recently'
  $('emailLabel').textContent = 'Verified account'
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=eee9dc&color=11110f&size=320`
  $('avatar').src = avatarUrl
  $('avatar').onerror = () => {
    $('avatar').removeAttribute('src')
    $('avatar').alt = name.slice(0, 2).toUpperCase()
  }
  if (profile?.cover_url) document.querySelector('.cover-image').style.backgroundImage = 'url("' + profile.cover_url + '")'
  document.body.classList.toggle('founder', founder)

  const count = catalogueCount()
  $('bookCount').textContent = count
  if (!profile?.library_headline) $('libraryHeadline').textContent = count ? (count + ' works in the catalogue.') : 'The complete catalogue.'
  else $('libraryHeadline').textContent = profile.library_headline
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
      .select('id,public_uid,username,display_name,avatar_url,cover_url,bio,role,created_at')
      .eq('id', session.user.id)
      .maybeSingle(),
    'Profile'
  )

  if (error) throw error
  setProfile(profile, session.user)
  return true
}

function openEditor(profile) {
  const modal = $('profileEditor')
  const form = $('profileForm')
  if (!modal || !form) return
  const fields = ['display_name','username','bio','about_title','about_text','reading_title','reading_text','library_headline','library_description','identity_note','library_note']
  fields.forEach((key) => { form.elements[key].value = profile?.[key] || '' })
  form.elements.profile_tags.value = Array.isArray(profile?.profile_tags) ? profile.profile_tags.join(', ') : ''
  modal.hidden = false
  modal.setAttribute('aria-hidden','false')
  document.body.classList.add('profile-editor-open')
  form.elements.display_name.focus()
}

function closeEditor() {
  const modal = $('profileEditor')
  if (!modal) return
  modal.hidden = true
  modal.setAttribute('aria-hidden','true')
  document.body.classList.remove('profile-editor-open')
}

async function saveProfileCopy(form) {
  const { data: { session }, error: sessionError } = await withTimeout(supabase.auth.getSession(), 'Authentication')
  if (sessionError) throw sessionError
  const user = session?.user
  if (!user) throw new Error('Your session expired. Please sign in again.')

  const formData = new FormData(form)
  const username = String(formData.get('username') || '').trim().toLowerCase()
  if (username && !/^[a-z0-9_]+$/.test(username)) throw new Error('Username can only use letters, numbers, and underscores.')

  const tags = String(formData.get('profile_tags') || '').split(',').map((tag) => tag.trim().replace(/^#+/, '')).filter(Boolean).slice(0, 8)
  const payload = {
    display_name: String(formData.get('display_name') || '').trim() || null,
    username: username || null,
    bio: String(formData.get('bio') || '').trim() || null,
    about_title: String(formData.get('about_title') || '').trim() || null,
    about_text: String(formData.get('about_text') || '').trim() || null,
    reading_title: String(formData.get('reading_title') || '').trim() || null,
    reading_text: String(formData.get('reading_text') || '').trim() || null,
    library_headline: String(formData.get('library_headline') || '').trim() || null,
    library_description: String(formData.get('library_description') || '').trim() || null,
    identity_note: String(formData.get('identity_note') || '').trim() || null,
    library_note: String(formData.get('library_note') || '').trim() || null,
    profile_tags: tags.length ? tags : null
  }

  const { error } = await withTimeout(supabase.from('profiles').update(payload).eq('id', user.id), 'Profile save')
  if (error) throw error
  return payload
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

    const currentUser = (await supabase.auth.getUser()).data.user
    const profileResult = await supabase.from('profiles').select('id,public_uid,username,display_name,avatar_url,cover_url,bio,role,created_at,about_title,about_text,reading_title,reading_text,library_headline,library_description,identity_note,library_note,profile_tags').eq('id', currentUser.id).maybeSingle()
    if (profileResult.error) throw profileResult.error
    const currentProfile = profileResult.data || {}
    $('editProfile').disabled = false
    $('editProfile').addEventListener('click', () => openEditor(currentProfile))

    document.querySelectorAll('[data-close-editor]').forEach((element) => element.addEventListener('click', closeEditor))
    $('profileForm').addEventListener('submit', async (event) => {
      event.preventDefault()
      const submit = event.currentTarget.querySelector('button[type="submit"]')
      submit.disabled = true
      clearError()
      try {
        const payload = await saveProfileCopy(event.currentTarget)
        Object.assign(currentProfile, payload)
        const session = (await supabase.auth.getSession()).data.session
        setProfile(currentProfile, session.user)
        closeEditor()
        showError('Profile writing updated.', false)
      } catch (error) {
        showError(error?.message || 'Could not save your profile.')
      } finally {
        submit.disabled = false
      }
    })

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeEditor()
    })

    $('editCover').addEventListener('click', () => $('coverInput').click())
    $('editAvatar').addEventListener('click', () => $('avatarInput').click())
    $('coverInput').addEventListener('change', () => handleMediaUpload($('coverInput'), 'cover'))
    $('avatarInput').addEventListener('change', () => handleMediaUpload($('avatarInput'), 'avatar'))

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
