const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Language ----------
// Translated page text is a pair of <span lang="en|es"> (the CSS shows one). STR covers the text this script writes itself.
// ponytail: two languages hard-wired as [en, es] pairs; a third would need a lookup by language code.
let lang = root.dataset.lang === 'es' ? 'es' : 'en';
const pick = ([en, es]) => (lang === 'es' ? es : en);
const pair = (en, es) => `<span lang="en">${en}</span><span lang="es">${es}</span>`;
const STR = {
    siteTitle: ['NFPerera · Game & Software Developer', 'NFPerera · Desarrollador de videojuegos y software'],
    opened: [title => `Opened ${title}`, title => `Abierto: ${title}`],
    loaded: ["Editor loaded. Type 'help' in the console or pick something from the Hierarchy.", "Editor cargado. Escribe 'help' en la consola o elige algo de la Jerarquía."],
    tip: ['Tip: some old-school cheat codes still work around here.', 'Consejo: por aquí todavía funcionan algunos trucos de la vieja escuela.'],
    langSet: ['Language set to English.', 'Idioma configurado: español.'],
    langSwitch: ['Switch to Spanish', 'Cambiar a inglés'],
    themeDay: ['☀ Day', '☀ Día'],
    themeNight: ['☾ Night', '☾ Noche'],
    lighting: [theme => `Lighting set to ${theme}.`, theme => `Iluminación: ${theme === 'day' ? 'día' : 'noche'}.`],
    playOn: ['Entering play mode... no game in this scene. Maybe try an old cheat code?', 'Entrando en modo Play... no hay ningún juego en esta escena. ¿Y si pruebas un truco clásico?'],
    playOff: ['Exited play mode.', 'Saliste del modo Play.'],
    help: ['Commands: help, ls, open <name|number>, theme, clear, contact', 'Comandos: help, ls, open <nombre|número>, theme, clear, contact'],
    usage: ['Usage: open <name|number>', 'Uso: open <nombre|número>'],
    nothing: [q => `Nothing called '${q}'. Try 'ls'.`, q => `No hay nada llamado '${q}'. Prueba con 'ls'.`],
    unknown: [c => `Unknown command '${c}'. Type 'help'.`, c => `Comando desconocido '${c}'. Escribe 'help'.`],
    emailHint: ['Click to copy', 'Haz clic para copiar'],
    emailCopied: ['Copied to clipboard!', '¡Copiado al portapapeles!'],
    emailLog: ['Email copied to clipboard.', 'Correo copiado al portapapeles.'],
    konami: ['Cheat code accepted: monarch migration unlocked 🦋', 'Truco aceptado: migración de monarcas desbloqueada 🦋'],
    neuroReset: ['Neuroevolution demo reset to generation 1.', 'Demo de neuroevolución reiniciada en la generación 1.'],
    phrases: [['Software Developer', 'Gameplay Programmer', 'Unity Expert'], ['Desarrollador de software', 'Programador de gameplay', 'Experto en Unity']],
    unaware: ['Unaware', 'Desprevenido'],
    suspicious: ['Suspicious...', 'Sospechoso...'],
    aware: ['Aware!', '¡Alerta!'],
    drop: ['drop', 'caída'],
    drift: ['wind drift', 'deriva por viento'],
    clicks: ['clicks', 'clics'],
    agroPoint: ['Point at a lot', 'Apunta a un lote'],
    agroBare: ['bare soil', 'suelo desnudo'],
    agroLot: [(id, ha, ip, what) => `Lot ${id} · ${ha} ha · IP ${ip} · ${what}`, (id, ha, ip, what) => `Lote ${id} · ${ha} ha · IP ${ip} · ${what}`],
    cmStock: ['Pick a cable from the stock', 'Elige un cable del stock'],
    cmPick: ['Click a cable end to pick it up', 'Haz clic en la punta de un cable para tomarla'],
    cmHeld: ['Click a clip to hang it, a port to plug it, or the floor to drop it', 'Clic en un clip para colgarlo, en un puerto para enchufarlo o en el piso para soltarlo'],
    cmShort: [gap => gap ? `Too short, ${num(gap)} m missing` : 'Too short', gap => gap ? `No alcanza, faltan ${num(gap)} m` : 'No alcanza'],
    cmWrong: ['Wrong connector', 'Conector incorrecto'],
    cmBusy: ['Already taken', 'Ya está ocupado'],
    cmWin: ['ALL PERFECT, VICTORY', 'TODO PERFECTO, VICTORIA'],
    cmErr: [id => `ERROR AT CONNECTOR ${id}`, id => `ERROR EN CONECTOR ${id}`],
    cmTidy: ['Tidy seal: the long cables hang from clips', 'Sello prolijo: los cables largos van colgados de clips'],
    cmMess: ['No tidy seal: hang the long cables from clips', 'Sin sello prolijo: cuelga los cables largos de clips'],
    cmCable: [len => `Cable ${num(len)} m`, len => `Cable ${num(len)} m`],
};
const t = (key, ...args) => {
    const v = pick(STR[key]);
    return typeof v === 'function' ? v(...args) : v;
};
const num = x => String(Math.round(x * 10) / 10).replace('.', lang === 'es' ? ',' : '.');

// ---------- Console ----------
const consoleLog = document.getElementById('console-log');
const consoleToggle = document.getElementById('console-toggle');
const consoleLast = document.getElementById('console-last');

function log(message, type = '') {
    const li = document.createElement('li');
    li.className = type;
    li.dataset.time = new Date().toLocaleTimeString([], { hour12: false });
    li.textContent = message;
    consoleLog.append(li);
    consoleLog.scrollTop = consoleLog.scrollHeight;
    consoleLast.textContent = message;
}

