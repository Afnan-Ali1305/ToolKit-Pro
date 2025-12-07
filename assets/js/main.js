// Main JavaScript for ToolKit Pro Website
document.addEventListener('DOMContentLoaded', function() {
    // ========== INITIALIZE AOS ANIMATIONS ==========
    AOS.init({
        duration: 800,
        offset: 100,
        once: true,
        easing: 'ease-in-out'
    });

    // ========== THEME TOGGLE SETUP ==========
    initializeThemeSystem();

    // ========== HEADER SCROLL EFFECT ==========
    const header = document.getElementById('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    });

    // ========== MOBILE MENU FUNCTIONALITY ==========
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const overlay = document.getElementById('overlay');

    function openMobileMenu() {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileMenuBtn.addEventListener('click', openMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);
    overlay.addEventListener('click', closeMobileMenu);

    // Close mobile menu when clicking on links
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ========== SMOOTH SCROLLING ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return;

            e.preventDefault();
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                closeMobileMenu(); // Close mobile menu if open
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== EXPLORE TOOLS BUTTON FUNCTIONALITY ==========
    const exploreToolsBtn = document.querySelector('.hero-btns .btn-primary');
    if (exploreToolsBtn && !exploreToolsBtn.getAttribute('href')) {
        exploreToolsBtn.addEventListener('click', function() {
            // Scroll to tools section
            const toolsSection = document.getElementById('tools');
            if (toolsSection) {
                window.scrollTo({
                    top: toolsSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Add visual feedback
                this.innerHTML = '<i class="fas fa-tools"></i> Exploring Tools...';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-check"></i> Tools Loaded!';
                    setTimeout(() => {
                        this.innerHTML = 'Explore Tools';
                    }, 1000);
                }, 800);
            }
        });
    }

    // ========== HOW IT WORKS BUTTON FUNCTIONALITY ==========
    const howItWorksBtn = document.querySelector('.hero-btns .btn-secondary');
    if (howItWorksBtn) {
        howItWorksBtn.addEventListener('click', function() {
            // Create and show modal with steps
            const modal = createHowItWorksModal();
            document.body.appendChild(modal);
            
            // Add visual feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-info-circle"></i> Loading...';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 500);
        });
    }

    // ========== TOOL CARD INTERACTIONS ==========
    document.querySelectorAll('.tool-card').forEach(card => {
        // Hover effects
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.borderColor = 'var(--primary-color)';
            this.style.boxShadow = 'var(--shadow-lg)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.borderColor = 'var(--border-color)';
            this.style.boxShadow = 'var(--shadow-md)';
        });

        // Click effects for tool links
        const toolLink = card.querySelector('.tool-link');
        if (toolLink) {
            toolLink.addEventListener('click', function(e) {
                if (!this.getAttribute('href') || this.getAttribute('href') === '#') {
                    e.preventDefault();
                    
                    // Add loading animation to card
                    card.classList.add('loading');
                    const originalLinkText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                    
                    setTimeout(() => {
                        card.classList.remove('loading');
                        this.innerHTML = originalLinkText;
                        card.style.transform = 'scale(0.98)';
                        setTimeout(() => {
                            card.style.transform = 'scale(1)';
                        }, 200);
                    }, 1000);
                }
            });
        }
    });

    // ========== CTA SECTION BUTTON ==========
    const ctaButton = document.querySelector('.cta-btn');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // Scroll to tools section
            const toolsSection = document.getElementById('tools');
            if (toolsSection) {
                window.scrollTo({
                    top: toolsSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Add animation to all tool cards
                const toolCards = document.querySelectorAll('.tool-card');
                toolCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.transform = 'translateY(-15px)';
                        card.style.boxShadow = '0 25px 50px rgba(0,0,0,0.2)';
                        setTimeout(() => {
                            card.style.transform = 'translateY(-5px)';
                            card.style.boxShadow = 'var(--shadow-lg)';
                        }, 300);
                    }, index * 100);
                });
            }
        });
    }

    // ========== IMAGE LAZY LOADING ==========
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.setAttribute('loading', 'lazy');
        
        // Add error handling
        img.onerror = function() {
            console.warn('Failed to load image:', this.src);
            this.style.opacity = '0.5';
            this.style.filter = 'grayscale(100%)';
            
            // For hero image, show fallback
            if (this.classList.contains('responsive-hero-img')) {
                this.alt = 'Illustration placeholder - Failed to load';
            }
        };
    });

    // ========== FORM HANDLING FOR "SUGGEST A TOOL" ==========
    const suggestToolLinks = document.querySelectorAll('a[href="#"]');
    suggestToolLinks.forEach(link => {
        if (link.textContent.includes('Suggest')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showToolSuggestionForm();
            });
        }
    });

    // ========== STATISTICS ANIMATION ==========
    animateStatistics();
});

