// convert.js - Image to PDF Converter with Theme Support
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme support
    initializeTheme();
    
    // DOM Elements
    const upload = document.getElementById("upload");
    const previewArea = document.getElementById("imagesPreview");
    const convertBtn = document.getElementById("convertBtn");
    const clearBtn = document.getElementById("clearBtn");
    const fileInputBtn = document.querySelector('.file-input-btn');
    const fileCount = document.querySelector('.file-count');
    
    // PDF Settings Elements
    const pageSize = document.getElementById("pageSize");
    const orientation = document.getElementById("orientation");
    const imageQuality = document.getElementById("imageQuality");
    const marginSize = document.getElementById("marginSize");
    const addPageNumbers = document.getElementById("addPageNumbers");
    const optimizeForWeb = document.getElementById("optimizeForWeb");
    
    // Progress Elements
    const progressContainer = document.querySelector('.progress-container');
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressText = document.querySelector('.progress-text span:first-child');
    
    // App State
    let selectedImages = [];
    let isConverting = false;
    
    // Initialize the UI
    function initializeUI() {
        // Setup event listeners
        setupEventListeners();
        
        // Initialize range displays
        updateRangeDisplay(imageQuality, 'imageQuality');
        updateRangeDisplay(marginSize, 'marginSize');
        
        // Initialize file input button
        if (fileInputBtn) {
            fileInputBtn.addEventListener('click', () => {
                upload.click();
            });
        }
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        // File upload
        upload.addEventListener("change", handleFileSelect);
        
        // Convert button
        convertBtn.addEventListener("click", convertToPDF);
        
        // Clear button
        clearBtn.addEventListener("click", clearAllFiles);
        
        // Range inputs
        imageQuality.addEventListener('input', function() {
            updateRangeDisplay(this, 'imageQuality');
        });
        
        marginSize.addEventListener('input', function() {
            updateRangeDisplay(this, 'marginSize');
        });
        
        // Settings changes
        [pageSize, orientation, addPageNumbers, optimizeForWeb].forEach(element => {
            element.addEventListener('change', () => {
                if (selectedImages.length > 0) {
                    convertBtn.disabled = false;
                }
            });
        });
        
        // Setup drag and drop
        setupDragAndDrop();
    }
    
    // Update Range Value Display
    function updateRangeDisplay(rangeInput, type) {
        const valueDisplay = rangeInput.parentElement.querySelector('.range-value');
        if (valueDisplay) {
            valueDisplay.textContent = rangeInput.value;
            
            // Update color based on value
            const percent = (rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min) * 100;
            if (type === 'imageQuality') {
                // Quality: lower is worse (red), higher is better (green)
                let color;
                if (rangeInput.value >= 90) {
                    color = '#4CAF50'; // Green
                } else if (rangeInput.value >= 75) {
                    color = '#8BC34A'; // Light green
                } else if (rangeInput.value >= 60) {
                    color = '#FFC107'; // Yellow
                } else {
                    color = '#F44336'; // Red
                }
                rangeInput.style.background = `linear-gradient(to right, ${color} ${percent}%, var(--border-color) ${percent}%)`;
            } else {
                // Margin: smaller is better for space (green), larger is more margin (blue)
                let color;
                if (rangeInput.value <= 5) {
                    color = '#4CAF50'; // Green (small margin)
                } else if (rangeInput.value <= 15) {
                    color = '#2196F3'; // Blue (medium margin)
                } else {
                    color = '#9C27B0'; // Purple (large margin)
                }
                rangeInput.style.background = `linear-gradient(to right, ${color} ${percent}%, var(--border-color) ${percent}%)`;
            }
        }
    }
    
    // Handle File Selection
    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        
        // Validate files
        const validFiles = files.filter(file => {
            return file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024; // 10MB limit
        });
        
        if (validFiles.length === 0) {
            showToast('Invalid Files', 'Please select valid image files (max 10MB each)', 'error');
            return;
        }
        
        // Add to selected images
        selectedImages = [...selectedImages, ...validFiles];
        
        // Update UI
        updateFilePreview();
        updateConvertButton();
        
        // Show success message
        showToast('Files Added', `${validFiles.length} image(s) added successfully`, 'success');
        
        // If too many files
        if (selectedImages.length > 10) {
            showToast('File Limit', 'Maximum 10 images allowed. First 10 images will be used.', 'warning');
            selectedImages = selectedImages.slice(0, 10);
            updateFilePreview();
        }
    }
    
    // Update File Preview
    function updateFilePreview() {
        previewArea.innerHTML = '';
        
        if (selectedImages.length === 0) {
            previewArea.innerHTML = `
                <div class="empty-preview">
                    <i class="empty-icon fas fa-images"></i>
                    <p>No images selected yet. Upload some images to get started.</p>
                </div>
            `;
            fileCount.textContent = '0 files';
            return;
        }
        
        fileCount.textContent = `${selectedImages.length} file${selectedImages.length !== 1 ? 's' : ''}`;
        
        selectedImages.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            const div = document.createElement('div');
            div.className = 'preview-item';
            div.dataset.index = index;
            
            div.innerHTML = `
                <div class="preview-img-container">
                    <img src="${url}" alt="${file.name}">
                    <span class="img-index">${index + 1}</span>
                    <button class="remove-btn" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-info">
                    <p class="file-name" title="${file.name}">${truncateFileName(file.name, 20)}</p>
                    <p class="file-size">${formatFileSize(file.size)}</p>
                </div>
                <div class="preview-actions">
                    <button class="move-btn move-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="move-btn move-down" data-index="${index}" ${index === selectedImages.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
            `;
            
            previewArea.appendChild(div);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                removeImage(index);
            });
        });
        
        // Add event listeners to move buttons
        document.querySelectorAll('.move-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.dataset.index);
                if (this.classList.contains('move-up')) {
                    moveImageUp(index);
                } else {
                    moveImageDown(index);
                }
            });
        });
    }
    
    // Remove Image
    function removeImage(index) {
        selectedImages.splice(index, 1);
        updateFilePreview();
        updateConvertButton();
        showToast('Image Removed', 'Image removed from selection', 'info');
    }
    
    // Move Image Up
    function moveImageUp(index) {
        if (index > 0) {
            [selectedImages[index], selectedImages[index - 1]] = [selectedImages[index - 1], selectedImages[index]];
            updateFilePreview();
            showToast('Order Updated', 'Image moved up in sequence', 'info');
        }
    }
    
    // Move Image Down
    function moveImageDown(index) {
        if (index < selectedImages.length - 1) {
            [selectedImages[index], selectedImages[index + 1]] = [selectedImages[index + 1], selectedImages[index]];
            updateFilePreview();
            showToast('Order Updated', 'Image moved down in sequence', 'info');
        }
    }
    
    // Update Convert Button State
    function updateConvertButton() {
        convertBtn.disabled = selectedImages.length === 0 || isConverting;
    }
    
    // Clear All Files
    function clearAllFiles() {
        if (selectedImages.length === 0) {
            showToast('No Files', 'No files to clear', 'info');
            return;
        }
        
        if (confirm(`Clear all ${selectedImages.length} images?`)) {
            selectedImages = [];
            upload.value = '';
            updateFilePreview();
            updateConvertButton();
            showToast('Cleared', 'All images cleared successfully', 'success');
        }
    }
    
    // Setup Drag and Drop
    function setupDragAndDrop() {
        const uploadArea = document.querySelector('.upload-area');
        if (!uploadArea) return;
        
        // Prevent default behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        // Highlight drop zone
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
        
        // Handle dropped files
        uploadArea.addEventListener('drop', handleDrop, false);
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = Array.from(dt.files);
            
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                // Create a new FileList-like object
                const dataTransfer = new DataTransfer();
                imageFiles.forEach(file => dataTransfer.items.add(file));
                upload.files = dataTransfer.files;
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                upload.dispatchEvent(event);
                
                // Visual feedback
                uploadArea.classList.add('drop-success');
                setTimeout(() => {
                    uploadArea.classList.remove('drop-success');
                }, 1000);
            }
        }
    }
    
    // Main Conversion Function
    async function convertToPDF() {
        if (selectedImages.length === 0 || isConverting) return;
        
        isConverting = true;
        convertBtn.disabled = true;
        
        try {
            // Show progress
            showProgress();
            updateProgress(10, 'Loading images...');
            
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                unit: 'mm',
                format: pageSize.value,
                orientation: getOrientation()
            });
            
            const margin = parseInt(marginSize.value);
            const quality = parseInt(imageQuality.value) / 100;
            
            // Calculate page dimensions
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const contentWidth = pageWidth - (margin * 2);
            const contentHeight = pageHeight - (margin * 2);
            
            for (let i = 0; i < selectedImages.length; i++) {
                updateProgress(10 + (i / selectedImages.length * 80), `Processing image ${i + 1} of ${selectedImages.length}...`);
                
                // Load image
                const img = await loadImage(selectedImages[i]);
                
                // Calculate image dimensions to fit within content area
                const imgRatio = img.width / img.height;
                const contentRatio = contentWidth / contentHeight;
                
                let imgWidth, imgHeight;
                
                if (imgRatio > contentRatio) {
                    // Image is wider than content area
                    imgWidth = contentWidth;
                    imgHeight = contentWidth / imgRatio;
                } else {
                    // Image is taller than content area
                    imgHeight = contentHeight;
                    imgWidth = contentHeight * imgRatio;
                }
                
                // Center image on page
                const x = margin + (contentWidth - imgWidth) / 2;
                const y = margin + (contentHeight - imgHeight) / 2;
                
                // Add page (except for first image)
                if (i > 0) {
                    pdf.addPage(pageSize.value, getOrientation());
                }
                
                // Add image to PDF
                pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight, `image${i}`, 'FAST', 0, quality);
                
                // Add page number if enabled
                if (addPageNumbers.checked) {
                    pdf.setFontSize(10);
                    pdf.setTextColor(128, 128, 128);
                    pdf.text(`Page ${i + 1}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
                }
                
                // Release object URL
                URL.revokeObjectURL(img.src);
            }
            
            updateProgress(95, 'Finalizing PDF...');
            
            // Optimize if enabled
            if (optimizeForWeb.checked) {
                pdf.setCreationDate(new Date());
            }
            
            // Generate filename
            const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const filename = `converted-images-${timestamp}.pdf`;
            
            updateProgress(100, 'Complete! Downloading...');
            
            // Save PDF
            setTimeout(() => {
                pdf.save(filename);
                hideProgress();
                isConverting = false;
                updateConvertButton();
                showToast('Conversion Complete!', `PDF saved as "${filename}"`, 'success');
            }, 500);
            
        } catch (error) {
            console.error('Conversion error:', error);
            hideProgress();
            isConverting = false;
            updateConvertButton();
            showToast('Conversion Failed', 'An error occurred while creating the PDF. Please try again.', 'error');
        }
    }
    
    // Helper function to load image
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
    
    // Get orientation setting
    function getOrientation() {
        if (orientation.value === 'auto') {
            // You could implement auto-detection here based on image dimensions
            return 'portrait';
        }
        return orientation.value;
    }
    
    // Progress Functions
    function showProgress() {
        progressContainer.classList.add('active');
    }
    
    function updateProgress(percentage, message) {
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${Math.round(percentage)}%`;
        if (message && progressText) {
            progressText.textContent = message;
        }
    }
    
    function hideProgress() {
        progressContainer.classList.remove('active');
        setTimeout(() => {
            progressFill.style.width = '0%';
            progressPercentage.textContent = '0%';
        }, 300);
    }
    
    // Toast Notification System
    function showToast(title, message, type = 'info') {
        // Create toast container if it doesn't exist
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        // Create toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
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
        
        // Show with animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
    
    // Utility Functions
    function truncateFileName(name, maxLength) {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 3) + '...';
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' Bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // Theme Support
    function initializeTheme() {
        // Check for saved theme or default to light
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Create theme toggle button
        const themeToggle = document.createElement('button');
        themeToggle.className = 'theme-toggle';
        themeToggle.innerHTML = savedTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Toggle theme';
        themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        
        themeToggle.addEventListener('click', function() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Add transition class
            html.classList.add('theme-transition');
            
            // Apply new theme
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update icon
            const icon = this.querySelector('i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            
            // Remove transition class after animation
            setTimeout(() => {
                html.classList.remove('theme-transition');
            }, 300);
            
            // Show feedback
            showToast('Theme Changed', `Switched to ${newTheme} mode`, 'info');
        });
        
        // Add to page
        document.body.appendChild(themeToggle);
        
        // Add theme transition styles
        const style = document.createElement('style');
        style.textContent = `
            .theme-transition * {
                transition: background-color 0.3s ease, 
                            border-color 0.3s ease, 
                            color 0.3s ease,
                            box-shadow 0.3s ease !important;
            }
            
            .theme-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--gradient-primary);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                z-index: 1000;
                box-shadow: var(--shadow-lg);
                transition: all 0.3s ease;
            }
            
            .theme-toggle:hover {
                transform: scale(1.1) rotate(15deg);
            }
            
            @media (max-width: 768px) {
                .theme-toggle {
                    bottom: 70px;
                    right: 15px;
                    width: 45px;
                    height: 45px;
                    font-size: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize the application
    initializeUI();
    
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome!', 'Upload images and convert them to PDF', 'info');
    }, 1000);
    
    // Export functions for debugging
    window.imageToPDF = {
        selectedImages,
        convertToPDF,
        clearAllFiles,
        showToast
    };
});

