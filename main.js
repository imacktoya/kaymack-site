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
                body: JSON.stringify(data),
            });
            if (!r.ok) throw new Error('send failed');
            leadForm.reset();
            status.textContent = "Got it — we'll be in touch within one business day.";
            status.className = 'lf-status success';
        } catch {
            status.textContent = 'Something went wrong on our end — book a free Tech Check above instead, or try again in a minute.';
            status.className = 'lf-status error';
        } finally {
            btn.disabled = false;
        }
    });
}