// ========== THEME TOGGLE SYSTEM ==========

function initializeThemeSystem() {
    // Create theme toggle button for desktop header
    const navCta = document.querySelector('.nav-cta');
    if (navCta && !navCta.querySelector('.theme-toggle')) {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Toggle dark mode';
        themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        navCta.appendChild(themeToggle);
        
        // Add event listener
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Create theme toggle for mobile menu
    const mobileCta = document.querySelector('.mobile-nav-cta');
    if (mobileCta && !mobileCta.querySelector('.mobile-theme-toggle')) {
        const mobileThemeToggle = document.createElement('button');
        mobileThemeToggle.className = 'mobile-theme-toggle theme-toggle';
        mobileThemeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        mobileThemeToggle.title = 'Toggle dark mode';
        mobileThemeToggle.setAttribute('aria-label', 'Toggle dark mode');
        mobileCta.appendChild(mobileThemeToggle);
        
        // Add event listener
        mobileThemeToggle.addEventListener('click', toggleTheme);
    }
    
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme = 'light';
    if (savedTheme) {
        initialTheme = savedTheme;
    } else if (systemPrefersDark) {
        initialTheme = 'dark';
    }
    
    // Apply initial theme
    applyTheme(initialTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    
    // Save preference
    localStorage.setItem('theme', newTheme);
    
    // Add transition effect
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);
}

function applyTheme(theme) {
    // Set theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update all theme toggle icons
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
                toggle.title = 'Switch to light mode';
                toggle.setAttribute('aria-label', 'Switch to light mode');
            } else {
                icon.className = 'fas fa-moon';
                toggle.title = 'Switch to dark mode';
                toggle.setAttribute('aria-label', 'Switch to dark mode');
            }
        }
    });
    
    // Update body class for additional styling
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

// ========== HELPER FUNCTIONS ==========

