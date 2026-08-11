// ===========================
// Theme Toggle
// ===========================
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
} else if (systemPrefersDark) {
    html.setAttribute('data-theme', 'dark');
}

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'light') {
        html.removeAttribute('data-theme');
    } else {
        html.setAttribute('data-theme', newTheme);
    }
    localStorage.setItem('theme', newTheme);
});

// ===========================
// Header Scroll Effect
// ===========================
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===========================
// Scroll Animations
// ===========================
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('animate');
            }, index * 100);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.problem-card, .service-card, .pricing-card, .step, .approach-card, .path-card')
    .forEach(el => observer.observe(el));

// ===========================
// Auto-update Copyright Year
// ===========================
document.getElementById('year').textContent = new Date().getFullYear();

// ===========================
// Analytics — GA4 loads only when a measurement ID is set below (get one from
// analytics.google.com; required for Google Ads conversion import). Until then
// track() is a safe no-op, and Cloudflare Web Analytics (dashboard toggle)
// covers basic traffic.
// ===========================
const ANALYTICS_ID = ''; // e.g. 'G-XXXXXXXXXX'
if (ANALYTICS_ID) {
    const gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + ANALYTICS_ID;
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_ID);
}
const track = (name, props) => { if (window.gtag) window.gtag('event', name, props || {}); };

// ===========================
// Attribution — first-touch UTMs + referrer, kept for the session so the lead
// form and Calendly links carry them into the CRM (which channel produced this
// lead). First touch wins: a later internal navigation never overwrites it.
// ===========================
const ATTR_KEY = 'km_attr';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
(() => {
    if (sessionStorage.getItem(ATTR_KEY)) return;
    const params = new URLSearchParams(location.search);
    const external = document.referrer && !document.referrer.includes(location.host);
    if (!external && !UTM_KEYS.some((k) => params.get(k))) return;
    const attr = { landing: location.pathname };
    if (external) attr.referrer = document.referrer;
    UTM_KEYS.forEach((k) => { if (params.get(k)) attr[k] = params.get(k); });
    try { sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr)); } catch { /* private mode */ }
})();
const getAttr = () => { try { return JSON.parse(sessionStorage.getItem(ATTR_KEY)) || {}; } catch { return {}; } };

// ===========================
// Calendly links — tag each with its placement + the visitor's UTMs. Calendly
// forwards these into the booking webhook, so booked leads land in the CRM
// already attributed; clicks are also tracked per placement.
// ===========================
document.querySelectorAll('a[href*="calendly.com"], a[href$="/book"], a[href*="/book?"]').forEach((a) => {
    const card = a.closest('.pricing-card');
    const placement =
        (a.classList.contains('header-cta') && 'header') ||
        (a.classList.contains('hero-cta') && 'hero') ||
        (card && 'pricing-' + (card.querySelector('h3')?.textContent || 'card').trim().toLowerCase().replace(/\s+/g, '-')) ||
        (a.closest('section[id]')?.id || 'page');
    const attr = getAttr();
    try {
        const u = new URL(a.href);
        u.searchParams.set('utm_source', attr.utm_source || 'website');
        if (attr.utm_medium) u.searchParams.set('utm_medium', attr.utm_medium);
        if (attr.utm_campaign) u.searchParams.set('utm_campaign', attr.utm_campaign);
        u.searchParams.set('utm_content', placement);
        a.href = u.toString();
    } catch { /* leave the link as-is */ }
    a.addEventListener('click', () => track('calendly_click', { placement }));
});

// ===========================
// Lead form → /api/lead (Pages Function → CRM)
// ===========================
const leadForm = document.getElementById('leadForm');
if (leadForm) {
    leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('lf-status');
        const btn = document.getElementById('lf-submit');
        const data = Object.fromEntries(new FormData(leadForm).entries());
        if (!data.name.trim() || !data.email.trim()) {
            status.textContent = 'Add your name and email so we can reach you.';
            status.className = 'lf-status error';
            return;
        }
        btn.disabled = true;
        status.textContent = 'Sending…';
        status.className = 'lf-status';
        try {
            const r = await fetch('/api/lead', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ ...data, attribution: { ...getAttr(), page: location.pathname } }),
            });
            if (!r.ok) throw new Error('send failed');
            leadForm.reset();
            status.textContent = "Got it — we'll be in touch within one business day.";
            status.className = 'lf-status success';
            track('lead_form_submit', {});
        } catch {
            status.textContent = 'Something went wrong on our end — book a free Tech Check above instead, or try again in a minute.';
            status.className = 'lf-status error';
        } finally {
            btn.disabled = false;
        }
    });
}
