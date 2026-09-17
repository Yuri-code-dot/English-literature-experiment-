/*
 * English Literature Library / Experimental Edition
 * Shared UI bootstrap for navigation, status, profile, and footer links.
 */
(function () {
  const SOURCE = 'https://raw.githubusercontent.com/Yuri-code-dot/English-literature-experiment-/61c081167060ef2af548641eaa1a7544bbac5d11/data.js';
  const ORIGINAL_LIBRARY = 'https://english-library-ibs9res1z-yuri-code-dots-projects.vercel.app/';
  // Shared catalogue registry. Content lives separately from the UI so every
  // discipline can plug into the same catalogue and Reading Room engine.
  window.LIBRARY_CATALOGUES = {
    'english-literature': { id: 'english-literature', name: 'English Literature', data: 'books' },
    'history': { id: 'history', name: 'History', data: 'history' },
    'political-science': { id: 'political-science', name: 'Political Science', data: 'politicalScience' },
    'economics': { id: 'economics', name: 'Economics', data: 'economics' },
    'accountancy': { id: 'accountancy', name: 'Accountancy', data: 'accountancy' },
    'physics': { id: 'physics', name: 'Physics', data: 'physics' },
    'chemistry': { id: 'chemistry', name: 'Chemistry', data: 'chemistry' },
    'biology': { id: 'biology', name: 'Biology', data: 'biology' },
    'mathematics': { id: 'mathematics', name: 'Mathematics', data: 'mathematics' },
    'computer-science': { id: 'computer-science', name: 'Computer Science', data: 'computerScience' },
    'programming': { id: 'programming', name: 'Programming', data: 'programming' },
    'ai-ml': { id: 'ai-ml', name: 'AI / Machine Learning', data: 'aiMl' }
  };
  const LAB = 'https://tensoramax.me/Tensoramax-Lab-/';

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', SOURCE, false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) new Function(xhr.responseText)();
    else throw new Error('Catalogue source returned ' + xhr.status);
  } catch (error) {
    console.error('English Literature Library data bootstrap failed:', error);
    window.LIBRARY_DATA = window.LIBRARY_DATA || { books: [] };
  }

  const style = document.createElement('style');
  style.textContent = `
    .experimental-status{display:inline-flex;align-items:center;gap:8px;margin-left:14px;padding:7px 9px;border:1px solid rgba(17,17,15,.22);background:rgba(250,245,232,.58);font:9px var(--mono);letter-spacing:.09em;text-transform:uppercase;white-space:nowrap}
    .experimental-status .status-label{color:var(--red);font-weight:500}.experimental-status .status-version{color:var(--muted)}
    .experimental-status .status-dot{width:6px;height:6px;border-radius:50%;background:var(--red);box-shadow:0 0 0 4px rgba(233,49,29,.08)}
    .library-auth-link{display:inline-flex;align-items:center;justify-content:center;margin-left:auto;margin-right:10px;border:1px solid var(--ink);background:var(--ink);color:var(--paper2);padding:9px 11px;font:9px var(--mono);letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}.library-auth-link:hover{background:var(--red);border-color:var(--red);color:#fff}
    .library-menu-button{position:fixed;left:13px;top:13px;width:38px;height:38px;z-index:101;border:1px solid var(--ink);background:var(--paper2);color:var(--ink);display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 25px rgba(17,17,15,.08)}
    .library-menu-button span,.library-menu-button span:before,.library-menu-button span:after{display:block;width:15px;height:1px;background:currentColor;content:"";transition:.25s}.library-menu-button span:before{transform:translateY(-5px)}.library-menu-button span:after{transform:translateY(4px)}.library-menu-button.open span{background:transparent}.library-menu-button.open span:before{transform:translateY(0) rotate(45deg)}.library-menu-button.open span:after{transform:translateY(-1px) rotate(-45deg)}
    .library-drawer{position:fixed;left:0;top:0;bottom:0;width:min(370px,88vw);z-index:100;background:var(--paper2);border-right:1px solid var(--ink);box-shadow:25px 0 80px rgba(17,17,15,.18);transform:translateX(-105%);transition:transform .38s cubic-bezier(.2,.8,.2,1);padding:88px 28px 30px;display:flex;flex-direction:column}.library-drawer.open{transform:translateX(0)}
    .library-drawer .drawer-kicker{font:9px var(--mono);letter-spacing:.12em;color:var(--red);text-transform:uppercase}.library-drawer h2{font:italic 500 clamp(2.3rem,6vw,4rem) var(--serif);line-height:.9;letter-spacing:-.06em;margin:14px 0 24px}.library-drawer nav{display:grid;gap:0;border-top:1px solid var(--line)}.library-drawer nav a{padding:16px 0;border-bottom:1px solid var(--line);font:10px var(--mono);letter-spacing:.09em;text-transform:uppercase;display:flex;justify-content:space-between;transition:.2s}.library-drawer nav a:hover{color:var(--red);padding-left:7px}.library-drawer .drawer-community{color:var(--red)}.library-patches{border-bottom:1px solid var(--line)}.library-patch-toggle{width:100%;display:flex;justify-content:space-between;align-items:center;padding:16px 0;border:0;background:transparent;color:var(--ink);font:10px var(--mono);letter-spacing:.09em;text-transform:uppercase;cursor:pointer}.library-patch-toggle:hover{color:var(--red)}.library-patch-toggle .patch-arrow{transition:transform .2s}.library-patches.open .patch-arrow{transform:rotate(45deg)}.library-patch-list{display:grid;gap:9px;padding:0 0 14px}.library-patch{display:block;padding:10px 11px;border:1px solid var(--line);background:rgba(238,233,220,.42);transition:.2s}.library-patch:hover{border-color:var(--red);background:rgba(233,49,29,.055);transform:translateX(4px)}.library-patch .patch-title{display:flex;justify-content:space-between;gap:10px;font:9px var(--mono);text-transform:uppercase}.library-patch .patch-date{color:var(--red)}.library-patch .patch-note{display:block;margin-top:5px;color:var(--muted);font:10px/1.45 var(--serif);text-transform:none;letter-spacing:0}.library-patch-list[hidden]{display:none}.library-drawer .drawer-footer{margin-top:auto;border-top:1px solid var(--line);padding-top:17px;font:9px/1.6 var(--mono);color:var(--muted);text-transform:uppercase}
    .library-menu-scrim{position:fixed;inset:0;z-index:90;background:rgba(10,10,9,.3);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:.3s}.library-menu-scrim.open{opacity:1;pointer-events:auto}
    .library-footer-links{display:flex;flex-wrap:wrap;gap:9px;margin-top:14px}.library-footer-links a{display:inline-flex;align-items:center;border:1px solid var(--ink);padding:10px 12px;color:var(--ink);background:transparent;font:9px var(--mono);letter-spacing:.08em;text-transform:uppercase;transition:.2s}.library-footer-links a:hover{background:var(--ink);color:var(--paper2)}.library-footer-links a.lab{border-color:var(--red)}.library-footer-links a.lab:hover{background:var(--red);color:#fff}
    @media(max-width:720px){.top{gap:8px;padding-left:68px}.experimental-status{position:absolute;left:14px;top:67px;margin:0;padding:7px 8px;background:rgba(250,245,232,.92);box-shadow:0 8px 22px rgba(17,17,15,.08)}.library-auth-link{margin-left:auto;margin-right:0;padding:8px 9px;font-size:8px}.mobile-only{display:flex;align-items:center;gap:7px}.rail{display:none}main{margin-left:0}footer{margin-left:0}.library-footer-links a{width:100%;justify-content:center}}
  `;
  document.head.appendChild(style);

  function addMenu() {
    if (document.querySelector('.library-menu-button')) return;
    const scrim = document.createElement('div'); scrim.className = 'library-menu-scrim'; document.body.appendChild(scrim);
    const drawer = document.createElement('aside'); drawer.className = 'library-drawer'; drawer.setAttribute('aria-label','Library navigation');
    drawer.innerHTML = `<div class="drawer-kicker">English Literature Library</div><h2>Read.<br>Think.<br>Discuss.</h2><nav><a href="index.html">Library <span>01</span></a><a href="index.html#catalogue">Catalogue <span>02</span></a><a href="index.html#authors">Authors <span>03</span></a><a href="index.html#timeline">Periods <span>04</span></a><a class="drawer-community" href="community/index.html">Discussion Room <span>↗</span></a><a href="profile/profile.html">Profile <span>↗</span></a></nav><section class="library-patches"><button class="library-patch-toggle" type="button" aria-expanded="false">Patches &amp; Updates <span class="patch-arrow">＋</span></button><div class="library-patch-list" hidden><a class="library-patch" href="https://github.com/Yuri-code-dot/English-literature-experiment-/commit/cc2389cc2d1708012bfdc263939ef495d8c3e43a" target="_blank" rel="noopener"><span class="patch-title"><span>Profile state hardening</span><span class="patch-date">NEW</span></span><span class="patch-note">Loading, timeout, retry, and error handling for the member profile.</span></a><a class="library-patch" href="https://github.com/Yuri-code-dot/English-literature-experiment-/commit/2df3afd99c445305c7ce2f35a077f72bb2e4279e" target="_blank" rel="noopener"><span class="patch-title"><span>Profile feedback layer</span><span class="patch-date">PATCH</span></span><span class="patch-note">Visible loading and error states so failed requests no longer feel silent.</span></a><a class="library-patch" href="https://github.com/Yuri-code-dot/English-literature-experiment-/commit/0b5e894142e7aa709266290d2a892d9e53cc33e3" target="_blank" rel="noopener"><span class="patch-title"><span>Reading engine upgrade</span><span class="patch-date">PATCH</span></span><span class="patch-note">Expanded public-domain loading, retry behavior, poetry handling, and Wikisource support.</span></a></div></section><div class="drawer-footer">Experimental Beta · v0.1<br>Powered by TensoraMax Lab</div>`;
    document.body.appendChild(drawer);
    const patchToggle = drawer.querySelector('.library-patch-toggle');
    const patchList = drawer.querySelector('.library-patch-list');
    patchToggle.addEventListener('click', () => {
      const open = drawer.querySelector('.library-patches').classList.toggle('open');
      patchList.hidden = !open;
      patchToggle.setAttribute('aria-expanded', String(open));
    });
    const button = document.createElement('button'); button.className='library-menu-button'; button.type='button'; button.setAttribute('aria-label','Open library menu'); button.setAttribute('aria-expanded','false'); button.innerHTML='<span></span>'; document.body.appendChild(button);
    function toggle(force){const open=typeof force==='boolean'?force:!drawer.classList.contains('open');drawer.classList.toggle('open',open);scrim.classList.toggle('open',open);button.classList.toggle('open',open);button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close library menu':'Open library menu')}
    button.addEventListener('click',()=>toggle());scrim.addEventListener('click',()=>toggle(false));drawer.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>toggle(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});
  }

  function addStatusAndAuth(){const header=document.querySelector('.top');if(!header)return;if(!header.querySelector('.experimental-status')){const status=document.createElement('div');status.className='experimental-status';status.innerHTML='<span class="status-dot"></span><span class="status-label">EXPERIMENTAL BETA</span><span class="status-version">v0.1</span>';header.appendChild(status)}if(!header.querySelector('.library-auth-link')){const link=document.createElement('a');link.className='library-auth-link';link.href='profile/profile.html';link.textContent='PROFILE ↗';link.setAttribute('aria-label','Open your English Literature Library profile');header.appendChild(link)}}

  function addFooterLinks(){const footer=document.querySelector('footer');if(!footer||footer.querySelector('.library-footer-links'))return;const wrap=document.createElement('div');wrap.className='library-footer-links';wrap.innerHTML=`<a href="${ORIGINAL_LIBRARY}" target="_blank" rel="noopener">OPEN ORIGINAL ENGLISH LITERATURE LIBRARY ↗</a><a class="lab" href="${LAB}" target="_blank" rel="noopener">OPEN TENSORAMAX LAB WEBSITE ↗</a>`;footer.appendChild(wrap)}
  function wireLabLink(){const link=document.querySelector('.original');if(!link)return;link.href=LAB;link.target='_blank';link.rel='noopener';link.textContent='OPEN TENSORAMAX LAB ↗'}
  function boot(){addMenu();addStatusAndAuth();addFooterLinks();wireLabLink();import('./presence.js').catch(error=>console.warn('Library presence unavailable:',error.message))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
