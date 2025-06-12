/**
 * Crop Recommender Component
 * Handles the crop recommendation functionality based on soil data and environmental conditions
 */

import { fetchWeatherData } from '../utils/api.js';

class CropRecommender {
    constructor() {
        this.form = document.getElementById('crop-form');
        this.soilNitrogenInput = document.getElementById('soil-nitrogen');
        this.soilPhosphorusInput = document.getElementById('soil-phosphorus');
        this.soilPotassiumInput = document.getElementById('soil-potassium');
        this.soilPhInput = document.getElementById('soil-ph');
        this.soilTemperatureInput = document.getElementById('soil-temperature');
        this.soilHumidityInput = document.getElementById('soil-humidity');
        this.soilTypeSelect = document.getElementById('soil-type');
        this.locationInput = document.getElementById('location');
        this.submitButton = document.getElementById('recommend-button');
        this.resultContainer = document.getElementById('result-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.recommendedCropsElement = document.getElementById('recommended-crops');
        this.reasonsElement = document.getElementById('recommendation-reasons');
        this.alternativeCropsElement = document.getElementById('alternative-crops');
        this.weatherInfoElement = document.getElementById('weather-info');
        this.iotConnectButton = document.getElementById('iot-connect');
        
        // Initialize the component
        this.init();
    }
    
    init() {
        // Setup event listeners
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.iotConnectButton.addEventListener('click', () => this.connectIoTDevice());
        
        // Initially hide these elements
        this.resultContainer.style.display = 'none';
        this.loadingIndicator.style.display = 'none';
        
        // Initialize range input display values
        this.initRangeInputs();
    }
    
    initRangeInputs() {
        // For each range input, display its current value
        const rangeInputs = document.querySelectorAll('input[type="range"]');
        rangeInputs.forEach(input => {
            const displayElement = document.getElementById(`${input.id}-value`);
            if (displayElement) {
                displayElement.textContent = input.value;
                
                // Update the display value when the range changes
                input.addEventListener('input', () => {
                    displayElement.textContent = input.value;
                });
            }
        });
    }
    
    async handleFormSubmit(e) {
        e.preventDefault();
        
        // Show loading indicator
        this.loadingIndicator.style.display = 'block';
        this.submitButton.disabled = true;
        
        try {
            // Get form data
            const formData = this.collectFormData();
            
            // Get weather data based on location
            const weatherData = await this.getWeatherData(formData.location);
            
            // Combine soil data with weather data
            const fullData = {
                ...formData,
                weather: weatherData
            };
            
            // Make API request to crop recommendation endpoint
            const response = await fetch('/api/recommend-crops', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fullData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to get crop recommendations. Please try again.');
            }
            
            const data = await response.json();
            
            // Display the results
            this.displayResults(data);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            // Hide loading indicator
            this.loadingIndicator.style.display = 'none';
            this.submitButton.disabled = false;
        }
    }
    
    collectFormData() {
        return {
            soilNitrogen: parseInt(this.soilNitrogenInput.value),
            soilPhosphorus: parseInt(this.soilPhosphorusInput.value),
            soilPotassium: parseInt(this.soilPotassiumInput.value),
            soilPh: parseFloat(this.soilPhInput.value),
            soilTemperature: parseInt(this.soilTemperatureInput.value),
            soilHumidity: parseInt(this.soilHumidityInput.value),
            soilType: this.soilTypeSelect.value,
            location: this.locationInput.value
        };
    }
    
    async getWeatherData(location) {
        try {
            return await fetchWeatherData(location);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            throw new Error('Unable to fetch weather data for your location. Please check your location and try again.');
        }
    }
    
    displayResults(data) {
        // Show result container
        this.resultContainer.style.display = 'block';
        
        // Display recommended crops
        this.renderCropList(this.recommendedCropsElement, data.recommendedCrops);
        
        // Display recommendation reasons
        this.reasonsElement.innerHTML = '';
        if (data.reasons && data.reasons.length > 0) {
            const reasonsList = document.createElement('ul');
            data.reasons.forEach(reason => {
                const listItem = document.createElement('li');
                listItem.textContent = reason;
                reasonsList.appendChild(listItem);
            });
            this.reasonsElement.appendChild(reasonsList);
        } else {
            this.reasonsElement.textContent = 'No specific reasons provided.';
        }
        
        // Display alternative crops
        this.renderCropList(this.alternativeCropsElement, data.alternativeCrops);
        
        // Display weather information
        if (data.weather) {
            this.weatherInfoElement.innerHTML = `
                <div class="weather-card">
                    <div class="weather-icon">
                        <i class="fas ${this.getWeatherIcon(data.weather.condition)}"></i>
                    </div>
                    <div class="weather-details">
                        <p><strong>Temperature:</strong> ${data.weather.temperature}°C</p>
                        <p><strong>Humidity:</strong> ${data.weather.humidity}%</p>
                        <p><strong>Rainfall:</strong> ${data.weather.rainfall} mm</p>
                        <p><strong>Condition:</strong> ${data.weather.condition}</p>
                    </div>
                </div>
            `;
        } else {
            this.weatherInfoElement.innerHTML = '<p>Weather information not available.</p>';
        }
        
        // Scroll to results
        this.resultContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    renderCropList(containerElement, crops) {
        containerElement.innerHTML = '';
        
        if (crops && crops.length > 0) {
            const cropList = document.createElement('ul');
            cropList.className = 'crop-list';
            
            crops.forEach(crop => {
                const listItem = document.createElement('li');
                listItem.className = 'crop-item';
                
                const cropName = document.createElement('h4');
                cropName.textContent = crop.name;
                
                const cropDetails = document.createElement('div');
                cropDetails.className = 'crop-details';
                cropDetails.innerHTML = `
                    <p>${crop.description}</p>
                    <div class="crop-stats">
                        <span class="crop-stat"><i class="fas fa-water"></i> Water: ${crop.waterRequirement}</span>
                        <span class="crop-stat"><i class="fas fa-sun"></i> Sunlight: ${crop.sunlightRequirement}</span>
                        <span class="crop-stat"><i class="fas fa-seedling"></i> Growing Season: ${crop.growingSeason}</span>
                    </div>
                `;
                
                const cropButtons = document.createElement('div');
                cropButtons.className = 'crop-buttons';
                cropButtons.innerHTML = `
                    <button class="btn-secondary btn-small" onclick="showCropDetails('${crop.name}')">Details</button>
                    <button class="btn-primary btn-small" onclick="addToMarketplace('${crop.name}')">Find Products</button>
                `;
                
                listItem.appendChild(cropName);
                listItem.appendChild(cropDetails);
                listItem.appendChild(cropButtons);
                cropList.appendChild(listItem);
            });
            
            containerElement.appendChild(cropList);
        } else {
            containerElement.textContent = 'No crops available.';
        }
    }
    
    getWeatherIcon(condition) {
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
            return 'fa-sun';
        } else if (conditionLower.includes('rain')) {
            return 'fa-cloud-rain';
        } else if (conditionLower.includes('cloud')) {
            return 'fa-cloud';
        } else if (conditionLower.includes('snow')) {
            return 'fa-snowflake';
        } else if (conditionLower.includes('storm') || conditionLower.includes('thunder')) {
            return 'fa-bolt';
        } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
            return 'fa-smog';
        } else {
            return 'fa-cloud-sun';
        }
    }
    