function setConsoleOpen(open) {
    document.body.classList.toggle('console-open', open);
    consoleToggle.setAttribute('aria-expanded', open);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

consoleToggle.addEventListener('click', () => setConsoleOpen(!document.body.classList.contains('console-open')));

// ---------- Build Hierarchy, asset grid and prev/next from the project articles ----------
const views = [...document.querySelectorAll('.view')];
const projects = views.filter(v => v.classList.contains('project'));
const accentOf = el => [...el.classList].find(c => c.startsWith('accent-')) || '';
const folders = { game: ['Games', 'Juegos'], tool: ['Tools', 'Herramientas'], ai: ['AI', 'IA'], sim: ['Simulation', 'Simulación'] };
// Project names are proper nouns; the page titles and project kinds carry a data-*-es twin
const titleOf = v => (lang === 'es' && v.dataset.titleEs) || v.dataset.title;
const kindOf = p => (lang === 'es' && p.dataset.kindEs) || p.dataset.kind;

const treeProjects = document.getElementById('tree-projects');
Object.entries(folders).forEach(([category, label]) => {
    const items = projects.filter(p => p.dataset.category === category);
    if (!items.length) return;
    const li = document.createElement('li');
    li.innerHTML = `<details open><summary>${pair(...label)}</summary><ul></ul></details>`;
    items.forEach(p => {
        li.querySelector('ul').insertAdjacentHTML('beforeend',
            `<li><a href="#/${p.dataset.route}" class="${accentOf(p)}">${p.dataset.title}</a></li>`);
    });
    treeProjects.append(li);
});

const assetGrid = document.getElementById('asset-grid');
projects.forEach((p, i) => {
    // Thumbnail: the banner screenshot if there is one, else the line-art icon, else initials
    const shot = p.querySelector('.banner-media');
    const icon = p.querySelector('template.asset-icon');
    const initials = p.dataset.title.split(' ').map(w => w[0]).join('').slice(0, 2);
    const thumb = shot ? `<img src="${shot.getAttribute('src')}" alt="" loading="lazy">` : icon ? icon.innerHTML : initials;
    assetGrid.insertAdjacentHTML('beforeend',
        `<a class="asset ${accentOf(p)}" href="#/${p.dataset.route}">
            <span class="asset-icon">${thumb}</span>
            <span class="asset-name">${p.dataset.title}</span>
            <span class="asset-kind">${pair(p.dataset.kind, p.dataset.kindEs || p.dataset.kind)}</span>
        </a>`);

    const prev = projects[(i - 1 + projects.length) % projects.length];
    const next = projects[(i + 1) % projects.length];
    p.querySelector('.pager').innerHTML =
        `<a href="#/${prev.dataset.route}" class="prev"><small>${pair('← Previous', '← Anterior')}</small>${prev.dataset.title}</a>
         <a href="#/${next.dataset.route}" class="next"><small>${pair('Next →', 'Siguiente →')}</small>${next.dataset.title}</a>`;
});

// ---------- Router: "#/route" shows the matching .view ----------
const hierLinks = document.querySelectorAll('#hierarchy a');
const sceneBody = document.getElementById('scene-body');
const sceneTab = document.getElementById('scene-tab');
const inspectorBody = document.getElementById('inspector-body');
const defaultInspector = document.getElementById('inspector-default');
const demos = { fsm: fsmDemo, perception: perceptionDemo, neuro: neuroDemo, ballistics: ballisticsDemo, agro: agroDemo, cablemess: cableMessDemo };
let firstRoute = true;
let currentView;

function showTitles() {
    const title = titleOf(currentView);
    sceneTab.textContent = title;
    document.title = currentView.dataset.route ? `${title} · NFPerera` : t('siteTitle');
}

function route() {
    const path = location.hash.replace(/^#\/?/, '');
    const view = views.find(v => v.dataset.route === path) || views[0];
    currentView = view;

    views.forEach(v => { v.hidden = v !== view; });
    hierLinks.forEach(a => a.classList.toggle('is-selected', a.getAttribute('href') === '#/' + view.dataset.route));
    const inspector = view.querySelector('template.inspector') || defaultInspector;
    inspectorBody.replaceChildren(inspector.content.cloneNode(true));
    showTitles();

    sceneBody.scrollTop = 0;
    if (!firstRoute) window.scrollTo(0, 0);
    closeDrawers();
    view.querySelectorAll('[data-demo]').forEach(el => demos[el.dataset.demo](el));
    if (!firstRoute) log(t('opened', titleOf(view)));
    firstRoute = false;
}

window.addEventListener('hashchange', route);

// ---------- Inspector | Share tabs ----------
const inspectorTabs = document.querySelectorAll('#inspector [role="tab"]');
inspectorTabs.forEach(tab => tab.addEventListener('click', () => inspectorTabs.forEach(other => {
    other.setAttribute('aria-selected', other === tab);
    document.getElementById(other.getAttribute('aria-controls')).hidden = other !== tab;
})));

// ---------- Mobile drawers: Hierarchy on the left, Inspector / Share on the right (one open at a time) ----------
const drawers = { 'hier-open': document.getElementById('hier-toggle'), 'insp-open': document.getElementById('insp-toggle') };

function closeDrawers() {
    Object.entries(drawers).forEach(([cls, btn]) => {
        document.body.classList.remove(cls);
        btn.setAttribute('aria-expanded', 'false');
    });
}

Object.entries(drawers).forEach(([cls, btn]) => btn.addEventListener('click', () => {
    const open = !document.body.classList.contains(cls);
    closeDrawers();
    document.body.classList.toggle(cls, open);
    btn.setAttribute('aria-expanded', open);
}));

// Tapping outside the open drawer (on its scrim) or pressing Escape closes it
document.addEventListener('click', e => {
    if (document.body.matches('.hier-open, .insp-open') && !e.target.closest('#hierarchy, #inspector, #hier-toggle, #insp-toggle')) closeDrawers();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawers(); });

// ---------- Day / night theme ----------
const themeBtn = document.getElementById('theme-toggle');
const currentTheme = () => root.dataset.theme ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night');
const updateThemeBtn = () => { themeBtn.textContent = t(currentTheme() === 'day' ? 'themeDay' : 'themeNight'); };

themeBtn.addEventListener('click', () => {
    root.dataset.theme = currentTheme() === 'day' ? 'night' : 'day';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    updateThemeBtn();
    log(t('lighting', root.dataset.theme));
});

// ---------- English / Spanish toggle ----------
// A saved choice wins, otherwise the <head> script picked the browser's language; only a click is saved.
const langBtn = document.getElementById('lang-toggle');
const LANG_ATTRS = ['aria-label', 'placeholder', 'content', 'alt']; // attributes with a data-es-* twin

function applyLang() {
    root.dataset.lang = lang;
    root.lang = lang;
    LANG_ATTRS.forEach(attr => document.querySelectorAll(`[data-es-${attr}]`).forEach(el => {
        if (!el.hasAttribute(`data-en-${attr}`)) el.setAttribute(`data-en-${attr}`, el.getAttribute(attr));
        el.setAttribute(attr, el.getAttribute(`data-${lang}-${attr}`));
    }));
    document.querySelectorAll('option[data-es]').forEach(o => { // <option> can't hold the span pairs
        o.dataset.en = o.dataset.en || o.textContent;
        o.textContent = o.dataset[lang];
    });
    langBtn.setAttribute('aria-label', t('langSwitch'));
    langBtn.title = t('langSwitch');
    updateThemeBtn();
    showTitles();
    emailStatus.textContent = t('emailHint');
    resetTyping();
    window.dispatchEvent(new Event('langchange')); // demos that draw their own text redraw it
}

langBtn.addEventListener('click', () => {
    lang = lang === 'es' ? 'en' : 'es';
    try { localStorage.setItem('lang', lang); } catch (e) {}
    applyLang();
    log(t('langSet'));
});

// ---------- Play button ----------
const playBtn = document.getElementById('play-btn');

playBtn.addEventListener('click', () => {
    const playing = document.body.classList.toggle('play-mode');
    playBtn.setAttribute('aria-pressed', playing);
    log(t(playing ? 'playOn' : 'playOff'), playing ? 'warn' : '');
});

// ---------- Console commands ----------
const consoleForm = document.getElementById('console-form');
const consoleInput = document.getElementById('console-input');

function openView(query) {
    const q = query.toLowerCase();
    const view = projects[Number(q) - 1] ||
        views.find(v => v.dataset.title.toLowerCase().includes(q) || (v.dataset.titleEs || '').toLowerCase().includes(q) ||
            (q && v.dataset.route.includes(q)));
    if (view) location.hash = '#/' + view.dataset.route;
    else log(t('nothing', query), 'warn');
}

const commands = {
    help: () => log(t('help')),
    ls: () => projects.forEach((p, i) => log(`${i + 1}. ${p.dataset.title} (${kindOf(p)})`)),
    open: arg => arg ? openView(arg) : log(t('usage'), 'warn'),
    theme: () => themeBtn.click(),
    clear: () => consoleLog.replaceChildren(),
    contact: () => { location.hash = '#/contact'; },
};

consoleForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = consoleInput.value.trim();
    consoleInput.value = '';
    if (!input) return;
    setConsoleOpen(true);
    log('> ' + input, 'cmd');
    const [cmd, ...args] = input.split(/\s+/);
    const run = commands[cmd.toLowerCase()];
    if (run) run(args.join(' '));
    else log(t('unknown', cmd), 'warn');
});

// ---------- Typewriter ----------
const typingText = document.getElementById('typing-text');
let phraseIndex = 0;
let charIndex = t('phrases')[0].length;
let isDeleting = true;

function resetTyping() { // a language change restarts the loop on the new language's first phrase
    phraseIndex = 0;
    charIndex = t('phrases')[0].length;
    isDeleting = true;
    typingText.textContent = t('phrases')[0];
}

function type() {
    const phrases = t('phrases');
    const currentPhrase = phrases[phraseIndex];
    charIndex += isDeleting ? -1 : 1;
    typingText.textContent = currentPhrase.substring(0, charIndex);

    let delay = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        delay = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 500;
    }
    setTimeout(type, delay);
}

// ---------- Click-to-copy email ----------
const emailBtn = document.getElementById('email-btn');
const emailStatus = document.getElementById('email-status');

emailBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailBtn.dataset.email)
        .then(() => {
            emailStatus.textContent = t('emailCopied');
            log(t('emailLog'), 'success');
        })
        .catch(() => { location.href = 'mailto:' + emailBtn.dataset.email; });
    setTimeout(() => { emailStatus.textContent = t('emailHint'); }, 2000);
});

// ---------- Gallery lightbox (only kicks in once real images are added) ----------
const lightbox = document.createElement('dialog');
lightbox.className = 'lightbox';
lightbox.innerHTML = '<img alt="">';
lightbox.addEventListener('click', () => lightbox.close());
document.body.append(lightbox);

sceneBody.addEventListener('click', e => {
    const img = e.target.closest('.gallery img');
    if (!img) return;
    lightbox.querySelector('img').src = img.src;
    lightbox.querySelector('img').alt = img.alt;
    lightbox.showModal();
});

// ---------- Konami code: ↑ ↑ ↓ ↓ ← → ← → B A ----------
const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiStep = 0;

document.addEventListener('keydown', e => {
    if (e.target.matches('input')) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    konamiStep = key === konami[konamiStep] ? konamiStep + 1 : (key === konami[0] ? 1 : 0);
    if (konamiStep === konami.length) {
        konamiStep = 0;
        monarchMigration();
    }
});

function monarchMigration() {
    log(t('konami'), 'success');
    for (let i = 0; i < 24; i++) {
        const b = document.createElement('span');
        b.className = 'butterfly';
        b.textContent = '🦋';
        b.style.left = Math.random() * 100 + 'vw';
        b.style.animationDelay = Math.random() * 1.5 + 's';
        b.style.setProperty('--drift', (Math.random() * 40 - 20) + 'vw');
        document.body.append(b);
        setTimeout(() => b.remove(), 5500);
    }
}

// ---------- Demo helpers ----------
function svgPoint(svg, e) {
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
}

// FSM demo: draggable nodes connected by bezier curves, random transitions over time
function fsmDemo(svg) {
    if (svg.dataset.ready) return;
    svg.dataset.ready = 'true';

    const W = 120, H = 44;
    const nodes = {};
    svg.querySelectorAll('.node').forEach(g => { nodes[g.dataset.id] = g; });
    // Phones get a narrower canvas so the states stay readable instead of shrinking to fit
    if (svg.clientWidth < 500) {
        svg.setAttribute('viewBox', '0 0 400 320');
        Object.values(nodes).forEach(g => { [g.dataset.x, g.dataset.y] = g.dataset.m.split(' '); });
    }
    const { width: vbW, height: vbH } = svg.viewBox.baseVal;
    const edges = [...svg.querySelectorAll('.edge')].map(path => ({ path, from: path.dataset.from, to: path.dataset.to }));
    const pos = id => ({ x: +nodes[id].dataset.x, y: +nodes[id].dataset.y });

    function draw() {
        Object.values(nodes).forEach(g => g.setAttribute('transform', `translate(${g.dataset.x} ${g.dataset.y})`));
        edges.forEach(({ path, from, to }) => {
            // Leave from the side facing the target so backward edges don't loop around
            const a = pos(from), b = pos(to);
            const dir = b.x >= a.x ? 1 : -1;
            const x1 = dir > 0 ? a.x + W : a.x, x2 = dir > 0 ? b.x : b.x + W;
            const y1 = a.y + H / 2, y2 = b.y + H / 2;
            const dx = dir * Math.max(50, Math.abs(x2 - x1) / 2);
            path.setAttribute('d', `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`);
        });
    }

    let drag = null;
    svg.addEventListener('pointerdown', e => {
        const g = e.target.closest('.node');
        if (!g) return;
        const p = svgPoint(svg, e);
        drag = { g, dx: p.x - g.dataset.x, dy: p.y - g.dataset.y };
        g.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove', e => {
        if (!drag) return;
        const p = svgPoint(svg, e);
        drag.g.dataset.x = Math.min(Math.max(p.x - drag.dx, 0), vbW - W);
        drag.g.dataset.y = Math.min(Math.max(p.y - drag.dy, 0), vbH - H);
        draw();
    });
    svg.addEventListener('pointerup', () => { drag = null; });
    svg.addEventListener('pointercancel', () => { drag = null; });

    let current = 'idle';
    function setActive(edge) {
        Object.values(nodes).forEach(g => g.classList.toggle('active', g.dataset.id === current));
        edges.forEach(e => e.path.classList.toggle('active', e === edge));
    }

    draw();
    setActive(null);
    if (reducedMotion) return;
    setInterval(() => {
        if (drag || svg.closest('[hidden]')) return;
        const options = edges.filter(e => e.from === current);
        const edge = options[Math.floor(Math.random() * options.length)];
        current = edge.to;
        setActive(edge);
    }, 1800);
}

