#!/bin/bash

# PHI Anonymizer Startup Script
# This script starts both the backend and frontend services

set -e

echo "🚀 Starting PHI Anonymizer..."
echo ""

# Check if conda environment exists
if ! conda env list | grep -q "anonymizer"; then
    echo "❌ Error: Conda environment 'anonymizer' not found"
    echo "Please run ./setup-conda.sh first"
    exit 1
fi

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env not found"
    echo "Please copy backend/.env.example to backend/.env and configure your API keys"
    exit 1
fi

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo "✅ Services stopped"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup INT TERM EXIT

# Start backend
echo "📡 Starting backend server..."
cd backend
source "$(conda info --base)/etc/profile.d/conda.sh"
conda activate anonymizer
uvicorn app.main:app --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend started (PID: $BACKEND_PID) - logs: backend.log"
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🎨 Starting frontend dev server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "✅ Frontend started (PID: $FRONTEND_PID) - logs: frontend.log"
echo "   App: http://localhost:5173"
echo ""

echo "=========================================="
echo "✨ PHI Anonymizer is running!"
echo "=========================================="
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Logs:"
echo "  Backend: tail -f backend.log"
echo "  Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================="

# Wait for processes to finish (or until Ctrl+C)
wait
