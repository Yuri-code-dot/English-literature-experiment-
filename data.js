/* Experimental network visual loader.
   The catalogue source is pinned to the last data-only revision so this file can
   carry the visual experiment without duplicating the 33-work dataset. */
(function () {
  const SOURCE = 'https://raw.githubusercontent.com/Yuri-code-dot/English-literature-experiment-/31d01f92551465a66b4261e502fa3ee83f6bd468/data.js';

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', SOURCE, false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) {
      new Function(xhr.responseText)();
    } else {
      throw new Error('Catalogue source returned ' + xhr.status);
    }
  } catch (error) {
    console.error('English Literature Library data bootstrap failed:', error);
    window.LIBRARY_DATA = window.LIBRARY_DATA || { books: [] };
  }

  if (!document.querySelector('style[data-tensor-network]')) {
    const style = document.createElement('style');
    style.setAttribute('data-tensor-network', '');
    style.textContent = `
      .kinetic-signal{height:260px;margin:42px 0 0;position:relative;overflow:hidden;mask-image:linear-gradient(90deg,transparent,black 4%,black 96%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,black 4%,black 96%,transparent)}
      .signal-grid{display:none!important}
      .tensor-network{position:absolute;inset:0;width:100%;height:100%;display:block;overflow:visible}
      .tensor-network .network-bg{fill:rgba(233,49,29,.018)}
      .tensor-network .network-grid{stroke:rgba(17,17,15,.10);stroke-width:1}
      .tensor-network .edge{fill:none;stroke:rgba(233,49,29,.36);stroke-width:1.25;vector-effect:non-scaling-stroke}
      .tensor-network .edge.strong{stroke:rgba(233,49,29,.72);stroke-width:1.8}
      .tensor-network .edge.dim{stroke:rgba(17,17,15,.20);stroke-dasharray:3 8}
      .tensor-network .packet{fill:var(--red);filter:drop-shadow(0 0 5px rgba(233,49,29,.42))}
      .tensor-network .node rect{fill:rgba(250,245,232,.92);stroke:rgba(233,49,29,.48);stroke-width:1.2;vector-effect:non-scaling-stroke}
      .tensor-network .node.primary rect{fill:var(--dark);stroke:var(--red);stroke-width:1.6}
      .tensor-network .node.active rect{fill:var(--red);stroke:var(--red)}
      .tensor-network .node text{font:600 11px var(--mono);letter-spacing:.08em;fill:var(--ink);text-anchor:middle;dominant-baseline:middle}
      .tensor-network .node.primary text{fill:var(--paper2)}
      .tensor-network .node.active text{fill:#fff}
      .tensor-network .node .port{fill:var(--red)}
      .tensor-network .node.primary .port{fill:var(--paper2)}
      .tensor-network .node .pulse-ring{fill:none;stroke:var(--red);stroke-width:1;opacity:0;transform-box:fill-box;transform-origin:center;animation:networkPulse 4.8s ease-out infinite}
      .tensor-network .node:nth-of-type(3) .pulse-ring{animation-delay:1.2s}
      .tensor-network .node:nth-of-type(5) .pulse-ring{animation-delay:2.4s}
      .tensor-network .node:nth-of-type(8) .pulse-ring{animation-delay:3.1s}
      .network-caption{position:absolute;left:0;top:-22px;font:9px var(--mono);letter-spacing:.14em;text-transform:uppercase;color:rgba(233,49,29,.7)}
      .footer-network{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none}
      .footer-network svg{width:100%;height:100%;display:block}
      footer>span{position:relative;z-index:3}
      footer{position:relative;min-height:390px;overflow:hidden;align-items:flex-end}
      footer:after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(238,233,220,.06),transparent 18%,transparent 82%,rgba(238,233,220,.18))}
      @keyframes networkPulse{0%{opacity:0;transform:scale(.65)}12%{opacity:.85}55%{opacity:0;transform:scale(1.8)}100%{opacity:0;transform:scale(1.8)}}
      @media(max-width:720px){
        .kinetic-signal{height:205px;margin-top:28px}
        .tensor-network .node text{font-size:8px;letter-spacing:.045em}
        .tensor-network .edge{stroke-width:1}
        .network-caption{top:-17px;font-size:8px}
        footer{min-height:430px}
      }
      @media(prefers-reduced-motion:reduce){
        .tensor-network .packet,.tensor-network .pulse-ring{animation:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function pathFor(a, b, bend) {
    const mx = (a.x + b.x) / 2;
    return `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
  }

  function makeNetwork(host, footerMode) {
    if (!host) return;
    host.querySelectorAll('.tensor-network,.network-caption').forEach(n => n.remove());

    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.classList.add('tensor-network');
    svg.setAttribute('viewBox', footerMode ? '0 0 1200 430' : '0 0 1200 300');
    svg.setAttribute('preserveAspectRatio','none');
    svg.setAttribute('aria-hidden','true');

    const width = 1200;
    const height = footerMode ? 430 : 300;
    const nodes = footerMode ? [
      {x:150,y:95,w:150,h:38,label:'TENSORAMAX LAB',primary:true},
      {x:430,y:55,w:100,h:34,label:'TSC',primary:true},
      {x:650,y:105,w:135,h:36,label:'TENSORA.AI',primary:true,active:true},
      {x:930,y:62,w:120,h:34,label:'TENSORAMAX',primary:true},
      {x:305,y:205,w:105,h:32,label:'OPUS',primary:true},
      {x:525,y:180,w:105,h:30,label:'RESEARCH'},
      {x:770,y:215,w:105,h:30,label:'ARCHIVE'},
      {x:1010,y:190,w:105,h:30,label:'LIBRARY'},
      {x:170,y:315,w:100,h:30,label:'ENGLISH'},
      {x:390,y:340,w:125,h:30,label:'LITERATURE'},
      {x:650,y:325,w:110,h:30,label:'HUMAN'},
      {x:850,y:345,w:125,h:30,label:'VICTORIAN'},
      {x:1080,y:310,w:125,h:30,label:'ROMANTICISM'},
      {x:920,y:275,w:165,h:30,label:'DIGITAL HUMANITIES'}
    ] : [
      {x:105,y:92,w:150,h:38,label:'TENSORAMAX LAB',primary:true},
      {x:350,y:52,w:86,h:32,label:'TSC',primary:true},
      {x:555,y:102,w:125,h:34,label:'TENSORA.AI',primary:true,active:true},
      {x:790,y:54,w:112,h:32,label:'TENSORAMAX',primary:true},
      {x:960,y:120,w:82,h:30,label:'OPUS',primary:true},
      {x:280,y:180,w:98,h:30,label:'ENGLISH'},
      {x:465,y:205,w:105,h:30,label:'LITERATURE'},
      {x:680,y:175,w:90,h:30,label:'LIBRARY'},
      {x:865,y:210,w:98,h:30,label:'RESEARCH'},
      {x:1080,y:172,w:95,h:30,label:'ARCHIVE'},
      {x:160,y:258,w:105,h:28,label:'VICTORIAN'},
      {x:375,y:262,w:112,h:28,label:'ROMANTICISM'},
      {x:625,y:250,w:135,h:28,label:'DIGITAL HUMANITIES'},
      {x:885,y:270,w:80,h:28,label:'HUMAN'}
    ];

    const edges = [
      [0,1,0],[1,2,0],[2,3,0],[2,4,8],[0,5,-8],[5,6,5],[6,7,-7],
      [7,8,8],[8,9,-8],[5,10,5],[6,11,-6],[7,12,7],[8,13,-5],
      [1,5,4],[2,6,-3],[3,8,4],[4,9,-6],[10,11,5],[11,12,-4],
      [12,13,6]
    ];

    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    const filter = document.createElementNS('http://www.w3.org/2000/svg','filter');
    filter.setAttribute('id','networkGlow');
    filter.innerHTML = '<feGaussianBlur stdDeviation="2.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>';
    defs.appendChild(filter);
    svg.appendChild(defs);

    const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
    bg.setAttribute('class','network-bg'); bg.setAttribute('x','0'); bg.setAttribute('y','0'); bg.setAttribute('width',width); bg.setAttribute('height',height); svg.appendChild(bg);

    for(let x=0;x<=width;x+=60){
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('class','network-grid');line.setAttribute('x1',x);line.setAttribute('y1',0);line.setAttribute('x2',x);line.setAttribute('y2',height);svg.appendChild(line);
    }
    for(let y=0;y<=height;y+=50){
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('class','network-grid');line.setAttribute('x1',0);line.setAttribute('y1',y);line.setAttribute('x2',width);line.setAttribute('y2',y);svg.appendChild(line);
    }

    edges.forEach((edge,index)=>{
      const a=nodes[edge[0]], b=nodes[edge[1]];
      const from={x:a.x+a.w/2,y:a.y+a.h/2}, to={x:b.x-b.w/2,y:b.y+b.h/2};
      const d=pathFor(from,to,edge[2]);
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('class','edge'+(index<8?' strong':'')+(index>15?' dim':''));
      path.setAttribute('d',d);
      svg.appendChild(path);
      if(index % 2 === 0){
        const packet=document.createElementNS('http://www.w3.org/2000/svg','circle');
        packet.setAttribute('class','packet');
        packet.setAttribute('r',index<6?'3':'2');
        const motion=document.createElementNS('http://www.w3.org/2000/svg','animateMotion');
        motion.setAttribute('dur',`${5.5 + (index%5)*1.3}s`);
        motion.setAttribute('begin',`${(index%7)*.55}s`);
        motion.setAttribute('repeatCount','indefinite');
        motion.setAttribute('path',d);
        packet.appendChild(motion);
        svg.appendChild(packet);
      }
    });

    nodes.forEach(node=>{
      const g=document.createElementNS('http://www.w3.org/2000/svg','g');
      g.classList.add('node');
      if(node.primary)g.classList.add('primary');
      if(node.active)g.classList.add('active');
      g.setAttribute('transform',`translate(${node.x-node.w/2},${node.y-node.h/2})`);
      const rect=document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('width',node.w);rect.setAttribute('height',node.h);rect.setAttribute('rx','2');
      g.appendChild(rect);
      const text=document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x',node.w/2);text.setAttribute('y',node.h/2+1);text.textContent=node.label;
      g.appendChild(text);
      const port=document.createElementNS('http://www.w3.org/2000/svg','circle');
      port.classList.add('port');port.setAttribute('cx',node.w);port.setAttribute('cy',node.h/2);port.setAttribute('r','2');
      g.appendChild(port);
      if(node.primary){
        const ring=document.createElementNS('http://www.w3.org/2000/svg','circle');
        ring.classList.add('pulse-ring');ring.setAttribute('cx',node.w/2);ring.setAttribute('cy',node.h/2);ring.setAttribute('r',Math.max(node.w,node.h)*.35);
        g.appendChild(ring);
      }
      svg.appendChild(g);
    });

    host.appendChild(svg);
  }

  function init() {
    const hero = document.getElementById('signalGrid')?.parentElement;
    if (hero) {
      hero.innerHTML = '<span class="network-caption">TENSORAMAX LAB / KNOWLEDGE NETWORK</span>';
      makeNetwork(hero,false);
    }
    const footer = document.querySelector('footer');
    if (footer && !footer.querySelector('.footer-network')) {
      const layer=document.createElement('div');
      layer.className='footer-network';
      footer.prepend(layer);
      makeNetwork(layer,true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();