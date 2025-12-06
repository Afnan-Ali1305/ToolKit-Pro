from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import uuid
import subprocess
from werkzeug.utils import secure_filename
import pythoncom
import win32com.client
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'doc', 'docx', 'docm'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_with_libreoffice(input_path, output_path):
    """Convert using LibreOffice (works on Linux/Mac/Windows)"""
    try:
        # For Windows
        if sys.platform == "win32":
            subprocess.run([
                'soffice', '--headless', '--convert-to', 'pdf',
                '--outdir', os.path.dirname(output_path),
                input_path
            ], check=True)
        else:
            subprocess.run([
                'libreoffice', '--headless', '--convert-to', 'pdf',
                '--outdir', os.path.dirname(output_path),
                input_path
            ], check=True)
        return True
    except Exception as e:
        print(f"LibreOffice conversion failed: {e}")
        return False

def convert_with_pypandoc(input_path, output_path):
    """Convert using pypandoc"""
    try:
        import pypandoc
        pypandoc.convert_file(input_path, 'pdf', outputfile=output_path)
        return True
    except Exception as e:
        print(f"pypandoc conversion failed: {e}")
        return False

@app.route('/convert', methods=['POST'])
def convert_to_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        # Generate unique filenames
        file_id = str(uuid.uuid4())
        original_filename = secure_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{file_id}_{original_filename}')
        pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{file_id}.pdf')
        
        # Save uploaded file
        file.save(upload_path)
        
        # Try different conversion methods
        success = False
        
        # Method 1: Try LibreOffice first
        if not success:
            success = convert_with_libreoffice(upload_path, pdf_path)
        
        # Method 2: Try pypandoc as fallback
        if not success:
            success = convert_with_pypandoc(upload_path, pdf_path)
        
        if not success or not os.path.exists(pdf_path):
            return jsonify({'error': 'Conversion failed'}), 500
        
        # Return the PDF file
        return send_file(
            pdf_path,
            as_attachment=True,
            download_name=f'{os.path.splitext(original_filename)[0]}.pdf',
            mimetype='application/pdf'
        )
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        # Cleanup temporary files
        for path in [upload_path, pdf_path]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except:
                    pass

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)