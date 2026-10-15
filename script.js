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
const demos = { fsm: fsmDemo, perception: perceptionDemo, neuro: neuroDemo, ballistics: ballisticsDemo };
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

// ---------- Init ----------
updateThemeBtn();
route();
log('Editor loaded. Type \'help\' in the console or pick something from the Hierarchy.');
log('Tip: some old-school cheat codes still work around here.');
if (!reducedMotion) setTimeout(type, 2000);
