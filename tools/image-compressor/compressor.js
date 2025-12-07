// compressor.js - Main Image Compression Logic with Enhanced UI

// DOM Elements
const upload = document.getElementById('upload');
const controls = document.getElementById('controls');
const previewArea = document.getElementById('previewArea');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const uploadArea = document.getElementById('uploadArea');
const formatButtons = document.querySelectorAll('.format-btn');
const keepMetadataCheckbox = document.getElementById('keepMetadata');
const autoCompressCheckbox = document.getElementById('autoCompress');

// Image Elements
const originalImg = document.getElementById('originalImg');
const compressedImg = document.getElementById('compressedImg');

// Size Elements
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const originalSizeDetail = document.getElementById('originalSizeDetail');
const compressedSizeDetail = document.getElementById('compressedSizeDetail');

// Dimension Elements
const originalDimensions = document.getElementById('originalDimensions');
const compressedDimensions = document.getElementById('compressedDimensions');

// Comparison Elements
const compressionRate = document.getElementById('compressionRate');
const savingsPercent = document.getElementById('savingsPercent');

// App State
let selectedFile = null;
let compressedFile = null;
let currentFormat = 'jpg';
let isCompressing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
    setupEventListeners();
    setupDragAndDrop();
    updateQualityDisplay();
});

// UI Initialization
function initializeUI() {
    // Set initial values
    qualityValue.textContent = `${qualitySlider.value}%`;
    
    // Add CSS for dynamic elements
    addDynamicStyles();
    
    // Initialize slider color
    updateSliderColor();
}

// Setup Event Listeners
function setupEventListeners() {
    // File upload
    upload.addEventListener('change', handleFileSelect);
    
    // Quality slider
    qualitySlider.addEventListener('input', function() {
        updateQualityDisplay();
        
        // Auto-compress if enabled and we have a file
        if (autoCompressCheckbox.checked && selectedFile && !isCompressing) {
            compressImage();
        }
    });
    
    // Format buttons
    formatButtons.forEach(button => {
        button.addEventListener('click', function() {
            formatButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFormat = this.dataset.format;
            
            // Compress immediately if auto-compress is enabled
            if (autoCompressCheckbox.checked && selectedFile && !isCompressing) {
                compressImage();
            }
        });
    });
    
    // Compress button
    compressBtn.addEventListener('click', compressImage);
    
    // Reset button
    resetBtn.addEventListener('click', resetApp);
    
    // Auto-compress checkbox
    autoCompressCheckbox.addEventListener('change', function() {
        if (this.checked && selectedFile && !isCompressing) {
            compressImage();
        }
    });
    
    // Keep metadata checkbox
    keepMetadataCheckbox.addEventListener('change', function() {
        // This would affect compression if implemented
        if (autoCompressCheckbox.checked && selectedFile && !isCompressing) {
            compressImage();
        }
    });
    
    // Share button
    document.querySelector('.share-btn')?.addEventListener('click', shareResult);
}

// Drag and Drop Functionality
function setupDragAndDrop() {
    if (!uploadArea) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        uploadArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            selectedFile = files[0];
            processSelectedFile(selectedFile);
        }
    }
}

// File Selection Handler
function handleFileSelect(e) {
    selectedFile = e.target.files[0];
    if (selectedFile) {
        processSelectedFile(selectedFile);
    }
}

// Process Selected File
function processSelectedFile(file) {
    // Validate file
    if (!validateFile(file)) {
        return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImg.src = e.target.result;
        originalImg.onload = function() {
            // Update original image info
            updateOriginalImageInfo(file);
            
            // Show controls
            controls.classList.remove('hidden');
            controls.classList.add('visible');
            
            // Hide preview area
            previewArea.classList.add('hidden');
            
            // Show upload success animation
            showUploadSuccess();
            
            // Auto-compress if enabled
            if (autoCompressCheckbox.checked && !isCompressing) {
                compressImage();
            }
        };
    };
    reader.readAsDataURL(file);
}

// Validate File
function validateFile(file) {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPG, PNG, WebP, GIF, BMP)', 'error');
        return false;
    }
    
    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
        showNotification('File size exceeds 10MB limit. Please select a smaller image.', 'error');
        return false;
    }
    
    return true;
}

