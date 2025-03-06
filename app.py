import os
import logging
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
import pytesseract
from PIL import Image
import io
from PyPDF2 import PdfReader
from utils.braille_converter import BrailleConverter
# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_file):
    """Extract text from PDF using PyPDF2"""
    try:
        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return ""

# def text_to_braille(text):
#     """Convert text to Braille Unicode characters"""
#     # Basic English to Braille mapping
#     braille_dict = {
#         'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
#         'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
#         'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
#         'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
#         'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
#         'z': '⠵', ' ': '⠀', '.': '⠲', ',': '⠂', '!': '⠖',
#         '?': '⠦', '"': '⠐', "'": '⠄', '-': '⠤', 
#         '0': '⠴', '1': '⠂', '2': '⠆', '3': '⠒', '4': '⠲',
#         '5': '⠢', '6': '⠖', '7': '⠶', '8': '⠦', '9': '⠔'
#     }

#     return ''.join(braille_dict.get(c.lower(), c) for c in text)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process_document():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(file.filename)
            file_ext = filename.rsplit('.', 1)[1].lower()

            if file_ext == 'pdf':
                text = extract_text_from_pdf(io.BytesIO(file.read()))
            else:
                image = Image.open(file)
                text = pytesseract.image_to_string(image)

            if not text.strip():
                return jsonify({'error': 'No text could be extracted from the document'}), 400

            # Convert text to braille
            braille_text = BrailleConverter().text_to_braille(text)

            return jsonify({
                'text': text,
                'braille': braille_text,
                'success': True
            })

        except Exception as e:
            logger.error(f"Error processing file: {str(e)}")
            return jsonify({'error': 'Error processing file', 'details': str(e)}), 500

    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/process-text', methods=['POST'])
def process_text():
    print("hello world")
    text = request.form.get('text')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    braille_text = BrailleConverter().text_to_braille(text)
    return jsonify({
        'text': text,
        'braille': braille_text,
        'success': True
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)