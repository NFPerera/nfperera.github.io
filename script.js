document.documentElement.classList.add('js');

// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open);
});

navLinks.addEventListener('click', e => {
    if (e.target.closest('a')) {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
    }
});

// Typewriter effect
const typingText = document.getElementById('typing-text');
const phrases = ["Software Developer", "Gameplay Programmer", "Tools Engineer", "AI Tinkerer", "Systems Architect"];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

if (!reducedMotion) setTimeout(type, 2000);

// Project filters
const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.project-card');

filters.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        filters.forEach(b => {
            b.classList.toggle('is-active', b === btn);
            b.setAttribute('aria-pressed', b === btn);
        });
        cards.forEach(card => {
            card.hidden = filter !== 'all' && card.dataset.category !== filter;
        });
    });
});

// Scroll reveal + current-section highlight in nav
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const navAnchors = navLinks.querySelectorAll('a');
const navObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => navObserver.observe(s));

// Click-to-copy email
const emailBtn = document.getElementById('email-btn');
const emailStatus = document.getElementById('email-status');

emailBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(emailBtn.dataset.email).then(() => {
        emailStatus.textContent = 'Copied to clipboard!';
    }).catch(() => {
        window.location.href = 'mailto:' + emailBtn.dataset.email;
    });
    setTimeout(() => { emailStatus.textContent = 'Click to copy'; }, 2000);
});

document.getElementById('year').textContent = new Date().getFullYear();
