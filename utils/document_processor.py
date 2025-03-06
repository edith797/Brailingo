import io
from typing import Tuple
from PIL import Image
import pytesseract
from PyPDF2 import PdfReader
import logging

logger = logging.getLogger(__name__)

class DocumentProcessor:
    @staticmethod
    def process_pdf(file_stream: io.BytesIO) -> Tuple[str, bool]:
        """
        Process a PDF file and extract text content using PyPDF2.

        Args:
            file_stream: BytesIO object containing the PDF file

        Returns:
            Tuple containing extracted text and success status
        """
        try:
            reader = PdfReader(file_stream)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            return text.strip(), True
        except Exception as e:
            logger.error(f"Error processing PDF: {str(e)}")
            return "", False

    @staticmethod
    def process_image(image_stream: io.BytesIO) -> Tuple[str, bool]:
        """
        Process an image file using Tesseract OCR.

        Args:
            image_stream: BytesIO object containing the image file

        Returns:
            Tuple containing extracted text and success status
        """
        try:
            image = Image.open(image_stream)
            text = pytesseract.image_to_string(image)
            return text.strip(), True
        except Exception as e:
            logger.error(f"Error processing image: {str(e)}")
            return "", False

    @staticmethod
    def clean_text(text: str) -> str:
        """
        Clean and normalize extracted text.

        Args:
            text: Raw extracted text

        Returns:
            Cleaned and normalized text
        """
        # Remove excessive whitespace
        text = ' '.join(text.split())
        # Remove non-printable characters
        text = ''.join(char for char in text if char.isprintable())
        return text