// Perception demo: the pointer is the player. Mirrors the toolkit's detection tick:
// found -> confirm timer fills (Suspicious) until Aware; lost -> lose timer back to Unaware.
function perceptionDemo(svg) {
    if (svg.startDemo) return svg.startDemo();

    const agent = { x: 320, y: 170 };
    const RANGE = 230, HALF_ANGLE = Math.PI / 6, INNER = 45, HEARING = 130;
    const DETECTION_TIME = 0.8, LOSE_TIME = 1.2, MIN_AUDIBLE = 0.15, INSTANT_LOUDNESS = 0.85;
    const cone = svg.querySelector('.cone');
    const player = svg.querySelector('.player');
    const root = svg.closest('.demo');
    const status = root.querySelector('.demo-status');
    const meter = root.querySelector('.meter span');
    let target = { x: -100, y: -100 }, last = { ...target };
    let angle = 0, noise = 0, awareness = 'unaware', confirm = 0, lose = 0, prevTime = 0, running = false;

    svg.addEventListener('pointermove', e => {
        const p = svgPoint(svg, e);
        target = { x: p.x, y: p.y };
    });
    svg.addEventListener('pointerleave', () => { target = { x: -100, y: -100 }; last = { ...target }; });

    function setAwareness(level) {
        if (level === awareness) return;
        awareness = level;
        svg.classList.toggle('suspicious', level === 'suspicious');
        svg.classList.toggle('aware', level === 'aware');
        showStatus();
    }
    const showStatus = () => { status.textContent = t(awareness); };
    showStatus();
    window.addEventListener('langchange', showStatus);

    function frame(now) {
        if (svg.closest('[hidden]')) { running = false; return; }
        const dt = prevTime ? Math.min((now - prevTime) / 1000, 0.05) : 0;
        prevTime = now;

        const dx = target.x - agent.x, dy = target.y - agent.y;
        const dist = Math.hypot(dx, dy);
        const toTarget = Math.atan2(dy, dx);
        const diff = Math.atan2(Math.sin(toTarget - angle), Math.cos(toTarget - angle));
        noise = Math.max(noise * 0.9, Math.hypot(target.x - last.x, target.y - last.y));
        last = { ...target };

        // Senses: inner radius sees instantly, the cone needs the confirm timer, noise falls off with distance
        const inner = dist < INNER;
        const seen = inner || (dist < RANGE && Math.abs(diff) < HALF_ANGLE);
        const loudness = Math.min(noise / 12, 1) * Math.max(1 - dist / HEARING, 0);
        const heard = loudness >= MIN_AUDIBLE;
        const found = seen || heard;
        const instant = inner || loudness >= INSTANT_LOUDNESS;

        if (found) {
            lose = 0;
            confirm = instant ? DETECTION_TIME : confirm + dt;
            if (confirm >= DETECTION_TIME) setAwareness('aware');
            else if (confirm > 0 && awareness === 'unaware') setAwareness('suspicious');
        } else {
            if (awareness !== 'unaware') lose += dt;
            if (lose > LOSE_TIME) {
                setAwareness('unaware');
                confirm = 0;
                lose = 0;
            }
        }

        if (found) angle += diff * (awareness === 'aware' ? 0.15 : 0.04);
        else if (awareness === 'unaware' && !reducedMotion) angle += 0.008;

        const a1 = angle - HALF_ANGLE, a2 = angle + HALF_ANGLE;
        cone.setAttribute('d', `M${agent.x} ${agent.y} L${agent.x + RANGE * Math.cos(a1)} ${agent.y + RANGE * Math.sin(a1)} ` +
            `A${RANGE} ${RANGE} 0 0 1 ${agent.x + RANGE * Math.cos(a2)} ${agent.y + RANGE * Math.sin(a2)} Z`);
        player.setAttribute('cx', target.x);
        player.setAttribute('cy', target.y);
        meter.style.width = Math.min(confirm / DETECTION_TIME, 1) * 100 + '%';
        requestAnimationFrame(frame);
    }

    svg.startDemo = () => {
        if (!running) { running = true; prevTime = 0; requestAnimationFrame(frame); }
    };
    svg.startDemo();
}

// Neuroevolution demo: a 2D take on the plane project. Each plane has a tiny tanh network;
// generations evolve with elitism + tournament selection + uniform crossover + mutation.
function neuroDemo(canvas) {
    if (canvas.startDemo) return canvas.startDemo();

    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const root = canvas.closest('.demo');
    const stat = name => root.querySelector(`[data-stat="${name}"]`);
    const speedSelect = root.querySelector('[data-control="speed"]');

    const POPULATION = 40, ELITE = 3, TOURNAMENT = 4, MUTATION_RATE = 0.1, MUTATION_STRENGTH = 0.5;
    const LAYERS = [6, 6, 1];
    const RAYS = [-0.9, -0.45, 0, 0.45, 0.9], RAY_LENGTH = 120;
    const SPEED = 2, MAX_TURN = 0.08, MAX_STEPS = 700, FINISH_X = W - 12;
    const pillars = [[150, 90], [260, 215], [370, 115], [480, 205], [575, 120]]
        .map(([x, gapY]) => ({ x, w: 22, top: gapY - 45, bottom: gapY + 45 }));

    const blocked = (x, y) => y < 0 || y > H || x < 0 ||
        pillars.some(p => x > p.x && x < p.x + p.w && (y < p.top || y > p.bottom));

    // Brain = layers of neurons; each neuron is an array of weights with the bias last
    const randomBrain = () => LAYERS.slice(1).map((size, l) =>
        Array.from({ length: size }, () => Array.from({ length: LAYERS[l] + 1 }, () => Math.random() * 2 - 1)));
    const mapBrain = (brain, f) => brain.map((layer, l) => layer.map((w, n) => w.map((v, i) => f(v, l, n, i))));
    const think = (brain, inputs) => brain.reduce((a, layer) =>
        layer.map(w => Math.tanh(w.reduce((sum, wi, i) => sum + wi * (i < a.length ? a[i] : 1), 0))), inputs);
    const crossover = (a, b) => mapBrain(a, (v, l, n, i) => (Math.random() < 0.5 ? v : b[l][n][i]));
    const mutate = brain => mapBrain(brain, v =>
        Math.random() < MUTATION_RATE ? v + (Math.random() * 2 - 1) * MUTATION_STRENGTH : v);

    function tournament(ranked) {
        let best = null;
        for (let i = 0; i < TOURNAMENT; i++) {
            const candidate = ranked[Math.floor(Math.random() * ranked.length)];
            if (!best || candidate.fitness > best.fitness) best = candidate;
        }
        return best.brain;
    }

    function evolve() {
        const ranked = [...planes].sort((a, b) => b.fitness - a.fitness);
        const next = ranked.slice(0, ELITE).map(p => p.brain);
        while (next.length < POPULATION) next.push(mutate(crossover(tournament(ranked), tournament(ranked))));
        return next;
    }

    const spawn = brain => ({ brain, x: 20, y: H / 2, a: 0, alive: true, fitness: 0 });
    let planes, generation, best, steps, running = false;

    function reset() {
        planes = Array.from({ length: POPULATION }, () => spawn(randomBrain()));
        generation = 1;
        best = 0;
        steps = 0;
    }

    function sense(p, offset) {
        for (let d = 0; d < RAY_LENGTH; d += 6) {
            if (blocked(p.x + Math.cos(p.a + offset) * d, p.y + Math.sin(p.a + offset) * d)) return 1 - d / RAY_LENGTH;
        }
        return 0;
    }

    function step() {
        steps++;
        planes.forEach(p => {
            if (!p.alive) return;
            const steer = think(p.brain, [...RAYS.map(r => sense(p, r)), p.a])[0];
            p.a = Math.max(-1.4, Math.min(1.4, p.a + steer * MAX_TURN));
            p.x += Math.cos(p.a) * SPEED;
            p.y += Math.sin(p.a) * SPEED;
            const passed = pillars.filter(q => p.x > q.x + q.w).length;
            p.fitness = p.x + passed * 100;
            if (p.x >= FINISH_X) { p.fitness += 500; p.alive = false; }
            else if (blocked(p.x, p.y)) p.alive = false;
        });

        if (steps >= MAX_STEPS || planes.every(p => !p.alive)) {
            best = Math.max(best, ...planes.map(p => p.fitness));
            planes = evolve().map(spawn);
            generation++;
            steps = 0;
        }
    }

    function draw() {
        const css = getComputedStyle(canvas);
        ctx.fillStyle = css.getPropertyValue('--field');
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = css.getPropertyValue('--border');
        pillars.forEach(p => {
            ctx.fillRect(p.x, 0, p.w, p.top);
            ctx.fillRect(p.x, p.bottom, p.w, H - p.bottom);
        });
        ctx.strokeStyle = css.getPropertyValue('--accent-green');
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(FINISH_X, 0);
        ctx.lineTo(FINISH_X, H);
        ctx.stroke();
        ctx.setLineDash([]);

        const accent = css.getPropertyValue('--accent');
        planes.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.a);
            ctx.globalAlpha = p.alive ? 0.9 : 0.15;
            ctx.fillStyle = accent;
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(-6, -5);
            ctx.lineTo(-3, 0);
            ctx.lineTo(-6, 5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });

        stat('gen').textContent = generation;
        stat('alive').textContent = planes.filter(p => p.alive).length;
        stat('best').textContent = Math.round(best);
    }

    function frame() {
        if (canvas.closest('[hidden]')) { running = false; return; }
        const speed = Number(speedSelect?.value || 4); // the Home copy has no controls
        for (let i = 0; i < speed; i++) step();
        draw();
        requestAnimationFrame(frame);
    }

    root.querySelector('[data-control="reset"]')?.addEventListener('click', () => {
        reset();
        log(t('neuroReset'));
    });

    reset();
    canvas.startDemo = () => {
        if (!running) { running = true; requestAnimationFrame(frame); }
    };
    canvas.startDemo();
}

