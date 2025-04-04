#!/bin/bash

# Start both the Node.js and Python servers

# Start Python Flask server in the background
echo "Starting Python Flask server..."
python app.py &

# Start Streamlit in the background
echo "Starting Streamlit server..."
bash run_streamlit.sh &

# Small delay to ensure Python servers start
sleep 3

# Start the Node.js server in the foreground
echo "Starting Node.js server..."
npm run dev

# This script will keep running until the Node.js server is stopped
# When this script is terminated, it will also kill the Python servers