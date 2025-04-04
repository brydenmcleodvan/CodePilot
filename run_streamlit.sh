#!/bin/bash

# Run Streamlit with the appropriate configuration for Replit
streamlit run streamlit_app.py --server.port 8501 --server.address 0.0.0.0 --server.enableXsrfProtection=false --server.enableWebsocketCompression=false