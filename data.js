/*
 * Experimental visual layer for the English Literature Library.
 * The catalogue stays pinned to the last clean data-only revision.
 * Visual language: Supabase-style generative signal field, rebuilt with
 * TensoraMax Lab / TSC / TENSORA.AI / literature vocabulary.
 */
(function () {
  const SOURCE = 'https://raw.githubusercontent.com/Yuri-code-dot/English-literature-experiment-/31d01f92551465a66b4261e502fa3ee83f6bd468/data.js';

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

  const words = [
    'TENSORAMAX LAB','TSC','TENSORA.AI','TENSORAMAX','OPUS','LIBRARY',
    'ENGLISH','LITERATURE','HUMAN','RESEARCH','ARCHIVE','READ','WRITE',
    'CULTURE','CANON','TEXT','CRITICISM','POETRY','THEATRE','NOVEL',
    'VICTORIAN','ROMANTICISM','MODERNISM','POSTCOLONIAL','DIGITAL HUMANITIES',
    'SHAKESPEARE','SHELLEY','WOOLF','DICKENS','BECKETT','MEMORY','LANGUAGE'
  ];
  const fragments = ['01','07','26','//','::','[]','{}','<>','••','░▒▓','A7','EL/02','LAB','DATA','READ/WRITE'];

  const style = document.createElement('style');
  style.setAttribute('data-supabase-field', '');
  style.textContent = `
    .kinetic-signal{height:250px;margin:38px 0 0;position:relative;overflow:hidden;background:rgba(17,17,15,.025);mask-image:linear-gradient(90deg,transparent,black 4%,black 96%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,black 4%,black 96%,transparent)}
    .signal-grid{display:none!important}
    .supabase-field{position:absolute;inset:0;overflow:hidden;pointer-events:none;font-family:var(--mono)}
    .signal-lane{position:absolute;left:-8%;width:116%;height:18px;display:flex;align-items:center;white-space:nowrap;overflow:visible;opacity:.72}
    .signal-track{display:flex;align-items:center;gap:18px;min-width:max-content;animation:signalDrift var(--speed,18s) linear infinite;animation-delay:var(--delay,0s)}
    .signal-lane.reverse .signal-track{animation-name:signalDriftReverse}
    .signal-word{font:600 10px/1 var(--mono);letter-spacing:.12em;color:rgba(233,49,29,.82);text-transform:uppercase}
    .signal-word.dark{color:rgba(17,17,15,.68)}
    .signal-data{font:9px/1 var(--mono);letter-spacing:.08em;color:rgba(17,17,15,.42)}
    .signal-block{display:inline-block;width:18px;height:9px;background:var(--red);opacity:.82}
    .signal-block.tall{height:16px;width:7px}
    .signal-block.wide{width:46px;height:6px}
    .signal-rule{display:inline-block;width:74px;height:1px;background:rgba(233,49,29,.45)}
    .signal-rule.dark{background:rgba(17,17,15,.28)}
    .signal-column{position:absolute;top:0;width:1px;height:100%;background:linear-gradient(180deg,transparent,rgba(233,49,29,.55),transparent);opacity:.5;animation:columnPulse 9s ease-in-out infinite}
    .signal-column.block{width:5px;background:var(--red);opacity:.2}
    .signal-burst{position:absolute;height:3px;background:var(--red);opacity:0;animation:burst 11s steps(1,end) infinite}
    .signal-label{position:absolute;left:2px;top:-18px;font:8px var(--mono);letter-spacing:.16em;color:rgba(233,49,29,.58);text-transform:uppercase}

    footer{position:relative;min-height:430px;overflow:hidden;align-items:flex-end}
    footer>span{position:relative;z-index:4}
    .footer-field{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none;background:rgba(17,17,15,.018);mask-image:linear-gradient(180deg,transparent 0%,black 8%,black 90%,transparent 100%);-webkit-mask-image:linear-gradient(180deg,transparent 0%,black 8%,black 90%,transparent 100%)}
    .footer-field .signal-lane{height:20px;opacity:.78}
    .footer-field .signal-word{font-size:10px}
    .footer-field .signal-data{font-size:9px}
    .footer-field .signal-block{opacity:.9}
    .footer-field:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(238,233,220,.04),transparent 22%,transparent 78%,rgba(238,233,220,.18));z-index:3}
    @keyframes signalDrift{from{transform:translate3d(-8%,0,0)}to{transform:translate3d(8%,0,0)}}
    @keyframes signalDriftReverse{from{transform:translate3d(8%,0,0)}to{transform:translate3d(-8%,0,0)}}
    @keyframes columnPulse{0%,100%{transform:scaleY(.25);opacity:.18}50%{transform:scaleY(1);opacity:.62}}
    @keyframes burst{0%,72%{opacity:0;transform:scaleX(.15)}75%{opacity:.8;transform:scaleX(1)}79%{opacity:.15;transform:scaleX(.45)}100%{opacity:0}}
    @media(max-width:720px){
      .kinetic-signal{height:205px;margin-top:26px}
      .signal-lane{height:16px}
      .signal-track{gap:12px}
      .signal-word{font-size:8px;letter-spacing:.08em}
      .signal-data{font-size:7px}
      .signal-block{width:13px;height:7px}
      .signal-rule{width:48px}
      footer{min-height:390px}
      .footer-field .signal-lane{height:17px}
    }
    @media(prefers-reduced-motion:reduce){
      .signal-track,.signal-column,.signal-burst{animation:none!important}
      .signal-burst{opacity:.18}
    }
  `;
  document.head.appendChild(style);

  function chunk(seed) {
    const word = words[seed % words.length];
    const fragment = fragments[(seed * 3) % fragments.length];
    const mode = seed % 7;
    if (mode === 0) return `<span class="signal-block"></span>`;
    if (mode === 1) return `<span class="signal-block wide"></span>`;
    if (mode === 2) return `<span class="signal-block tall"></span>`;
    if (mode === 3) return `<span class="signal-data">${fragment}</span>`;
    if (mode === 4) return `<span class="signal-rule"></span>`;
    if (mode === 5) return `<span class="signal-rule dark"></span>`;
    return `<span class="signal-word${seed % 5 === 0 ? ' dark' : ''}">${word}</span>`;
  }

  function makeLane(top, index) {
    const lane = document.createElement('div');
    lane.className = 'signal-lane' + (index % 2 ? ' reverse' : '');
    lane.style.top = top + '%';
    lane.style.setProperty('--speed', (15 + (index % 5) * 2.4) + 's');
    lane.style.setProperty('--delay', (-index * 1.7) + 's');
    const track = document.createElement('div');
    track.className = 'signal-track';
    let html = '';
    for (let i = 0; i < 22; i++) html += chunk(index * 9 + i);
    track.innerHTML = html;
    lane.appendChild(track);
    return lane;
  }

  function makeField(host, footerMode) {
    if (!host) return;
    const field = document.createElement('div');
    field.className = footerMode ? 'footer-field' : 'supabase-field';
    field.setAttribute('aria-hidden', 'true');

    if (!footerMode) {
      const label = document.createElement('div');
      label.className = 'signal-label';
      label.textContent = 'TENSORAMAX LAB / GENERATIVE LITERATURE SIGNAL';
      field.appendChild(label);
    }

    const laneCount = footerMode ? 14 : 9;
    for (let i = 0; i < laneCount; i++) field.appendChild(makeLane(7 + i * (footerMode ? 6.6 : 10.7), i + (footerMode ? 3 : 0)));

    const cols = footerMode ? 22 : 12;
    for (let i = 0; i < cols; i++) {
      const column = document.createElement('i');
      column.className = 'signal-column' + (i % 5 === 0 ? ' block' : '');
      column.style.left = (4 + i * (92 / (cols - 1))) + '%';
      column.style.animationDelay = (-i * .55) + 's';
      field.appendChild(column);
    }

    const bursts = footerMode ? 10 : 5;
    for (let i = 0; i < bursts; i++) {
      const burst = document.createElement('i');
      burst.className = 'signal-burst';
      burst.style.left = (8 + ((i * 17) % 78)) + '%';
      burst.style.top = (12 + ((i * 23) % 74)) + '%';
      burst.style.width = (18 + ((i * 11) % 38)) + 'px';
      burst.style.animationDelay = (-i * 1.9) + 's';
      field.appendChild(burst);
    }
    host.appendChild(field);
  }

  function init() {
    const hero = document.getElementById('signalGrid')?.parentElement;
    if (hero) {
      hero.innerHTML = '';
      makeField(hero, false);
    }
    const footer = document.querySelector('footer');
    if (footer) {
      footer.querySelectorAll('.footer-field').forEach(el => el.remove());
      makeField(footer, true);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
