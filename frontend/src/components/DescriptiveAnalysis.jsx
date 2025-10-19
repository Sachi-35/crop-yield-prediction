import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell
} from "recharts";

// Helper function for correlation intensity (add this before the component)
const getCorrelationIntensity = (value) => {
  const absValue = Math.abs(value);
  if (absValue >= 0.8) return "Strong";
  if (absValue >= 0.6) return "Moderate";
  if (absValue >= 0.4) return "Weak";
  return "Very Weak";
};

const SkeletonChart = ({ height = "h-64" }) => (
  <div className={`${height} animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
  </div>
);

const ErrorCard = ({ message, onDismiss }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow relative"
  >
    <span className="block sm:inline">{message}</span>
    {onDismiss && (
      <button 
        onClick={onDismiss}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        <span className="text-red-500 hover:text-red-700">×</span>
      </button>
    )}
  </motion.div>
);

// Update error display component
const ErrorDisplay = ({ message }) => (
  <div 
    className="bg-red-100 text-red-700 p-4 rounded-lg shadow flex justify-between items-center"
    onClick={() => setError(null)}
    role="alert"
  >
    <span>{message}</span>
    <button 
      className="text-red-700 hover:text-red-900"
      aria-label="Dismiss error"
    >
      ×
    </button>
  </div>
);

// Add this error message component at the top level
const ErrorMessage = ({ message, onDismiss }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 relative">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-red-700">{message}</p>
      </div>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="absolute top-2 right-2 text-red-400 hover:text-red-500"
        >
          ×
        </button>
      )}
    </div>
  </div>
);

const DescriptiveAnalysis = () => {
  // State declarations
  const [selectedState, setSelectedState] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [yearRange, setYearRange] = useState({ start: 2015, end: 2020 });
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [cropComparisonData, setCropComparisonData] = useState([]);
  const [rainfallTrendData, setRainfallTrendData] = useState([]);
  const [fertilizerTrendData, setFertilizerTrendData] = useState([]);
  const [pesticideTrendData, setPesticideTrendData] = useState([]);
  const [showOverlayChart, setShowOverlayChart] = useState(false);
  const [correlationData, setCorrelationData] = useState(null);
  const [hoveredCorrelation, setHoveredCorrelation] = useState(null);
  const [selectedView, setSelectedView] = useState("overview");
  const [hoveredChart, setHoveredChart] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedState || !selectedCrop) return;
      
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/descriptive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            state: selectedState,
            crop: selectedCrop,
            yearRange
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setAnalyticsData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedState, selectedCrop, yearRange]);

  useEffect(() => {
    if (yearRange.start > yearRange.end) {
      setError("Start year cannot be greater than end year");
    } else {
      setError(null);
    }
  }, [yearRange]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
       opacity: 1,
       y: 0,
       transition: {
         duration: 0.6,
         staggerChildren: 0.1
        }
    }
  };


  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    hover: { 
      scale: 1.02, 
      y: -5,
      boxShadow: "0 20px 40px rgba(149, 99, 70, 0.15)",
      transition: { duration: 0.3 }
    }
  };

  // Sample data for demonstration (fallback when API fails)
  const sampleYieldData = [
    { year: 2015, yield: 2.5, rainfall: 800, fertilizer: 120, pesticide: 15 },
    { year: 2016, yield: 2.8, rainfall: 950, fertilizer: 135, pesticide: 18 },
    { year: 2017, yield: 2.3, rainfall: 650, fertilizer: 110, pesticide: 12 },
    { year: 2018, yield: 3.1, rainfall: 1100, fertilizer: 145, pesticide: 20 },
    { year: 2019, yield: 2.9, rainfall: 980, fertilizer: 140, pesticide: 17 },
    { year: 2020, yield: 3.3, rainfall: 1200, fertilizer: 160, pesticide: 22 }
  ];

  const sampleCorrelationData = [
    { factor1: "Yield", factor2: "Rainfall", correlation: 0.82, x: 1, y: 1 },
    { factor1: "Yield", factor2: "Fertilizer", correlation: 0.75, x: 2, y: 1 },
    { factor1: "Yield", factor2: "Pesticide", correlation: 0.68, x: 3, y: 1 },
    { factor1: "Rainfall", factor2: "Fertilizer", correlation: 0.45, x: 2, y: 2 },
    { factor1: "Rainfall", factor2: "Pesticide", correlation: 0.52, x: 3, y: 2 },
    { factor1: "Fertilizer", factor2: "Pesticide", correlation: 0.89, x: 3, y: 3 }
  ];

  const sampleFactorDistribution = [
    { name: "Rainfall Impact", value: 35, fill: "#37acd0" },
    { name: "Fertilizer Impact", value: 28, fill: "#99b83b" },
    { name: "Pesticide Impact", value: 22, fill: "#e26c52" }, 
    { name: "Other Factors", value: 15, fill: "#f8d662" }
  ];

  // Dataset-driven dropdown lists
  const states = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
    "Rajasthan", "Tamil Nadu", "Telanganga", "Uttar Pradesh", "West Bengal"
  ];

  const crops = [
    "Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Groundnut", "Soybean",
    "Mustard", "Sunflower", "Bajra", "Jowar", "Ragi", "Moong", "Urad", "Arhar"
  ];

  const years = Array.from({length: 24}, (_, i) => 1997 + i);

  // Update the handleAnalyze function
  const handleAnalyze = async () => {
    // Clear previous states
    setError(null);
    setData(null);

    // Enhanced validation
    if (!state || !crop) {
      setError("⚠️ Both State and Crop selections are required");
      return;
    }
    
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch("http://localhost:8000/api/descriptive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: selectedState, year: selectedYear, crop: selectedCrop }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || "Failed to fetch analysis data");
      }

      // Validate response data
      if (!json.yield_trends || !json.crop_comparison || !json.inputs) {
        throw new Error("Invalid data format received from server");
      }

      setData(json);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "An unexpected error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  function getCorrelationColor(value) {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return value > 0 ? "#99b83b" : "#dc2626"; // Strong positive/negative
    if (absValue >= 0.6) return value > 0 ? "#f8d662" : "#ea580c"; // Moderate positive/negative  
    if (absValue >= 0.4) return value > 0 ? "#37acd0" : "#e26c52"; // Weak positive/negative
    return "#9ca3af"; // Very weak
  }

  const calculateCorrelations = (data) => {
    if (!data || data.length < 2) return null;

    const factors = ['yield', 'rainfall', 'fertilizer', 'pesticide'];
    const correlationMatrix = {};

    factors.forEach(factor1 => {
      correlationMatrix[factor1] = {};
      factors.forEach(factor2 => {
        if (factor1 === factor2) {
          correlationMatrix[factor1][factor2] = 1.0;
        } else {
          const correlation = ((data, x, y) => {
            const n = data.length;
            if (n < 2) return 0;

            const xValues = data.map(d => parseFloat(d[x]) || 0);
            const yValues = data.map(d => parseFloat(d[y]) || 0);

            const sumX = xValues.reduce((a, b) => a + b, 0);
            const sumY = yValues.reduce((a, b) => a + b, 0);
            const sumXY = xValues.reduce((sum, xi, i) => sum + xi * yValues[i], 0);
            const sumX2 = xValues.reduce((sum, xi) => sum + xi * xi, 0);
            const sumY2 = yValues.reduce((sum, yi) => sum + yi * yi, 0);

            const numerator = n * sumXY - sumX * sumY;
            const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

            return denominator === 0 ? 0 : Math.round((numerator / denominator) * 100) / 100;
          })(data, factor1, factor2);
          correlationMatrix[factor1][factor2] = correlation;
        }
      });
    });

    return correlationMatrix;
  };

  const getCorrelationDescription = (factor1, factor2, value) => {
    const direction = value > 0 ? "positive" : "negative";
    const strength = ((value) => {
      const absValue = Math.abs(value);
      if (absValue >= 0.8) return "Strong";
      if (absValue >= 0.6) return "Moderate";
      if (absValue >= 0.4) return "Weak";
      return "Very Weak";
    })(value).toLowerCase();
    
    if (factor1 === factor2) return "Perfect correlation (same variable)";
    
    const factorNames = {
      yield: "Yield",
      rainfall: "Rainfall", 
      fertilizer: "Fertilizer",
      pesticide: "Pesticide"
    };
    
    return `${strength} ${direction} correlation between ${factorNames[factor1]} and ${factorNames[factor2]}`;
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const ChartLoadingOverlay = () => (
    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#956346]" />
    </div>
  );

  const renderChart = (data) => {
    if (loading) return <SkeletonChart />;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!data?.length) return <div>No data available</div>;

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          {/* ...existing chart configuration... */}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  // Update loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-green-600 rounded-full"></div>
        </div>
        <span className="ml-3 text-gray-600">Analyzing data...</span>
      </div>
    </div>
  );

  // Update button to show loading state
  <button
    onClick={handleAnalyze}
    disabled={loading || !state || !crop}
    className={`
      bg-green-600 text-white rounded-lg p-2 
      ${loading || !state || !crop ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}
      transition-all duration-200
    `}
  >
    {loading ? (
      <span className="flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Analyzing...
      </span>
    ) : 'Analyze'}
  </button>

  return (
      <motion.div 
        className="p-6 bg-gradient-to-br from-[#edebdf] via-white to-[#edebdf] min-h-screen"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        
      {/* Header */}
      {/* Enhanced Header with CropVision branding */}
      <motion.div variants={cardVariants} className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-[#956346] mb-3 bg-gradient-to-r from-[#956346] to-[#99b83b] bg-clip-text text-transparent">
          Agricultural Data Insights
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Comprehensive descriptive analysis of crop performance and environmental factors
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#37acd0] to-[#99b83b] mx-auto mt-4 rounded-full"></div>
      </motion.div>

      {/* Enhanced View Selection */}
      <motion.div variants={cardVariants} className="mb-8 flex justify-center">
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-[#956346]/20">
          {["overview", "analysis", "correlation"].map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 mx-1 ${
                selectedView === view
                  ? "bg-[#956346] text-white shadow-lg transform scale-105"
                  : "text-[#956346] hover:bg-[#956346]/10"
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Filters Section */}
      <motion.div 
        variants={itemVariants}
        className="filters-section mb-8 p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
      >
        <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
          🔍 Analysis Filters
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* State Selection */}
          <div>
            <label className="block text-sm font-medium text-[#956346] mb-2">
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-3 border border-[#956346]/30 rounded-lg focus:ring-2 focus:ring-[#37acd0] focus:border-transparent bg-white"
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Crop Selection */}
          <div>
            <label className="block text-sm font-medium text-[#956346] mb-2">
              Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full p-3 border border-[#956346]/30 rounded-lg focus:ring-2 focus:ring-[#37acd0] focus:border-transparent bg-white"
            >
              <option value="">Select Crop</option>
              {crops.map(crop => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>

          {/* Year Selection */}
          <div>
            <label className="block text-sm font-medium text-[#956346] mb-2">
              Year (Optional)
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-3 border border-[#956346]/30 rounded-lg focus:ring-2 focus:ring-[#37acd0] focus:border-transparent bg-white"
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-sm font-medium text-[#956346] mb-2">
              Start Year
            </label>
            <input
              type="number"
              min="1997"
              max="2020"
              value={yearRange.start}
              onChange={(e) => setYearRange({...yearRange, start: parseInt(e.target.value)})}
              className="w-full p-3 border border-[#956346]/30 rounded-lg focus:ring-2 focus:ring-[#37acd0] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#956346] mb-2">
              End Year
            </label>
            <input
              type="number"
              min="1997"
              max="2020"
              value={yearRange.end}
              onChange={(e) => setYearRange({...yearRange, end: parseInt(e.target.value)})}
              className="w-full p-3 border border-[#956346]/30 rounded-lg focus:ring-2 focus:ring-[#37acd0] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            onClick={handleAnalyze}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-
              loading 
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#956346] hover:bg-[#956346]/90 text-white'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </div>
            ) : (
              'Analyze Data'
            )}
          </motion.button>

          {/* JSON Preview Toggle */}
          {apiResult && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="px-4 py-3 bg-[#37acd0] text-white rounded-lg font-medium hover:bg-[#37acd0]/90 transition-all duration-200"
            >
              {showJsonPreview ? "🎯 Hide Data" : "📋 View Raw Data"}
            </motion.button>
          )}
        </div>
        {/* Overlay Chart Toggle */}
        {analyticsData && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowOverlayChart(!showOverlayChart)}
            className="px-4 py-3 bg-[#e26c52] text-white rounded-lg font-medium hover:bg-[#e26c52]/90 transition-all duration-200"
          >
            {showOverlayChart ? "📊 Separate Charts" : "📈 Overlay View"}
          </motion.button>
        )}
      </motion.div>

      {/* JSON Preview Section */}
      {showJsonPreview && apiResult && (
        <div className="mb-8 p-4 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Raw API Response</h3>
          <pre className="bg-gray-50 p-4 rounded overflow-auto">
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </div>
      )}

      {/* Yield Trends Chart */}
      <motion.div 
        variants={itemVariants}
        className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
      >
        <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
          📈 Yield Trends - {selectedState ? `${selectedState} (${selectedCrop})` : 'Select State & Crop'}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
              <XAxis 
                dataKey="year" 
                stroke="#956346"
                fontSize={12}
              />
              <YAxis 
                stroke="#956346"
                fontSize={12}
                label={{ value: 'Yield (tons/hectare)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #956346',
                  borderRadius: '8px',
                  color: '#956346'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="yield" 
                stroke="#99b83b" 
                strokeWidth={3}
                dot={{ fill: '#99b83b', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#99b83b', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Rainfall Impact */}
      <motion.div 
        variants={itemVariants}
        className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
      >
        <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
          🌧️ Rainfall vs Yield
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
              <XAxis 
                dataKey="rainfall" 
                stroke="#956346"
                fontSize={12}
                label={{ value: 'Rainfall (mm)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                stroke="#956346"
                fontSize={12}
                label={{ value: 'Yield (tons/hectare)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '2px solid #956346',
                  borderRadius: '8px',
                  color: '#956346'
                }}
                formatter={(value, name) => [`${value}${name === 'yield' ? ' tons/ha' : ' mm'}`, name]}
              />
              <Scatter 
                dataKey="yield" 
                fill="#37acd0"
                strokeWidth={2}
                stroke="#37acd0"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Error Handling */}
      {error && (
        <ErrorCard 
          message={error} 
          onDismiss={() => setError(null)}
        />
      )}

      {/* Enhanced Error Display */}
      {error && (
        <ErrorMessage 
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Charts Section - Only show if we have data and not loading/error */}
      {!loading && !error && data && (
        <>
          {/* Yield Trends Chart */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
          >
            <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
              📈 Yield Trends - {selectedState ? `${selectedState} (${selectedCrop})` : 'Select State & Crop'}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                  <XAxis 
                    dataKey="year" 
                    stroke="#956346"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#956346"
                    fontSize={12}
                    label={{ value: 'Yield (tons/hectare)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #956346',
                      borderRadius: '8px',
                      color: '#956346'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="yield" 
                    stroke="#99b83b" 
                    strokeWidth={3}
                    dot={{ fill: '#99b83b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#99b83b', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Correlation Analysis */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
          >
            <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
              📊 Correlation Analysis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {correlationData && Object.keys(correlationData).map((factor1) => (
                <div key={factor1} className="p-4 bg-gray-50 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-[#956346] mb-2">
                    {factor1.charAt(0).toUpperCase() + factor1.slice(1)} Correlations
                  </h3>
                  <div className="flex flex-col gap-2">
                    {Object.entries(correlationData[factor1]).map(([factor2, value]) => (
                      <div key={factor2} className="flex justify-between">
                        <span className="text-sm text-gray-700">
                          {factor2.charAt(0).toUpperCase() + factor2.slice(1)}
                        </span>
                        <span className="text-sm font-medium" style={{ color: getCorrelationColor(value) }}>
                          {value.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Factor Contribution Analysis */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
          >
            <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
              📈 Factor Contribution Analysis
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={sampleFactorDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {sampleFactorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
          >
            <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
              💡 Recommendations
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li className="text-sm text-gray-700">
                Consider increasing fertilizer application during the initial growth stages to boost yield potential.
              </li>
              <li className="text-sm text-gray-700">
                Monitor rainfall patterns and implement irrigation strategies to mitigate drought impact.
              </li>
              <li className="text-sm text-gray-700">
                Explore pest-resistant crop varieties to reduce pesticide dependency.
              </li>
              <li className="text-sm text-gray-700">
                Regularly update soil health assessments to tailor fertilizer and amendment applications.
              </li>
            </ul>
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default DescriptiveAnalysis;