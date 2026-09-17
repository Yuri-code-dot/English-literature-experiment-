/*
 * English Literature Library / Experimental Edition
 *
 * Keep the current visual experiment pinned to its known-good revision,
 * then layer the product-status, profile entry, community navigation, and live presence on top.
 */
(function () {
  const SOURCE = 'https://raw.githubusercontent.com/Yuri-code-dot/English-literature-experiment-/61c081167060ef2af548641eaa1a7544bbac5d11/data.js';

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
  style.setAttribute('data-experimental-status', '');
  style.textContent = `
    .experimental-status{display:inline-flex;align-items:center;gap:8px;margin-left:14px;padding:7px 9px;border:1px solid rgba(17,17,15,.22);background:rgba(250,245,232,.58);font:9px var(--mono);letter-spacing:.09em;text-transform:uppercase;white-space:nowrap}
    .experimental-status .status-label{color:var(--red);font-weight:500}
    .experimental-status .status-version{color:var(--muted)}
    .experimental-status .status-dot{width:6px;height:6px;border-radius:50%;background:var(--red);box-shadow:0 0 0 4px rgba(233,49,29,.08)}
    .library-auth-link{display:inline-flex;align-items:center;justify-content:center;margin-left:auto;margin-right:10px;border:1px solid var(--ink);background:var(--ink);color:var(--paper2);padding:9px 11px;font:9px var(--mono);letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
    .library-auth-link:hover{background:var(--red);border-color:var(--red);color:#fff}
    .library-menu-button{position:fixed;left:13px;top:13px;width:38px;height:38px;z-index:101;border:1px solid var(--ink);background:var(--paper2);color:var(--ink);display:grid;place-items:center;cursor:pointer;box-shadow:0 8px 25px rgba(17,17,15,.08)}
    .library-menu-button span,.library-menu-button span:before,.library-menu-button span:after{display:block;width:15px;height:1px;background:currentColor;content:"";transition:.25s}
    .library-menu-button span:before{transform:translateY(-5px)}.library-menu-button span:after{transform:translateY(4px)}
    .library-menu-button.open span{background:transparent}.library-menu-button.open span:before{transform:translateY(0) rotate(45deg)}.library-menu-button.open span:after{transform:translateY(-1px) rotate(-45deg)}
    .library-drawer{position:fixed;left:0;top:0;bottom:0;width:min(370px,88vw);z-index:100;background:var(--paper2);border-right:1px solid var(--ink);box-shadow:25px 0 80px rgba(17,17,15,.18);transform:translateX(-105%);transition:transform .38s cubic-bezier(.2,.8,.2,1);padding:88px 28px 30px;display:flex;flex-direction:column}
    .library-drawer.open{transform:translateX(0)}
    .library-drawer .drawer-kicker{font:9px var(--mono);letter-spacing:.12em;color:var(--red);text-transform:uppercase}
    .library-drawer h2{font:italic 500 clamp(2.3rem,6vw,4rem) var(--serif);line-height:.9;letter-spacing:-.06em;margin:14px 0 24px}
    .library-drawer nav{display:grid;gap:0;border-top:1px solid var(--line)}
    .library-drawer nav a{padding:16px 0;border-bottom:1px solid var(--line);font:10px var(--mono);letter-spacing:.09em;text-transform:uppercase;display:flex;justify-content:space-between;transition:.2s}
    .library-drawer nav a:hover{color:var(--red);padding-left:7px}
    .library-drawer .drawer-community{color:var(--red)}
    .library-drawer .drawer-footer{margin-top:auto;border-top:1px solid var(--line);padding-top:17px;font:9px/1.6 var(--mono);color:var(--muted);text-transform:uppercase}
    .library-menu-scrim{position:fixed;inset:0;z-index:90;background:rgba(10,10,9,.3);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:.3s}
    .library-menu-scrim.open{opacity:1;pointer-events:auto}
    @media(max-width:720px){
      .top{gap:8px;padding-left:68px}
      .experimental-status{position:absolute;left:14px;top:67px;margin:0;padding:7px 8px;background:rgba(250,245,232,.92);box-shadow:0 8px 22px rgba(17,17,15,.08)}
      .library-auth-link{margin-left:auto;margin-right:0;padding:8px 9px;font-size:8px}
      .mobile-only{display:flex;align-items:center;gap:7px}
      .rail{display:none}main{margin-left:0}footer{margin-left:0}
    }
  `;
  document.head.appendChild(style);

  function addMenu() {
    if (document.querySelector('.library-menu-button')) return;

    const scrim = document.createElement('div');
    scrim.className = 'library-menu-scrim';
    document.body.appendChild(scrim);

    const drawer = document.createElement('aside');
    drawer.className = 'library-drawer';
    drawer.setAttribute('aria-label', 'Library navigation');
    drawer.innerHTML = `
      <div class="drawer-kicker">English Literature Library</div>
      <h2>Read.<br>Think.<br>Discuss.</h2>
      <nav>
        <a href="index.html">Library <span>01</span></a>
        <a href="#catalogue">Catalogue <span>02</span></a>
        <a href="#authors">Authors <span>03</span></a>
        <a href="#timeline">Periods <span>04</span></a>
        <a class="drawer-community" href="community/index.html">Discussion Room <span>↗</span></a>
        <a href="profile/profile.html">Profile <span>↗</span></a>
      </nav>
      <div class="drawer-footer">Experimental Beta · v0.1<br>Powered by TensoraMax Lab</div>
    `;
    document.body.appendChild(drawer);

    const button = document.createElement('button');
    button.className = 'library-menu-button';
    button.type = 'button';
    button.setAttribute('aria-label', 'Open library menu');
    button.setAttribute('aria-expanded', 'false');
    button.innerHTML = '<span></span>';
    document.body.appendChild(button);

    function toggle(force) {
      const open = typeof force === 'boolean' ? force : !drawer.classList.contains('open');
      drawer.classList.toggle('open', open);
      scrim.classList.toggle('open', open);
      button.classList.toggle('open', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close library menu' : 'Open library menu');
    }
    button.addEventListener('click', () => toggle());
    scrim.addEventListener('click', () => toggle(false));
    drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') toggle(false); });
  }

  function addStatusAndAuth() {
    const header = document.querySelector('.top');
    if (!header) return;

    if (!header.querySelector('.experimental-status')) {
      const status = document.createElement('div');
      status.className = 'experimental-status';
      status.setAttribute('aria-label', 'Experimental Beta version 0.1');
      status.innerHTML = '<span class="status-dot"></span><span class="status-label">EXPERIMENTAL BETA</span><span class="status-version">v0.1</span>';
      header.appendChild(status);
    }

    if (!header.querySelector('.library-auth-link')) {
      const link = document.createElement('a');
      link.className = 'library-auth-link';
      link.href = 'profile/profile.html';
      link.textContent = 'PROFILE ↗';
      link.setAttribute('aria-label', 'Open your English Literature Library profile');
      const viewDesktop = header.querySelector('#viewToggleDesktop');
      const viewMobile = header.querySelector('#viewToggle');
      if (viewDesktop) header.insertBefore(link, viewDesktop.parentElement);
      else if (viewMobile) viewMobile.parentElement.insertBefore(link, viewMobile);
      else header.appendChild(link);
    }
  }

  function boot() {
    addMenu();
    addStatusAndAuth();
    import('./presence.js').catch(error => console.warn('Library presence unavailable:', error.message));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
