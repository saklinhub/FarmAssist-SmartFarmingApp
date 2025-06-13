
echo "🔽 Downloading ML models..."

# Download crop_model.pkl from Google Drive
curl -L -o crop_model.pkl "https://drive.google.com/uc?export=download&id=1Ab3XaEW7NL50Jugt4fPx1dN1eZHrYEQK"

# Download crop_disease_detection.h5 from Google Drive
curl -L -o crop_disease_detection.h5 "https://drive.google.com/uc?export=download&id=17-Arqf2U0jhQbDjDroQ0GT2EYkUFBpGN"

echo "✅ Models downloaded!"

echo "🚀 Starting the app..."
exec gunicorn app:app --bind=0.0.0.0:$PORT