function createHowItWorksModal() {
    const modal = document.createElement('div');
    modal.className = 'how-it-works-modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close"><i class="fas fa-times"></i></button>
            <h2><i class="fas fa-play-circle"></i> How It Works</h2>
            <div class="steps-container">
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h3>Choose Your Tool</h3>
                        <p>Browse our collection of professional tools and select the one that fits your needs.</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h3>Upload Your Files</h3>
                        <p>Drag and drop or select files directly from your device. No file size limits.</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h3>Process Locally</h3>
                        <p>All processing happens in your browser. Your files never leave your device.</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-content">
                        <h3>Download Results</h3>
                        <p>Get your processed files instantly. No watermarks, no registration required.</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary start-using-btn">
                    <i class="fas fa-rocket"></i> Start Using Tools Now
                </button>
            </div>
        </div>
    `;

    // Add styles for modal
    const style = document.createElement('style');
    style.textContent = `
        .how-it-works-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            position: relative;
            background: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 40px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
            animation: modalSlideIn 0.3s ease;
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .modal-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            font-size: 24px;
            color: var(--text-secondary);
            cursor: pointer;
            transition: var(--transition);
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-close:hover {
            background: var(--bg-tertiary);
            color: var(--text-primary);
        }
        
        .modal-content h2 {
            margin-bottom: 30px;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .modal-content h2 i {
            color: var(--primary-color);
        }
        
        .steps-container {
            display: flex;
            flex-direction: column;
            gap: 25px;
            margin: 30px 0;
        }
        
        .step {
            display: flex;
            gap: 20px;
            align-items: flex-start;
            padding: 20px;
            border-radius: var(--border-radius);
            background: var(--bg-secondary);
            transition: var(--transition);
        }
        
        .step:hover {
            transform: translateX(10px);
            background: var(--bg-tertiary);
        }
        
        .step-number {
            width: 40px;
            height: 40px;
            background: var(--gradient-primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            flex-shrink: 0;
        }
        
        .step-content h3 {
            margin-bottom: 8px;
            color: var(--text-primary);
        }
        
        .step-content p {
            color: var(--text-secondary);
            margin: 0;
        }
        
        .modal-footer {
            margin-top: 40px;
            text-align: center;
        }
        
        .start-using-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }
        
        @media (max-width: 768px) {
            .modal-content {
                padding: 30px 20px;
            }
            
            .step {
                flex-direction: column;
                text-align: center;
                padding: 25px 20px;
            }
            
            .step-number {
                margin: 0 auto;
            }
        }
    `;
    
    document.head.appendChild(style);

    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
        document.head.removeChild(style);
    });

    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.remove();
        document.head.removeChild(style);
    });

    modal.querySelector('.start-using-btn').addEventListener('click', () => {
        modal.remove();
        document.head.removeChild(style);
        
        // Scroll to tools section
        const toolsSection = document.getElementById('tools');
        if (toolsSection) {
            window.scrollTo({
                top: toolsSection.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });

    return modal;
}

function showToolSuggestionForm() {
    const formHTML = `
        <div class="tool-suggestion-modal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <h3><i class="fas fa-lightbulb"></i> Suggest a Tool</h3>
                <p>Help us improve! What tool would you like to see in our collection?</p>
                
                <form id="suggestionForm">
                    <div class="form-group">
                        <label for="toolName">Tool Name *</label>
                        <input type="text" id="toolName" placeholder="e.g., PDF to Word Converter" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="toolDescription">Description *</label>
                        <textarea id="toolDescription" rows="3" placeholder="What does this tool do and why is it useful?" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Your Email (Optional)</label>
                        <input type="email" id="email" placeholder="email@example.com">
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Submit Suggestion
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Create modal element
    const modal = document.createElement('div');
    modal.innerHTML = formHTML;
    document.body.appendChild(modal);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .tool-suggestion-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .tool-suggestion-modal .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        
        .tool-suggestion-modal .modal-content {
            position: relative;
            background: var(--card-bg);
            border-radius: var(--border-radius);
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border-color);
            animation: modalSlideIn 0.3s ease;
        }
        
        .tool-suggestion-modal h3 {
            margin-bottom: 10px;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .tool-suggestion-modal h3 i {
            color: var(--accent-color);
        }
        
        .tool-suggestion-modal p {
            color: var(--text-secondary);
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--text-primary);
        }
        
        .form-group input,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-family: inherit;
            font-size: 16px;
            transition: var(--transition);
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
        }
        
        [data-theme="dark"] .form-group input:focus,
        [data-theme="dark"] .form-group textarea:focus {
            box-shadow: 0 0 0 3px rgba(90, 122, 255, 0.2);
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        
        .form-actions .btn {
            flex: 1;
        }
        
        @media (max-width: 576px) {
            .form-actions {
                flex-direction: column;
            }
        }
    `;
    
    document.head.appendChild(style);

    // Add event listeners
    const form = modal.querySelector('#suggestionForm');
    const cancelBtn = modal.querySelector('.cancel-btn');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const toolName = document.getElementById('toolName').value;
        const toolDescription = document.getElementById('toolDescription').value;
        
        // Show success message
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Thank You!';
        submitBtn.disabled = true;
        
        // In a real app, you would send this data to a server
        console.log('Tool Suggestion:', { toolName, toolDescription });
        
        setTimeout(() => {
            modal.remove();
            document.head.removeChild(style);
            
            // Show success notification
            showNotification('Thank you for your suggestion! We\'ll review it soon.', 'success');
        }, 1500);
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.remove();
        document.head.removeChild(style);
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.remove();
        document.head.removeChild(style);
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: var(--card-bg);
                border-left: 4px solid var(--primary-color);
                padding: 16px 20px;
                border-radius: 8px;
                box-shadow: var(--shadow-lg);
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 400px;
                z-index: 3000;
                animation: slideInRight 0.3s ease;
                border: 1px solid var(--border-color);
            }
            
            .notification-success {
                border-left-color: var(--success-color);
            }
            
            .notification i {
                font-size: 20px;
                color: var(--primary-color);
            }
            
            .notification-success i {
                color: var(--success-color);
            }
            
            .notification span {
                color: var(--text-primary);
                flex: 1;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-tertiary);
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: var(--transition);
            }
            
            .notification-close:hover {
                background: var(--bg-tertiary);
                color: var(--text-primary);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function animateStatistics() {
    const statItems = document.querySelectorAll('.stat-item h3');
    statItems.forEach(stat => {
        const targetValue = parseInt(stat.textContent);
        if (!isNaN(targetValue)) {
            let current = 0;
            const increment = targetValue / 50; // Adjust speed
            const timer = setInterval(() => {
                current += increment;
                if (current >= targetValue) {
                    current = targetValue;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current) + (stat.textContent.includes('+') ? '+' : '');
            }, 30);
        }
    });
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        // Only auto-switch if user hasn't set a preference
        const newTheme = e.matches ? 'dark' : 'light';
        applyTheme(newTheme);
    }
});