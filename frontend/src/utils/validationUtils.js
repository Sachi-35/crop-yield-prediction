/**
 * CropVision - Validation Utilities
 * Validates form input and API data for Predictive Analysis
 */

/**
 * Validates prediction input before sending to backend
 * @param {Object} predictionData - The prediction form data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validatePrediction = (predictionData) => {
  const errors = {};

  // Validate Nitrogen (N)
  if (predictionData.nitrogen === undefined || predictionData.nitrogen === null || predictionData.nitrogen === '') {
    errors.nitrogen = 'Nitrogen value is required';
  } else if (isNaN(predictionData.nitrogen)) {
    errors.nitrogen = 'Nitrogen must be a number';
  } else if (predictionData.nitrogen < 0) {
    errors.nitrogen = 'Nitrogen cannot be negative';
  } else if (predictionData.nitrogen > 300) {
    errors.nitrogen = 'Nitrogen value seems unusually high (max: 300 kg/ha)';
  }

  // Validate Phosphorus (P)
  if (predictionData.phosphorus === undefined || predictionData.phosphorus === null || predictionData.phosphorus === '') {
    errors.phosphorus = 'Phosphorus value is required';
  } else if (isNaN(predictionData.phosphorus)) {
    errors.phosphorus = 'Phosphorus must be a number';
  } else if (predictionData.phosphorus < 0) {
    errors.phosphorus = 'Phosphorus cannot be negative';
  } else if (predictionData.phosphorus > 200) {
    errors.phosphorus = 'Phosphorus value seems unusually high (max: 200 kg/ha)';
  }

  // Validate Potassium (K)
  if (predictionData.potassium === undefined || predictionData.potassium === null || predictionData.potassium === '') {
    errors.potassium = 'Potassium value is required';
  } else if (isNaN(predictionData.potassium)) {
    errors.potassium = 'Potassium must be a number';
  } else if (predictionData.potassium < 0) {
    errors.potassium = 'Potassium cannot be negative';
  } else if (predictionData.potassium > 300) {
    errors.potassium = 'Potassium value seems unusually high (max: 300 kg/ha)';
  }

  // Validate Temperature
  if (predictionData.temperature === undefined || predictionData.temperature === null || predictionData.temperature === '') {
    errors.temperature = 'Temperature value is required';
  } else if (isNaN(predictionData.temperature)) {
    errors.temperature = 'Temperature must be a number';
  } else if (predictionData.temperature < -10) {
    errors.temperature = 'Temperature seems unusually low (min: -10°C)';
  } else if (predictionData.temperature > 60) {
    errors.temperature = 'Temperature seems unusually high (max: 60°C)';
  }

  // Validate Humidity
  if (predictionData.humidity === undefined || predictionData.humidity === null || predictionData.humidity === '') {
    errors.humidity = 'Humidity value is required';
  } else if (isNaN(predictionData.humidity)) {
    errors.humidity = 'Humidity must be a number';
  } else if (predictionData.humidity < 0) {
    errors.humidity = 'Humidity cannot be negative';
  } else if (predictionData.humidity > 100) {
    errors.humidity = 'Humidity cannot exceed 100%';
  }

  // Validate pH
  if (predictionData.ph === undefined || predictionData.ph === null || predictionData.ph === '') {
    errors.ph = 'pH value is required';
  } else if (isNaN(predictionData.ph)) {
    errors.ph = 'pH must be a number';
  } else if (predictionData.ph < 0) {
    errors.ph = 'pH cannot be negative';
  } else if (predictionData.ph > 14) {
    errors.ph = 'pH cannot exceed 14';
  }

  // Validate Rainfall
  if (predictionData.rainfall === undefined || predictionData.rainfall === null || predictionData.rainfall === '') {
    errors.rainfall = 'Rainfall value is required';
  } else if (isNaN(predictionData.rainfall)) {
    errors.rainfall = 'Rainfall must be a number';
  } else if (predictionData.rainfall < 0) {
    errors.rainfall = 'Rainfall cannot be negative';
  } else if (predictionData.rainfall > 500) {
    errors.rainfall = 'Rainfall value seems unusually high (max: 500 mm)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates scenario effect input for what-if analysis
 * @param {Object} scenarioData - The scenario effect data
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateScenarioEffect = (scenarioData) => {
  const errors = {};

  // Validate feature name
  if (!scenarioData.feature || scenarioData.feature.trim() === '') {
    errors.feature = 'Feature name is required';
  }

  // Validate change value
  if (scenarioData.change === undefined || scenarioData.change === null || scenarioData.change === '') {
    errors.change = 'Change value is required';
  } else if (isNaN(scenarioData.change)) {
    errors.change = 'Change must be a number';
  }

  // Feature-specific validation based on the feature being modified
  if (scenarioData.feature) {
    const feature = scenarioData.feature.toLowerCase();
    const change = parseFloat(scenarioData.change);

    switch (feature) {
      case 'nitrogen':
      case 'n':
        if (change < -100 || change > 100) {
          errors.change = 'Nitrogen change should be between -100 and +100 kg/ha';
        }
        break;

      case 'phosphorus':
      case 'p':
        if (change < -50 || change > 50) {
          errors.change = 'Phosphorus change should be between -50 and +50 kg/ha';
        }
        break;

      case 'potassium':
      case 'k':
        if (change < -100 || change > 100) {
          errors.change = 'Potassium change should be between -100 and +100 kg/ha';
        }
        break;

      case 'temperature':
        if (change < -20 || change > 20) {
          errors.change = 'Temperature change should be between -20°C and +20°C';
        }
        break;

      case 'humidity':
        if (change < -50 || change > 50) {
          errors.change = 'Humidity change should be between -50% and +50%';
        }
        break;

      case 'ph':
        if (change < -3 || change > 3) {
          errors.change = 'pH change should be between -3 and +3';
        }
        break;

      case 'rainfall':
        if (change < -200 || change > 200) {
          errors.change = 'Rainfall change should be between -200 and +200 mm';
        }
        break;

      default:
        // Generic validation for unknown features
        if (Math.abs(change) > 1000) {
          errors.change = 'Change value seems unreasonably large';
        }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates API response data
 * @param {Object} responseData - Response from prediction API
 * @returns {boolean} - Whether response is valid
 */
export const validateAPIResponse = (responseData) => {
  if (!responseData) return false;
  
  // Check if response has required fields
  if (responseData.prediction === undefined && responseData.yield === undefined) {
    return false;
  }

  // Check if prediction/yield is a valid number
  const yieldValue = responseData.prediction || responseData.yield;
  if (isNaN(yieldValue) || yieldValue < 0) {
    return false;
  }

  return true;
};

/**
 * Sanitizes numeric input (removes invalid characters, formats properly)
 * @param {string|number} value - Input value
 * @returns {string} - Sanitized value
 */
export const sanitizeNumericInput = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  
  // Convert to string and remove non-numeric characters except decimal point and minus
  const sanitized = String(value).replace(/[^\d.-]/g, '');
  
  // Ensure only one decimal point
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  return sanitized;
};

/**
 * Formats validation errors for display
 * @param {Object} errors - Errors object from validation
 * @returns {string} - Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors || Object.keys(errors).length === 0) return '';
  
  return Object.values(errors).join(', ');
};