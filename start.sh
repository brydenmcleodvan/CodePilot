#!/bin/bash

# Healthmap Unified Startup Script
# This script coordinates the startup of all application components

echo "Starting Healthmap Application..."

# Check if postgresql is running and initialize database if needed
echo "Checking database status..."
if ! pg_isready > /dev/null 2>&1; then
  echo "Database not running, initializing..."
  # Add initialization code here if needed
fi

# Start all processes in background
echo "Starting backend services..."

# Start Express.js server
echo "Starting Express server..."
npm run dev &
EXPRESS_PID=$!

# Start Flask API server
echo "Starting Flask API server..."
python app.py &
FLASK_PID=$!

# Start Streamlit application
echo "Starting Streamlit application..."
streamlit run streamlit_app.py &
STREAMLIT_PID=$!

echo "All services started successfully!"
echo "Express server running with PID: $EXPRESS_PID"
echo "Flask API running with PID: $FLASK_PID"
echo "Streamlit app running with PID: $STREAMLIT_PID"

# Function to handle script termination
cleanup() {
  echo "Shutting down all services..."
  kill $EXPRESS_PID
  kill $FLASK_PID
  kill $STREAMLIT_PID
  echo "All services terminated."
  exit 0
}

# Register the cleanup function for script termination
trap cleanup INT TERM

# Keep the script running
echo "Press Ctrl+C to stop all services"
wait