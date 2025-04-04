#!/bin/bash

# Start the Node.js server in the background
echo "Starting Node.js server..."
npm run dev &
NODE_PID=$!

# Give the Node.js server a moment to start
sleep 2

# Start the Streamlit app
echo "Starting Streamlit app..."
./run_streamlit.sh

# If Streamlit exits, kill the Node.js server
echo "Shutting down Node.js server..."
kill $NODE_PID