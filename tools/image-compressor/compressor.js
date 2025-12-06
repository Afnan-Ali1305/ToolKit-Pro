const upload = document.getElementById('upload');
const controls = document.getElementById('controls');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const previewArea = document.getElementById('previewArea');

const originalImg = document.getElementById('originalImg');
const compressedImg = document.getElementById('compressedImg');

const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');

const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');

let selectedFile = null;

// Show compression controls after image select
upload.addEventListener('change', (e) => {
    selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // Show image preview
    originalImg.src = URL.createObjectURL(selectedFile);
    originalSize.textContent = `Size: ${(selectedFile.size / 1024).toFixed(1)} KB`;

    controls.classList.remove('hidden');
    previewArea.classList.add('hidden');
});

// Update quality value text
qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value;
});

// Compression function
compressBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    const options = {
        maxWidthOrHeight: 2000,
        maxSizeMB: 2,
        initialQuality: parseFloat(qualitySlider.value)
    };

    const compressedFile = await imageCompression(selectedFile, options);
    const compressedBlobUrl = URL.createObjectURL(compressedFile);

    compressedImg.src = compressedBlobUrl;
    compressedSize.textContent = `Size: ${(compressedFile.size / 1024).toFixed(1)} KB`;

    downloadBtn.href = compressedBlobUrl;

    previewArea.classList.remove('hidden');
});


// ui 

// ui-enhancements.js - UI animations and enhancements for Image Compressor

document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
});

function initializeUI() {
    // Initialize all UI enhancements
    setupUploadArea();
    setupRangeSlider();
    setupFormatButtons();
    setupCheckboxAnimations();
    setupDragAndDrop();
    addPageAnimations();
    setupTooltips();
}

// Upload area animations
function setupUploadArea() {
    const uploadBox = document.querySelector('.upload-box');
    const fileInput = document.getElementById('upload');
    
    if (!uploadBox || !fileInput) return;
    
    // Click on upload box triggers file input
    uploadBox.addEventListener('click', (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
    // File selection animation
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            uploadBox.classList.add('file-selected');
            setTimeout(() => uploadBox.classList.remove('file-selected'), 1000);
            
            // Show controls section
            const controls = document.getElementById('controls');
            if (controls) {
                controls.classList.remove('hidden');
                controls.classList.add('visible');
            }
            
            // Show success animation
            animateUploadSuccess();
        }
    });
}

// Range slider with value update
function setupRangeSlider() {
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    
    if (!qualitySlider || !qualityValue) return;
    
    // Update value display
    qualitySlider.addEventListener('input', function() {
        const value = this.value;
        qualityValue.textContent = `${value}%`;
        
        // Animate value change
        qualityValue.classList.add('pulse');
        setTimeout(() => qualityValue.classList.remove('pulse'), 300);
        
        // Update color based on value
        updateSliderColor(this, value);
    });
    
    // Initial update
    updateSliderColor(qualitySlider, qualitySlider.value);
    qualityValue.textContent = `${qualitySlider.value}%`;
}

function updateSliderColor(slider, value) {
    const percent = (value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #4361ee ${percent}%, #e0e0e0 ${percent}%)`;
}

// Format buttons toggle
function setupFormatButtons() {
    const formatButtons = document.querySelectorAll('.format-btn');
    
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            formatButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Animation
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 300);
        });
    });
}

// Checkbox animations
function setupCheckboxAnimations() {
    const checkboxes = document.querySelectorAll('.checkbox input');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const label = this.closest('.checkbox');
            if (this.checked) {
                label.classList.add('checked');
                animateCheckbox(label);
            } else {
                label.classList.remove('checked');
            }
        });
    });
}

