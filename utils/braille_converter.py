class BrailleConverter:
    BRAILLE_DICT = {
        'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
        'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
        'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
        'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
        'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
        'z': '⠵', ' ': '⠀', '0': '⠴', '1': '⠂', '2': '⠆',
        '3': '⠒', '4': '⠲', '5': '⠢', '6': '⠖', '7': '⠶',
        '8': '⠦', '9': '⠔', '.': '⠲', ',': '⠂', '?': '⠦',
        '!': '⠖', "'": '⠄', '"': '⠐⠂', '-': '⠤', '/': '⠌',
        ':': '⠒', ';': '⠆', '(': '⠐⠣', ')': '⠐⠜',
        'number': '⠼', 'capital': '⠠'
    }

    def __init__(self):
        self.NUMBER_PREFIX = self.BRAILLE_DICT['number']
        self.CAPITAL_PREFIX = self.BRAILLE_DICT['capital']

    def text_to_braille(self, text):
        """
        Convert text to braille.
        - Each letter is converted to its Braille equivalent.
        - Numbers are prefixed with the number sign.
        - Capital letters are prefixed with the capital sign.
        - Consecutive uppercase words get a double capital sign.
        """
        result = []
        i = 0
        inside_number = False  # Track if we are inside a number sequence
        inside_uppercase = False  # Track uppercase sequences

        while i < len(text):
            char = text[i]

            # Handle numbers (prefix first digit in sequence)
            if char.isdigit():
                if not inside_number:  # Add prefix only for first number in sequence
                    result.append(self.NUMBER_PREFIX)
                    inside_number = True
                result.append(self.BRAILLE_DICT.get(char, char))

            # Handle uppercase letters
            elif char.isupper():
                if not inside_uppercase:
                    # If next letter is also uppercase, use double capital prefix
                    if i + 1 < len(text) and text[i + 1].isupper():
                        result.append(self.CAPITAL_PREFIX * 2)
                    else:
                        result.append(self.CAPITAL_PREFIX)
                    inside_uppercase = True
                result.append(self.BRAILLE_DICT.get(char.lower(), char))

            # Handle lowercase letters and spaces
            elif char in self.BRAILLE_DICT:
                inside_number = False  # Reset number tracking
                inside_uppercase = False  # Reset uppercase tracking
                result.append(self.BRAILLE_DICT[char])

            else:
                inside_number = False  # Reset number tracking
                inside_uppercase = False  # Reset uppercase tracking
                result.append(char)  # Keep unknown characters as is

            i += 1

        return ''.join(result)
