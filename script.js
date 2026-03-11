/* ============================================================
   SCRIPT.JS — Portfolio Séraphin Kokou
   Canvas Hero · Scroll FX · Nav · Portfolio Filter · Form
============================================================ */

'use strict';

// ── Utility: run once DOM is ready ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
    initStickyHeader();
    initMobileNav();
    initScrollAnimations();
    initCounters();
    initPortfolioFilter();
    initContactForm();
    initActiveNav();
});

/* ============================================================
   1. HERO CANVAS — Particle Network Animation
============================================================ */
function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height, particles, animId;
    const PARTICLE_COUNT = 90;
    const MAX_DIST = 140;
    const COLORS = ['rgba(59,130,246,', 'rgba(249,115,22,', 'rgba(168,85,247,'];

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }

    class Particle {
        constructor() { this.reset(true); }
        reset(rand = false) {
            this.x = rand ? Math.random() * width : Math.random() < 0.5 ? 0 : width;
            this.y = rand ? Math.random() * height : Math.random() < 0.5 ? 0 : height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.r = Math.random() * 2 + 1;
            this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
            this.alpha = Math.random() * 0.5 + 0.2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const opacity = (1 - dist / MAX_DIST) * 0.18;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = a.color + opacity + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        animId = requestAnimationFrame(animate);
    }

    init();
    animate();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { cancelAnimationFrame(animId); init(); animate(); }, 200);
    });
}

/* ============================================================
   2. STICKY HEADER — scroll class
============================================================ */
function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

/* ============================================================
   3. MOBILE NAV — burger toggle
============================================================ */
function initMobileNav() {
    const burger = document.getElementById('burger');
    const navList = document.getElementById('navList');
    if (!burger || !navList) return;

    burger.addEventListener('click', () => {
        const open = burger.classList.toggle('open');
        burger.setAttribute('aria-expanded', open);
        navList.parentElement.classList.toggle('open', open);
    });

    // Close on nav link click
    navList.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
            navList.parentElement.classList.remove('open');
        });
    });
}

/* ============================================================
   4. SCROLL ANIMATIONS — IntersectionObserver
============================================================ */
function initScrollAnimations() {
    const delay = [0, 100, 200, 300];

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const idx = Array.from(el.parentElement.children).indexOf(el);
                const d = delay[idx % delay.length] || 0;
                setTimeout(() => el.classList.add('visible'), d);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.05 });

    const targets = document.querySelectorAll(
        '.timeline-item, .stat-card, .expertise-card, .project-card'
    );

    // Make elements already in viewport visible immediately
    requestAnimationFrame(() => {
        targets.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('visible');
            } else {
                observer.observe(el);
            }
        });
    });
}

/* ============================================================
   5. COUNTERS — animate number on scroll
============================================================ */
function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            let current = 0;
            const step = Math.ceil(target / 30);
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                el.textContent = current;
                if (current >= target) clearInterval(timer);
            }, 50);
            obs.unobserve(el);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => obs.observe(c));
}

/* ============================================================
   6. PORTFOLIO FILTER
============================================================ */
function initPortfolioFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!buttons.length || !cards.length) return;

    // Make all cards visible initially
    cards.forEach(card => card.classList.add('visible'));

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            buttons.forEach(b => b.classList.remove('filter-btn--active'));
            btn.classList.add('filter-btn--active');

            const filter = btn.dataset.filter;

            cards.forEach((card, i) => {
                const cats = card.dataset.category ? card.dataset.category.split(' ') : [];
                const match = filter === 'all' || cats.includes(filter);
                if (match) {
                    card.classList.remove('hidden');
                    // Stagger re-animation
                    card.classList.remove('visible');
                    setTimeout(() => card.classList.add('visible'), i * 50);
                } else {
                    card.classList.remove('visible');
                    card.classList.add('hidden');
                }
            });
        });
    });
}

/* ============================================================
   7. ACTIVE NAV — highlight current section on scroll
============================================================ */
function initActiveNav() {
    const links = document.querySelectorAll('.nav__link');
    const sections = document.querySelectorAll('section[id], footer[id]');
    if (!sections.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                links.forEach(l => {
                    const active = l.getAttribute('href') === `#${id}`;
                    l.classList.toggle('active', active);
                });
            }
        });
    }, { rootMargin: '-45% 0px -45%', threshold: 0 });

    sections.forEach(s => obs.observe(s));
}

/* ============================================================
   8. CONTACT FORM — client-side validation + UX
============================================================ */
function initContactForm() {
    // Le formulaire est maintenant géré nativement via HTML (FormSubmit.co)
    // Cela permet l'envoi de l'email d'activation lors de la première utilisation.
}

/* ============================================================
   9. SMOOTH ANCHOR OFFSET — account for fixed header
============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (!target) return;
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 70;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* ============================================================
   10. CERTIFICATE VIEWER — secure modal, no download
============================================================ */

// Domains that block iframe embedding — show direct link fallback immediately
const IFRAME_BLOCKED_DOMAINS = ['coursera.org', 'www.coursera.org'];