// Update Original Image Info
function updateOriginalImageInfo(file) {
    const fileSizeKB = (file.size / 1024).toFixed(1);
    originalSize.textContent = `${fileSizeKB} KB`;
    originalSizeDetail.textContent = `${fileSizeKB} KB`;
    originalDimensions.textContent = `${originalImg.naturalWidth} × ${originalImg.naturalHeight}`;
}

// Update Quality Display
function updateQualityDisplay() {
    const value = qualitySlider.value;
    qualityValue.textContent = `${value}%`;
    
    // Update slider color
    updateSliderColor();
    
    // Animate value change
    qualityValue.classList.add('pulse');
    setTimeout(() => qualityValue.classList.remove('pulse'), 300);
}

// Update Slider Color
function updateSliderColor() {
    const value = parseInt(qualitySlider.value);
    const min = parseInt(qualitySlider.min);
    const max = parseInt(qualitySlider.max);
    const percent = ((value - min) / (max - min)) * 100;
    
    // Create color gradient based on quality value
    let color;
    if (value >= 80) {
        color = '#4CAF50'; // Green for high quality
    } else if (value >= 60) {
        color = '#8BC34A'; // Light green
    } else if (value >= 40) {
        color = '#FFC107'; // Yellow
    } else if (value >= 20) {
        color = '#FF9800'; // Orange
    } else {
        color = '#F44336'; // Red for low quality
    }
    
    qualitySlider.style.background = `linear-gradient(to right, ${color} ${percent}%, #e0e0e0 ${percent}%)`;
}

