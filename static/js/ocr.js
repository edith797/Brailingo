class DocumentProcessor {
    constructor() {
        this.form = document.getElementById('uploadForm');
        this.fileInput = document.getElementById('fileInput');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.outputControls = document.querySelector('.output-controls');
        this.extractedText = document.querySelector('#extractedText .text-content');
        this.brailleText = document.querySelector('#brailleText .braille-content');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.announceToScreenReader(`Selected file: ${file.name}`);
            this.provideFeedback('file_selected');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        const file = this.fileInput.files[0];
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
        this.extractedText.textContent = text;
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
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.role = 'alert';
        alert.textContent = message;

        this.form.insertAdjacentElement('beforeend', alert);
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