// Ballistics demo: RealShooter's G7 drag model + RK4, ported to JS. Recomputes on slider input.
const G7_MACH = [0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70, 0.725, 0.75,
    0.775, 0.80, 0.825, 0.85, 0.875, 0.90, 0.925, 0.95, 0.975, 1.00, 1.025, 1.05, 1.075, 1.10, 1.15, 1.20, 1.25, 1.30,
    1.35, 1.40, 1.50, 1.60, 1.70, 1.80, 1.90, 2.00, 2.20, 2.40, 2.60, 2.80, 3.00, 3.50, 4.00, 4.50, 5.00];
const G7_CD = [0.1198, 0.1197, 0.1196, 0.1194, 0.1193, 0.1194, 0.1194, 0.1194, 0.1193, 0.1193, 0.1194, 0.1194, 0.1194,
    0.1197, 0.1202, 0.1207, 0.1215, 0.1226, 0.1242, 0.1266, 0.1306, 0.1368, 0.1464, 0.1660, 0.2054, 0.2993, 0.3803,
    0.4015, 0.4043, 0.4034, 0.4014, 0.3955, 0.3884, 0.3810, 0.3732, 0.3657, 0.3580, 0.3440, 0.3315, 0.3209, 0.3117,
    0.3042, 0.2980, 0.2864, 0.2752, 0.2640, 0.2547, 0.2470, 0.2338, 0.2177, 0.2088, 0.1974];

function g7Cd(mach) {
    if (mach <= G7_MACH[0]) return G7_CD[0];
    const i = G7_MACH.findIndex(m => m >= mach);
    if (i === -1) return G7_CD[G7_CD.length - 1];
    const t = (mach - G7_MACH[i - 1]) / (G7_MACH[i] - G7_MACH[i - 1]);
    return G7_CD[i - 1] + (G7_CD[i] - G7_CD[i - 1]) * t;
}

function ballisticsDemo(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = 'true';

    // .308 Win 175 gr, the same defaults as RealShooter's BulletData
    const MASS = 175 * 0.00006479891, DIAMETER = 0.00782;
    const AREA = Math.PI * (DIAMETER / 2) ** 2;
    const SECTIONAL_DENSITY = (175 / 7000) / (7.82 / 25.4) ** 2;
    const AIR_DENSITY = 1.225, SPEED_OF_SOUND = 340.3, GRAVITY = 9.80665;
    const SIGHT_HEIGHT = 0.05, DT = 0.001, MAX_RANGE = 1000, ROWS = [100, 300, 600, 900];
    const inputs = {};
    root.querySelectorAll('[data-input]').forEach(el => { inputs[el.dataset.input] = el; });
    const svg = root.querySelector('svg');
    const tbody = root.querySelector('tbody');

    // State: [x (downrange), y (up), z (right), vx, vy, vz]. Wind blows toward +z.
    function flight(angle, v0, wind, formFactor, untilX, sampleEvery) {
        const derivative = s => {
            const rx = s[3], ry = s[4], rz = s[5] - wind;
            const speed = Math.hypot(rx, ry, rz);
            const k = 0.5 * AIR_DENSITY * speed * g7Cd(speed / SPEED_OF_SOUND) * formFactor * AREA / MASS;
            return [s[3], s[4], s[5], -k * rx, -k * ry - GRAVITY, -k * rz];
        };
        const add = (s, d, h) => s.map((v, i) => v + d[i] * h);
        let s = [0, -SIGHT_HEIGHT, 0, v0 * Math.cos(angle), v0 * Math.sin(angle), 0];
        let t = 0, nextSample = sampleEvery;
        const samples = [];
        while (s[0] < untilX && t < 6) {
            const k1 = derivative(s), k2 = derivative(add(s, k1, DT / 2));
            const k3 = derivative(add(s, k2, DT / 2)), k4 = derivative(add(s, k3, DT));
            s = s.map((v, i) => v + DT / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]));
            t += DT;
            if (s[0] >= nextSample) {
                samples.push({ x: nextSample, y: s[1], z: s[2], t, v: Math.hypot(s[3], s[4], s[5]) });
                nextSample += sampleEvery;
            }
        }
        return samples;
    }

    // Bisect the launch angle so the bullet crosses the line of sight at the zero range
    function zeroAngle(v0, formFactor, zero) {
        let lo = -0.01, hi = 0.03;
        for (let i = 0; i < 24; i++) {
            const mid = (lo + hi) / 2;
            const samples = flight(mid, v0, 0, formFactor, zero, zero);
            if (samples.length && samples[samples.length - 1].y > 0) hi = mid; else lo = mid;
        }
        return (lo + hi) / 2;
    }

    const fmtMil = (meters, range) => {
        const mil = meters / range * 1000;
        return `${Math.abs(mil).toFixed(1)} mil <small>${Math.round(Math.abs(mil) / 0.1)} ${t('clicks')}</small>`;
    };

    function render() {
        Object.values(inputs).forEach(el => { el.closest('label').querySelector('output').textContent = el.value; });
        const v0 = Number(inputs.v0.value), wind = Number(inputs.wind.value), zero = Number(inputs.zero.value);
        const formFactor = SECTIONAL_DENSITY / Number(inputs.bc.value);
        const samples = flight(zeroAngle(v0, formFactor, zero), v0, wind, formFactor, MAX_RANGE, 10);

        // Chart: drop and drift in cm over range, drawn in CSS pixels so labels stay legible on phones
        const width = svg.clientWidth;
        if (!width) return; // hidden; the ResizeObserver renders it once it is shown
        svg.setAttribute('viewBox', `0 0 ${width} 260`);
        const left = 70, right = width - 35, top = 14, bottom = 228;
        const values = samples.flatMap(p => [p.y * 100, p.z * 100]).concat(0);
        const rawStep = (Math.max(...values) - Math.min(...values)) / 4;
        const magnitude = 10 ** Math.floor(Math.log10(rawStep));
        const tick = [1, 2, 5, 10].map(m => m * magnitude).find(t => t >= rawStep);
        const minY = Math.floor(Math.min(...values) / tick) * tick, maxY = Math.ceil(Math.max(...values) / tick) * tick;
        const px = x => left + (x / MAX_RANGE) * (right - left);
        const py = cm => top + (maxY - cm) / (maxY - minY || 1) * (bottom - top);
        const line = key => 'M' + px(0) + ' ' + py(-SIGHT_HEIGHT * (key === 'y' ? 100 : 0)) + samples.map(p => ` L${px(p.x)} ${py(p[key] * 100)}`).join('');

        let grid = '';
        for (let x = 0; x <= MAX_RANGE; x += 100) {
            grid += `<line class="grid" x1="${px(x)}" y1="${top}" x2="${px(x)}" y2="${bottom}"/>` +
                (x % 200 === 0 ? `<text x="${px(x)}" y="${bottom + 18}" text-anchor="middle">${x} m</text>` : '');
        }
        for (let cm = minY; cm <= maxY; cm += tick) {
            grid += `<line class="grid" x1="${left}" y1="${py(cm)}" x2="${right}" y2="${py(cm)}"/>` +
                `<text x="${left - 8}" y="${py(cm) + 4}" text-anchor="end">${cm} cm</text>`;
        }
        svg.innerHTML = grid +
            `<line class="los" x1="${left}" y1="${py(0)}" x2="${right}" y2="${py(0)}"/>` +
            `<path class="drift" d="${line('z')}"/><path class="drop" d="${line('y')}"/>` +
            `<circle class="zero-mark" cx="${px(zero)}" cy="${py(0)}" r="4"/>` +
            `<text class="drop-label" x="${left + 12}" y="${bottom - 26}">— ${t('drop')}</text>` +
            `<text class="drift-label" x="${left + 12}" y="${bottom - 10}">- - ${t('drift')}</text>`;

        tbody.innerHTML = ROWS.map(range => {
            const p = samples.find(s => s.x >= range);
            if (!p) return '';
            const cm = meters => Math.round(meters * 100) || 0; // avoid "-0"
            return `<tr><td>${range} m</td><td>${cm(p.y)} cm</td><td>${fmtMil(p.y, range)}</td>` +
                `<td>${cm(p.z)} cm</td><td>${fmtMil(p.z, range)}</td>` +
                `<td>${p.t.toFixed(2)} s</td><td>${Math.round(p.v)} m/s</td></tr>`;
        }).join('');
    }

    Object.values(inputs).forEach(el => el.addEventListener('input', render));
    new ResizeObserver(render).observe(svg);
    window.addEventListener('langchange', render);
}

// AgroLife demo: real Pergamino lots farmed the way the game farms its neighbours. On 1 May every idle lot
// gets the next crop of the rotation on its typical sowing date; crops advance by growing degree-days under
// weather from the generator's monthly parameters, and are coloured like the map's Status layer.
const AGRO_MONTHS = [31, 30, 31, 31, 30, 31, 30, 31, 31, 28, 31, 30]; // the campaign year runs May → April
const AGRO_MONTH_NAMES = [['May', 'May'], ['Jun', 'Jun'], ['Jul', 'Jul'], ['Aug', 'Ago'], ['Sep', 'Sep'], ['Oct', 'Oct'],
    ['Nov', 'Nov'], ['Dec', 'Dic'], ['Jan', 'Ene'], ['Feb', 'Feb'], ['Mar', 'Mar'], ['Apr', 'Abr']];
