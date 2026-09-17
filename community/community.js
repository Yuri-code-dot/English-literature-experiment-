import { supabase, getUser } from '../auth/auth.js'

const list = document.querySelector('#discussionList')
const search = document.querySelector('#search')
const composer = document.querySelector('#composer')
const form = document.querySelector('#discussionForm')
const status = document.querySelector('#formStatus')
let discussions = []
let activeFilter = 'all'

const demo = [
  {id:'demo-1',title:'Was Victor responsible for the creature’s actions?',body:'A starting point for discussing responsibility, creation, and rejection in Frankenstein.',type:'question',book_id:'frankenstein',replies:34,created_at:'2026-09-16T10:00:00Z'},
  {id:'demo-2',title:'The role of nature in Romantic poetry',body:'How does landscape become more than scenery in Romantic writing?',type:'analysis',book_id:'',replies:12,created_at:'2026-09-15T10:00:00Z'},
  {id:'demo-3',title:'Is Hamlet actually indecisive?',body:'A general reading-room thread for interpretations of Hamlet’s hesitation and action.',type:'general',book_id:'hamlet',replies:42,created_at:'2026-09-14T10:00:00Z'}
]

function escapeHTML(value='') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))
}

function render() {
  const query = search.value.trim().toLowerCase()
  const filtered = discussions.filter(item => {
    const typeMatch = activeFilter === 'all' || item.type === activeFilter
    const text = `${item.title} ${item.body} ${item.book_id || ''}`.toLowerCase()
    return typeMatch && (!query || text.includes(query))
  })
  if (!filtered.length) {
    list.innerHTML = '<article class="empty-state"><b>No discussions found.</b><span>Try another search or start a new thread.</span></article>'
    return
  }
  list.innerHTML = filtered.map(item => `
    <article class="discussion">
      <div>
        <div class="discussion-meta"><span class="discussion-type">${escapeHTML(item.type || 'general')}</span><span>${escapeHTML(item.book_id || 'Library-wide')}</span></div>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.body)}</p>
      </div>
      <div class="reply-count">${Number(item.replies || 0)} REPLIES ↗</div>
    </article>`).join('')
}

async function loadDiscussions() {
  const { data, error } = await supabase.from('discussions').select('*').order('created_at', { ascending:false }).limit(50)
  if (error) {
    console.info('Discussion table is not connected yet. Showing the room preview.', error.message)
    discussions = demo
  } else {
    discussions = data?.length ? data : demo
  }
  render()
}

function openComposer() {
  composer.classList.add('open')
  composer.setAttribute('aria-hidden','false')
  document.querySelector('#title').focus()
}
function closeComposer() {
  composer.classList.remove('open')
  composer.setAttribute('aria-hidden','true')
  form.reset()
  status.textContent = ''
}

document.querySelector('#newDiscussion').addEventListener('click', async () => {
  try {
    const user = await getUser()
    if (!user) {
      window.location.href = '../auth/login.html?next=../community/index.html'
      return
    }
    openComposer()
  } catch (error) {
    status.textContent = 'Please sign in before starting a discussion.'
    openComposer()
  }
})
document.querySelector('#closeComposer').addEventListener('click', closeComposer)
composer.addEventListener('click', event => { if (event.target === composer) closeComposer() })
search.addEventListener('input', render)
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'))
  button.classList.add('active')
  activeFilter = button.dataset.filter
  render()
}))

form.addEventListener('submit', async event => {
  event.preventDefault()
  status.textContent = 'Publishing…'
  try {
    const user = await getUser()
    if (!user) throw new Error('SIGN_IN_REQUIRED')
    const payload = { title:document.querySelector('#title').value.trim(), type:document.querySelector('#type').value, book_id:document.querySelector('#bookId').value.trim() || null, body:document.querySelector('#body').value.trim(), author_id:user.id }
    const { error } = await supabase.from('discussions').insert(payload)
    if (error) throw error
    closeComposer()
    await loadDiscussions()
  } catch (error) {
    status.textContent = error.message === 'SIGN_IN_REQUIRED' ? 'Sign in to publish a discussion.' : 'Could not publish yet. Check the Supabase discussions table.'
  }
})

loadDiscussions()
