// tools-animations.js - Animation and UI enhancement for all tool pages

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add back button to header
    addBackButton();
    
    // Initialize tool statistics
    initializeStats();
    
    // Setup file upload animations
    setupFileUploadAnimations();
    
    // Setup toast notifications
    setupToastSystem();
    
    // Setup progress animations
    setupProgressAnimations();
    
    // Setup drag and drop
    setupDragAndDrop();
    
    // Setup control animations
    setupControlAnimations();
});

// Add back button to return to main page
function addBackButton() {
    const header = document.querySelector('.tool-header');
    if (!header) return;
    
    const backBtn = document.createElement('a');
    backBtn.href = '../index.html';
    backBtn.className = 'back-btn';
    backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Back to Tools';
    
    const backContainer = document.createElement('div');
    backContainer.className = 'back-home';
    backContainer.appendChild(backBtn);
    
    document.body.insertBefore(backContainer, document.body.firstChild);
}

// Initialize animated statistics
function initializeStats() {
    const stats = document.querySelectorAll('.stat-number');
    if (!stats.length) return;
    
    stats.forEach(stat => {
        const target = parseInt(stat.textContent);
        const suffix = stat.textContent.replace(/[0-9]/g, '');
        animateCounter(stat, 0, target, 2000, suffix);
    });
}

// Counter animation for statistics
function animateCounter(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// File upload animations
function setupFileUploadAnimations() {
    const uploadArea = document.querySelector('.upload-area');
    const fileInput = document.querySelector('.file-input');
    
    if (!uploadArea || !fileInput) return;
    
    // Add upload icon
    const icon = document.createElement('i');
    icon.className = 'upload-icon fas fa-cloud-upload-alt';
    uploadArea.insertBefore(icon, uploadArea.firstChild);
    
    // Add hover effect
    uploadArea.addEventListener('mouseenter', () => {
        icon.classList.add('bounce-animation');
    });
    
    uploadArea.addEventListener('mouseleave', () => {
        icon.classList.remove('bounce-animation');
    });
    
    // File selection animation
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            uploadArea.classList.add('success-pulse');
            setTimeout(() => {
                uploadArea.classList.remove('success-pulse');
            }, 1000);
            
            // Show success toast
            showToast('Files Added', `${e.target.files.length} file(s) added successfully`, 'success');
        }
    });
}

// Drag and drop functionality
function setupDragAndDrop() {
    const uploadArea = document.querySelector('.upload-area');
    if (!uploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        }, false);
    });
    
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        const fileInput = document.querySelector('.file-input');
        
        if (fileInput && files.length > 0) {
            // Create a new DataTransfer to set files
            const dataTransfer = new DataTransfer();
            // Add existing files
            if (fileInput.files) {
                for (let i = 0; i < fileInput.files.length; i++) {
                    dataTransfer.items.add(fileInput.files[i]);
                }
            }
            // Add dropped files
            for (let i = 0; i < files.length; i++) {
                dataTransfer.items.add(files[i]);
            }
            fileInput.files = dataTransfer.files;
            
            // Trigger change event
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
            
            // Show success message
            showToast('Files Dropped', `${files.length} file(s) added via drag & drop`, 'success');
        }
    }, false);
}

// Toast notification system
function setupToastSystem() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
}

function showToast(title, message, type = 'info') {
    const container = document.querySelector('.toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Icons based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="toast-icon ${icons[type] || icons.info}"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Show toast with animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Setup close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        hideToast(toast);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            hideToast(toast);
        }
    }, 5000);
}

function hideToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Progress animations
function setupProgressAnimations() {
    // This will be called by your main tool script
    window.showProgress = function() {
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.classList.add('show');
        }
    };
    
    window.updateProgress = function(percentage) {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-percentage');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
    };
    
    window.hideProgress = function() {
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.classList.remove('show');
        }
    };
}

// Control animations
function setupControlAnimations() {
    // Range input value display
    const rangeInputs = document.querySelectorAll('input[type="range"]');
    rangeInputs.forEach(input => {
        const valueDisplay = input.nextElementSibling;
        if (valueDisplay && valueDisplay.classList.contains('range-value')) {
            input.addEventListener('input', () => {
                valueDisplay.textContent = input.value;
            });
        }
    });
    
    // Checkbox animations
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const label = checkbox.closest('.checkbox-group');
            if (label) {
                if (checkbox.checked) {
                    label.classList.add('checked');
                    showToast('Option Enabled', 'This option has been enabled', 'info');
                } else {
                    label.classList.remove('checked');
                    showToast('Option Disabled', 'This option has been disabled', 'warning');
                }
            }
        });
    });
    
    // Select dropdown animations
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', () => {
            showToast('Setting Updated', `${select.previousElementSibling.textContent} changed to ${select.options[select.selectedIndex].text}`, 'info');
        });
    });
}

// Button loading states
function setupButtonLoading(button) {
    if (!button) return;
    
    const originalText = button.innerHTML;
    const originalWidth = button.offsetWidth;
    
    button.style.minWidth = `${originalWidth}px`;
    button.classList.add('loading');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
    
    return function resetButton() {
        button.classList.remove('loading');
        button.innerHTML = originalText;
        button.disabled = false;
        button.style.minWidth = '';
    };
}

// File preview animations
function addFilePreview(file, elementId) {
    const previewArea = document.getElementById(elementId);
    if (!previewArea) return;
    
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item fade-in';
    
    // Create image preview or file icon
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'preview-image';
            previewItem.appendChild(img);
            
            const info = document.createElement('div');
            info.className = 'preview-info';
            info.innerHTML = `
                <div class="preview-name">${file.name}</div>
                <div class="preview-size">${formatFileSize(file.size)}</div>
            `;
            previewItem.appendChild(info);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'preview-remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = () => {
                previewItem.classList.add('removing');
                setTimeout(() => {
                    previewArea.removeChild(previewItem);
                    updateFileCount();
                }, 300);
            };
            previewItem.appendChild(removeBtn);
        };
        reader.readAsDataURL(file);
    } else {
        // For non-image files
        previewItem.innerHTML = `
            <div class="preview-image" style="display: flex; align-items: center; justify-content: center; background: var(--light-color);">
                <i class="fas fa-file" style="font-size: 3rem; color: var(--primary-color);"></i>
            </div>
            <div class="preview-info">
                <div class="preview-name">${file.name}</div>
                <div class="preview-size">${formatFileSize(file.size)}</div>
            </div>
            <button class="preview-remove"><i class="fas fa-times"></i></button>
        `;
        
        const removeBtn = previewItem.querySelector('.preview-remove');
        removeBtn.onclick = () => {
            previewItem.classList.add('removing');
            setTimeout(() => {
                previewArea.removeChild(previewItem);
                updateFileCount();
            }, 300);
        };
    }
    
    previewArea.appendChild(previewItem);
    updateFileCount();
}

function updateFileCount() {
    const previewArea = document.querySelector('.preview-area');
    const fileCount = document.querySelector('.file-count');
    
    if (previewArea && fileCount) {
        const items = previewArea.querySelectorAll('.preview-item');
        fileCount.textContent = `${items.length} file${items.length !== 1 ? 's' : ''}`;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Page load animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Animate elements in sequence
    const animatedElements = document.querySelectorAll('.tool-header, .upload-section, .preview-section, .controls-section');
    animatedElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('fade-in');
        }, index * 200);
    });
});

// Export functions for use in your main tool scripts
window.toolAnimations = {
    showToast,
    setupButtonLoading,
    addFilePreview,
    updateFileCount,
    showProgress: window.showProgress,
    updateProgress: window.updateProgress,
    hideProgress: window.hideProgress
};