function animateCheckbox(element) {
    element.style.transform = 'scale(1.1)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

// Drag and drop functionality
function setupDragAndDrop() {
    const uploadBox = document.querySelector('.upload-box');
    if (!uploadBox) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight drop zone when dragging over
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadBox.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadBox.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadBox.classList.add('drag-over');
    }
    
    function unhighlight() {
        uploadBox.classList.remove('drag-over');
    }
    
    // Handle dropped files
    uploadBox.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        const fileInput = document.getElementById('upload');
        
        if (files.length > 0) {
            fileInput.files = files;
            
            // Trigger change event
            const event = new Event('change');
            fileInput.dispatchEvent(event);
            
            // Show drop animation
            animateDropSuccess();
        }
    }
}

// Page load animations
function addPageAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe sections for animation
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            animation: slideUp 0.6s ease forwards;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .pulse {
            animation: pulse 0.3s ease;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        .file-selected {
            animation: successPulse 1s ease;
        }
        
        @keyframes successPulse {
            0%, 100% { border-color: #4361ee; }
            50% { border-color: #4CAF50; }
        }
    `;
    document.head.appendChild(style);
}

// Tooltip system
function setupTooltips() {
    // Add tooltips to buttons
    const buttons = document.querySelectorAll('button, .upload-btn, .download-btn');
    buttons.forEach(button => {
        if (button.title) {
            createTooltip(button);
        }
    });
}

function createTooltip(element) {
    element.addEventListener('mouseenter', function(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = this.title;
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translateX(-50%) translateY(-100%)';
        
        this._tooltip = tooltip;
    });
    
    element.addEventListener('mouseleave', function() {
        if (this._tooltip) {
            this._tooltip.remove();
            delete this._tooltip;
        }
    });
}

// Animation functions for compression process
function showLoadingAnimation(button) {
    if (!button) return;
    
    const originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Compressing...`;
    button.disabled = true;
    
    return function() {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

function showSuccessAnimation(element) {
    element.classList.add('success-animation');
    setTimeout(() => element.classList.remove('success-animation'), 1000);
}

function updateCompressionStats(originalSize, compressedSize) {
    const savingsPercent = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    const compressionRate = document.getElementById('compressionRate');
    const savingsPercentElement = document.getElementById('savingsPercent');
    
    if (compressionRate) {
        compressionRate.textContent = `${savingsPercent}%`;
        compressionRate.classList.add('updated');
        setTimeout(() => compressionRate.classList.remove('updated'), 1000);
    }
    
    if (savingsPercentElement) {
        savingsPercentElement.textContent = `${savingsPercent}% saved`;
    }
}

// Helper functions
function animateUploadSuccess() {
    const uploadBox = document.querySelector('.upload-box');
    if (uploadBox) {
        uploadBox.classList.add('success-animation');
        setTimeout(() => uploadBox.classList.remove('success-animation'), 1000);
    }
}

function animateDropSuccess() {
    const uploadBox = document.querySelector('.upload-box');
    if (uploadBox) {
        // Add bounce animation
        uploadBox.style.animation = 'bounce 0.5s ease';
        setTimeout(() => {
            uploadBox.style.animation = '';
        }, 500);
    }
}

// Add bounce animation CSS
const bounceCSS = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .success-animation {
        animation: success 1s ease;
    }
    
    @keyframes success {
        0%, 100% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12); }
        50% { box-shadow: 0 4px 30px rgba(76, 175, 80, 0.4); }
    }
    
    .updated {
        animation: updated 0.5s ease;
    }
    
    @keyframes updated {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }
    
    .tooltip {
        position: fixed;
        background: #1a1a2e;
        color: white;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        z-index: 1000;
        white-space: nowrap;
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px 5px 0;
        border-style: solid;
        border-color: #1a1a2e transparent transparent;
    }
`;

// Add animations CSS to document
const styleSheet = document.createElement('style');
styleSheet.textContent = bounceCSS;
document.head.appendChild(styleSheet);

// Export functions for use in compressor.js
window.uiEnhancements = {
    showLoadingAnimation,
    showSuccessAnimation,
    updateCompressionStats,
    animateUploadSuccess,
    animateDropSuccess
};