    async connectIoTDevice() {
        this.iotConnectButton.disabled = true;
        this.iotConnectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        
        try {
            // Simulate connecting to an IoT device and getting data
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mock IoT data
            const iotData = {
                soilNitrogen: 42,
                soilPhosphorus: 35,
                soilPotassium: 28,
                soilPh: 6.8,
                soilTemperature: 25,
                soilHumidity: 65,
                soilType: 'loamy'
            };
            
            // Update form fields with IoT data
            this.soilNitrogenInput.value = iotData.soilNitrogen;
            this.soilPhosphorusInput.value = iotData.soilPhosphorus;
            this.soilPotassiumInput.value = iotData.soilPotassium;
            this.soilPhInput.value = iotData.soilPh;
            this.soilTemperatureInput.value = iotData.soilTemperature;
            this.soilHumidityInput.value = iotData.soilHumidity;
            this.soilTypeSelect.value = iotData.soilType;
            
            // Update the display values for range inputs
            document.getElementById('soil-nitrogen-value').textContent = iotData.soilNitrogen;
            document.getElementById('soil-phosphorus-value').textContent = iotData.soilPhosphorus;
            document.getElementById('soil-potassium-value').textContent = iotData.soilPotassium;
            document.getElementById('soil-ph-value').textContent = iotData.soilPh;
            document.getElementById('soil-temperature-value').textContent = iotData.soilTemperature;
            document.getElementById('soil-humidity-value').textContent = iotData.soilHumidity;
            
            this.showSuccess('IoT device connected successfully! Soil data has been updated.');
            
        } catch (error) {
            this.showError('Failed to connect to IoT device. Please try again.');
        } finally {
            this.iotConnectButton.disabled = false;
            this.iotConnectButton.innerHTML = '<i class="fas fa-link"></i> Connect IoT Device';
        }
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
    
    showSuccess(message) {
        // Create and show a success toast
        const successToast = document.createElement('div');
        successToast.className = 'toast success';
        successToast.textContent = message;
        
        document.body.appendChild(successToast);
        
        // Show the toast
        setTimeout(() => {
            successToast.classList.add('show');
        }, 10);
        
        // Remove the toast after 3 seconds
        setTimeout(() => {
            successToast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(successToast);
            }, 300);
        }, 3000);
    }
}

// Initialize the crop recommender when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('crop-form')) {
        new CropRecommender();
    }
});

export default CropRecommender;