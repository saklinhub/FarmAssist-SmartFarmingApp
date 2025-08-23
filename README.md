# FarmAssist - Smart Farming Application

## Overview
FarmAssist is a Flask-based web application designed to empower farmers with data-driven decision-making tools using machine learning and deep learning. The application provides two core features:

- 🌾 **Crop Recommendation**: Suggests the most suitable crops to grow based on soil and climate data inputs.
- 🧪 **Disease Detection**: Utilizes a deep learning model to detect plant diseases from uploaded images.

## Features
- **Crop Recommendation**: Analyzes soil parameters (e.g., nitrogen, phosphorus, potassium levels) and climate conditions (e.g., temperature, humidity, rainfall) to recommend optimal crops for maximizing yield.
- **Disease Detection**: Employs a trained deep learning model to identify plant diseases from images, enabling early intervention and crop protection.
- **User-Friendly Interface**: Built with Flask, providing an intuitive web interface for farmers to access insights easily.

## Installation
To set up FarmAssist locally, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/saklinhub/FarmAssist-SmartFarmingApp.git
   cd FarmAssist-SmartFarmingApp

2. **Set Up a Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt  

4. **Run the Application**:
   ```bash
   python app.py

5. Open your browser and navigate to http://localhost:5000.

## Requirements
- Python 3.8+
- Flask
- NumPy, Pandas, Scikit-learn (for crop recommendation)
- TensorFlow or PyTorch (for disease detection)
- Other dependencies listed in requirements.txt

## Usage
1. **Crop Recomendation:**
  - Input soil and climate data through the web interface.
  - Receive a recommendation for the best crop to plant based on the provided data.

2. **Disease Detection**
   - Upload an image of a plant leaf.
   - The system will analyze the image and provide a diagnosis of potential diseases.
  
## Project Structure: 
```text
FarmAssist-SmartFarmingApp/
├── app.py                  # Main Flask application
├── models/                 # Machine learning and deep learning models
├── static/                 # CSS, JavaScript, and image assets
├── templates/              # HTML templates for the web interface
├── requirements.txt        # Project dependencies
└── README.md               # Project documentation
```

## Contributing
Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (git checkout -b feature-branch).
3. Make your changes and commit (git commit -m "Add feature").
4. Push to the branch (git push origin feature-branch).
5. Open a pull request.



   


   
