conda# PHI Anonymizer

A full-stack web application for HIPAA-compliant de-identification of medical documents using AI-powered anonymization.

## Features

- **Rich Text Input**: WYSIWYG editor with formatting support (bold, italic, headings, lists)
- **Document Upload**: Support for Word (.docx) and PDF files
- **OCR Support**: Automatic OCR for scanned PDFs using Tesseract
- **Multiple LLM Providers**: Configurable support for Anthropic Claude, OpenAI GPT-4, and local models via Ollama
- **Configurable LLM Parameters**: Fine-tune temperature, max tokens, top-p, context length, and model selection
- **PHI Detection**: Comprehensive detection and replacement of Protected Health Information
- **Replacement Log**: Detailed log of all PHI replacements made
- **Side-by-Side Comparison**: View original and anonymized text side by side
- **Export Options**: Copy to clipboard or download anonymized text

## Architecture

### Backend (Python + FastAPI)
- FastAPI framework for high-performance async API
- Multiple LLM provider support with factory pattern
- Document parsing for Word and PDF files
- OCR integration with Tesseract
- Temporary file storage with automatic cleanup
- Comprehensive PHI anonymization prompt

### Frontend (React + TypeScript)
- React 18 with TypeScript
- Vite for fast development and building
- TipTap rich text editor
- Tailwind CSS for styling
- React Dropzone for file uploads
- Headless UI for accessible components

## Prerequisites

### System Requirements
- **Python**: 3.11 or higher (or Conda/Miniconda)
- **Node.js**: 18 or higher
- **Tesseract OCR**: Required for PDF OCR functionality (automatically installed with conda)

### Install Tesseract (Skip if using conda)

If you're using the conda environment, Tesseract will be installed automatically. Otherwise:

**macOS**:
```bash
brew install tesseract
```

**Ubuntu/Debian**:
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

**Windows**:
Download and install from: https://github.com/UB-Mannheim/tesseract/wiki

## Quick Start (Conda)

For a fast setup using Conda, run the automated setup script:

```bash
git clone <your-repo-url>
cd Anonymizer
chmod +x setup-conda.sh
./setup-conda.sh
```

This will:
- Create the conda environment with all dependencies
- Set up backend and frontend configurations
- Install all required packages including Tesseract

**Then configure your API keys** in `backend/.env` and you're ready to go!

---

## Detailed Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Anonymizer
```

### 2. Backend Setup

Choose either **Conda** (recommended) or **venv**:

#### Option A: Using Conda (Recommended)

```bash
# Create conda environment from environment.yml
conda env create -f environment.yml

# Activate the environment
conda activate anonymizer

# Verify installation
python --version  # Should show Python 3.11.x
tesseract --version  # Should show Tesseract version

# Create .env file from example
cp backend/.env.example backend/.env

# Edit backend/.env and add your API keys
# At minimum, add one of:
# - ANTHROPIC_API_KEY (recommended)
# - OPENAI_API_KEY
# - OLLAMA_BASE_URL (for Ollama)
```

#### Option B: Using venv

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env

# Edit .env and add your API keys
# At minimum, add one of:
# - ANTHROPIC_API_KEY (recommended)
# - OPENAI_API_KEY
# - OLLAMA_BASE_URL (for Ollama)
```

**Note**: If using venv, you'll need to install Tesseract separately (see Prerequisites).

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
cd ../frontend

# Create .env file (optional, defaults work for local development)
cp .env.example .env
```

### 4. Configure LLM Providers

Edit `backend/.env` and add your API keys:

**Anthropic Claude (Recommended)**:
```env
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

Get your API key from: https://console.anthropic.com/

**OpenAI GPT-4**:
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

Get your API key from: https://platform.openai.com/api-keys

**Ollama (Local Models)**:
```bash
# Install Ollama from https://ollama.ai/
# Pull a model (choose one or multiple):
ollama pull llama2
ollama pull mistral
ollama pull mixtral
ollama pull llama3

# Configure in .env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# Optional: Configure default parameters
DEFAULT_TEMPERATURE=0.3
DEFAULT_MAX_TOKENS=8000
DEFAULT_TOP_P=1.0
DEFAULT_CONTEXT_LENGTH=4096  # Adjust based on your model
```

**Note**: Different Ollama models have different context lengths. For example:
- `llama2`: 4096 tokens
- `mistral`: 8192 tokens
- `mixtral`: 32768 tokens
- `llama3`: 8192 tokens

### 5. Configure LLM Parameters (Optional)

You can customize LLM behavior through the UI or by setting defaults in `backend/.env`:

```env
# Temperature: Controls randomness (0.0 = focused, 2.0 = creative)
DEFAULT_TEMPERATURE=0.3

# Max Tokens: Maximum response length
DEFAULT_MAX_TOKENS=8000

# Top P: Nucleus sampling threshold (0.0-1.0)
DEFAULT_TOP_P=1.0

# Context Length: For Ollama models only
DEFAULT_CONTEXT_LENGTH=4096
```

