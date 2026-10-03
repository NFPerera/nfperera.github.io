const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Console ----------
const consoleLog = document.getElementById('console-log');

function log(message, type = '') {
    const li = document.createElement('li');
    li.className = type;
    li.dataset.time = new Date().toLocaleTimeString([], { hour12: false });
    li.textContent = message;
    consoleLog.append(li);
    consoleLog.scrollTop = consoleLog.scrollHeight;
}

// ---------- Build Hierarchy, asset grid and prev/next from the project articles ----------
const views = [...document.querySelectorAll('.view')];
const projects = views.filter(v => v.classList.contains('project'));
const accentOf = el => [...el.classList].find(c => c.startsWith('accent-')) || '';
const folders = { game: 'Games', tool: 'Tools', ai: 'AI' };

const treeProjects = document.getElementById('tree-projects');
Object.entries(folders).forEach(([category, label]) => {
    const items = projects.filter(p => p.dataset.category === category);
    if (!items.length) return;
    const li = document.createElement('li');
    li.innerHTML = `<details open><summary>${label}</summary><ul></ul></details>`;
    items.forEach(p => {
        li.querySelector('ul').insertAdjacentHTML('beforeend',
            `<li><a href="#/${p.dataset.route}" class="${accentOf(p)}">${p.dataset.title}</a></li>`);
    });
    treeProjects.append(li);
});

const assetGrid = document.getElementById('asset-grid');
projects.forEach((p, i) => {
    const initials = p.dataset.title.split(' ').map(w => w[0]).join('').slice(0, 2);
    assetGrid.insertAdjacentHTML('beforeend',
        `<a class="asset ${accentOf(p)}" href="#/${p.dataset.route}">
            <span class="asset-icon">${initials}</span>
            <span class="asset-name">${p.dataset.title}</span>
            <span class="asset-kind">${p.dataset.kind}</span>
        </a>`);

    const prev = projects[(i - 1 + projects.length) % projects.length];
    const next = projects[(i + 1) % projects.length];
    p.querySelector('.pager').innerHTML =
        `<a href="#/${prev.dataset.route}" class="prev"><small>← Previous</small>${prev.dataset.title}</a>
         <a href="#/${next.dataset.route}" class="next"><small>Next →</small>${next.dataset.title}</a>`;
});

// ---------- Router: "#/route" shows the matching .view ----------
const hierLinks = document.querySelectorAll('#hierarchy a');
const sceneBody = document.getElementById('scene-body');
const sceneTab = document.getElementById('scene-tab');
const inspectorBody = document.getElementById('inspector-body');
const defaultInspector = document.getElementById('inspector-default');
const demos = { fsm: fsmDemo, perception: perceptionDemo };
let firstRoute = true;

function route() {
    const path = location.hash.replace(/^#\/?/, '');
    const view = views.find(v => v.dataset.route === path) || views[0];

    views.forEach(v => { v.hidden = v !== view; });
    hierLinks.forEach(a => a.classList.toggle('is-selected', a.getAttribute('href') === '#/' + view.dataset.route));
    const inspector = view.querySelector('template.inspector') || defaultInspector;
    inspectorBody.replaceChildren(inspector.content.cloneNode(true));
    sceneTab.textContent = view.dataset.title;
    document.title = view.dataset.route ? `${view.dataset.title} · NFPerera` : 'NFPerera · Game & Software Developer';

    sceneBody.scrollTop = 0;
    if (!firstRoute) window.scrollTo(0, 0);
    closeHierarchy();
    view.querySelectorAll('[data-demo]').forEach(el => demos[el.dataset.demo](el));
    if (!firstRoute) log(`Opened ${view.dataset.title}`);
    firstRoute = false;
}

window.addEventListener('hashchange', route);

// ---------- Mobile hierarchy drawer ----------
const hierToggle = document.getElementById('hier-toggle');

function closeHierarchy() {
    document.body.classList.remove('hier-open');
    hierToggle.setAttribute('aria-expanded', 'false');
}

hierToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('hier-open');
    hierToggle.setAttribute('aria-expanded', open);
});

// ---------- Day / night theme ----------
const themeBtn = document.getElementById('theme-toggle');
const currentTheme = () => root.dataset.theme ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'day' : 'night');
const updateThemeBtn = () => { themeBtn.textContent = currentTheme() === 'day' ? '☀ Day' : '☾ Night'; };

themeBtn.addEventListener('click', () => {
    root.dataset.theme = currentTheme() === 'day' ? 'night' : 'day';
    try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
    updateThemeBtn();
    log(`Lighting set to ${root.dataset.theme}.`);
});

// ---------- Play button ----------
const playBtn = document.getElementById('play-btn');

playBtn.addEventListener('click', () => {
    const playing = document.body.classList.toggle('play-mode');
    playBtn.setAttribute('aria-pressed', playing);
    log(playing ? 'Entering play mode... no game in this scene. Maybe try an old cheat code?' : 'Exited play mode.',
        playing ? 'warn' : '');
});

// ---------- Console commands ----------
const consoleForm = document.getElementById('console-form');
const consoleInput = document.getElementById('console-input');