// Main Compression Function
async function compressImage() {
    if (!selectedFile) {
        showNotification('Please select an image first!', 'warning');
        return;
    }
    
    if (isCompressing) {
        showNotification('Compression already in progress...', 'info');
        return;
    }
    
    isCompressing = true;
    
    try {
        // Show loading state
        const originalText = compressBtn.innerHTML;
        compressBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Compressing...';
        compressBtn.disabled = true;
        
        // Prepare compression options
        const quality = parseInt(qualitySlider.value) / 100;
        
        const options = {
            maxSizeMB: 10,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: currentFormat === 'jpg' ? 'image/jpeg' : `image/${currentFormat}`,
            initialQuality: quality,
            alwaysKeepResolution: true
        };
        
        // Adjust options based on format
        if (currentFormat === 'png') {
            options.pngQuality = quality;
        } else if (currentFormat === 'webp') {
            options.webpQuality = quality;
        }
        
        // Convert to proper mime type for compression
        const fileType = currentFormat === 'jpg' ? 'image/jpeg' : `image/${currentFormat}`;
        
        // Compress image with current settings
        console.log('Compressing with options:', { quality, format: currentFormat });
        compressedFile = await imageCompression(selectedFile, options);
        
        // Create blob URL for preview and download
        const compressedBlobUrl = URL.createObjectURL(compressedFile);
        
        // Update compressed image
        compressedImg.onload = function() {
            // Update compressed image info
            updateCompressedImageInfo(compressedFile);
            
            // Show preview area
            previewArea.classList.remove('hidden');
            previewArea.classList.add('visible');
            
            // Set up download
            setupDownload(compressedBlobUrl);
            
            // Show success animation
            showCompressionSuccess();
            
            // Reset button state
            compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
            compressBtn.disabled = false;
            isCompressing = false;
            
            // Scroll to preview
            setTimeout(() => {
                previewArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        };
        
        compressedImg.onerror = function() {
            throw new Error('Failed to load compressed image');
        };
        
        compressedImg.src = compressedBlobUrl;
        
    } catch (error) {
        console.error('Compression error:', error);
        showNotification('Error compressing image. Please try again.', 'error');
        
        // Reset button state
        compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
        compressBtn.disabled = false;
        isCompressing = false;
    }
}

// Update Compressed Image Info
function updateCompressedImageInfo(file) {
    const originalSizeBytes = selectedFile.size;
    const compressedSizeBytes = file.size;
    const fileSizeKB = (compressedSizeBytes / 1024).toFixed(1);
    
    // Update sizes
    compressedSize.textContent = `${fileSizeKB} KB`;
    compressedSizeDetail.textContent = `${fileSizeKB} KB`;
    
    // Update dimensions
    compressedDimensions.textContent = `${compressedImg.naturalWidth} × ${compressedImg.naturalHeight}`;
    
    // Calculate and display savings
    const savings = ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes * 100).toFixed(1);
    compressionRate.textContent = `${savings}%`;
    savingsPercent.textContent = `${savings}% saved`;
    
    // Show quality indicator
    const quality = parseInt(qualitySlider.value);
    let qualityText = 'High';
    let qualityColor = '#4CAF50';
    
    if (quality < 20) {
        qualityText = 'Very Low';
        qualityColor = '#F44336';
    } else if (quality < 40) {
        qualityText = 'Low';
        qualityColor = '#FF9800';
    } else if (quality < 60) {
        qualityText = 'Medium';
        qualityColor = '#FFC107';
    } else if (quality < 80) {
        qualityText = 'Good';
        qualityColor = '#8BC34A';
    }
    
    // Animate the compression rate
    compressionRate.style.color = qualityColor;
    compressionRate.classList.add('updated');
    setTimeout(() => compressionRate.classList.remove('updated'), 1000);
    
    // Update compression button text with quality info
    compressBtn.innerHTML = `<i class="fas fa-compress-alt"></i> Re-compress (${qualityText} Quality)`;
}

// Setup Download
function setupDownload(blobUrl) {
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const quality = parseInt(qualitySlider.value);
    const qualityLabel = quality >= 80 ? 'high' : quality >= 60 ? 'good' : quality >= 40 ? 'medium' : 'low';
    const filename = `compressed_${qualityLabel}_quality_${timestamp}.${currentFormat}`;
    
    downloadBtn.href = blobUrl;
    downloadBtn.download = filename;
    
    // Update download button text
    downloadBtn.innerHTML = `<i class="fas fa-download"></i> Download (${currentFormat.toUpperCase()})`;
}

// Reset Application
function resetApp() {
    // Reset file input
    upload.value = '';
    selectedFile = null;
    compressedFile = null;
    
    // Reset images
    originalImg.src = '#';
    originalImg.onload = null;
    compressedImg.src = '#';
    compressedImg.onload = null;
    
    // Reset controls
    qualitySlider.value = 60;
    updateQualityDisplay();
    
    // Reset format buttons
    formatButtons.forEach(btn => {
        if (btn.dataset.format === 'jpg') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    currentFormat = 'jpg';
    
    // Reset checkboxes
    keepMetadataCheckbox.checked = true;
    autoCompressCheckbox.checked = false;
    
    // Hide sections
    controls.classList.add('hidden');
    previewArea.classList.add('hidden');
    
    // Reset text displays
    originalSize.textContent = '0 KB';
    compressedSize.textContent = '0 KB';
    originalSizeDetail.textContent = '0 KB';
    compressedSizeDetail.textContent = '0 KB';
    originalDimensions.textContent = '-';
    compressedDimensions.textContent = '-';
    compressionRate.textContent = '0%';
    savingsPercent.textContent = '0% saved';
    
    // Reset compression button
    compressBtn.innerHTML = '<i class="fas fa-compress-alt"></i> Compress Image';
    compressBtn.disabled = false;
    
    // Clear any existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    showNotification('Reset completed. Ready for new image!', 'success');
}

// Share Result
function shareResult() {
    if (!compressedFile) {
        showNotification('No compressed image to share!', 'warning');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: 'Compressed Image',
            text: `I just compressed an image to ${compressedFile.size / 1024}KB (${parseInt(qualitySlider.value)}% quality) using ImageCompressor.pro`,
            files: [compressedFile]
        }).catch(console.error);
    } else {
        // Fallback: Copy download link to clipboard
        const tempInput = document.createElement('input');
        tempInput.value = window.location.href;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        showNotification('Link copied to clipboard! Share this tool with others!', 'success');
    }
}

// Upload Success Animation
function showUploadSuccess() {
    uploadArea.classList.add('success-animation');
    setTimeout(() => uploadArea.classList.remove('success-animation'), 1000);
}

// Compression Success Animation
function showCompressionSuccess() {
    const comparisonArrow = document.querySelector('.comparison-arrow');
    if (comparisonArrow) {
        comparisonArrow.classList.add('success-animation');
        setTimeout(() => comparisonArrow.classList.remove('success-animation'), 1000);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `custom-notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Add Dynamic Styles
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Range slider styling */
        .range-slider {
            -webkit-appearance: none;
            width: 100%;
            height: 10px;
            border-radius: 5px;
            background: linear-gradient(to right, #4361ee 60%, #e0e0e0 60%);
            outline: none;
            margin: 15px 0;
        }
        
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #4361ee;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        }
        
        .range-slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
        }
        
        .range-slider::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #4361ee;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        /* Animation classes */
        .visible {
            animation: fadeInUp 0.5s ease forwards;
        }
        
        .hidden {
            display: none !important;
        }
        
        .drag-over {
            border-color: #4361ee !important;
            background-color: rgba(67, 97, 238, 0.05) !important;
            transform: scale(1.02);
            transition: all 0.3s ease;
        }
        
        .success-animation {
            animation: pulseSuccess 1s ease;
        }
        
        .pulse {
            animation: pulse 0.3s ease;
        }
        
        .updated {
            animation: scaleUp 0.5s ease;
        }
        
        /* Control value styling */
        .control-value {
            font-weight: 600;
            color: #4361ee;
            font-size: 1.1em;
            min-width: 50px;
            text-align: right;
            transition: all 0.3s ease;
        }
        
        /* Notifications */
        .custom-notification {
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            color: #1a1a2e;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 1000;
            transform: translateX(120%);
            transition: transform 0.3s ease;
            border-left: 4px solid #4361ee;
            max-width: 400px;
        }
        
        .custom-notification.show {
            transform: translateX(0);
        }
        
        .notification-success {
            border-left-color: #4CAF50;
        }
        
        .notification-error {
            border-left-color: #f44336;
        }
        
        .notification-warning {
            border-left-color: #FF9800;
        }
        
        .custom-notification i {
            font-size: 20px;
        }
        
        .notification-success i {
            color: #4CAF50;
        }
        
        .notification-error i {
            color: #f44336;
        }
        
        .notification-warning i {
            color: #FF9800;
        }
        
        /* Keyframes */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes pulseSuccess {
            0%, 100% { 
                box-shadow: 0 4px 16px rgba(0,0,0,0.1); 
                transform: scale(1);
            }
            50% { 
                box-shadow: 0 4px 30px rgba(67, 97, 238, 0.4);
                transform: scale(1.02);
            }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        @keyframes scaleUp {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
            .custom-notification {
                left: 20px;
                right: 20px;
                transform: translateY(-150%);
            }
            
            .custom-notification.show {
                transform: translateY(0);
            }
            
            .control-value {
                font-size: 1em;
            }
        }
        
        /* Quality level indicators */
        .quality-low { color: #F44336; }
        .quality-medium { color: #FF9800; }
        .quality-good { color: #8BC34A; }
        .quality-high { color: #4CAF50; }
    `;
    
    document.head.appendChild(style);
}

// Quality-based color coding for compression rate
function getQualityColor(quality) {
    if (quality >= 80) return '#4CAF50';
    if (quality >= 60) return '#8BC34A';
    if (quality >= 40) return '#FFC107';
    if (quality >= 20) return '#FF9800';
    return '#F44336';
}

// Export functions if needed
window.ImageCompressor = {
    compressImage,
    resetApp,
    validateFile,
    showNotification,
    updateQualityDisplay
};

// Fix navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Fix "All Tools" links
    const allToolsLinks = document.querySelectorAll('a[href*="index.html"], a[href="../index.html"], a[href*="home"]');
    
    allToolsLinks.forEach(link => {
        if (link.textContent.includes('All Tools') || link.textContent.includes('Home') || 
            link.getAttribute('href').includes('index.html')) {
            
            // Remove existing href
            link.removeAttribute('href');
            
            // Add click handler
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Try multiple methods to go to main page
                try {
                    // Method 1: Try root path
                    window.location.href = '/index.html';
                } catch (err1) {
                    try {
                        // Method 2: Try relative path
                        window.location.href = '../index.html';
                    } catch (err2) {
                        try {
                            // Method 3: Try two levels up
                            window.location.href = '../../index.html';
                        } catch (err3) {
                            // Method 4: Try current directory
                            window.location.href = './index.html';
                        }
                    }
                }
            });
            
            // Add cursor pointer
            link.style.cursor = 'pointer';
        }
    });
});

// Theme Support for Tool Pages
document.addEventListener('DOMContentLoaded', function() {
    // Check if theme is stored
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    themeToggle.title = 'Toggle theme';
    
    themeToggle.addEventListener('click', function() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.classList.add('theme-transition');
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = this.querySelector('i');
        if (newTheme === 'dark') {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
        
        setTimeout(() => {
            html.classList.remove('theme-transition');
        }, 300);
    });
    
    document.body.appendChild(themeToggle);
});