function openCertifViewer(url, title) {
    const modal = document.getElementById('certifModal');
    const frame = document.getElementById('certifFrame');
    const label = document.getElementById('certifModalTitle');
    const body = document.querySelector('.certif-modal__body');
    if (!modal || !frame) return;

    label.textContent = title || 'Certificat';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Remove any previous fallback card
    const prev = body.querySelector('.certif-blocked');
    if (prev) prev.remove();

    // Check if the URL is from a domain that blocks iframes
    let isBlocked = false;
    try {
        const parsed = new URL(url);
        isBlocked = IFRAME_BLOCKED_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
    } catch (e) { /* invalid URL — fall through */ }

    if (isBlocked) {
        // Show fallback immediately without trying the iframe
        frame.style.display = 'none';
        showFallback(url, title, body, 'Coursera');
    } else {
        // Try embedding (works for Google Docs viewer / PDF links)
        frame.style.display = 'block';
        frame.src = url;

        let blocked = false;
        const TIMEOUT = 4000;
        const timer = setTimeout(() => {
            try {
                const doc = frame.contentDocument || frame.contentWindow.document;
                if (!doc || doc.body.innerHTML === '') showBlocked();
            } catch (e) { /* cross-origin, probably fine */ }
        }, TIMEOUT);

        frame.onload = () => {
            clearTimeout(timer);
            try {
                const doc = frame.contentDocument || frame.contentWindow.document;
                if (!doc || doc.body.innerHTML === '') showBlocked();
            } catch (e) { /* cross-origin, content rendered */ }
        };

        frame.onerror = () => { clearTimeout(timer); showBlocked(); };

        function showBlocked() {
            if (blocked) return;
            blocked = true;
            frame.style.display = 'none';
            showFallback(url, title, body, 'l\'hébergeur');
        }
    }

    document._certifEsc = (e) => { if (e.key === 'Escape') closeCertifViewer(); };
    document.addEventListener('keydown', document._certifEsc);
}

function showFallback(url, title, body, providerName) {
    const card = document.createElement('div');
    card.className = 'certif-blocked';
    card.innerHTML = `
        <div class="certif-blocked__logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="8" r="6"/>
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
        </div>
        <h3>${title}</h3>
        <p>Ce certificat est hébergé sur <strong>${providerName}</strong> et ne peut pas être intégré directement pour des raisons de sécurité (politique <code>X-Frame-Options</code>).</p>
        <p class="certif-blocked__sub">Cliquez sur le bouton ci-dessous pour voir et vérifier ce certificat officiel.</p>
        <a href="${url}" target="_blank" rel="noopener noreferrer" class="certif-blocked__btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            Voir le certificat sur ${providerName}
        </a>
    `;
    body.appendChild(card);
}

function closeCertifViewer() {
    const modal = document.getElementById('certifModal');
    const frame = document.getElementById('certifFrame');
    if (!modal) return;

    modal.classList.remove('open');
    document.body.style.overflow = '';

    // Delay src clear to allow closing animation
    setTimeout(() => { if (frame) frame.src = ''; }, 300);

    if (document._certifEsc) {
        document.removeEventListener('keydown', document._certifEsc);
        delete document._certifEsc;
    }
}

/* ── Global protection: block easy save / print shortcuts ──────────────────── */
document.addEventListener('keydown', (e) => {
    // Block Ctrl+S (save), Ctrl+P (print), Ctrl+Shift+I (devtools) on cert modal
    const modal = document.getElementById('certifModal');
    if (!modal || !modal.classList.contains('open')) return;
    if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
        e.preventDefault();
    }
});

/* ============================================================
   SECTION NAVIGATION ARROW LOGIC
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const sections = Array.from(document.querySelectorAll('section'));
    const arrow = document.getElementById('nextSectionArrow');

    if (!arrow || sections.length === 0) return;

    function updateArrow() {
        const scrollY = window.scrollY;

        let currentSectionIndex = -1;

        // Find the current section
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop - 100; // Header offset
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionBottom) {
                currentSectionIndex = index;
            }
        });

        // Handle bottom of page
        const isAtBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50;

        if (scrollY > 100) {
            arrow.classList.add('visible');
        } else {
            arrow.classList.remove('visible');
        }

        if (isAtBottom || currentSectionIndex === sections.length - 1) {
            arrow.classList.add('up');
            arrow.setAttribute('title', 'Retourner en haut');
            arrow.setAttribute('aria-label', 'Retourner en haut');
        } else {
            arrow.classList.remove('up');
            arrow.setAttribute('title', 'Section suivante');
            arrow.setAttribute('aria-label', 'Section suivante');
        }
    }

    arrow.addEventListener('click', (e) => {
        e.preventDefault();

        const isUp = arrow.classList.contains('up');

        if (isUp) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            let nextIndex = 0;
            const scrollY = window.scrollY;

            for (let i = 0; i < sections.length; i++) {
                if (sections[i].offsetTop - 100 > scrollY + 10) {
                    nextIndex = i;
                    break;
                }
            }

            const targetSection = sections[nextIndex];
            if (targetSection) {
                const targetTop = targetSection.offsetTop - document.querySelector('header').offsetHeight;
                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            }
        }
    });

    // Debounce the arrow scroll listener a bit for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                updateArrow();
                scrollTimeout = null;
            }, 50);
        }
    });

    // Initial check
    updateArrow();
});

/* ============================================================
   11. MON GOMBO CAROUSEL
============================================================ */
function initGomboCarousel() {
    const images = document.querySelectorAll('.gombo-img');
    if (!images.length) return;

    let currentIndex = 0;

    setInterval(() => {
        images[currentIndex].classList.remove('gombo-img--active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('gombo-img--active');
    }, 3000); // Change image every 3 seconds
}

// Initialize the carousel
document.addEventListener('DOMContentLoaded', () => {
    initGomboCarousel();
});