const agroDay = dayMonth => { // "15/6" → day of the campaign
    const [d, m] = dayMonth.split('/').map(Number);
    return AGRO_MONTHS.slice(0, (m + 7) % 12).reduce((a, b) => a + b, 0) + d - 1;
};
// clima.json, January first: P(wet | dry day), P(wet | wet day), then mean and sd of Tmax dry, Tmax wet, Tmin dry, Tmin wet
const AGRO_WEATHER = [
    [0.24, 0.51, 32.3, 3.9, 30.9, 4.3, 17.0, 3.0, 19.0, 2.8], [0.23, 0.55, 30.4, 4.3, 29.2, 3.8, 15.9, 3.5, 18.2, 2.9],
    [0.23, 0.53, 28.0, 4.3, 26.9, 4.1, 14.1, 3.7, 16.5, 3.2], [0.19, 0.56, 23.2, 3.7, 22.9, 3.6, 10.0, 3.5, 13.4, 3.2],
    [0.11, 0.55, 19.1, 3.9, 19.2, 3.9, 7.3, 3.7, 11.4, 3.5], [0.08, 0.41, 16.1, 3.4, 16.1, 3.7, 4.6, 3.8, 8.0, 3.6],
    [0.09, 0.40, 15.6, 3.9, 15.2, 4.3, 3.5, 3.9, 7.0, 3.4], [0.09, 0.40, 18.4, 4.4, 17.4, 4.7, 4.8, 3.9, 8.1, 3.4],
    [0.14, 0.42, 21.3, 4.0, 19.8, 4.4, 6.9, 3.3, 9.5, 3.2], [0.25, 0.52, 24.6, 4.0, 23.8, 4.1, 9.4, 3.1, 12.3, 2.9],
    [0.24, 0.50, 28.3, 4.1, 26.9, 4.4, 12.7, 3.2, 14.6, 3.1], [0.27, 0.48, 30.9, 4.2, 29.7, 4.0, 15.3, 3.4, 17.2, 2.8],
];
// crops.json, long-cycle genetics: base temperature, degree-days to emergence/vegetative/flowering/grain fill/maturity
const AGRO_SOY = { base: 10, gd: [80, 130, 500, 750, 1450], harvestDays: 10, sow: '15/11', light: '#a8e0b0', dark: '#2f7f4f', photoperiod: true };
const AGRO_CROPS = {
    trigo: { name: ['Wheat', 'Trigo'], base: 0, gd: [150, 250, 1500, 1650, 2200], harvestDays: 7, sow: '15/6', light: '#b9d67a', dark: '#4e7a2a' },
    maiz: { name: ['Maize', 'Maíz'], base: 8, gd: [70, 120, 700, 1100, 1850], harvestDays: 15, sow: '1/10', light: '#8fd18a', dark: '#1f6b2e' },
    soja1: { ...AGRO_SOY, name: ['Soybean', 'Soja'] },
    soja2: { ...AGRO_SOY, name: ['Second soybean', 'Soja de segunda'] },
};
const AGRO_ROTATION = ['maiz', 'soja1', 'trigo']; // wheat is always followed by second soybean
const AGRO_STAGES = [['sown', 'sembrado'], ['emerged', 'emergido'], ['vegetative', 'vegetativo'], ['flowering', 'floración'],
    ['grain fill', 'llenado de grano'], ['mature', 'maduro']];
const AGRO_COLORS = { bare: '#8c7a5b', mature: '#e3c04b', red: '#b5452f', yellow: '#e3c04b', green: '#3e8e41' };

