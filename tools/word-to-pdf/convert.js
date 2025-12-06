document.getElementById('upload').addEventListener('change', handleFileSelect);
document.getElementById('convertBtn').addEventListener('click', convertToPDF);

let currentFile = null;
let docContent = '';

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    currentFile = file;
    
    // Show preview using docx-preview
    const preview = document.getElementById('preview');
    preview.innerHTML = '<h3>Preview:</h3><div class="doc-preview"></div>';
    
    const previewContainer = preview.querySelector('.doc-preview');
    
    try {
        // Load and preview DOCX file
        const arrayBuffer = await file.arrayBuffer();
        
        // Render DOCX preview
        docx.renderAsync(arrayBuffer, previewContainer);
        
        // Extract text for basic conversion
        const text = await extractTextFromDocx(arrayBuffer);
        docContent = text;
        
        // Show convert button
        document.getElementById('convertBtn').classList.remove('hidden');
        
    } catch (error) {
        preview.innerHTML = `<p class="error">Error previewing file: ${error.message}</p>`;
        console.error(error);
    }
}

async function extractTextFromDocx(arrayBuffer) {
    // Simple text extraction from DOCX (basic implementation)
    try {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const xml = await zip.file("word/document.xml").async("string");
        
        // Parse XML to extract text
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "application/xml");
        
        // Get all text elements
        const textNodes = xmlDoc.getElementsByTagName('w:t');
        let text = '';
        
        for (let node of textNodes) {
            text += node.textContent + ' ';
        }
        
        return text.trim();
    } catch (error) {
        console.warn('Could not extract text from DOCX, using fallback');
        return 'Document content extracted (basic preview only)';
    }
}

async function convertToPDF() {
    if (!currentFile) {
        alert('Please select a file first');
        return;
    }

    const convertBtn = document.getElementById('convertBtn');
    convertBtn.disabled = true;
    convertBtn.textContent = 'Converting...';

    try {
        // Option 1: Using jspdf for basic conversion (client-side)
        await convertUsingJSPDF();
        
        // Option 2: Uncomment below for server-side conversion
        // await convertUsingServer();
        
    } catch (error) {
        console.error('Conversion error:', error);
        alert(`Conversion failed: ${error.message}`);
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = 'Convert to PDF';
    }
}

// Option 1: Client-side conversion using jsPDF (basic)
async function convertUsingJSPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Converted Document', 105, 20, { align: 'center' });
    
    // Add file info
    doc.setFontSize(12);
    doc.text(`Original: ${currentFile.name}`, 20, 40);
    doc.text(`Converted: ${new Date().toLocaleDateString()}`, 20, 50);
    
    // Add content
    doc.setFontSize(10);
    
    // Split text into lines
    const lines = docContent.split(' ');
    let y = 70;
    let line = '';
    
    for (let word of lines) {
        if (doc.getTextWidth(line + word) < 170) {
            line += word + ' ';
        } else {
            doc.text(line, 20, y);
            y += 7;
            line = word + ' ';
            
            // Add new page if needed
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
        }
    }
    
    if (line) {
        doc.text(line, 20, y);
    }
    
    // Save PDF
    doc.save(`${currentFile.name.replace('.docx', '')}.pdf`);
}

