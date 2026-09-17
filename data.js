/*
 * English Literature Library / Experimental Edition
 *
 * Keep the current visual experiment pinned to its known-good revision,
 * then layer the product-status and authentication entry on top.
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
    @media(max-width:720px){
      .top{gap:8px}
      .experimental-status{position:absolute;left:14px;top:67px;margin:0;padding:7px 8px;background:rgba(250,245,232,.92);box-shadow:0 8px 22px rgba(17,17,15,.08)}
      .library-auth-link{margin-left:auto;margin-right:0;padding:8px 9px;font-size:8px}
      .mobile-only{display:flex;align-items:center;gap:7px}
    }
  `;
  document.head.appendChild(style);

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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addStatusAndAuth, { once: true });
  else addStatusAndAuth();
})();
