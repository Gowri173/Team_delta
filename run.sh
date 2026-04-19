#!/bin/bash

echo "======================================================="
echo "        ServeEase Platform Setup & Run Script"
echo "======================================================="
echo ""

echo "[1/3] Installing Backend Dependencies..."
cd backend || exit
npm install
cd ..

echo ""
echo "[2/3] Installing Frontend Dependencies..."
cd frontend || exit
npm install
cd ..

echo ""
echo "[3/3] Starting Servers..."
echo "Starting Backend on port 8000 and Frontend on port 5173..."

# Trap ctrl-c and kill background processes
trap "kill 0" SIGINT

# Start Backend
cd backend || exit
npm run dev &
BACKEND_PID=$!
cd ..

# Start Frontend
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "======================================================="
echo "  ServeEase is starting!"
echo "  Frontend: http://localhost:5173"
echo "  Backend: http://localhost:8000"
echo "  Press Ctrl+C to stop both servers."
echo "======================================================="

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID
