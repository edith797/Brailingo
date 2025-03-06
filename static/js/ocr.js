class DocumentProcessor {
    constructor() {
        this.uploadForm = document.getElementById('uploadForm');
        this.textForm = document.getElementById('textForm'); // Fixed: correct ID reference
        this.fileInput = document.getElementById('fileInput');
        this.textInput = document.getElementById('textInput');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.outputControls = document.querySelector('.output-controls');
        this.extractedText = document.querySelector('#extractedText .text-content');
        this.brailleText = document.querySelector('#brailleText .braille-content');

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.uploadForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.textForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.textInput.value = ''; // Clear text input when file is selected
            this.announceToScreenReader(`Selected file: ${file.name}`);
            this.provideFeedback('file_selected');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();

        const file = this.fileInput.files[0];
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
                console.log("cp 1");
                response = await fetch('/process-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ text: text })
                });
            }

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
        this.extractedText.textContent = text.trim();
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
        // Fixed: Use the correct form reference based on which form was submitted
        const form = event && event.target === this.textForm ? this.textForm : this.uploadForm;
        
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger';
        alert.role = 'alert';
        alert.textContent = message;

        form.insertAdjacentElement('beforeend', alert);
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