const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
const folders = { game: 'Games', tool: 'Tools', ai: 'AI', sim: 'Simulation' };

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
    // Thumbnail: the banner screenshot if there is one, else the line-art icon, else initials
    const shot = p.querySelector('.banner-media');
    const icon = p.querySelector('template.asset-icon');
    const initials = p.dataset.title.split(' ').map(w => w[0]).join('').slice(0, 2);
    const thumb = shot ? `<img src="${shot.getAttribute('src')}" alt="" loading="lazy">` : icon ? icon.innerHTML : initials;
    assetGrid.insertAdjacentHTML('beforeend',
        `<a class="asset ${accentOf(p)}" href="#/${p.dataset.route}">
            <span class="asset-icon">${thumb}</span>
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
const demos = { fsm: fsmDemo, perception: perceptionDemo, neuro: neuroDemo, ballistics: ballisticsDemo, agro: agroDemo };
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

// Tapping outside the open drawer (on its scrim) or pressing Escape closes it
document.addEventListener('click', e => {
    if (document.body.classList.contains('hier-open') && !e.target.closest('#hierarchy, #hier-toggle')) closeHierarchy();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeHierarchy(); });

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
    setConsoleOpen(true);
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
        status.textContent = { unaware: 'Unaware', suspicious: 'Suspicious...', aware: 'Aware!' }[level];
    }

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
        log('Neuroevolution demo reset to generation 1.');
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
        return `${Math.abs(mil).toFixed(1)} mil <small>${Math.round(Math.abs(mil) / 0.1)} clicks</small>`;
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
            `<text class="drop-label" x="${left + 12}" y="${bottom - 26}">— drop</text>` +
            `<text class="drift-label" x="${left + 12}" y="${bottom - 10}">- - wind drift</text>`;

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
}

// AgroLife demo: real Pergamino lots farmed the way the game farms its neighbours. On 1 May every idle lot
// gets the next crop of the rotation on its typical sowing date; crops advance by growing degree-days under
// weather from the generator's monthly parameters, and are coloured like the map's Status layer.
const AGRO_MONTHS = [31, 30, 31, 31, 30, 31, 30, 31, 31, 28, 31, 30]; // the campaign year runs May → April
const AGRO_MONTH_NAMES = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
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
    trigo: { name: 'Wheat', base: 0, gd: [150, 250, 1500, 1650, 2200], harvestDays: 7, sow: '15/6', light: '#b9d67a', dark: '#4e7a2a' },
    maiz: { name: 'Maize', base: 8, gd: [70, 120, 700, 1100, 1850], harvestDays: 15, sow: '1/10', light: '#8fd18a', dark: '#1f6b2e' },
    soja1: { ...AGRO_SOY, name: 'Soybean' },
    soja2: { ...AGRO_SOY, name: 'Second soybean' },
};
const AGRO_ROTATION = ['maiz', 'soja1', 'trigo']; // wheat is always followed by second soybean
const AGRO_STAGES = ['sown', 'emerged', 'vegetative', 'flowering', 'grain fill', 'mature'];
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

    const toPath = (xy, close, path = new Path2D()) => {
        for (let i = 0; i < xy.length; i += 2) path[i ? 'lineTo' : 'moveTo'](xy[i], xy[i + 1]);
        if (close) path.closePath();
        return path;
    };
    const toLines = data => data.split(';').reduce((path, s) => toPath(s.split(' ').map(Number), false, path), new Path2D());
    const roads = toLines(AGRO_ROADS), streams = toLines(AGRO_STREAMS);
    const lots = AGRO_LOTS.split(';').map(s => {
        const [id, ip, ha, ...xy] = s.split(' ').map(Number);
        return { id, ip, ha, path: toPath(xy, true), crop: null, plan: null };
    });

    const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
    const mix = (a, b, t) => `rgb(${hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t))})`;
    const gradient = t => t < 0.5 ? mix(AGRO_COLORS.red, AGRO_COLORS.yellow, t * 2) : mix(AGRO_COLORS.yellow, AGRO_COLORS.green, t * 2 - 1);
    const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

    let day = 0, campaign = 0, wet = false, zMax = 0, zMin = 0, tMean = 0, hover = null, clock = 0, prevTime = 0, running = false;

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
        const css = getComputedStyle(canvas);
        ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
        ctx.fillStyle = css.getPropertyValue('--field');
        ctx.fillRect(0, 0, 640, 300);
        ctx.lineJoin = 'round';
        ctx.lineWidth = 0.75;
        ctx.strokeStyle = css.getPropertyValue('--field');
        lots.forEach(l => {
            ctx.fillStyle = colorOf(l);
            ctx.fill(l.path);
            ctx.stroke(l.path);
        });
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = css.getPropertyValue('--text-muted');
        ctx.stroke(roads);
        ctx.strokeStyle = '#2c6fb5';
        ctx.stroke(streams);
        if (hover) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = css.getPropertyValue('--text-color');
            ctx.stroke(hover.path);
        }

        const m = monthOf(day);
        const dayOfMonth = day - AGRO_MONTHS.slice(0, m).reduce((a, b) => a + b, 0) + 1;
        stat('date').textContent = `${dayOfMonth} ${AGRO_MONTH_NAMES[m]}`;
        stat('year').textContent = campaign + (m >= 8 ? 1 : 0); // the game's "Year N" turns on 1 January
        stat('temp').textContent = `${tMean.toFixed(1)} °C`;
        const k = hover?.crop;
        stat('lot').textContent = hover
            ? `Lot ${hover.id} · ${hover.ha} ha · IP ${hover.ip} · ${k ? `${k.c.name}, ${AGRO_STAGES[k.stage]}` : 'bare soil'}`
            : 'Point at a lot';
    }

    function drawLegend() {
        if (!legend) return;
        const items = layerSelect?.value === 'ip'
            ? [['IP 0', AGRO_COLORS.red], ['50', AGRO_COLORS.yellow], ['100', AGRO_COLORS.green]]
            : [['Bare soil', AGRO_COLORS.bare], ['Wheat', AGRO_CROPS.trigo.dark], ['Maize', AGRO_CROPS.maiz.dark],
               ['Soybean', AGRO_SOY.dark], ['Mature', AGRO_COLORS.mature]];
        legend.innerHTML = items.map(([text, color]) => `<span><i class="swatch" style="background:${color}"></i>${text}</span>`).join('');
    }

    function pointAt(e) {
        const x = e.offsetX * canvas.width / canvas.clientWidth, y = e.offsetY * canvas.height / canvas.clientHeight;
        hover = lots.find(l => ctx.isPointInPath(l.path, x, y)) || null;
        draw();
    }

    function frame(time) {
        if (canvas.closest('[hidden]')) { running = false; return; }
        const dt = prevTime ? Math.min(0.1, (time - prevTime) / 1000) : 0;
        prevTime = time;
        clock += dt * 6 * Number(speedSelect?.value || 2); // ×1 is 6 days a second, as in the game
        if (clock >= 1) {
            while (clock >= 1) { step(); clock--; }
            draw();
        }
        requestAnimationFrame(frame);
    }

    canvas.addEventListener('pointermove', pointAt);
    canvas.addEventListener('pointerdown', pointAt);
    canvas.addEventListener('pointerleave', () => { hover = null; draw(); });
    layerSelect?.addEventListener('change', () => { drawLegend(); draw(); });

    while (day !== agroDay('25/11')) step(); // open on late spring, when every crop of the rotation is in the ground
    drawLegend();
    draw();
    canvas.startDemo = () => {
        if (!running) { running = true; prevTime = 0; requestAnimationFrame(frame); }
    };
    canvas.startDemo();
}

// Real lots (id, productivity index, hectares, outline) and the main roads and streams around Fontezuela,
// cut from AgroLife's lotes.json / geografia.json into a 640×300 frame (1 px ≈ 31 m)
const AGRO_LOTS = '2134 77 59 168 -9 182 -14 200 -14 200 0 150 2 155 -9 160 -9 161 -10;2143 77 99 615 2 612 8 562 9 562 -10 623 -11 619 -3;2144 77 74 269 -16 270 28 253 28 252 -16;2145 77 71 270 15 269 -4 309 -4 309 14;2159 77 74 234 -15 252 -16 253 28 235 28;2160 77 74 217 -15 234 -15 235 28 218 29;2161 77 76 200 14 142 17 142 15 150 2 200 0;2162 77 82 634 14 633 0 692 3 691 17;2165 86 114 95 16 101 10 103 12 105 11 126 -10 126 -12 135 -12 136 -13 138 -11 148 -10 138 10 133 16 128 21 126 26 127 30 125 33 124 34 93 18;2166 77 74 200 -14 217 -15 218 29 201 29;2168 77 75 546 -9 562 -10 563 39 547 40;2170 77 112 349 33 348 -5 363 -5 379 -5 379 32;2173 77 80 611 11 604 26 563 27 562 9 612 8;2175 41 80 418 -6 457 -7 453 -3 451 0 445 5 439 13 430 21 426 28 424 29 419 37;2176 77 75 531 -9 546 -9 547 40 532 40;2177 65 90 398 -6 418 -6 419 37 412 40 410 43 399 43;2178 77 77 309 -4 328 -5 329 36 309 36;2179 77 75 516 40 515 -9 531 -9 532 40;2182 77 75 499 -8 515 -9 516 40 500 41;2183 77 75 499 -8 500 41 485 41 484 -8;2185 65 75 469 41 468 -8 484 -8 485 41;2187 65 119 424 41 431 32 435 26 444 17 448 11 457 4 458 1 461 -2 465 -7 468 -8 469 41 422 42;2189 77 93 633 -10 634 43 603 43 616 14 625 0 630 -11 633 -11;2193 77 93 380 43 379 -5 398 -6 399 43;2195 77 80 634 28 634 14 691 17 690 32;2197 77 79 201 28 145 31 142 17 200 14;2199 77 77 348 -5 349 35 329 36 328 -5;2201 77 71 270 15 309 14 309 33 270 33;2219 77 50 690 32 676 36 675 41 653 40 634 43 634 28;2220 77 66 603 28 600 34 596 44 563 45 563 27 604 26;2221 77 76 201 42 147 45 145 31 201 28;2224 77 52 634 43 653 40 675 41 676 36 694 30 694 47 635 48;2226 77 67 202 69 201 29 218 29 219 68;2231 86 84 124 45 131 37 133 31 134 25 138 20 142 15 152 73 149 73 121 54;2234 77 73 503 49 502 49 502 41 563 39 563 51 503 53;2240 77 70 253 72 242 68 236 68 236 28 253 28 254 72;2242 77 67 236 28 236 68 219 68 218 29;2243 77 71 271 69 254 72 253 28 270 28;2245 41 67 380 43 410 43 407 48 408 50 411 51 413 50 417 44 422 42 441 42 441 54 380 55;2246 86 106 90 22 93 18 124 34 118 43 113 61 109 62 95 75 95 38 94 37 85 37 85 27;2247 77 74 201 42 202 56 149 59 147 45;2255 77 52 309 33 309 36 284 36 282 38 283 70 271 69 270 33;2258 77 72 503 65 503 53 563 51 564 64;2260 77 103 477 49 475 51 475 62 472 66 441 66 441 42 502 41 502 49;2262 41 108 351 70 350 36 349 35 349 33 379 32 380 69;2263 77 96 635 48 694 47 694 64 635 65;2264 77 73 380 55 441 54 441 66 380 68;2268 57 65 202 69 193 70 193 66 189 66 188 67 188 70 163 71 152 73 149 59 202 56;2275 77 89 574 100 564 100 563 45 580 45 581 99;2279 77 82 616 94 597 96 601 55 603 43 615 43;2281 77 72 504 76 503 65 564 64 564 76 504 77;2285 86 58 141 75 119 77 107 84 101 86 92 88 96 84 99 83 100 79 113 68 115 68 117 66 120 62 121 54 149 73 146 74;2289 77 96 695 80 635 81 635 65 694 64;2291 77 86 503 49 504 100 505 101 487 101 486 49;2292 77 67 596 44 594 54 591 98 581 99 580 45;2293 77 73 380 80 380 68 441 66 442 79;2295 77 95 634 43 636 92 616 94 615 43;2301 77 67 472 66 469 69 470 90 442 91 441 66;2303 77 58 220 68 242 68 252 72 261 70 257 87 209 75 210 69;2305 86 52 111 82 119 77 125 77 159 72 154 92;2309 77 72 504 89 504 77 564 76 564 88;2310 77 73 381 92 380 80 442 79 442 91;2313 77 80 469 69 475 62 475 51 477 49 486 49 487 101 470 102;2317 77 78 636 95 635 81 694 80 694 94;2322 77 100 305 123 288 120 294 72 317 75 306 122 305 123;2323 77 80 253 103 205 91 209 75 257 87;2325 77 64 271 69 272 108 250 115 261 70;2326 77 78 197 124 181 120 189 121 191 119 192 111 184 110 193 70 210 69;2327 77 71 380 69 381 116 366 116 365 69;2328 77 72 181 120 165 116 176 71 188 70 190 71 193 70 184 110 176 110 175 112 174 117 181 120;2329 77 89 288 120 272 116 271 69 294 72;2331 57 72 157 115 156 113 149 112 159 72 176 71 165 116;2332 77 112 317 75 349 78 350 112 310 103;2333 77 70 350 116 349 79 351 76 351 70 365 69 366 116;2338 77 94 470 112 426 113 425 91 470 90;2339 86 83 149 112 149 113 132 108 132 102 130 101 129 98 128 97 124 98 124 106 110 102 108 101 108 86 106 86 105 85 111 82 154 92 149 112;2348 77 105 504 103 505 101 504 100 504 89 564 88 564 100 534 100 534 113 504 114;2354 77 78 636 95 694 94 695 107 636 109;2356 77 94 381 114 381 92 425 91 426 113;2357 77 80 205 91 253 103 249 119 201 108;2363 77 84 551 148 534 131 534 100 555 100 555 149 550 149;2369 77 78 695 121 636 122 636 109 695 107;2373 77 68 491 130 481 130 482 140 471 141 470 102 490 101;2377 77 92 636 92 637 156 622 156 621 94;2381 77 90 606 96 621 94 622 156 607 157 607 141 608 141 608 140 607 140;2382 77 87 350 134 316 126 315 124 306 122 310 103 350 112;2383 57 47 118 135 118 106 122 107 121 108 122 118 123 120 126 119 127 117 134 116 135 110 149 113 149 123 136 123 135 124 135 134;2384 77 98 555 100 574 100 575 128 576 129 576 133 576 149 555 149;2386 77 78 246 134 197 124 201 108 249 119;2388 77 93 399 135 382 136 381 114 426 113 426 134;2389 86 53 77 104 77 136 75 138 75 140 67 141 51 128 60 119 69 118 69 113 63 113 64 112 66 111 68 108 73 107 76 104;2391 86 87 118 147 113 148 98 143 97 107 99 106 98 98 118 106 119 146;2392 77 94 470 133 426 134 426 113 470 112;2393 86 71 91 141 84 139 77 136 77 104 79 103 85 103 86 101 87 104 96 107 97 107 98 143;2396 77 76 576 141 576 133 576 129 575 128 574 100 591 98 589 105 589 141 585 157 576 157 576 144;2399 77 62 505 124 504 114 534 113 534 126 533 138 510 138 512 125;2401 77 66 593 156 595 142 595 105 597 97 606 96 607 140 605 140 605 141 607 141 607 157 592 157;2402 77 70 492 152 493 151 502 148 502 131 491 130 490 101 505 101 504 103 505 124 512 125 509 156 492 157 492 152;2403 77 78 695 135 637 136 636 122 695 121;2404 86 82 156 141 156 135 157 134 157 115 195 123 196 140 156 141;2406 77 59 293 142 290 142 273 138 272 116 305 123 302 133 300 133 299 136 299 137 301 138 295 137 294 142;2408 77 66 294 143 291 144 288 143 287 145 284 145 276 141 246 134 250 115 272 108 273 138 274 139 294 142;2417 77 63 351 156 350 116 366 116 367 159;2418 77 56 314 131 316 130 316 126 350 134 351 156 327 150 328 149 329 144 327 141 324 141 325 138 323 137 323 135 322 134 323 132 325 132 325 129 320 128 318 135 315 133 314 131;2421 77 41 482 140 481 130 502 131 502 148 493 151 492 152 480 147 479 145 478 140;2422 77 71 472 158 509 156 510 138 533 138 531 162 471 161 471 158;2423 77 83 382 136 426 134 426 153 382 154;2424 86 33 65 142 58 145 52 149 38 162 36 160 35 155 39 154 45 148 47 133 49 130 51 128 67 141;2428 77 69 367 159 366 116 381 116 382 163;2432 86 107 134 157 134 156 127 153 119 146 118 135 135 134 137 136 156 135 156 141 172 141 162 167;2433 86 33 78 157 45 158 55 149 61 145 70 142 78 144;2439 77 89 426 134 448 134 449 178 427 173;2440 86 52 179 172 162 167 172 141 190 140;2441 86 92 212 182 209 181 207 182 195 178 213 127 230 131 212 182;2445 57 84 189 176 188 174 187 173 183 174 179 172 190 140 196 140 196 123 213 127 195 178;2448 77 72 213 184 212 182 230 131 243 134 224 188;2459 90 74 236 192 224 188 243 134 255 137;2474 77 60 382 163 382 154 426 153 427 173;2475 77 70 637 136 650 136 651 190 638 190;2479 77 101 468 133 470 133 472 183 449 178 448 134;2482 57 64 91 144 111 151 119 157 120 186 112 190;2485 77 37 543 179 547 176 547 174 545 172 549 168 549 166 545 163 540 169 536 168 533 170 533 169 534 168 533 166 550 149 554 149 555 190;2486 77 84 311 197 310 151 311 148 314 147 328 151 329 197;2487 77 73 236 192 255 137 268 140 260 152 264 153 248 196;2489 77 93 564 199 564 197 563 196 557 195 556 193 556 192 555 190 554 149 576 149 577 191 574 188 572 188 568 193 570 196 568 195;2490 86 52 34 167 5 196 -3 201 -4 201 -5 201 -7 195 -5 194 27 162 26 160 14 149 20 145 19 143 29 155 30 161 32 164;2492 86 100 78 157 78 144 84 142 91 144 112 190 94 198 75 157;2494 77 61 364 159 382 163 382 164 382 196 365 196;2496 77 70 248 196 264 153 266 153 269 150 272 149 271 142 268 141 268 140 273 141 273 143 273 141 275 141 280 144 261 201;2497 77 120 531 165 529 166 529 169 527 168 525 169 524 185 522 187 489 181 488 182 487 186 472 183 471 161 531 162;2499 77 77 328 151 346 155 347 197 329 197;2502 86 113 144 198 120 198 119 157 124 156 133 158 133 157 155 165;2503 77 69 364 159 365 196 347 197 346 155 351 156;2504 77 95 261 201 280 144 287 146 286 153 295 155 277 206 275 205 274 206;2508 77 88 50 153 45 158 54 158 68 188 63 188 63 192 64 193 67 193 68 190 75 206 58 214 56 212 55 209 55 205 53 201 53 198 50 194 50 188 48 184 47 179 44 173 43 167 39 163 51 151 51 152;2510 77 45 570 203 572 203 578 197 578 192 577 191 576 157 585 157 583 175 585 181 586 183 586 208 569 204;2511 86 91 54 158 75 157 94 198 75 206 68 188;2512 86 58 158 197 144 198 155 165 172 171 159 209 158 198;2513 77 64 615 215 604 212 602 157 614 156;2514 77 94 306 157 308 156 309 151 310 151 310 163 294 212 277 206 295 155;2515 77 47 310 163 311 213 310 214 310 216 308 217 294 212;2516 77 98 406 170 430 175 430 214 406 214;2517 77 67 615 215 614 156 626 156 627 217;2521 77 95 383 215 382 165 406 170 406 214;2524 77 70 637 156 638 220 627 217 626 156;2528 77 76 586 183 589 184 591 181 590 175 592 157 602 157 604 212 586 208;2529 57 72 34 167 37 170 38 175 41 181 42 186 44 190 44 196 47 200 47 203 49 206 49 210 52 217 52 222 43 225 22 179;2533 90 81 430 226 430 175 447 179 447 226;2535 86 67 183 174 179 184 177 192 177 194 180 199 178 207 175 210 170 218 166 219 163 224 161 225 159 229 159 209 172 171;2547 77 74 459 182 464 183 464 226 447 226 447 179;2559 86 79 22 179 43 225 27 232 9 192;2563 77 58 657 224 654 222 651 223 638 220 638 190 657 190 657 224;2566 90 114 231 229 220 229 198 198 206 192 213 185 243 195;2567 86 56 18 237 -1 212 0 211 0 207 2 201 9 192 27 232;2568 77 98 331 226 318 221 314 218 313 214 311 213 311 197 347 197 348 232;2570 77 68 366 239 348 232 347 197 365 196;2578 90 105 271 205 271 206 274 207 274 228 231 229 243 195 252 198;2583 86 99 120 198 158 197 159 229 158 231 159 235 157 237 157 241 121 206;2584 77 70 477 186 487 188 486 195 490 196 490 244 477 244;2585 90 57 184 212 185 208 187 206 188 202 191 199 196 200 198 198 220 229 202 229;2586 86 65 120 195 121 206 154 239 135 247 110 190 120 186;2589 77 59 503 199 503 244 490 244 490 196;2590 77 81 382 196 384 246 366 239 365 196;2592 86 126 116 256 91 199 110 190 135 247;2594 77 81 503 244 503 199 523 203 523 244;2599 77 75 464 197 464 183 477 186 477 244 464 244;2600 77 80 524 203 525 203 526 200 539 202 542 200 542 244 523 244 523 203;2601 77 110 563 255 542 255 542 200 543 199 563 203;2603 86 84 91 199 116 256 104 261 78 205;2605 77 49 312 240 312 227 313 227 314 224 315 223 329 228 329 227 367 241;2606 77 76 563 255 563 203 584 208 573 255;2607 77 64 588 254 573 255 584 208 598 211;2610 90 76 293 213 305 218 310 222 310 223 311 227 312 227 312 259 294 260;2611 77 75 589 255 588 254 598 211 612 214 600 267 589 265 589 255;2613 86 79 -20 218 -5 211 -1 212 24 245 7 257 -1 246 1 246 14 233 1 235 -6 238;2614 21 87 275 253 279 247 278 244 275 244 275 243 274 207 286 211 293 213 294 260 275 260;2615 86 84 78 205 104 261 91 267 65 210;2616 77 83 384 247 383 215 407 214 407 255;2625 90 57 198 229 199 254 170 226 177 222 178 220 178 217 184 212 202 229;2626 90 81 198 230 217 229 218 272 199 273;2627 21 72 78 273 79 268 74 260 73 255 69 252 68 244 62 237 60 224 58 220 58 214 65 210 91 267;2628 86 95 -33 223 -20 218 -6 238 -9 239 -15 245 -12 248 -1 246 7 257 -10 269 -40 226;2629 77 76 625 217 614 271 600 267 612 214;2633 77 105 430 214 430 264 407 255 407 214;2634 77 116 625 217 646 222 634 277 613 272;2640 90 56 255 228 274 228 275 244 271 248 267 258 261 265 258 272 256 272;2641 90 98 312 257 312 240 367 241 372 243 372 258;2642 77 68 430 264 430 226 447 226 447 271;2643 90 81 255 228 256 272 237 272 236 229;2645 90 81 217 229 236 229 237 272 218 272;2646 57 92 52 222 54 225 56 239 62 246 63 254 67 258 68 263 72 270 72 275 58 281 35 229;2648 90 87 199 282 165 249 166 246 165 244 166 233 166 231 168 229 170 226 199 254;2650 77 65 372 243 431 265 430 266 371 264;2651 90 65 646 222 651 223 650 225 649 239 649 247 655 275 654 281 634 277;2655 86 60 56 282 27 248 18 237 35 229 58 281;2659 77 78 464 226 464 277 447 271 447 226;2660 77 70 484 284 464 277 464 244 484 244;2663 86 62 157 241 157 245 158 247 155 250 147 252 143 256 140 264 137 266 136 269 127 278 117 255 154 239;2679 90 103 551 278 543 278 542 255 588 254 589 277 578 278 557 277 552 278;2680 57 64 27 248 33 255 29 257 31 260 33 260 35 258 35 257 59 285 46 294 16 251 24 245;2682 77 74 542 244 543 305 530 300 530 244;2684 90 96 313 273 312 257 372 258 371 275;2686 77 64 504 244 517 244 517 296 504 291;2688 77 70 530 244 530 300 517 296 517 244;2691 86 56 127 278 125 280 123 280 120 283 117 287 113 287 110 292 97 264 117 255;2692 90 92 149 262 150 259 155 259 159 256 165 249 198 280 183 295;2695 77 83 484 284 484 244 504 244 504 291 489 286;2697 90 122 430 266 431 287 370 285 371 264;2698 86 67 33 303 3 260 16 251 39 283 36 281 34 283 32 282 31 282 22 275 17 280 31 291 38 285 39 285 40 284 46 294;2704 90 97 312 259 314 312 295 312 294 260;2706 90 97 276 296 275 260 294 260 295 312 276 313 276 300;2707 90 94 313 290 313 273 371 275 370 292;2709 21 106 275 253 276 314 236 315 236 313 239 311 241 307 244 305 246 301 250 299 253 295 255 293 256 290 263 277 265 272 269 265 273 262 275 254;2711 86 81 20 312 -10 269 3 260 33 303;2715 90 93 137 279 137 278 140 277 146 266 149 264 149 262 183 295 169 310;2719 90 72 417 308 421 306 431 305 431 265 452 273 434 318 416 308;2725 90 64 543 305 543 278 556 277 568 278 561 311;2727 21 101 225 308 224 281 199 282 199 273 258 272 249 289 245 294 240 297 239 301 236 302 233 307 229 309 228 316 225 316;2728 86 77 110 292 108 297 110 303 111 310 118 323 114 321 107 315 101 305 98 303 96 298 92 295 90 291 87 290 87 287 83 282 82 277 78 274 78 273 97 264;2729 90 111 370 285 431 287 431 305 421 306 418 308 414 307 400 303 385 300 385 306 369 305;2730 90 112 614 271 602 324 581 317 593 266;2731 90 80 571 278 578 278 589 277 589 265 593 266 581 317 561 311 568 278;2736 57 69 94 324 56 282 72 275 73 277 76 280 77 285 81 289 82 294 85 296 87 299 90 302 92 306 104 321 102 323 97 323 94 324;2737 90 93 208 316 205 319 199 320 198 319 198 306 197 295 198 282 224 281 225 316;2738 90 92 464 278 464 299 462 300 461 301 461 311 460 312 454 322 452 323 451 326 434 318 452 273;2739 77 72 464 317 468 314 468 302 467 300 464 299 464 278 484 285 484 322 464 322;2740 90 113 634 277 622 331 602 324 613 272;2741 90 92 314 307 313 290 370 292 369 308;2743 90 92 121 293 126 287 129 286 133 284 137 279 169 310 154 325;2745 90 78 198 282 197 295 199 320 205 319 208 316 228 316 227 320 224 319 221 319 219 321 219 323 217 324 215 323 212 323 207 325 205 327 199 324 194 325 191 324 173 306 198 280 199 282;2751 21 85 654 281 654 284 648 295 642 310 639 317 632 334 622 331 634 277;2752 86 83 71 298 30 326 20 312 59 285;2756 77 64 489 287 504 292 504 321 484 322 484 285;2760 77 88 518 297 543 305 544 321 504 321 504 292;2763 90 73 148 332 137 333 127 328 120 313 117 308 117 300 114 296 116 294 119 294 121 293 154 325;2775 57 86 71 298 82 311 40 341 30 326';
const AGRO_ROADS = '37 164 35 166;-2 124 -3 126;-1 123 -2 124;0 121 -1 123;1 120 0 121;3 118 1 120;5 116 3 118;5 115 5 116;6 114 5 115;9 112 6 114;10 111 9 112;11 109 10 111;12 108 11 109;14 106 12 108;15 105 14 106;17 102 15 105;20 100 17 102;22 98 20 100;24 95 22 98;26 93 24 95;27 91 26 93;29 88 27 91;34 72 31 71;31 71 28 70;28 70 25 69;25 69 24 68;24 68 23 67;23 67 22 67;1 72 4 74;-2 71 1 72;-2 71 -1 68;-1 68;20 66 17 65;17 65;16 65 17 65;17 65 15 64;14 64 16 65;15 64 14 64;22 67 20 66;-1 68 0 65;0 65 1 65;1 65 2 62;2 62;2 62 3 59;12 63 14 64;9 61 12 63;6 60 9 61;3 59 2 59;3 59 3 58;3 58 2 59;2 59 -1 57;-1 57 -4 56;3 59 6 60;4 55 3 58;4 55 6 54;5 54 4 55;6 54;5 53 5 54;38 48 35 46;35 46;6 54 7 51;6 51 5 53;7 51 8 48;8 48 6 51;8 48 9 46;8 46 8 48;9 46 10 43;10 43 8 46;35 46 32 45;32 45 30 44;30 44 29 44;29 44 28 44;28 44 25 42;25 42 22 41;22 41 19 39;10 43 11 40;11 40 10 43;19 39 16 38;11 40 13 37;13 37 11 40;16 38 13 37;9 35 13 37;13 37 14 34;6 34 9 35;3 33 6 34;0 31 3 33;-3 30 0 31;14 34 17 27;17 27 18 24;19 21 21 18;21 18 22 15;40 20 33 13;18 24 19 21;22 15 23 13;23 13 24 11;33 13 27 8;24 11 24 10;24 10 25 8;25 8 26 6;27 8 26 6;26 6 23 4;23 4 22 3;22 3 15 -4;36 166 37 164;19 237 2 215 -4 206;-32 222 -15 214 -8 210 36 166;35 166 -8 209 -16 214 -32 221;298 215 299 216;299 215 298 215;273 205 187 175;187 176 268 204;272 205 298 215;298 215 273 205;268 204 272 205;95 326 19 237;37 164 51 151 59 145 69 142 80 141 92 143 185 175;186 175 91 142 82 140 69 141 58 145 50 150 37 164;78 141 78 148;76 144 80 143;78 139 78 141;80 137 77 136 75 138;77 133 78 139;77 117 77 133;299 216 489 287 852 408;852 408 489 286 299 215;577 206 569 204;569 204 552 201;758 277 707 240 696 233 577 206;552 201 529 195;529 195 526 191 523 190;523 190 516 189;516 189 506 186;185 175 187 176;187 175 186 175;311 146 307 145;307 145 304 144;290 144 285 145 281 144;292 144 290 144;326 150 311 146;281 144 280 143;304 144 297 142 292 144;275 141 280 143;280 143 274 140;273 141 275 141;273 141;273 141;273 141;274 140 273 141;273 141 273 140;274 140 273 140;266 139 273 141;273 140 266 139;506 186 500 185 489 186 326 150;202 125 266 139;202 125 201 124;77 102 77 117;201 124 118 106 97 98;77 99 77 102;97 98 87 94;77 89 77 99;37 87;37 87 36 87;36 87 35 87;35 87 34 87;32 86 29 88;34 87 33 86;33 86 32 86;32 85 32 86;29 84 32 86;28 84 29 84;32 84 32 85;26 83 28 84;32 82 32 84;23 82 26 83;20 81 23 82;34 79 32 82;36 77 34 79;17 79 20 81;15 78 17 79;13 78 15 78;10 76 13 78;8 76 10 76;7 75 8 76;37 76 36 77;38 74 35 73;35 73 34 72;6 75 7 75;4 74 6 75;87 94 84 92;84 92 83 92;83 92 77 89;77 89 76 88;76 88 72 88;72 88 67 87;40 87 37 87;67 87 65 87;44 87 40 87;65 87 64 87;64 87 61 87;61 87 58 87;58 87 57 87;57 87 55 87;55 87 51 87;45 87 44 87;51 87 48 87;48 87 45 87;38 74 37 76;39 74 38 74;40 72 39 74;43 69 40 72;48 65 43 69;49 64 48 65;53 59 49 64;54 58 53 59;56 56 54 58;56 56;56 56 54 55;58 53 56 56;54 55 51 53;51 53 47 52;61 51 58 53;47 52;47 52 46 51;46 51;46 51 45 51;45 51 40 49;40 49 38 48;66 45 61 51;75 37 66 45;78 33 75 37;66 45 58 37;58 37;58 37 53 33;53 33 40 20;85 26 78 33;78 33 70 25;70 25 70 24;89 21 85 26;70 24 65 20;101 10 89 21;65 20 60 15;60 15 52 8;102 8 101 10;52 8 46 1;112 -2 102 8;46 1 39 -5;118 -8 112 -2';
const AGRO_STREAMS = '20 140 32 155;5 115 9 123 12 127 13 132 20 140;22 107 18 104 12 118 12 127;-5 108 5 115;26 103 24 107 22 107;30 89 31 94 27 97 28 101 26 103;133 278 131 281 129 281 128 283 125 283 123 285 122 285 122 287 119 288 118 291 115 290 112 294 111 298 114 301 114 309;139 270 135 273 134 276 133 276 130 278 129 281;32 155 34 161 40 169 41 174 44 180 47 190 47 195 50 199 50 202 52 205 52 209 55 216 55 220 57 224 59 238 65 245 66 253 70 257 71 261 76 269 76 276 79 279 85 292 88 293 90 297 93 300 95 304 105 317 113 324 123 330 129 332 134 335 144 336 150 335 153 335 156 338 161 337 169 337 181 340 183 342 187 342 190 347 195 347 196 351 199 353 204 359 213 365 215 368 216 372 222 376 227 376 236 386 238 392 242 396 243 400 253 410 257 415 259 421 265 428 268 436 267 442 271 444 277 443 279 446 286 452 291 453 294 452 297 455 302 455 306 456 312 453 319 456 323 454 335 456 343 456 347 457 351 455 368 451 373 456 379 457 382 459 387 458 390 460 397 461 404 464 411 471 417 471 419 473 425 474 429 480 439 484 442 487 452 488 456 494 461 493 466 497 470 497 476 502 485 502 494 508 500 510 508 521 515 520 524 527 531 528 537 531 544 532 553 531 571 525 574 526 584 523 588 524 598 521 620 509 630 508 637 499 641 497 649 489 658 488 664 485 673 483 681 483 696 480 705 477 712 477 718 473 727 472;276 247 272 252 270 260 267 263 262 270 260 276 252 289 253 291 248 294 248 297 242 299 242 303 238 304 236 309 232 311 233 313 231 315;276 247;210 184 195 196 194 197 194 195 188 196 188 198 187 197 187 199 184 202 184 204 182 207;186 176 180 193 184 198 182 208 174 216 174 218 175 218 175 219 173 219 171 222 168 222 165 226 166 228 163 227 163 229 161 231 163 233 162 239 160 239 160 240 162 242 160 244 163 247 160 251 158 251 158 253 155 253 154 256 153 255 152 256 152 254 150 254 149 256 148 256 148 258 146 258 146 262 144 263 141 268 139 268 140 271 137 275;59 115 52 121 52 123 44 132 43 146 37 151 32 153;59 115;60 115 59 115;60 114 60 115;76 101 72 102 72 104 67 105 64 108 61 109 60 114;77 101 76 101;83 92 77 101;84 92 83 92;87 88 87 89 84 92;465 302 465 313;588 181 587 175 592 141;592 141;592 141 592 105 594 97;594 97;594 97 597 54 601 40;601 40 613 12 627 -11;87 87 87 88;114 65 112 65 97 78 97 81 94 81 87 87;114 65;47 51 47 52;58 37 47 51;66 28 58 37;151 -8 136 18 131 24 130 31 128 35 121 44 117 60 114 65;70 25 66 28;70 24 70 25;73 21 70 24;88 -2 81 5 79 13 73 21;43 -1 43 0;44 -1 43 -1;49 -9 44 -1;411 48 414 42 420 40 423 37 433 23 442 15 447 7 455 2 455 -1 459 -4 465 -14 468 -15 470 -18 472 -21 472 -27 474 -28 474 -31 476 -32 479 -49 484 -51 484 -54 486 -54 485 -58 490 -66 490 -68 493 -70 499 -71 499 -74 503 -76 503 -78 505 -78 505 -80 509 -84 509 -86 512 -89 511 -93 513 -97 515 -107 519 -108 523 -119 528 -122 528 -125 531 -124 547 -149 550 -150 549 -152 550 -156 552 -158 553 -161 553 -164 555 -165 554 -168 559 -180 559 -184 560 -192 563 -197 562 -199 565 -200 565 -203 568 -205 568 -207 574 -213 577 -219 581 -220 583 -223 585 -232 588 -236 587 -241 588 -242 592 -247 597 -264 601 -284;33 70 34 72 29 84 31 85 30 89;39 61 35 64 33 70;39 61;43 56 39 61;30 37;30 30 30 37;30 30;36 16 33 20 30 30;36 16;38 4 35 8 34 12 36 16;39 4 38 4;42 0 39 4;43 0 42 0';

// ---------- Init ----------
updateThemeBtn();
route();
log('Editor loaded. Type \'help\' in the console or pick something from the Hierarchy.');
log('Tip: some old-school cheat codes still work around here.');
if (!reducedMotion) setTimeout(type, 2000);