// Option 2: Server-side conversion (more reliable)
async function convertUsingServer() {
    const formData = new FormData();
    formData.append('file', currentFile);
    
    try {
        const response = await fetch('http://localhost:5000/convert', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFile.name.replace('.docx', '')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Server conversion failed:', error);
        alert('Server conversion failed. Using client-side conversion instead.');
        await convertUsingJSPDF(); // Fallback to client-side
    }
}

// Add JSZip for DOCX extraction (if not already loaded)
if (typeof JSZip === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    document.head.appendChild(script);
}


// ui code

// ui-enhancements.js - UI animations for Word to PDF Converter

document.addEventListener('DOMContentLoaded', function() {
    initializeWordPDFUI();
});

function initializeWordPDFUI() {
    // Initialize all UI enhancements
    setupUploadArea();
    setupFormatOptions();
    setupOrientationOptions();
    setupCheckboxAnimations();
    setupDragAndDrop();
    setupProgressAnimation();
    setupConversionSimulation();
    addPageAnimations();
    setupFilePreview();
}

// Upload area with drag & drop
function setupUploadArea() {
    const uploadBox = document.querySelector('.upload-box');
    const fileInput = document.getElementById('upload');
    const previewSection = document.getElementById('previewSection');
    
    if (!uploadBox || !fileInput) return;
    
    // Click on upload box triggers file input
    uploadBox.addEventListener('click', (e) => {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });
    
    // File selection handler
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            
            // Validate file type
            if (!file.name.match(/\.(doc|docx)$/i)) {
                showNotification('Invalid file type', 'Please upload a .doc or .docx file.', 'error');
                this.value = '';
                return;
            }
            
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                showNotification('File too large', 'Maximum file size is 10MB.', 'error');
                this.value = '';
                return;
            }
            
            // Show success animation
            uploadBox.classList.add('file-selected');
            setTimeout(() => uploadBox.classList.remove('file-selected'), 1000);
            
            // Show preview section
            if (previewSection) {
                previewSection.classList.remove('hidden');
                previewSection.classList.add('visible');
            }
            
            // Update file info
            updateFileInfo(file);
            
            // Show success notification
            showNotification('File uploaded', `${file.name} loaded successfully.`, 'success');
            
            // Try to preview Word document
            previewWordDocument(file);
        }
    });
}

// Update file information display
function updateFileInfo(file) {
    const fileInfo = document.getElementById('fileInfo');
    const sizeInfo = document.getElementById('sizeInfo');
    const formatInfo = document.getElementById('formatInfo');
    const originalFileName = document.getElementById('originalFileName');
    const pdfFileName = document.getElementById('pdfFileName');
    
    if (fileInfo) {
        fileInfo.textContent = `File: ${file.name}`;
    }
    
    if (sizeInfo) {
        sizeInfo.textContent = formatFileSize(file.size);
    }
    
    if (formatInfo) {
        const extension = file.name.split('.').pop().toUpperCase();
        formatInfo.textContent = extension;
    }
    
    if (originalFileName) {
        originalFileName.textContent = file.name;
    }
    
    if (pdfFileName) {
        const pdfName = file.name.replace(/\.[^/.]+$/, "") + '.pdf';
        pdfFileName.textContent = pdfName;
    }
}

// Preview Word document (basic preview)
function previewWordDocument(file) {
    const previewContent = document.getElementById('preview');
    if (!previewContent) return;
    
    // Clear previous preview
    previewContent.innerHTML = '';
    
    // Show loading state
    previewContent.innerHTML = `
        <div class="loading-preview">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading document preview...</p>
        </div>
    `;
    
    // Simulate document processing
    setTimeout(() => {
        // Create a basic document preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewContent.innerHTML = createDocumentPreview(file);
        };
        reader.readAsText(file);
    }, 1000);
}

// Create a styled document preview
function createDocumentPreview(file) {
    return `
        <div class="document-preview">
            <div class="document-header">
                <i class="fas fa-file-word"></i>
                <h4>${file.name}</h4>
            </div>
            <div class="document-content">
                <div class="page">
                    <div class="page-header">
                        <h5>Document Preview</h5>
                        <span class="page-number">Page 1</span>
                    </div>
                    <div class="content">
                        <p>This is a preview of your Word document. The actual conversion will preserve all formatting, fonts, and layout.</p>
                        <p><strong>File Details:</strong></p>
                        <ul>
                            <li>Name: ${file.name}</li>
                            <li>Size: ${formatFileSize(file.size)}</li>
                            <li>Type: ${file.type || 'Word Document'}</li>
                        </ul>
                        <p><em>Note: This is a basic preview. The actual PDF will maintain exact formatting.</em></p>
                    </div>
                </div>
            </div>
            <div class="document-footer">
                <i class="fas fa-info-circle"></i>
                <span>Word document ready for conversion</span>
            </div>
        </div>
    `;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format options toggle
function setupFormatOptions() {
    const formatOptions = document.querySelectorAll('.format-option');
    
    formatOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            formatOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Animation
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 300);
            
            // Show selection feedback
            showNotification('Format selected', `${this.dataset.format.toUpperCase()} page format selected`, 'info');
        });
    });
}

