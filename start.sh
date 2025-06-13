#!/bin/bash

echo "🔽 Downloading ML models..."

# Replace these with your actual file IDs
PKL_FILE_ID=your_pkl_file_id_here
H5_FILE_ID=your_h5_file_id_here

# Download model.pkl
curl -L -o crop_model.pkl "https://drive.google.com/uc?export=download&id=1Ab3XaEW7NL50Jugt4fPx1dN1eZHrYEQK"

# Download model.h5
curl -L -o crop_disease_detection.h5 "https://drive.google.com/uc?export=download&id=17-Arqf2U0jhQbDjDroQ0GT2EYkUFBpGN"

echo "✅ Models downloaded!"

echo "🚀 Starting the app..."
gunicorn app:app --bind=0.0.0.0:$PORT # Replace 'app:app' with your actual app entry point if different