function agroDemo(canvas) {
    if (canvas.startDemo) return canvas.startDemo();

    const ctx = canvas.getContext('2d');
    const SCALE = canvas.width / 640; // data is in a 640×300 frame; the canvas is drawn at 2× for sharp edges
    const root = canvas.closest('.demo');
    const stat = name => root.querySelector(`[data-stat="${name}"]`);
    const speedSelect = root.querySelector('[data-control="speed"]');
    const layerSelect = root.querySelector('[data-control="layer"]');
    const legend = root.querySelector('[data-legend]');

    // The whole of Pergamino (agro-map.js), in metres: x east, y south. Records are delta-encoded in units of AGRO_MAP.unit metres.
    const trace = (path, nums, box) => {
        let x = 0, y = 0;
        for (let i = 0; i < nums.length; i += 2) {
            x += nums[i]; y += nums[i + 1];
            path[i ? 'lineTo' : 'moveTo'](x * AGRO_MAP.unit, y * AGRO_MAP.unit);
            if (box) {
                box[0] = Math.min(box[0], x * AGRO_MAP.unit); box[1] = Math.min(box[1], y * AGRO_MAP.unit);
                box[2] = Math.max(box[2], x * AGRO_MAP.unit); box[3] = Math.max(box[3], y * AGRO_MAP.unit);
            }
        }
    };
    const toLines = data => {
        const path = new Path2D();
        data.split(';').forEach(s => trace(path, s.split(' ').map(Number)));
        return path;
    };
    const roads = toLines(AGRO_MAP.roads), routes = toLines(AGRO_MAP.routes), streams = toLines(AGRO_MAP.streams), border = toLines(AGRO_MAP.border);
    const lots = AGRO_MAP.lots.split(';').map(s => {
        const [id, ip, ha, ...d] = s.split(' ').map(Number), path = new Path2D(), box = [Infinity, Infinity, -Infinity, -Infinity];
        trace(path, d, box);
        path.closePath();
        return { id, ip, ha, path, box, crop: null, plan: null };
    });

    // The view: its centre in metres and its scale in frame px per metre. It opens on the 640×300 cut around Fontezuela this demo
    // used to show alone; the buttons zoom by 2× between that and a bit closer, or out to the whole region
    const HOME = { cx: 8000, cy: 9000, s: 1 / 31.25 }, MIN_S = 0.0045, MAX_S = HOME.s * 8;
    const view = { ...HOME }, goal = { ...HOME };
    const applyView = () => ctx.setTransform(SCALE * view.s, 0, 0, SCALE * view.s, SCALE * (320 - view.cx * view.s), SCALE * (150 - view.cy * view.s));

    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, t) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t))})`;
    const gradient = t => t < 0.5 ? mix(AGRO_COLORS.red, AGRO_COLORS.yellow, t * 2) : mix(AGRO_COLORS.yellow, AGRO_COLORS.green, t * 2 - 1);
    const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

    let day = 0, campaign = 0, wet = false, zMax = 0, zMin = 0, tMean = 0, hover = null, clock = 0, prevTime = 0, running = false, dirty = false;

    // One day of the WGEN-style generator: Markov chain for wet days, AR(1) anomalies for temperature
    function weather() {
        const month = (monthOf(day) + 4) % 12; // AGRO_WEATHER starts in January
        const [pDry, pWet, txD, sxD, txW, sxW, tnD, snD, tnW, snW] = AGRO_WEATHER[month];
        wet = Math.random() < (wet ? pWet : pDry);
        zMax = 0.66 * zMax + Math.sqrt(1 - 0.66 ** 2) * gauss();
        zMin = 0.68 * zMin + Math.sqrt(1 - 0.68 ** 2) * gauss();
        const tMax = wet ? txW + sxW * zMax : txD + sxD * zMax;
        const tMin = Math.min(tMax - 1, wet ? tnW + snW * zMin : tnD + snD * zMin);
        return (tMax + tMin) / 2;
    }

    function monthOf(d) {
        let m = 0;
        while (d >= AGRO_MONTHS[m]) d -= AGRO_MONTHS[m++];
        return m;
    }

    function sow(lot) {
        const c = AGRO_CROPS[lot.plan.crop];
        // Late-sown soybean shortens every stage but emergence (photoperiod)
        const f = c.photoperiod ? Math.max(0.75, 1 - 0.003 * Math.max(0, day - agroDay('15/11'))) : 1;
        lot.crop = { c, id: lot.plan.crop, gd: 0, stage: 0, matureDays: 0, stages: c.gd.map((g, i) => (i ? g * f : g)) };
        lot.plan = null;
    }

    function step() {
        if (day === 0) {
            campaign++;
            lots.forEach(l => {
                if (!l.crop && !l.plan) {
                    const id = AGRO_ROTATION[(l.id + campaign) % 3];
                    l.plan = { crop: id, day: agroDay(AGRO_CROPS[id].sow) };
                }
            });
        }
        tMean = weather();
        lots.forEach(l => {
            if (l.plan && l.plan.day === day) sow(l);
            const k = l.crop;
            if (!k) return;
            k.gd += Math.max(0, tMean - k.c.base);
            k.stage = k.stages.filter(g => k.gd >= g).length;
            if (k.stage === 5 && ++k.matureDays >= k.c.harvestDays) {
                l.crop = null;
                if (k.id === 'trigo' && day + 1 <= agroDay('15/1')) l.plan = { crop: 'soja2', day: day + 1 };
            }
        });
        day = (day + 1) % 365;
    }

    function colorOf(l) {
        if (layerSelect?.value === 'ip') return gradient(Math.min(1, l.ip / 100));
        const k = l.crop;
        if (!k) return AGRO_COLORS.bare;
        if (k.stage === 5) return AGRO_COLORS.mature;
        return mix(k.c.light, k.c.dark, Math.min(1, k.gd / k.stages[4]));
    }

    function draw() {
        const css = getComputedStyle(canvas), v = name => css.getPropertyValue(name);
        const s = view.s, close = s >= 0.02; // lots lose their outline when zoomed far out
        ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        ctx.fillStyle = v('--field');
        ctx.fillRect(0, 0, 640, 300);
        applyView();
        ctx.lineJoin = 'round';
        const x0 = view.cx - 320 / s, x1 = view.cx + 320 / s, y0 = view.cy - 150 / s, y1 = view.cy + 150 / s;
        ctx.lineWidth = 0.75 / s;
        ctx.strokeStyle = v('--field');
        lots.forEach(l => {
            const b = l.box;
            if (b[2] < x0 || b[0] > x1 || b[3] < y0 || b[1] > y1) return; // off screen
            ctx.fillStyle = colorOf(l);
            ctx.fill(l.path);
            if (close) ctx.stroke(l.path);
        });
        ctx.strokeStyle = v('--text-muted');
        ctx.lineWidth = (close ? 1.5 : 0.8) / s;
        ctx.stroke(roads);
        ctx.lineWidth = (close ? 2.5 : 1.4) / s;
        ctx.stroke(routes);
        ctx.setLineDash([6 / s, 4 / s]);
        ctx.stroke(border);
        ctx.setLineDash([]);
        ctx.strokeStyle = '#2c6fb5';
        ctx.lineWidth = (close ? 1.5 : 0.8) / s;
        ctx.stroke(streams);
        if (hover) {
            ctx.lineWidth = 2 / s;
            ctx.strokeStyle = v('--text-color');
            ctx.stroke(hover.path);
        }

        // Labels and scale bar at a constant size on screen (13 px), in frame pixels
        const px = 640 / (canvas.clientWidth || 640);
        ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        ctx.font = `${13 * px}px system-ui, sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3 * px;
        ctx.strokeStyle = v('--field');
        ctx.fillStyle = v('--text-color');
        AGRO_MAP.towns.forEach(([name, x, y, city]) => {
            const fx = 320 + (x - view.cx) * s, fy = 150 + (y - view.cy) * s;
            if (fx < -20 || fx > 660 || fy < -10 || fy > 310) return;
            ctx.beginPath(); ctx.arc(fx, fy, (city ? 3.5 : 2.5) * px, 0, 7); ctx.fill();
            if (!city && s < 0.012) return; // far out, only the city keeps its name so the labels don't pile up
            ctx.strokeText(name, fx + 6 * px, fy); ctx.fillText(name, fx + 6 * px, fy);
        });
        const metres = [500, 1000, 2000, 5000, 10000, 20000].filter(m => m * s / px <= 120).pop() || 500, bx = 10 * px, by = 300 - 14 * px;
        ctx.strokeStyle = v('--field'); ctx.lineWidth = 5 * px;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + metres * s, by); ctx.stroke();
        ctx.strokeStyle = v('--text-color'); ctx.lineWidth = 2 * px;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + metres * s, by); ctx.stroke();
        ctx.strokeStyle = v('--field'); ctx.lineWidth = 3 * px;
        const scaleText = metres >= 1000 ? `${metres / 1000} km` : `${metres} m`;
        ctx.strokeText(scaleText, bx, by - 10 * px); ctx.fillText(scaleText, bx, by - 10 * px);

        const m = monthOf(day);
        const dayOfMonth = day - AGRO_MONTHS.slice(0, m).reduce((a, b) => a + b, 0) + 1;
        stat('date').textContent = `${dayOfMonth} ${pick(AGRO_MONTH_NAMES[m])}`;
        stat('year').textContent = campaign + (m >= 8 ? 1 : 0); // the game's "Year N" turns on 1 January
        stat('temp').textContent = `${tMean.toFixed(1)} °C`;
        const k = hover?.crop;
        stat('lot').textContent = hover
            ? t('agroLot', hover.id, hover.ha, hover.ip, k ? `${pick(k.c.name)}, ${pick(AGRO_STAGES[k.stage])}` : t('agroBare'))
            : t('agroPoint');
    }

    function drawLegend() {
        if (!legend) return;
        const items = layerSelect?.value === 'ip'
            ? [['IP 0', AGRO_COLORS.red], ['50', AGRO_COLORS.yellow], ['100', AGRO_COLORS.green]]
            : [[pick(['Bare soil', 'Suelo desnudo']), AGRO_COLORS.bare], [pick(AGRO_CROPS.trigo.name), AGRO_CROPS.trigo.dark],
               [pick(AGRO_CROPS.maiz.name), AGRO_CROPS.maiz.dark], [pick(AGRO_CROPS.soja1.name), AGRO_SOY.dark],
               [pick(['Mature', 'Maduro']), AGRO_COLORS.mature]];
        legend.innerHTML = items.map(([text, color]) => `<span><i class="swatch" style="background:${color}"></i>${text}</span>`).join('');
    }

    const framePoint = e => ({ x: e.offsetX * 640 / canvas.clientWidth, y: e.offsetY * 300 / canvas.clientHeight });

    function pointAt(e) {
        const p = framePoint(e), wx = view.cx + (p.x - 320) / view.s, wy = view.cy + (p.y - 150) / view.s;
        applyView(); // isPointInPath tests the path under the current transform
        hover = lots.find(l => l.box[0] <= wx && wx <= l.box[2] && l.box[1] <= wy && wy <= l.box[3] && ctx.isPointInPath(l.path, p.x * SCALE, p.y * SCALE)) || null;
        dirty = true;
    }

    // Drag to pan; a press that doesn't move is a tap and selects the lot under it
    let drag = null;
    canvas.addEventListener('pointerdown', e => {
        drag = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy, moved: false };
        canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
        if (!drag) return pointAt(e);
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) < 5) return;
        if (!drag.moved) { drag.moved = true; hover = null; canvas.classList.add('dragging'); }
        const k = 640 / canvas.clientWidth / view.s; // screen px → metres
        view.cx = goal.cx = Math.min(Math.max(drag.cx - dx * k, -37000), 38000);
        view.cy = goal.cy = Math.min(Math.max(drag.cy - dy * k, -33300), 37700);
        dirty = true;
    });
    const endDrag = e => {
        if (drag && !drag.moved && e.type === 'pointerup') pointAt(e);
        drag = null;
        canvas.classList.remove('dragging');
    };
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', e => { if (!drag && e.pointerType === 'mouse') { hover = null; dirty = true; } }); // a finger lifting must keep its tap

    const zoomIn = root.querySelector('[data-control="zoom-in"]'), zoomOut = root.querySelector('[data-control="zoom-out"]');
    function zoomTo(next) { // the buttons set a goal and the view eases towards it
        Object.assign(goal, next);
        goal.s = Math.min(Math.max(goal.s, MIN_S), MAX_S);
        if (reducedMotion) Object.assign(view, goal);
        zoomIn.disabled = goal.s >= MAX_S * 0.999;
        zoomOut.disabled = goal.s <= MIN_S * 1.001;
        dirty = true;
    }
    zoomIn.addEventListener('click', () => zoomTo({ s: goal.s * 2 }));
    zoomOut.addEventListener('click', () => zoomTo({ s: goal.s / 2 }));
    root.querySelector('[data-control="home"]').addEventListener('click', () => zoomTo(HOME));

    function ease() { // 25% of the way each frame, in log scale for the zoom so it feels even
        const near = (a, b, tol) => Math.abs(a - b) <= tol;
        if (near(view.cx, goal.cx, 1) && near(view.cy, goal.cy, 1) && near(view.s / goal.s, 1, 0.002)) return;
        view.cx += (goal.cx - view.cx) * 0.25;
        view.cy += (goal.cy - view.cy) * 0.25;
        view.s *= (goal.s / view.s) ** 0.25;
        dirty = true;
    }

    function frame(time) {
        if (canvas.closest('[hidden]')) { running = false; return; }
        const dt = prevTime ? Math.min(0.1, (time - prevTime) / 1000) : 0;
        prevTime = time;
        clock += dt * 6 * Number(speedSelect?.value || 2); // ×1 is 6 days a second, as in the game
        while (clock >= 1) { step(); clock--; dirty = true; }
        ease();
        if (dirty) { dirty = false; draw(); }
        requestAnimationFrame(frame);
    }

    layerSelect?.addEventListener('change', () => { drawLegend(); draw(); });
    window.addEventListener('langchange', () => { drawLegend(); draw(); });
    window.addEventListener('resize', () => { dirty = true; });

    while (day !== agroDay('25/11')) step(); // open on late spring, when every crop of the rotation is in the ground
    drawLegend();
    draw();
    canvas.startDemo = () => {
        if (!running) { running = true; prevTime = 0; requestAnimationFrame(frame); }
    };
    canvas.startDemo();
}

// CableMess demo: a top-down 2D take on the game's cable rules (CableRoute.EvaluatePort / EvaluateRoutePoint, Port.Satisfied,
// VerifyButton.Check). A cable is a chain of 0.1 m links that can't stretch, pinned to ports and wall clips, dragged around as
// if on a high-friction floor. ponytail: no gravity, momentum or collisions with the furniture (the game's Verlet solver has them);
// upgrade by porting that solver. The plans are schematic. Units are px, 75 to the metre; ports are
// [id, device, type, u, v, faceU, faceV, to] with u, v in metres, and `to` is what the tape says the port must be plugged into.
const CM = { S: 75, SEG: 7.5, W: 600, H: 450, OX: 20, OY: 15, TENSION: 1.05, REACH: 22, GLIDE: 5 };
const CM_KITCHEN = [0.3, 5.4, 2.4, 0.6, ['Kitchen', 'Cocina']];
const CM_JACK = ['Boca', ['Wall jack', 'Boca'], 0, 0.1, 0.12, 0.4];
const CM_JACK_PORT = ['Boca-1', 'Boca', 'eth', 0.12, 0.3, 1, 0, 'Router-1'];
const CM_LEVELS = [
    { // Studio flat: one long cable, five wall clips
        furniture: [CM_KITCHEN, [6, 5, 2, 1, ['Bed', 'Cama']]],
        clips: [[1.5, 0], [3.5, 0], [5.5, 0], [8, 1.2], [8, 2.6]],
        stock: [['eth', 14]],
        devices: [CM_JACK, ['Router', ['Router', 'Router'], 6.3, 3.2, 1.7, 1.4]],
        ports: [CM_JACK_PORT, ['Router-1', 'Router', 'eth', 6.3, 3.7, -1, 0, 'Boca'], ['Router-2', 'Router', 'eth', 6.3, 4.3, -1, 0, '']],
    },
    { // Apartment: pick each cable's length from the stock; the router only works once it has power
        furniture: [CM_KITCHEN, [4.2, 5, 2, 1, ['Bed', 'Cama']], [6.3, 2.7, 1.7, 1.8, ['Desk', 'Escritorio']]],
        clips: [[3.95, 0], [6.6, 0], [8, 1.3]],
        stock: [['eth', 1], ['eth', 2], ['eth', 3], ['eth', 5], ['eth', 10], ['pwr', 1.5], ['pwr', 3]],
        devices: [CM_JACK, ['Router', ['Router', 'Router'], 1.3, 0.1, 2.2, 0.7, 'Router-P1'],
            ['Regleta', ['Power strip', 'Regleta'], 4.4, 0.1, 1.9, 0.5], ['Switch', ['Switch', 'Switch'], 6.6, 3, 1.4, 1.2]],
        ports: [CM_JACK_PORT,
            ['Router-1', 'Router', 'eth', 1.7, 0.8, 0, 1, 'Boca'], ['Router-2', 'Router', 'eth', 2.2, 0.8, 0, 1, ''],
            ['Router-3', 'Router', 'eth', 2.7, 0.8, 0, 1, ''], ['Router-4', 'Router', 'eth', 3.2, 0.8, 0, 1, 'Switch-1'],
            ['Router-P1', 'Router', 'pwr', 3.5, 0.3, 1, 0, 'Regleta'],
            ['Regleta-1', 'Regleta', 'pwr', 4.8, 0.6, 0, 1, ''], ['Regleta-2', 'Regleta', 'pwr', 5.35, 0.6, 0, 1, ''],
            ['Regleta-3', 'Regleta', 'pwr', 5.9, 0.6, 0, 1, 'Router-P1'],
            ['Switch-1', 'Switch', 'eth', 6.6, 3.35, -1, 0, 'Router-4'], ['Switch-2', 'Switch', 'eth', 6.6, 3.95, -1, 0, '']],
    },
];

