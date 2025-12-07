// convert.js - Word to PDF Converter with Theme Support
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme support
    initializeTheme();
    
    // DOM Elements
    const upload = document.getElementById('upload');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const newConversionBtn = document.getElementById('newConversionBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.querySelector('.share-btn');
    const uploadBox = document.querySelector('.upload-box');
    
    // Preview Elements
    const previewSection = document.getElementById('previewSection');
    const progressSection = document.getElementById('progressSection');
    const resultSection = document.getElementById('resultSection');
    const preview = document.getElementById('preview');
    const fileInfo = document.getElementById('fileInfo');
    const sizeInfo = document.getElementById('sizeInfo');
    const formatInfo = document.getElementById('formatInfo');
    const pagesInfo = document.getElementById('pagesInfo');
    
    // Result Elements
    const originalFileName = document.getElementById('originalFileName');
    const pdfFileName = document.getElementById('pdfFileName');
    const conversionTime = document.getElementById('conversionTime');
    
    // Options Elements
    const formatOptions = document.querySelectorAll('.format-option');
    const orientationOptions = document.querySelectorAll('.orientation-option');
    const includeMetadata = document.getElementById('includeMetadata');
    const addPageNumbers = document.getElementById('addPageNumbers');
    const preserveFormatting = document.getElementById('preserveFormatting');
    
    // Progress Elements
    const progressFill = document.querySelector('.progress-fill');
    const progressPercentage = document.querySelector('.progress-percentage');
    const progressSteps = document.querySelectorAll('.step');
    
    // App State
    let currentFile = null;
    let docContent = '';
    let isConverting = false;
    let conversionStartTime = null;
    
    // PDF Settings
    let currentFormat = 'a4';
    let currentOrientation = 'portrait';
    
    // Initialize the application
    function initializeUI() {
        setupEventListeners();
        setupFormatOptions();
        setupOrientationOptions();
        setupCheckboxAnimations();
        setupDragAndDrop();
    }
    
    // Setup Event Listeners
    function setupEventListeners() {
        // File upload
        upload.addEventListener('change', handleFileSelect);
        
        // Upload button click
        if (uploadBox) {
            uploadBox.addEventListener('click', function(e) {
                if (e.target !== upload) {
                    upload.click();
                }
            });
        }
        
        // Convert button
        convertBtn.addEventListener('click', convertToPDF);
        
        // Clear button
        clearBtn.addEventListener('click', clearFile);
        
        // New conversion button
        if (newConversionBtn) {
            newConversionBtn.addEventListener('click', resetConverter);
        }
        
        // Download button
        if (downloadBtn) {
            downloadBtn.addEventListener('click', downloadPDF);
        }
        
        // Share button
        if (shareBtn) {
            shareBtn.addEventListener('click', sharePDF);
        }
    }
    
    // Setup Format Options
    function setupFormatOptions() {
        formatOptions.forEach(option => {
            option.addEventListener('click', function() {
                formatOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                currentFormat = this.dataset.format;
                showToast('Format Selected', `${this.dataset.format.toUpperCase()} page format selected`, 'info');
            });
        });
    }
    
    // Setup Orientation Options
    function setupOrientationOptions() {
        orientationOptions.forEach(option => {
            option.addEventListener('click', function() {
                orientationOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                currentOrientation = this.dataset.orientation;
                showToast('Orientation Selected', `${this.dataset.orientation} orientation selected`, 'info');
            });
        });
    }
    
    // Setup Checkbox Animations
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
    
    // Setup Drag and Drop
    function setupDragAndDrop() {
        if (!uploadBox) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadBox.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadBox.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            uploadBox.addEventListener(eventName, unhighlight, false);
        });
        
        uploadBox.addEventListener('drop', handleDrop, false);
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        function highlight() {
            uploadBox.classList.add('drag-over');
        }
        
        function unhighlight() {
            uploadBox.classList.remove('drag-over');
        }
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                const wordFile = Array.from(files).find(f => f.name.match(/\.(doc|docx)$/i));
                
                if (wordFile) {
                    // Create a new DataTransfer to set file
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(wordFile);
                    upload.files = dataTransfer.files;
                    
                    // Trigger change event
                    const event = new Event('change', { bubbles: true });
                    upload.dispatchEvent(event);
                    
                    // Show success animation
                    animateDropSuccess();
                } else {
                    showToast('Invalid File', 'Please drop a Word document (.doc or .docx)', 'error');
                }
            }
        }
    }
    
    // Handle File Selection
    async function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.name.match(/\.(doc|docx)$/i)) {
            showToast('Invalid File Type', 'Please upload a .doc or .docx file.', 'error');
            upload.value = '';
            return;
        }
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showToast('File Too Large', 'Maximum file size is 10MB.', 'error');
            upload.value = '';
            return;
        }
        
        currentFile = file;
        
        // Show success animation
        uploadBox.classList.add('file-selected');
        setTimeout(() => uploadBox.classList.remove('file-selected'), 1000);
        
        // Show preview section
        previewSection.classList.remove('hidden');
        previewSection.classList.add('visible');
        
        // Update file info
        updateFileInfo(file);
        
        // Try to preview document
        await previewDocument(file);
        
        // Show success notification
        showToast('File Uploaded', `${file.name} loaded successfully`, 'success');
        
        // Scroll to preview
        setTimeout(() => {
            previewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
    
    // Update File Information
    function updateFileInfo(file) {
        const fileName = file.name;
        const fileSize = formatFileSize(file.size);
        const fileExtension = fileName.split('.').pop().toUpperCase();
        
        if (fileInfo) fileInfo.textContent = `File: ${fileName}`;
        if (sizeInfo) sizeInfo.textContent = fileSize;
        if (formatInfo) formatInfo.textContent = fileExtension;
        if (pagesInfo) pagesInfo.textContent = '1'; // Placeholder, could extract actual pages
        
        if (originalFileName) originalFileName.textContent = fileName;
        if (pdfFileName) {
            const pdfName = fileName.replace(/\.[^/.]+$/, '') + '.pdf';
            pdfFileName.textContent = pdfName;
        }
    }
    
    // Preview Document (Basic Preview)
    async function previewDocument(file) {
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
        
        try {
            // Create a basic document preview
            setTimeout(() => {
                previewContent.innerHTML = createDocumentPreview(file);
            }, 1000);
            
            // Try to extract text content
            const arrayBuffer = await file.arrayBuffer();
            const text = await extractTextFromDocx(arrayBuffer);
            docContent = text;
            
        } catch (error) {
            console.error('Preview error:', error);
            previewContent.innerHTML = `
                <div class="error-preview">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Preview unavailable. Document will still convert.</p>
                </div>
            `;
            docContent = 'Document content could not be previewed.';
        }
    }
    
    // Extract Text from DOCX
    async function extractTextFromDocx(arrayBuffer) {
        try {
            // Load JSZip if available
            if (typeof JSZip !== 'undefined') {
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
            } else {
                // Fallback to simple text extraction
                const decoder = new TextDecoder();
                const text = decoder.decode(arrayBuffer);
                return text.substring(0, 1000) + '...'; // Limit text
            }
        } catch (error) {
            console.warn('Could not extract text from DOCX:', error);
            return 'Document content extracted (basic preview only).';
        }
    }
    
    // Create Document Preview
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
                            <p>This is a preview of your Word document. The actual conversion will preserve formatting where possible.</p>
                            <p><strong>File Details:</strong></p>
                            <ul>
                                <li>Name: ${file.name}</li>
                                <li>Size: ${formatFileSize(file.size)}</li>
                                <li>Type: ${file.type || 'Word Document'}</li>
                                <li>Format: ${currentFormat.toUpperCase()}</li>
                                <li>Orientation: ${currentOrientation}</li>
                            </ul>
                            <p><em>Note: Full document preview requires server-side processing.</em></p>
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
    
    // Main Conversion Function
    async function convertToPDF() {
        if (!currentFile) {
            showToast('No File Selected', 'Please upload a Word document first.', 'error');
            return;
        }
        
        if (isConverting) {
            showToast('Already Converting', 'Please wait for current conversion to complete.', 'warning');
            return;
        }
        
        isConverting = true;
        conversionStartTime = Date.now();
        
        try {
            // Show loading state
            const originalText = convertBtn.innerHTML;
            convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
            convertBtn.disabled = true;
            
            // Show progress section
            previewSection.classList.add('hidden');
            progressSection.classList.remove('hidden');
            progressSection.classList.add('visible');
            
            // Start progress animation
            simulateConversionProgress();
            
            // Wait for progress animation
            await new Promise(resolve => setTimeout(resolve, 4500));
            
            // Convert using client-side method
            const pdfBlob = await convertUsingJSPDF();
            
            // Hide progress, show result
            progressSection.classList.add('hidden');
            resultSection.classList.remove('hidden');
            resultSection.classList.add('visible');
            
            // Calculate conversion time
            const conversionDuration = (Date.now() - conversionStartTime) / 1000;
            if (conversionTime) {
                conversionTime.textContent = `${conversionDuration.toFixed(1)}s`;
            }
            
            // Set download link
            if (downloadBtn) {
                const url = URL.createObjectURL(pdfBlob);
                const pdfName = currentFile.name.replace(/\.[^/.]+$/, '') + '.pdf';
                downloadBtn.href = url;
                downloadBtn.download = pdfName;
            }
            
            // Show success notification
            showToast('Conversion Complete!', 'Your Word document has been converted to PDF.', 'success');
            
            // Scroll to result
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
            
        } catch (error) {
            console.error('Conversion error:', error);
            showToast('Conversion Failed', 'An error occurred during conversion. Please try again.', 'error');
            
            // Show preview section again
            progressSection.classList.add('hidden');
            previewSection.classList.remove('hidden');
            
        } finally {
            // Reset button state
            convertBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
            convertBtn.disabled = false;
            isConverting = false;
        }
    }
    
    // Simulate Conversion Progress
    function simulateConversionProgress() {
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
            }
        }, 100);
    }
    
    // Convert using jsPDF (Client-side)
    async function convertUsingJSPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: currentOrientation,
            unit: 'mm',
            format: currentFormat
        });
        
        // Set document properties
        if (includeMetadata.checked) {
            doc.setProperties({
                title: currentFile.name.replace(/\.[^/.]+$/, ''),
                subject: 'Converted from Word to PDF',
                author: 'Word2PDF.pro',
                keywords: 'word, pdf, conversion',
                creator: 'Word2PDF.pro'
            });
        }
        
        // Add title
        doc.setFontSize(20);
        doc.setTextColor(43, 87, 154); // Word blue
        doc.text('Converted Document', 105, 20, { align: 'center' });
        
        // Add file info
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Original: ${currentFile.name}`, 20, 40);
        doc.text(`Converted: ${new Date().toLocaleDateString()}`, 20, 48);
        doc.text(`Format: ${currentFormat.toUpperCase()} - ${currentOrientation}`, 20, 56);
        
        // Add separation line
        doc.setDrawColor(43, 87, 154);
        doc.setLineWidth(0.5);
        doc.line(20, 62, 190, 62);
        
        // Add content header
        doc.setFontSize(16);
        doc.setTextColor(43, 87, 154);
        doc.text('Document Content', 20, 72);
        
        // Add content
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        
        // Split text into lines
        const lines = docContent.split(' ');
        let y = 82;
        let line = '';
        
        for (let word of lines) {
            const testLine = line + word + ' ';
            const textWidth = doc.getStringUnitWidth(testLine) * doc.internal.getFontSize() / doc.internal.scaleFactor;
            
            if (textWidth < (currentOrientation === 'portrait' ? 170 : 270)) {
                line = testLine;
            } else {
                if (line) {
                    doc.text(line.trim(), 20, y);
                    y += 7;
                }
                line = word + ' ';
                
                // Check if we need a new page
                if (y > (currentOrientation === 'portrait' ? 280 : 190)) {
                    if (addPageNumbers.checked) {
                        addPageNumber(doc);
                    }
                    doc.addPage();
                    y = 20;
                }
            }
        }
        
        // Add remaining text
        if (line) {
            doc.text(line.trim(), 20, y);
        }
        
        // Add page numbers if enabled
        if (addPageNumbers.checked) {
            addPageNumber(doc);
        }
        
        // Return as blob
        return doc.output('blob');
    }
    
    // Add Page Number
    function addPageNumber(doc) {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text(`Page ${i} of ${pageCount}`, 105, 287, { align: 'center' });
        }
    }
    
    // Clear File
    function clearFile() {
        if (!currentFile) {
            showToast('No File', 'No file to clear.', 'info');
            return;
        }
        
        if (confirm('Are you sure you want to clear the current file?')) {
            currentFile = null;
            upload.value = '';
            
            // Hide sections
            previewSection.classList.add('hidden');
            progressSection.classList.add('hidden');
            resultSection.classList.add('hidden');
            
            // Clear preview
            const previewContent = document.getElementById('preview');
            if (previewContent) {
                previewContent.innerHTML = `
                    <div class="empty-preview">
                        <i class="fas fa-file-alt"></i>
                        <p>Document preview will appear here</p>
                    </div>
                `;
            }
            
            // Clear file info
            if (fileInfo) fileInfo.textContent = 'File: example.docx';
            if (sizeInfo) sizeInfo.textContent = '0 KB';
            if (formatInfo) formatInfo.textContent = 'DOCX';
            if (pagesInfo) pagesInfo.textContent = '0';
            
            showToast('File Cleared', 'Document selection cleared.', 'success');
        }
    }
    
    // Reset Converter
    function resetConverter() {
        resultSection.classList.add('hidden');
        
        // Scroll to upload section
        const uploadSection = document.querySelector('.upload-section');
        if (uploadSection) {
            uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        showToast('New Conversion', 'Ready for new document conversion.', 'info');
    }
    
    // Download PDF
    function downloadPDF(e) {
        if (!currentFile) {
            e.preventDefault();
            showToast('No PDF', 'No PDF to download. Please convert a document first.', 'error');
        }
        // Download will happen automatically via the link
    }
    
    // Share PDF
    function sharePDF() {
        if (navigator.share) {
            navigator.share({
                title: 'Converted PDF',
                text: 'I converted a Word document to PDF using Word2PDF.pro',
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback: Copy link to clipboard
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    showToast('Link Copied', 'Tool link copied to clipboard!', 'success');
                })
                .catch(() => {
                    showToast('Share', 'Share this tool with others!', 'info');
                });
        }
    }
    
    // Format File Size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
    
    // Animation Functions
    function animateDropSuccess() {
        if (uploadBox) {
            uploadBox.style.animation = 'bounce 0.5s ease';
            setTimeout(() => {
                uploadBox.style.animation = '';
            }, 500);
        }
    }
    
    // Add bounce animation CSS
    const bounceCSS = document.createElement('style');
    bounceCSS.textContent = `
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        .file-selected {
            animation: successPulse 1s ease;
        }
        
        @keyframes successPulse {
            0%, 100% { border-color: var(--primary-color); }
            50% { border-color: var(--success-color); }
        }
    `;
    document.head.appendChild(bounceCSS);
    
    // Add preview styles
    const previewStyles = document.createElement('style');
    previewStyles.textContent = `
        .loading-preview {
            text-align: center;
            padding: 3rem;
            color: var(--text-secondary);
        }
        
        .loading-preview i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .error-preview {
            text-align: center;
            padding: 3rem;
            color: var(--error-color);
        }
        
        .error-preview i {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .document-preview {
            background: var(--card-bg);
            border-radius: var(--radius-md);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            border: 1px solid var(--border-color);
        }
        
        .document-header {
            background: var(--primary-color);
            color: white;
            padding: var(--space-md);
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        
        .document-header i {
            font-size: 1.5rem;
        }
        
        .document-content {
            padding: var(--space-lg);
        }
        
        .page {
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            padding: var(--space-lg);
            min-height: 300px;
        }
        
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-md);
            padding-bottom: var(--space-sm);
            border-bottom: 2px solid var(--border-color);
        }
        
        .page-number {
            color: var(--text-secondary);
            font-size: 0.9rem;
        }
        
        .content {
            line-height: 1.6;
            color: var(--text-primary);
        }
        
        .content ul {
            margin: var(--space-md) 0;
            padding-left: var(--space-lg);
        }
        
        .content li {
            margin-bottom: var(--space-xs);
        }
        
        .document-footer {
            background: var(--bg-secondary);
            padding: var(--space-md);
            display: flex;
            align-items: center;
            gap: var(--space-xs);
            color: var(--text-secondary);
            font-size: 0.9rem;
            border-top: 1px solid var(--border-color);
        }
        
        .document-footer i {
            color: var(--primary-color);
        }
        
        @media (max-width: 768px) {
            .document-content {
                padding: var(--space-md);
            }
            
            .page {
                padding: var(--space-md);
                min-height: 200px;
            }
        }
    `;
    document.head.appendChild(previewStyles);
    
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
        showToast('Welcome to Word2PDF!', 'Upload a Word document to convert it to PDF', 'info');
    }, 1000);
    
    // Export functions for debugging
    window.wordToPDF = {
        currentFile,
        convertToPDF,
        clearFile,
        showToast,
        formatFileSize
    };
});