function openView(query) {
    const q = query.toLowerCase();
    const view = projects[Number(q) - 1] ||
        views.find(v => v.dataset.title.toLowerCase().includes(q) || (q && v.dataset.route.includes(q)));
    if (view) location.hash = '#/' + view.dataset.route;
    else log(`Nothing called '${query}'. Try 'ls'.`, 'warn');
}

const commands = {
    help: () => log('Commands: help, ls, open <name|number>, theme, clear, contact'),
    ls: () => projects.forEach((p, i) => log(`${i + 1}. ${p.dataset.title} (${p.dataset.kind})`)),
    open: arg => arg ? openView(arg) : log('Usage: open <name|number>', 'warn'),
    theme: () => themeBtn.click(),
    clear: () => consoleLog.replaceChildren(),
    contact: () => { location.hash = '#/contact'; },
};

consoleForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = consoleInput.value.trim();
    consoleInput.value = '';
    if (!input) return;
    log('> ' + input, 'cmd');
    const [cmd, ...args] = input.split(/\s+/);
    const run = commands[cmd.toLowerCase()];
    if (run) run(args.join(' '));
    else log(`Unknown command '${cmd}'. Type 'help'.`, 'warn');
});

// ---------- Typewriter ----------
const typingText = document.getElementById('typing-text');
const phrases = ["Software Developer", "Gameplay Programmer", "Unity Expert"];
let phraseIndex = 0;
let charIndex = phrases[0].length;
let isDeleting = true;

function type() {
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
            emailStatus.textContent = 'Copied to clipboard!';
            log('Email copied to clipboard.', 'success');
        })
        .catch(() => { location.href = 'mailto:' + emailBtn.dataset.email; });
    setTimeout(() => { emailStatus.textContent = 'Click to copy'; }, 2000);
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
    log('Cheat code accepted: monarch migration unlocked 🦋', 'success');
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
    const { width: vbW, height: vbH } = svg.viewBox.baseVal;
    const nodes = {};
    svg.querySelectorAll('.node').forEach(g => { nodes[g.dataset.id] = g; });
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

// Perception demo: the pointer is the player; the agent sees in a cone and hears fast movement nearby
function perceptionDemo(svg) {
    if (svg.startDemo) return svg.startDemo();

    const agent = { x: 320, y: 170 };
    const RANGE = 230, HALF_ANGLE = Math.PI / 6, HEARING = 110, NOISE_THRESHOLD = 6;
    const cone = svg.querySelector('.cone');
    const player = svg.querySelector('.player');
    const status = svg.closest('.demo').querySelector('.demo-status');
    let target = { x: -100, y: -100 }, last = { ...target };
    let angle = 0, noise = 0, state = '', running = false;

    svg.addEventListener('pointermove', e => {
        const p = svgPoint(svg, e);
        target = { x: p.x, y: p.y };
    });
    svg.addEventListener('pointerleave', () => { target = { x: -100, y: -100 }; last = { ...target }; });

    function frame() {
        if (svg.closest('[hidden]')) { running = false; return; }

        const dx = target.x - agent.x, dy = target.y - agent.y;
        const dist = Math.hypot(dx, dy);
        const diff = Math.atan2(Math.sin(Math.atan2(dy, dx) - angle), Math.cos(Math.atan2(dy, dx) - angle));
        noise = Math.max(noise * 0.9, Math.hypot(target.x - last.x, target.y - last.y));
        last = { ...target };

        const seen = dist < RANGE && Math.abs(diff) < HALF_ANGLE;
        const heard = !seen && dist < HEARING && noise > NOISE_THRESHOLD;
        if (seen) angle += diff * 0.15;
        else if (heard) angle += diff * 0.06;
        else if (!reducedMotion) angle += 0.008;

        const a1 = angle - HALF_ANGLE, a2 = angle + HALF_ANGLE;
        cone.setAttribute('d', `M${agent.x} ${agent.y} L${agent.x + RANGE * Math.cos(a1)} ${agent.y + RANGE * Math.sin(a1)} ` +
            `A${RANGE} ${RANGE} 0 0 1 ${agent.x + RANGE * Math.cos(a2)} ${agent.y + RANGE * Math.sin(a2)} Z`);
        player.setAttribute('cx', target.x);
        player.setAttribute('cy', target.y);

        const next = seen ? 'seen' : heard ? 'heard' : '';
        if (next !== state) {
            state = next;
            svg.classList.toggle('seen', seen);
            svg.classList.toggle('heard', heard);
            status.textContent = seen ? 'Spotted!' : heard ? 'Heard something...' : 'Unaware';
        }
        requestAnimationFrame(frame);
    }

    svg.startDemo = () => {
        if (!running) { running = true; requestAnimationFrame(frame); }
    };
    svg.startDemo();
}

// ---------- Init ----------
updateThemeBtn();
route();
log('Editor loaded. Type \'help\' in the console or pick something from the Hierarchy.');
log('Tip: some old-school cheat codes still work around here.');
if (!reducedMotion) setTimeout(type, 2000);