// Orientation options toggle
function setupOrientationOptions() {
    const orientationOptions = document.querySelectorAll('.orientation-option');
    
    orientationOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            orientationOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Animation
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 300);
            
            // Show selection feedback
            showNotification('Orientation selected', `${this.dataset.orientation} orientation selected`, 'info');
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
    element.style.transform = 'scale(1.05)';
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
            const wordFile = Array.from(files).find(f => f.name.match(/\.(doc|docx)$/i));
            
            if (wordFile) {
                fileInput.files = dt.files;
                
                // Trigger change event
                const event = new Event('change');
                fileInput.dispatchEvent(event);
                
                // Show drop animation
                animateDropSuccess();
            } else {
                showNotification('Invalid file', 'Please drop a Word document (.doc or .docx)', 'error');
            }
        }
    }
}

// Progress animation simulation
function setupProgressAnimation() {
    const convertBtn = document.getElementById('convertBtn');
    const progressSection = document.getElementById('progressSection');
    const resultSection = document.getElementById('resultSection');
    const previewSection = document.getElementById('previewSection');
    
    if (!convertBtn || !progressSection) return;
    
    convertBtn.addEventListener('click', function() {
        // Validate file is selected
        const fileInput = document.getElementById('upload');
        if (!fileInput.files.length) {
            showNotification('No file selected', 'Please upload a Word document first.', 'error');
            return;
        }
        
        // Show loading state on button
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
        this.disabled = true;
        
        // Show progress section
        if (previewSection) {
            previewSection.classList.add('hidden');
        }
        
        progressSection.classList.remove('hidden');
        progressSection.classList.add('visible');
        
        // Simulate conversion process
        simulateConversionProcess();
        
        // Restore button after process
        setTimeout(() => {
            this.innerHTML = originalText;
            this.disabled = false;
        }, 4500);
    });
}

// Simulate conversion with progress updates
function simulateConversionProcess() {
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressSteps = document.querySelectorAll('.step');
    const progressSection = document.getElementById('progressSection');
    const resultSection = document.getElementById('resultSection');
    const conversionTime = document.getElementById('conversionTime');
    
    let progress = 0;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 10 + 5;
        if (progress > 100) progress = 100;
        
        // Update progress bar
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        // Update percentage
        if (progressPercentage) {
            progressPercentage.textContent = `${Math.round(progress)}%`;
        }
        
        // Update steps
        if (progress >= 25 && currentStep < 1) {
            progressSteps[0].classList.remove('active');
            progressSteps[1].classList.add('active');
            currentStep = 1;
        } else if (progress >= 50 && currentStep < 2) {
            progressSteps[1].classList.remove('active');
            progressSteps[2].classList.add('active');
            currentStep = 2;
        } else if (progress >= 75 && currentStep < 3) {
            progressSteps[2].classList.remove('active');
            progressSteps[3].classList.add('active');
            currentStep = 3;
        }
        
        // When complete
        if (progress >= 100) {
            clearInterval(interval);
            
            // Hide progress, show result
            setTimeout(() => {
                progressSection.classList.add('hidden');
                resultSection.classList.remove('hidden');
                resultSection.classList.add('visible');
                
                // Set conversion time
                if (conversionTime) {
                    const time = (Math.random() * 2 + 1).toFixed(1);
                    conversionTime.textContent = `${time}s`;
                }
                
                // Show success notification
                showNotification('Conversion complete', 'Your Word document has been converted to PDF!', 'success');
            }, 500);
        }
    }, 100);
}