The UI provides controls to override these defaults per request.

## Running the Application

### Development Mode

**Terminal 1 - Backend**:
```bash
# If using conda:
conda activate anonymizer
cd backend
uvicorn app.main:app --reload

# If using venv:
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000
API documentation at http://localhost:8000/docs

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173

### Production Build

**Backend**:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
cd frontend
npm run build
# Serve the dist/ folder with your preferred static file server
```

## Usage

1. **Select LLM Provider**: Choose your preferred LLM provider from the dropdown
2. **Configure LLM Parameters** (Optional): Click to expand and adjust:
   - **Temperature**: Control response randomness (0.0-2.0)
   - **Max Tokens**: Set maximum response length
   - **Top P**: Adjust nucleus sampling
   - **Context Length**: For Ollama, set context window size
   - **Model Name**: Override the default model
3. **Input Method**: Choose between rich text input or document upload
4. **Rich Text Input**:
   - Paste or type your medical document
   - Use the toolbar for formatting
   - Click "Anonymize"
4. **Document Upload**:
   - Drag and drop or click to select a .docx or .pdf file
   - For scanned PDFs, OCR will be automatically applied
   - Click "Anonymize File"
5. **Review Results**:
   - View the PHI Replacement Log showing all changes
   - Compare original and anonymized text side by side
   - Copy or download the anonymized text

## API Endpoints

### POST /api/anonymize/text
Anonymize text directly.

**Request**:
```json
{
  "text": "Patient John Doe...",
  "provider": "anthropic"
}
```

**Response**:
```json
{
  "replacement_log": [...],
  "anonymized_text": "Patient Jane Smith...",
  "provider_used": "anthropic",
  "processing_time_seconds": 2.34
}
```

### POST /api/anonymize/upload
Upload and anonymize a document.

**Request**: multipart/form-data
- `file`: Document file (.docx or .pdf)
- `provider`: LLM provider name

**Response**: Same as /text endpoint plus file metadata

### GET /api/anonymize/providers
Get list of configured LLM providers.

**Response**:
```json
[
  {
    "name": "anthropic",
    "configured": true,
    "available": true
  }
]
```

## Security & HIPAA Compliance

### Important Security Notes

1. **No Persistent Storage**: Files are temporarily stored and automatically deleted after processing or after 1 hour
2. **API Key Security**: Never commit .env files with API keys to version control
3. **HIPAA Compliance**:
   - LLM API calls may not be covered by a Business Associate Agreement (BAA)
   - For true HIPAA compliance, consider using local models or ensuring BAA with your LLM provider
   - This tool provides de-identification but should be reviewed by compliance experts
4. **PHI Logging**: The application never logs original PHI values, only descriptions

### Best Practices

- Use local LLM models for maximum privacy
- Review anonymized output before sharing
- Ensure API keys are properly secured
- Run on a secure, private network
- Regularly update dependencies for security patches

## File Structure

```
Anonymizer/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── anonymize.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── anonymize.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── llm_service.py
│   │   │   ├── document_parser.py
│   │   │   └── file_handler.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RichTextEditor.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ProviderSelector.tsx
│   │   │   ├── ResultsDisplay.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── hooks/
│   │   │   ├── useAnonymizer.ts
│   │   │   └── useProviders.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## Conda Environment Management

### Updating the Environment

If you add new dependencies or update `environment.yml`:

```bash
# Update the environment
conda env update -f environment.yml --prune

# Or recreate it from scratch
conda deactivate
conda env remove -n anonymizer
conda env create -f environment.yml
```

### Exporting Your Environment

To share your exact environment setup:

```bash
# Export with versions
conda env export > environment-lock.yml

# Export minimal (without versions)
conda env export --from-history > environment-minimal.yml
```

### Common Conda Commands

```bash
# List all environments
conda env list

# Activate environment
conda activate anonymizer

# Deactivate environment
conda deactivate

# List packages in environment
conda list

# Remove environment
conda env remove -n anonymizer
```

## Troubleshooting

### Backend Issues

**Import errors**: Make sure environment is activated
```bash
# For conda:
conda activate anonymizer

# For venv:
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

**Tesseract not found**: Install Tesseract and update `TESSERACT_PATH` in .env

**API key errors**: Verify API keys are correctly set in backend/.env

### Frontend Issues

**Node modules missing**: Run `npm install` in the frontend directory

**CORS errors**: Ensure backend is running and `ALLOWED_ORIGINS` includes frontend URL

**Build errors**: Clear node_modules and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
```

## Development

### Running Tests

**Backend**:
```bash
cd backend
pytest
```

### Linting

**Frontend**:
```bash
cd frontend
npm run lint
```

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
