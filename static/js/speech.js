class SpeechController {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.utterance = null;
        this.isListening = false;
        this.responseType = null; // 'speech' or 'tactile'

        setTimeout(() => {
            this.setUpPage();
            this.playWelcomeMessage();
            this.initializeVoiceCommands();
            this.initializeButtons();
        }, 1000);
    }

    playWelcomeMessage() {
        const welcomeMessage = "Welcome to the Brailingo. Please choose your preferred feedback method: Speech or Tactile. For voice commands, say 'use speech' or 'use tactile' to make your selection.";

        this.speak(welcomeMessage);
        // this.provideTactileFeedback([200, 100, 200, 100, 200]); // Welcome pattern

        setTimeout(() => {
            this.toggleVoiceRecognition();
        }, 1000);
    }

    setUpPage() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
    }

    speak(text) {
        console.log(text);
        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        this.synthesis.speak(utterance);
    }

    initializeButtons() {
        document.getElementById('startVoice').addEventListener('click', () => this.toggleVoiceRecognition());
        document.getElementById('speechOption').addEventListener('click', () => this.setResponseType('speech'));
        document.getElementById('tactileOption').addEventListener('click', () => this.setResponseType('tactile'));
        document.getElementById('playText').addEventListener('click', () => this.readText());
        document.getElementById('pauseText').addEventListener('click', () => this.pauseReading());
        document.getElementById('stopText').addEventListener('click', () => this.stopReading());
    }

    setResponseType(type) {
        this.responseType = type;
        document.getElementById('responseTypeSection').style.display = 'none';
        document.querySelector('.file-upload-section').style.display = 'block';

        const message = `${type === 'speech' ? 'Speech' : 'Tactile'} output selected. You can now upload a document or use voice commands to navigate.`;

        if (type === 'speech') {
            this.speak(message);
            document.querySelector('.output-controls').style.display = 'block';
        } else {
            this.provideTactileFeedback([200, 100, 200]);
        }

        this.updateStatus(message, 'success');
    }

    initializeVoiceCommands() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;

            this.recognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
                this.processCommand(command);
            };

            // this.recognition.onerror = (event) => {
            //     console.error('Speech recognition error:', event.error);
            //     this.updateStatus('Error in voice recognition. Please try again.', 'error');
            // };

            this.recognition.onend = () => {
                if (this.isListening) {
                    this.recognition.start();
                }
            };
        }
    }

    processCommand(command) {
        console.log('Received command:', command);

        if (command.includes('use speech')) {
            this.setResponseType('speech');
        } else if (command.includes('use tactile')) {
            this.setResponseType('tactile');
        } else if (command.includes('upload') || command.includes('select file')) {
            document.getElementById('fileInput').click();
        } else if (command.includes('process') || command.includes('start')) {
            document.getElementById('uploadForm').dispatchEvent(new Event('submit'));
        } else if (command.includes('read text')) {
            this.readText();
        } else if (command.includes('pause')) {
            this.pauseReading();
        } else if (command.includes('stop')) {
            this.stopReading();
        } else if (command.includes('show braille')) {
            document.getElementById('brailleText').scrollIntoView({ behavior: 'smooth' });
        } else if (command.includes('help')) {
            new bootstrap.Modal(document.getElementById('voiceCommandsHelp')).show();
        }
    }

    toggleVoiceRecognition() {
        if (!this.recognition) {
            this.updateStatus('Voice recognition is not supported in your browser.', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.updateStatus('Voice commands stopped', 'info');
        } else {
            this.recognition.start();
            this.isListening = true;
            this.updateStatus('Listening for voice commands...', 'success');
        }
    }

    readText() {
        const textElement = document.querySelector('#extractedText .text-content');
        const text = textElement.textContent;

        if (text && text.trim()) {
            this.utterance = new SpeechSynthesisUtterance(text);
            this.synthesis.speak(this.utterance);
        }
    }

    pauseReading() {
        if (this.synthesis.speaking) {
            this.synthesis.pause();
        }
    }

    stopReading() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
    }

    provideTactileFeedback(pattern = [100, 50, 100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    updateStatus(message, type) {
        const statusElement = document.getElementById('voiceStatus');
        statusElement.textContent = message;
        statusElement.className = `alert alert-${type}`;
        statusElement.style.display = 'block';

        if (this.responseType === 'tactile') {
            this.provideTactileFeedback();
        } else if (this.responseType === 'speech') {
            this.speak(message);
        }
    }
}

// Initialize speech controller when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const speechController = new SpeechController();
    window.speechController = speechController;

    // Initialize Feather icons
    feather.replace();
});