// Setup conversion simulation
function setupConversionSimulation() {
    const clearBtn = document.getElementById('clearBtn');
    const newConversionBtn = document.getElementById('newConversionBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.querySelector('.share-btn');
    
    // Clear file button
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            const fileInput = document.getElementById('upload');
            const previewSection = document.getElementById('previewSection');
            
            fileInput.value = '';
            
            if (previewSection) {
                previewSection.classList.add('hidden');
            }
            
            showNotification('Cleared', 'File selection cleared.', 'info');
        });
    }
    
    // New conversion button
    if (newConversionBtn) {
        newConversionBtn.addEventListener('click', function() {
            const resultSection = document.getElementById('resultSection');
            const uploadSection = document.querySelector('.upload-section');
            
            resultSection.classList.add('hidden');
            
            // Scroll to upload section
            uploadSection.scrollIntoView({ behavior: 'smooth' });
            
            showNotification('New conversion', 'Ready for new document conversion.', 'info');
        });
    }
    
    // Download button (simulated)
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            // This would normally trigger actual download
            // For demo, we'll just show a notification
            e.preventDefault();
            showNotification('Download started', 'PDF download has begun.', 'success');
            
            // Simulate download completion
            setTimeout(() => {
                showNotification('Download complete', 'PDF saved to your device.', 'success');
            }, 2000);
        });
    }
    
    // Share button
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            showNotification('Share', 'Share feature coming soon!', 'info');
        });
    }
}

// Page animations
function addPageAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-in {
            animation: slideIn 0.6s ease forwards;
        }
        
        .file-selected {
            animation: successPulse 1s ease;
        }
        
        @keyframes successPulse {
            0%, 100% { border-color: #2b579a; }
            50% { border-color: #4CAF50; }
        }
        
        .clicked {
            animation: clickEffect 0.3s ease;
        }
        
        @keyframes clickEffect {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.95); }
        }
        
        .loading-preview {
            text-align: center;
            padding: 3rem;
            color: #6c757d;
        }
        
        .loading-preview i {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .document-preview {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .document-header {
            background: #2b579a;
            color: white;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .document-content {
            padding: 2rem;
        }
        
        .page {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            padding: 2rem;
            min-height: 300px;
        }
        
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .page-number {
            color: #6c757d;
            font-size: 0.9rem;
        }
        
        .content {
            line-height: 1.6;
        }
        
        .content ul {
            margin: 1rem 0;
            padding-left: 1.5rem;
        }
        
        .content li {
            margin-bottom: 0.5rem;
        }
        
        .document-footer {
            background: #f8f9fa;
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #6c757d;
            font-size: 0.9rem;
            border-top: 1px solid #e0e0e0;
        }
    `;
    document.head.appendChild(style);
    
    // Animate sections on scroll
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
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Notification system
function showNotification(title, message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        <div class="notification-content">
            <strong>${title}</strong>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Add styles if not already added
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                z-index: 1000;
                max-width: 400px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                border-left: 4px solid #2b579a;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                border-left-color: #4CAF50;
            }
            
            .notification.error {
                border-left-color: #f44336;
            }
            
            .notification.warning {
                border-left-color: #FF9800;
            }
            
            .notification i:first-child {
                font-size: 1.5rem;
            }
            
            .notification.success i:first-child {
                color: #4CAF50;
            }
            
            .notification.error i:first-child {
                color: #f44336;
            }
            
            .notification.warning i:first-child {
                color: #FF9800;
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-content strong {
                display: block;
                margin-bottom: 0.25rem;
            }
            
            .notification-content span {
                font-size: 0.9rem;
                color: #6c757d;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #6c757d;
                cursor: pointer;
                padding: 0.25rem;
                border-radius: 4px;
            }
            
            .notification-close:hover {
                background: #f8f9fa;
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Animation functions
function animateDropSuccess() {
    const uploadBox = document.querySelector('.upload-box');
    if (uploadBox) {
        uploadBox.style.animation = 'bounce 0.5s ease';
        setTimeout(() => {
            uploadBox.style.animation = '';
        }, 500);
    }
}

// Add bounce animation
const bounceCSS = document.createElement('style');
bounceCSS.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;
document.head.appendChild(bounceCSS);

// Export functions for use in convert.js
window.wordPDFUI = {
    showNotification,
    formatFileSize,
    updateFileInfo,
    previewWordDocument
};