function cableMessDemo(canvas) {
    if (canvas.startDemo) return canvas.startDemo();

    const { S, SEG, W, H, OX, OY, TENSION, REACH, GLIDE } = CM;
    const ctx = canvas.getContext('2d');
    const root = canvas.closest('.demo');
    const stat = name => root.querySelector(`[data-stat="${name}"]`);
    const control = name => root.querySelector(`[data-control="${name}"]`);
    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const cableColor = (type, len) => type === 'pwr' ? '#d9822b' : { 1: '#4a90d9', 2: '#e3c04b', 3: '#3e8e41' }[len] || '#9aa0a6';

    let level, devices, ports, clips, cables, held, hand = { x: 0, y: 0 }, mouse = { x: -99, y: -99 };
    let flash = null, shown = '', asleep = false, calm = 0, dirty = true, running = false;

    // ----- The game's rules -----
    const plugged = c => !!(c.pin[0]?.port && c.pin[c.x.length - 1]?.port);
    const peerOf = p => {
        const c = p.cable;
        if (!c) return null;
        const a = c.pin[0]?.port, b = c.pin[c.x.length - 1]?.port;
        return (a === p ? b : a) || null;
    };
    const satisfied = p => { const peer = peerOf(p); return !p.to || (!!peer && (peer.id === p.to || peer.dev === p.to)); };
    const powered = dev => !dev.power || !!ports.find(p => p.id === dev.power).cable;
    // The nearest pin on the cable side of an end: the cable can't reach farther than its links from there
    const anchorOf = (c, i) => {
        const d = i ? -1 : 1;
        for (let k = i + d; k >= 0 && k < c.x.length; k += d) if (c.pin[k]) return k;
        return -1;
    };

    // Whether the held end can go to a port or a clip, and which particle a clip would pin
    function judge(c, i, target) {
        const a = anchorOf(c, i), reach = a < 0 ? Infinity : Math.abs(i - a) * SEG;
        if (target.id) {
            if (target.type !== c.type) return { v: 'cmWrong' };
            if (target.cable) return { v: 'cmBusy' };
            const gap = a < 0 ? 0 : dist(c.pin[a], target.at) - reach;
            return gap > 0 ? { v: 'cmShort', gap: gap / S } : { v: 'ok' };
        }
        if (c.pin.some(p => p?.clip === target)) return { v: 'cmBusy' };
        if (a >= 0) {
            const steps = Math.max(1, Math.ceil(dist(c.pin[a], target) * TENSION / SEG)), avail = Math.abs(i - a);
            const gap = steps * SEG + dist(target, hand) - avail * SEG;
            return gap > 0 ? { v: 'cmShort', gap: gap / S } : { v: 'ok', index: a + (i > a ? steps : -steps) };
        }
        let best = -1, bestDist = Infinity; // loose cable: the particle nearest the clip that still leaves enough cable to reach the hand
        for (let k = 0; k < c.x.length; k++) {
            const d = Math.hypot(c.x[k] - target.x, c.y[k] - target.y);
            if (k !== i && Math.abs(i - k) * SEG >= dist(target, hand) && d < bestDist) { bestDist = d; best = k; }
        }
        return best >= 0 ? { v: 'ok', index: best } : { v: 'cmShort', gap: 0 };
    }

    function verify() {
        const wrong = ports.find(p => !satisfied(p));
        if (wrong) { flash = { text: t('cmErr', wrong.id), until: performance.now() + 5000, tone: 'bad' }; return; }
        // The seal is optional: a cable whose ends are more than 3 m apart should hang from at least two clips
        const tidy = cables.every(c => !plugged(c) || dist(c.pin[0], c.pin[c.x.length - 1]) <= 3 * S || c.pin.filter(p => p?.clip).length >= 2);
        flash = { text: `${t('cmWin')} · ${t(tidy ? 'cmTidy' : 'cmMess')}`, until: performance.now() + 7000, tone: 'good' };
    }

    // ----- Cables -----
    function discard(c) {
        c.pin.forEach(p => { if (p?.port) p.port.cable = null; });
        cables.splice(cables.indexOf(c), 1);
        if (held?.c === c) held = null;
    }

    function spawn(type, len) { // one loose cable at a time, like the one in hand: a new pick returns the old one to the stock
        cables.filter(c => !plugged(c)).forEach(discard);
        const n = Math.round(len * 10) + 1, perRow = 28;
        const c = { type, len, color: cableColor(type, len), x: [], y: [], ox: new Array(n).fill(0), oy: new Array(n).fill(0), pin: new Array(n).fill(null) };
        for (let i = 0; i < n; i++) { // asleep in the middle of the room, folded in rows
            const row = Math.floor(i / perRow), col = row % 2 ? perRow - 1 - i % perRow : i % perRow;
            c.x.push(W / 2 - perRow * SEG / 2 + col * SEG);
            c.y.push(H / 2 - 30 + row * SEG);
        }
        cables.push(c);
        wake();
    }

    function stepCable(c, h) {
        const { x, y, ox, oy, pin } = c, n = x.length;
        const fixed = i => pin[i] || i === h;
        for (let i = 0; i < n; i++) {
            ox[i] = x[i]; oy[i] = y[i];
            const target = pin[i] || (i === h && hand);
            if (!target) continue;
            const dx = target.x - x[i], dy = target.y - y[i], d = Math.hypot(dx, dy) || 1e-9;
            const k = pin[i] ? Math.min(1, GLIDE / d) : 0.4; // pins glide into place at 4 m/s, the hand follows loosely
            x[i] += dx * k; y[i] += dy * k;
        }
        for (let it = 0; it < 12; it++) {
            for (let i = 0; i < n - 1; i++) {
                const dx = x[i + 1] - x[i], dy = y[i + 1] - y[i], d = Math.hypot(dx, dy);
                if (d <= SEG) continue;
                const a = fixed(i), b = fixed(i + 1);
                if (a && b) continue;
                const s = (d - SEG) / d, wa = a ? 0 : b ? 1 : 0.5;
                x[i] += dx * s * wa; y[i] += dy * s * wa;
                x[i + 1] -= dx * s * (1 - wa); y[i + 1] -= dy * s * (1 - wa);
            }
        }
        let moved = 0;
        for (let i = 0; i < n; i++) {
            if (!fixed(i)) { x[i] = Math.min(Math.max(x[i], 0), W); y[i] = Math.min(Math.max(y[i], 0), H); }
            moved = Math.max(moved, Math.abs(x[i] - ox[i]), Math.abs(y[i] - oy[i]));
        }
        return moved;
    }

    // ----- Level and controls -----
    function buildStock() {
        const box = control('stock');
        box.hidden = level.stock.length < 2;
        box.innerHTML = level.stock.map(([type, len], k) =>
            `<button type="button" class="tool-btn" data-k="${k}"><i class="swatch" style="background:${cableColor(type, len)}"></i>${pick(type === 'eth' ? ['Ethernet', 'Ethernet'] : ['Power', 'Alimentación'])} ${num(len)} m</button>`).join('');
    }

    function loadLevel(index) {
        level = CM_LEVELS[index];
        devices = level.devices.map(([id, name, u, v, w, h, power]) => ({ id, name, x: u * S, y: v * S, w: w * S, h: h * S, power }));
        ports = level.ports.map(([id, dev, type, u, v, fx, fy, to]) =>
            ({ id, dev, type, to, fx, fy, x: u * S, y: v * S, at: { x: (u + fx * 0.15) * S, y: (v + fy * 0.15) * S }, cable: null }));
        clips = level.clips.map(([u, v]) => ({ x: u * S, y: v * S, clip: true }));
        cables = []; held = null; flash = null;
        buildStock();
        if (level.stock.length === 1) spawn(...level.stock[0]);
        wake();
    }

    function wake() { asleep = false; calm = 0; dirty = true; }

    // ----- Pointer: click to pick up, click to hang or plug, click the floor to drop -----
    const ends = () => cables.flatMap(c => [0, c.x.length - 1].map(i => ({ c, i, x: c.x[i], y: c.y[i] })));
    function aim(...lists) { // the pick radius grows on a small screen so a fingertip still lands on it
        let best = null, bestDist = Math.max(REACH, 20 / (canvas.clientWidth / 640 || 1));
        for (const list of lists) for (const o of list) {
            const d = Math.hypot(o.x - mouse.x, o.y - mouse.y);
            if (d < bestDist) { bestDist = d; best = o; }
        }
        return best;
    }

    function updateHand() { // the hand can't go farther than the cable left beyond the anchor
        const { c, i } = held, a = anchorOf(c, i);
        hand = { x: Math.min(Math.max(mouse.x, 0), W), y: Math.min(Math.max(mouse.y, 0), H) };
        if (a < 0) return;
        const reach = Math.abs(i - a) * SEG, d = dist(c.pin[a], hand);
        if (d > reach) hand = { x: c.pin[a].x + (hand.x - c.pin[a].x) * reach / d, y: c.pin[a].y + (hand.y - c.pin[a].y) * reach / d };
    }

    function say(key, gap) {
        flash = { text: t(key, gap), until: performance.now() + 3000, tone: 'bad' };
    }

    function click() {
        wake();
        if (!held) {
            const end = aim(ends());
            if (!end) {
                const port = aim(ports);
                if (port) flash = { text: port.id + (port.to ? ' → ' + port.to : ''), until: performance.now() + 3000, tone: '' };
                return;
            }
            const pinned = end.c.pin[end.i];
            if (pinned?.port) pinned.port.cable = null; // lifting a plugged end unplugs it
            end.c.pin[end.i] = null;
            held = { c: end.c, i: end.i };
            updateHand();
            return;
        }
        updateHand();
        const target = aim(ports, clips);
        if (!target) { held = null; return; } // dropped where it is
        const verdict = judge(held.c, held.i, target);
        if (verdict.v !== 'ok') return say(verdict.v, verdict.gap);
        if (target.id) {
            held.c.pin[held.i] = { x: target.at.x, y: target.at.y, port: target };
            target.cable = held.c;
            held = null;
        } else {
            held.c.pin[verdict.index] = { x: target.x, y: target.y, clip: target };
        }
    }

    const setMouse = e => {
        mouse = { x: e.offsetX * 640 / canvas.clientWidth - OX, y: e.offsetY * 480 / canvas.clientHeight - OY };
        dirty = true;
        if (held) wake();
    };
    canvas.addEventListener('pointermove', setMouse);
    canvas.addEventListener('pointerdown', e => { setMouse(e); click(); });
    canvas.addEventListener('pointerleave', () => { if (!held) { mouse = { x: -99, y: -99 }; dirty = true; } });
    control('stock').addEventListener('click', e => {
        const button = e.target.closest('button');
        if (button) spawn(...level.stock[button.dataset.k]);
    });
    control('level').addEventListener('change', e => loadLevel(Number(e.target.value)));
    control('reset').addEventListener('click', () => loadLevel(Number(control('level').value)));
    control('verify').addEventListener('click', () => { verify(); dirty = true; });
    window.addEventListener('langchange', () => { flash = null; buildStock(); dirty = true; });
    window.addEventListener('resize', () => { dirty = true; });

    // ----- Drawing -----
    function draw() {
        const css = getComputedStyle(canvas), v = name => css.getPropertyValue(name).trim();
        const scale = canvas.clientWidth / 640 || 1;
        const fs = Math.round(13 / scale); // labels stay 13 px on screen
        const k = 1 / Math.min(1, scale);   // and the small parts (cable, plugs, ports, clips) never shrink below a fingertip-friendly size
        ctx.setTransform(2, 0, 0, 2, 0, 0);
        ctx.clearRect(0, 0, 640, 480);
        ctx.translate(OX, OY);
        ctx.font = `${fs}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = ctx.lineCap = 'round';

        ctx.fillStyle = v('--panel');
        ctx.fillRect(0, 0, W, H);
        level.furniture.forEach(([u, vv, w, h, name]) => {
            ctx.fillStyle = v('--panel-header'); ctx.strokeStyle = v('--border'); ctx.lineWidth = 1.5;
            ctx.fillRect(u * S, vv * S, w * S, h * S); ctx.strokeRect(u * S, vv * S, w * S, h * S);
            ctx.fillStyle = v('--text-muted');
            ctx.fillText(pick(name), (u + w / 2) * S, (vv + h / 2) * S);
        });
        ctx.strokeStyle = v('--text-muted'); ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, W, H);
        clips.forEach(c => {
            ctx.fillStyle = v('--text-color'); ctx.beginPath(); ctx.arc(c.x, c.y, 5 * k, 0, 7); ctx.fill();
        });

        devices.forEach(d => {
            ctx.fillStyle = v('--scene'); ctx.strokeStyle = v('--text-muted'); ctx.lineWidth = 1.5;
            ctx.fillRect(d.x, d.y, d.w, d.h); ctx.strokeRect(d.x, d.y, d.w, d.h);
        });
        ports.forEach(p => {
            ctx.fillStyle = v('--field'); ctx.strokeStyle = v('--text-muted'); ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (p.type === 'eth') ctx.rect(p.x - 5 * k, p.y - 5 * k, 10 * k, 10 * k); else ctx.arc(p.x, p.y, 5.5 * k, 0, 7);
            ctx.fill(); ctx.stroke();
            const dev = devices.find(d => d.id === p.dev);
            ctx.fillStyle = !p.cable || !powered(dev) ? '#4a4f54' : satisfied(p) ? '#33ff4d' : '#ff2a1f'; // Port.Update's LED
            ctx.beginPath(); ctx.arc(p.x - p.fx * (7 + 3 * k), p.y - p.fy * (7 + 3 * k), 2.6 * k, 0, 7); ctx.fill();
        });

        cables.forEach(c => {
            const n = c.x.length;
            ctx.beginPath(); ctx.moveTo(c.x[0], c.y[0]);
            for (let i = 1; i < n - 1; i++) ctx.quadraticCurveTo(c.x[i], c.y[i], (c.x[i] + c.x[i + 1]) / 2, (c.y[i] + c.y[i + 1]) / 2);
            ctx.lineTo(c.x[n - 1], c.y[n - 1]);
            ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 5.5 * k; ctx.stroke();
            ctx.strokeStyle = c.color; ctx.lineWidth = 3.2 * k; ctx.stroke();
            [0, n - 1].forEach(i => {
                const j = i ? i - 1 : 1;
                ctx.save(); ctx.translate(c.x[i], c.y[i]); ctx.rotate(Math.atan2(c.y[i] - c.y[j], c.x[i] - c.x[j])); ctx.scale(k, k);
                ctx.fillStyle = '#e6e6e6'; ctx.strokeStyle = 'rgba(0,0,0,.75)'; ctx.lineWidth = 1.2;
                ctx.beginPath();
                if (c.type === 'eth') ctx.rect(-3, -4.5, 9, 9); else ctx.arc(2, 0, 5, 0, 7);
                ctx.fill(); ctx.stroke(); ctx.restore();
            });
        });
        clips.forEach(c => { // the cable passes through the clip, so the clip draws over it
            if (cables.some(o => o.pin.some(p => p?.clip === c))) { ctx.fillStyle = v('--accent-green'); ctx.beginPath(); ctx.arc(c.x, c.y, 3 * k, 0, 7); ctx.fill(); }
        });
        devices.forEach((d, i) => { // names go over the cables, with a halo; the wall jack is a plate, so its name sits underneath
            ctx.lineWidth = 4; ctx.strokeStyle = v('--scene'); ctx.fillStyle = v(i ? '--text-color' : '--text-muted');
            ctx.textAlign = i ? 'center' : 'left';
            const x = i ? d.x + d.w / 2 : 4, y = i ? d.y + d.h / 2 : d.y + d.h + fs;
            ctx.strokeText(pick(d.name), x, y); ctx.fillText(pick(d.name), x, y);
        });
        ctx.textAlign = 'center';

        if (!held) { // loose ends invite a click
            ctx.strokeStyle = v('--accent-terracotta'); ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
            ends().filter(e => !e.c.pin[e.i]).forEach(e => { ctx.beginPath(); ctx.arc(e.x, e.y, 11 * k, 0, 7); ctx.stroke(); });
            ctx.setLineDash([]);
        }
        const near = held ? aim(ports, clips) : aim(ends(), ports);
        if (near) {
            ctx.strokeStyle = held ? (judge(held.c, held.i, near).v === 'ok' ? v('--accent-green') : v('--accent-terracotta')) : v('--text-color');
            ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(near.x, near.y, 13 * k, 0, 7); ctx.stroke();
        }
        canvas.style.cursor = near ? 'pointer' : 'default';
    }

    function status() {
        const f = flash && performance.now() < flash.until ? flash : null;
        const port = !f && !held && aim(ports);
        const text = f ? f.text : port ? port.id + (port.to ? ' → ' + port.to : '') : t(held ? 'cmHeld' : cables.length ? 'cmPick' : 'cmStock');
        const a = held ? anchorOf(held.c, held.i) : -1;
        const tension = a >= 0 ? Math.min(1, dist(held.c.pin[a], hand) / (Math.abs(held.i - a) * SEG)) : 0;
        const cable = held ? t('cmCable', held.c.len) : '';
        const key = [text, f?.tone, cable, tension.toFixed(2)].join('|');
        if (key === shown) return;
        shown = key;
        stat('msg').textContent = text;
        stat('msg').dataset.tone = f?.tone || '';
        stat('cable').textContent = cable;
        const bar = root.querySelector('.meter span');
        bar.style.width = tension * 100 + '%';
        bar.classList.toggle('hot', tension > 0.95);
    }

    function frame() {
        if (canvas.closest('[hidden]')) { running = false; return; }
        if (held) updateHand();
        if (!asleep) {
            const moved = cables.reduce((m, c) => Math.max(m, stepCable(c, held?.c === c ? held.i : -1)), 0);
            calm = moved < 0.05 && !held ? calm + 1 : 0;
            if (calm > 20) { asleep = true; dirty = true; }
        }
        if (!asleep || dirty) draw();
        dirty = false;
        status();
        requestAnimationFrame(frame);
    }

    loadLevel(0);
    canvas.startDemo = () => {
        if (!running) { running = true; dirty = true; requestAnimationFrame(frame); }
    };
    canvas.startDemo();
}


// ---------- Init ----------
route();
applyLang();
log(t('loaded'));
log(t('tip'));
if (!reducedMotion) setTimeout(type, 2000);
