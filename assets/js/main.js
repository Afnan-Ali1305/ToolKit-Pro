// Main JavaScript for Your Website
// Initialize AOS animations
AOS.init({
    duration: 800,
    offset: 100,
    once: true
});

// Header scroll effect
window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
});

// Mobile menu functionality
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const overlay = document.getElementById('overlay');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
});

mobileMenuClose.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

overlay.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.getAttribute('href') === '#') return;

        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            // Close mobile menu if open
            mobileMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';

            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Tool card interaction
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-10px)';
    });

    card.addEventListener('mouseleave', function () {
        if (!this.classList.contains('clicked')) {
            this.style.transform = 'translateY(0)';
        }
    });

    card.addEventListener('click', function () {
        this.classList.toggle('clicked');
    });
});

// Add loading animation to buttons
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function (e) {
        // Only animate if it's not a link button
        if (this.getAttribute('href')) return;

        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        this.style.pointerEvents = 'none';

        // Reset after 2 seconds
        setTimeout(() => {
            this.innerHTML = 'Action Completed!';
            setTimeout(() => {
                this.innerHTML = 'Get Started';
                this.style.pointerEvents = 'auto';
            }, 1500);
        }, 2000);
    });
});
