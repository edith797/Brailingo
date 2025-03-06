class SpeechController {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.utterance = null;
        this.isListening = false;
        this.responseType = null; // 'speech' or 'tactile'
        this.inputType = null; //'text' or 'file'

        setTimeout(() => {
            this.setUpPage();
            this.playWelcomeMessage();
            this.initializeVoiceCommands();
            this.initializeButtons();
        }, 100);
    }

    playWelcomeMessage() {
        const welcomeMessage = "Welcome to the Brailingo. Please choose your preferred feedback method: Speech or Tactile. For voice commands, say 'use speech' or 'use tactile' to make your selection.";
        this.speak(welcomeMessage);
        // this.provideTactileFeedback([200, 100, 200, 100, 200]);

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
        this.synthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        this.synthesis.speak(utterance);
    }

    initializeButtons() {
        document.getElementById('startVoice').addEventListener('click', () => this.toggleVoiceRecognition());
        document.getElementById('speechOption').addEventListener('click', () => this.setResponseType('speech'));
        document.getElementById('tactileOption').addEventListener('click', () => this.setResponseType('tactile'));
        document.getElementById('textOption').addEventListener('click', () => this.setInputType('text'));
        document.getElementById('fileOption').addEventListener('click', () => this.setInputType('file'));
        document.getElementById('playText').addEventListener('click', () => this.readText());
        document.getElementById('pauseText').addEventListener('click', () => this.pauseReading());
        document.getElementById('stopText').addEventListener('click', () => this.stopReading());
    }

    setInputType(type) {
        if (type === 'file') {
            document.querySelector('.file-upload-section').style.display = 'block';
            document.querySelector('.text-input-section').style.display = 'none';
        } else {
            document.querySelector('.file-upload-section').style.display = 'none';
            document.querySelector('.text-input-section').style.display = 'block';
        }
        
        if (type === 'speech') {
            // 
            document.querySelector('.output-controls').style.display = 'block';
        } else {
            this.provideTactileFeedback([200, 100, 200]);
        }
    }
    
    setResponseType(type) {
        this.responseType = type;
        document.getElementById('responseTypeSection').style.display = 'none';
        document.getElementById('inputTypeSection').style.display = 'block';

        const message = `${type === 'speech' ? 'Speech' : 'Tactile'} output selected. You can now upload a document or use voice commands to navigate.`;

        this.speak(message);

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

            this.recognition.onerror = (event) => {
                if (event.error === 'no-speech') return; // Ignore no-speech errors
                console.log('Speech recognition error:', event.error);
                this.updateStatus('Error in voice recognition. Please try again.', 'error');
            };

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
        } else if (command.includes('input text')) {
            this.setInputType('text');
        } else if (command.includes('input file')) {
            this.setInputType('file');
        } else if (command.includes('read text')) {
            this.readText();
        } else if (command.includes('pause')) {
            this.pauseReading();
        } else if (command.includes('resume')) {
            this.readText();
        } else if (command.includes('stop')) {
            this.stopReading();
        } else if (command.includes('show braille')) {
            document.getElementById('brailleText').scrollIntoView({ behavior: 'smooth' });
        } else if (command.includes('help')) {
            new bootstrap.Modal(document.getElementById('voiceCommandsHelp')).show();
        } 
        else if (command.includes('close')) {
            const helpModal = bootstrap.Modal.getInstance(document.getElementById('voiceCommandsHelp'));
            if (helpModal) {
                helpModal.hide();
            }
        } 
        else {
            console.log("Unknown command:", command);
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

    hightlightWords(word, index) {
        const textElement = document.getElementById('textContainer');
        const words = textElement.getElementsByTagName('span');

        Array.from(words).forEach(span => {
            span.classList.remove('text-highlighted');
        })

        if (words[index]) {
            words[index].classList.add('text-highlighted');
        }
    }

    prepareTextForReading(text) {
        const textContainer = document.getElementById('textContainer');
        const words = text.split(' ');
        textContainer.innerHTML = words
          .map((word, index) => {
              return `<span data-index="${index}">${word.trim()} </span>`;
        }
          )
          .join("");
    }
    
    readText() {
        console.log("Reading text...");
        const textElement = document.getElementById('textContainer');
        const text = textElement.textContent;
        // console.log(text);
        this.prepareTextForReading(text);
        const words = text.split(" ");
        console.log(words);
        let currentIndex = 0;

        console.log('cp 1');
        if (text && text.trim()) {
            if (!this.utterance || !this.synthesis.speaking) {
                this.utterance = new SpeechSynthesisUtterance(text);
                this.utterance.onboundary = async (event) => {
                    if (event.name === 'word') {
                        this.hightlightWords(words[currentIndex], currentIndex);
                        currentIndex++;
                    }
                };

                this.utterance.onend = () => {
                    const textContainer = document.getElementById('textContainer');
                    const words = textContainer.getElementsByTagName('span');
                    Array.from(words).forEach((word) =>
                      word.classList.remove("text-highlighted")
                    );
                };
            }

            console.log('cp 2');
            if (this.synthesis.paused) {
                this.synthesis.resume();
            } else {
                this.synthesis.speak(this.utterance);
            }
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