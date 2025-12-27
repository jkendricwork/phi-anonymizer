#!/bin/bash
# Setup script for PHI Anonymizer with Conda

set -e  # Exit on error

echo "=========================================="
echo "PHI Anonymizer - Conda Setup"
echo "=========================================="
echo ""

# Check if conda is installed
if ! command -v conda &> /dev/null; then
    echo "ERROR: Conda is not installed!"
    echo "Please install Miniconda or Anaconda from:"
    echo "  - Miniconda: https://docs.conda.io/en/latest/miniconda.html"
    echo "  - Anaconda: https://www.anaconda.com/download"
    exit 1
fi

echo "✓ Conda found: $(conda --version)"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "WARNING: Node.js is not installed!"
    echo "Frontend will not work without Node.js."
    echo "Install from: https://nodejs.org/"
    echo ""
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ Node.js found: $(node --version)"
    echo "✓ npm found: $(npm --version)"
fi
echo ""

# Create conda environment
echo "Step 1: Creating conda environment 'anonymizer'..."
if conda env list | grep -q "^anonymizer "; then
    echo "Environment 'anonymizer' already exists."
    read -p "Recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        conda env remove -n anonymizer
        conda env create -f environment.yml
    else
        echo "Updating existing environment..."
        conda env update -f environment.yml --prune
    fi
else
    conda env create -f environment.yml
fi
echo "✓ Conda environment created"
echo ""

# Setup backend configuration
echo "Step 2: Setting up backend configuration..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env from example"
    echo ""
    echo "IMPORTANT: Edit backend/.env and add your API keys!"
    echo "  - ANTHROPIC_API_KEY (recommended)"
    echo "  - OPENAI_API_KEY"
    echo "  - OLLAMA_BASE_URL (for local models)"
else
    echo "✓ backend/.env already exists"
fi
echo ""

# Setup frontend
echo "Step 3: Setting up frontend..."
if [ -d "frontend/node_modules" ]; then
    echo "✓ Frontend dependencies already installed"
else
    echo "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✓ Frontend dependencies installed"
fi
echo ""

# Create frontend .env if needed
if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env 2>/dev/null || true
    echo "✓ Created frontend/.env (using defaults)"
fi
echo ""

# Final instructions
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  conda activate anonymizer"
echo "  cd backend"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser"
echo ""
echo "Don't forget to configure your API keys in backend/.env!"
echo "=========================================="
