class DocumentProcessor {
    constructor() {
<<<<<<< HEAD
        this.form = document.getElementById('uploadForm');
        this.fileInput = document.getElementById('fileInput');
=======
        this.uploadForm = document.getElementById('uploadForm');
        this.textForm = document.getElementById('textForm'); // Fixed: correct ID reference
        this.fileInput = document.getElementById('fileInput');
        this.textInput = document.getElementById('textInput');
>>>>>>> 68be6b3c0cc5ab15e1034740d877726b0e3b3306
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.outputControls = document.querySelector('.output-controls');
        this.extractedText = document.querySelector('#extractedText .text-content');
        this.brailleText = document.querySelector('#brailleText .braille-content');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
<<<<<<< HEAD
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
=======
        this.uploadForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.textForm.addEventListener('submit', (e) => this.handleSubmit(e));
>>>>>>> 68be6b3c0cc5ab15e1034740d877726b0e3b3306
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
<<<<<<< HEAD
=======
            this.textInput.value = ''; // Clear text input when file is selected
>>>>>>> 68be6b3c0cc5ab15e1034740d877726b0e3b3306
            this.announceToScreenReader(`Selected file: ${file.name}`);
            this.provideFeedback('file_selected');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        const file = this.fileInput.files[0];
<<<<<<< HEAD
        if (!file) {
            this.showError('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            this.showLoading(true);
            const response = await fetch('/process', {
                method: 'POST',
                body: formData
            });
=======
        const text = this.textInput.value.trim();

        if (!file && !text) {
            this.showError('Please either select a file or enter text.');
            return;
        }

        try {
            this.showLoading(true);
            let response;

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                response = await fetch('/process', {
                    method: 'POST',
                    body: formData
                });
            } else {
                response = await fetch('/process-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: text })
                });
            }
>>>>>>> 68be6b3c0cc5ab15e1034740d877726b0e3b3306

            const data = await response.json();

            if (response.ok) {
                this.displayResults(data.text, data.braille);
                this.provideFeedback('success');
            } else {
                this.showError(data.error || 'Error processing document');
                this.provideFeedback('error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showError('An error occurred while processing the document');
            this.provideFeedback('error');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(text, braille) {
<<<<<<< HEAD
        this.extractedText.textContent = text;
=======
        this.extractedText.textContent = text.trim();
>>>>>>> 68be6b3c0cc5ab15e1034740d877726b0e3b3306
        this.brailleText.textContent = braille;

        if (window.speechController && window.speechController.responseType === 'speech') {
            this.outputControls.style.display = 'block';
        }

        this.announceToScreenReader('Document processed successfully. Text and Braille content are now available.');
    }

    showLoading(show) {
        this.loadingIndicator.style.display = show ? 'block' : 'none';
        if (show) {
            this.announceToScreenReader('Processing document, please wait...');
            this.provideFeedback('processing');
        }
    }

    showError(message) {
<<<<<<< HEAD
=======
        // Fixed: Use the correct form reference based on which form was submitted
        const form = event && event.target === this.textForm ? this.textForm : this.uploadForm;
        
>>>>>>> 68be6b3c0cc5ab15e1034740d877726b0e3b3306
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.role = 'alert';
        alert.textContent = message;

<<<<<<< HEAD
        this.form.insertAdjacentElement('beforeend', alert);
=======
        form.insertAdjacentElement('beforeend', alert);
>>>>>>> 68be6b3c0cc5ab15e1034740d877726b0e3b3306
        this.announceToScreenReader(`Error: ${message}`);
        this.provideFeedback('error');

        setTimeout(() => alert.remove(), 5000);
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;

        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }

    provideFeedback(type) {
        if (!window.speechController) return;

        const feedbackPatterns = {
            file_selected: [100, 30, 100],
            processing: [50, 50, 50],
            success: [200, 100, 200],
            error: [100, 100, 100, 100]
        };

        const feedbackMessages = {
            file_selected: 'File selected and ready for processing',
            processing: 'Processing your document',
            success: 'Document processed successfully',
            error: 'An error occurred'
        };

        if (window.speechController.responseType === 'tactile') {
            const pattern = feedbackPatterns[type] || feedbackPatterns.error;
            if ('vibrate' in navigator) {
                navigator.vibrate(pattern);
            }
        } else if (window.speechController.responseType === 'speech') {
            const message = feedbackMessages[type];
            window.speechController.speak(message);
        }
    }
}

// Initialize document processor when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const processor = new DocumentProcessor();
    window.documentProcessor = processor;
});