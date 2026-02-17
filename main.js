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
