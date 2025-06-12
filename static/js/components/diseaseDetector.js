/**
 * Disease Detector Component
 * Handles the plant disease detection functionality
 */

class DiseaseDetector {
    constructor() {
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.imagePreview = document.getElementById('image-preview');
        this.previewContainer = document.getElementById('preview-container');
        this.detectButton = document.getElementById('detect-button');
        this.resultContainer = document.getElementById('result-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.diseaseNameElement = document.getElementById('disease-name');
        this.diseaseDescriptionElement = document.getElementById('disease-description');
        this.treatmentSuggestionsElement = document.getElementById('treatment-suggestions');
        this.preventionTipsElement = document.getElementById('prevention-tips');
        
        this.selectedFile = null;
        
        // Initialize the component
        this.init();
    }
    
    init() {
        // Setup event listeners
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', () => this.handleDragLeave());
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.detectButton.addEventListener('click', () => this.detectDisease());
        
        // Initially hide these elements
        this.previewContainer.style.display = 'none';
        this.resultContainer.style.display = 'none';
        this.loadingIndicator.style.display = 'none';
    }
    
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.add('drag-over');
    }
    
    handleDragLeave() {
        this.uploadArea.classList.remove('drag-over');
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        this.uploadArea.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.match('image.*')) {
            this.processFile(file);
        } else {
            this.showError('Please upload an image file.');
        }
    }
    
    processFile(file) {
        // Check if file is an image
        if (!file.type.match('image.*')) {
            this.showError('Please upload an image file.');
            return;
        }
        
        this.selectedFile = file;
        
        // Display image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imagePreview.src = e.target.result;
            this.previewContainer.style.display = 'block';
            this.resultContainer.style.display = 'none'; // Hide any previous results
            
            // Enable detect button
            this.detectButton.disabled = false;
        };
        reader.readAsDataURL(file);
    }
    
    async detectDisease() {
        if (!this.selectedFile) {
            this.showError('Please select an image first.');
            return;
        }
        
        // Show loading indicator
        this.loadingIndicator.style.display = 'block';
        this.detectButton.disabled = true;
        
        try {
            // Create FormData object to send the file
            const formData = new FormData();
            formData.append('image', this.selectedFile);
            
            // Make API request to disease detection endpoint
            const response = await fetch('/api/detect-disease', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to detect disease. Please try again.');
            }
            
            const data = await response.json();
            
            // Display the results
            this.displayResults(data);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            // Hide loading indicator
            this.loadingIndicator.style.display = 'none';
            this.detectButton.disabled = false;
        }
    }
    
    displayResults(data) {
        // Show result container
        this.resultContainer.style.display = 'block';
        
        // Update result elements with the data
        this.diseaseNameElement.textContent = data.diseaseName;
        this.diseaseDescriptionElement.textContent = data.description;
        
        // Clear previous treatment suggestions
        this.treatmentSuggestionsElement.innerHTML = '';
        
        // Add treatment suggestions
        if (data.treatments && data.treatments.length > 0) {
            const treatmentList = document.createElement('ul');
            data.treatments.forEach(treatment => {
                const listItem = document.createElement('li');
                listItem.textContent = treatment;
                treatmentList.appendChild(listItem);
            });
            this.treatmentSuggestionsElement.appendChild(treatmentList);
        } else {
            this.treatmentSuggestionsElement.textContent = 'No specific treatments available.';
        }
        
        // Clear previous prevention tips
        this.preventionTipsElement.innerHTML = '';
        
        // Add prevention tips
        if (data.preventionTips && data.preventionTips.length > 0) {
            const preventionList = document.createElement('ul');
            data.preventionTips.forEach(tip => {
                const listItem = document.createElement('li');
                listItem.textContent = tip;
                preventionList.appendChild(listItem);
            });
            this.preventionTipsElement.appendChild(preventionList);
        } else {
            this.preventionTipsElement.textContent = 'No specific prevention tips available.';
        }
        
        // Scroll to results
        this.resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    showError(message) {
        // Create and show an error toast
        const errorToast = document.createElement('div');
        errorToast.className = 'toast error';
        errorToast.textContent = message;
        
        document.body.appendChild(errorToast);
        
        // Show the toast
        setTimeout(() => {
            errorToast.classList.add('show');
        }, 10);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
            errorToast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(errorToast);
            }, 300);
        }, 3000);
    }
}

// Initialize the disease detector when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('upload-area')) {
        new DiseaseDetector();
    }
});

export default DiseaseDetector;