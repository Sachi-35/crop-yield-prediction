import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell
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

const DescriptiveAnalysis = () => {
  const [selectedState, setSelectedState] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [yearRange, setYearRange] = useState({ start: 2015, end: 2020 });
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [apiResult, setApiResult] = useState(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);

  const [yieldTrendData, setYieldTrendData] = useState([]);
  const [cropComparisonData, setCropComparisonData] = useState([]);

  const [rainfallTrendData, setRainfallTrendData] = useState([]);
  const [fertilizerTrendData, setFertilizerTrendData] = useState([]);
  const [pesticideTrendData, setPesticideTrendData] = useState([]);
  const [showOverlayChart, setShowOverlayChart] = useState(false);

  const [correlationData, setCorrelationData] = useState(null);
  const [hoveredCorrelation, setHoveredCorrelation] = useState(null);

  const [selectedView, setSelectedView] = useState("overview");
  const [hoveredChart, setHoveredChart] = useState(null);

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

  const years = Array.from({length: 24}, (_, i) => (1997 + i).toString());

  const handleAnalyze = async () => {
  if (!selectedState || !selectedCrop) {
    alert("Please select both state and crop");
    return;
  }
  
  setLoading(true);
  
  try {
    // API call to /descriptive endpoint
    const response = await fetch("http://localhost:5000/descriptive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        state: selectedState, 
        crop: selectedCrop, 
        year: selectedYear,
        yearRange: yearRange
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setApiResult(data);
    setAnalyticsData(data.chartData || sampleYieldData);

    // Update input trend data from API response
    setRainfallTrendData(data.rainfallTrends || sampleYieldData);
    setFertilizerTrendData(data.fertilizerTrends || sampleYieldData);
    setPesticideTrendData(data.pesticideTrends || sampleYieldData);

    // Update specific chart data from API response
    setYieldTrendData(data.yieldTrends || sampleYieldData);
    
    setCropComparisonData(data.cropComparison || [
      { crop: "Rice", yield: 300 },
      { crop: "Wheat", yield: 280 },
      { crop: "Maize", yield: 250 },
      { crop: "Sugarcane", yield: 400 },
      { crop: "Cotton", yield: 220 },
    ]);

    // Calculate correlations from the data
    const correlations = calculateCorrelations(data.chartData || sampleYieldData);
    setCorrelationData(correlations);
    
  } catch (error) {
    console.error("Error fetching descriptive stats:", error);
    setApiResult({ error: "Failed to fetch data. Using sample data." });
    
    // Fallback to sample data
    setAnalyticsData(sampleYieldData);
    setYieldTrendData(sampleYieldData);
    setRainfallTrendData(sampleYieldData);
    setFertilizerTrendData(sampleYieldData);
    setPesticideTrendData(sampleYieldData);
    
    setCropComparisonData([
      { crop: "Rice", yield: 300 },
      { crop: "Wheat", yield: 280 },
      { crop: "Maize", yield: 250 },
      { crop: "Sugarcane", yield: 400 },
      { crop: "Cotton", yield: 220 },
    ]);

    // Calculate correlations from sample data
    const correlations = calculateCorrelations(sampleYieldData);
    setCorrelationData(correlations);
    
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
            className="relative px-6 py-3 bg-[#956346] text-white rounded-lg font-medium hover:bg-[#956346]/90 transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden"
          >
            {loading && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#99b83b] to-[#37acd0] opacity-20"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              />
            )}
            <div className="relative flex items-center gap-2">
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Analyzing Data..." : "🔎 Generate Analysis"}
            </div>
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
        <motion.div 
          variants={itemVariants}
          className="mb-8 p-6 bg-gray-900 text-green-300 rounded-xl shadow-lg border border-[#956346]/20"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            📋 API Response Data
          </h2>
          <pre className="whitespace-pre-wrap break-words text-sm overflow-x-auto max-h-64 overflow-y-auto">
            {JSON.stringify(apiResult, null, 2)}
          </pre>
        </motion.div>
      )}

      {/* Charts Section - Only show if we have data */}
      {!loading && analyticsData && selectedView === "overview" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Yield Trends */}
            <motion.div 
              variants={itemVariants}
              className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
            >
              <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
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
          </div>

          {/* Additional Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Fertilizer Usage */}
            <motion.div 
              variants={itemVariants}
              className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
            >
              <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
                🧪 Fertilizer & Pesticide Usage
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                    <XAxis 
                      dataKey="year" 
                      stroke="#956346"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#956346"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #956346',
                        borderRadius: '8px',
                        color: '#956346'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="fertilizer" fill="#f8d662" name="Fertilizer (kg/ha)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="pesticide" fill="#e26c52" name="Pesticide (kg/ha)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Factor Distribution */}
            <motion.div 
              variants={itemVariants}
              className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
            >
              <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
                📊 Yield Impact Factors
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sampleFactorDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({name, value}) => `${name}: ${value}%`}
                      labelLine={false}
                      fontSize={12}
                    >
                      {sampleFactorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #956346',
                        borderRadius: '8px',
                        color: '#956346'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Correlation Matrix */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
          >
            <h2 className="text-2xl font-semibold text-[#956346] mb-6 flex items-center gap-2">
              🔗 Advanced Correlation Analysis
            </h2>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Interactive Correlation Heatmap */}
              <div className="xl:col-span-2">
                <h3 className="text-lg font-medium text-[#956346] mb-4">Interactive Correlation Matrix</h3>
                
                {correlationData ? (
                  <div className="relative">
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      {/* Headers */}
                      <div></div>
                      {['Yield', 'Rainfall', 'Fertilizer', 'Pesticide'].map(factor => (
                        <div key={factor} className="text-sm font-semibold text-[#956346] p-2 text-center">
                          {factor}
                        </div>
                      ))}
                      
                      {/* Matrix Rows */}
                      {['yield', 'rainfall', 'fertilizer', 'pesticide'].map((factor1, i) => (
                        <React.Fragment key={factor1}>
                          <div className="text-sm font-semibold text-[#956346] p-2 capitalize">
                            {factor1}
                          </div>
                          {['yield', 'rainfall', 'fertilizer', 'pesticide'].map((factor2, j) => (
                            <motion.div
                              key={`${factor1}-${factor2}`}
                              className="relative p-3 rounded-lg text-center text-white font-semibold text-sm cursor-pointer"
                              style={{
                                backgroundColor: getCorrelationColor(correlationData[factor1][factor2]),
                                color: Math.abs(correlationData[factor1][factor2]) < 0.5 ? '#374151' : 'white'
                              }}
                              whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 8px 25px rgba(0,0,0,0.15)"
                              }}
                              onMouseEnter={() => setHoveredCorrelation({
                                factor1, factor2, 
                                value: correlationData[factor1][factor2]
                              })}
                              onMouseLeave={() => setHoveredCorrelation(null)}
                            >
                              {correlationData[factor1][factor2].toFixed(2)}
                              
                              {/* Interactive Tooltip */}
                              {hoveredCorrelation && 
                              hoveredCorrelation.factor1 === factor1 && 
                              hoveredCorrelation.factor2 === factor2 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
                                >
                                  <div className="font-semibold">
                                    {getCorrelationIntensity(hoveredCorrelation.value)} Correlation
                                  </div>
                                  <div className="text-gray-300">
                                    {getCorrelationDescription(factor1, factor2, hoveredCorrelation.value)}
                                  </div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </motion.div>
                              )}
                            </motion.div>
                          ))}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Enhanced Legend */}
                    <div className="flex flex-wrap gap-3 justify-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#99b83b'}}></div>
                        <span>Strong Positive (0.8+)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#f8d662'}}></div>
                        <span>Moderate Positive (0.6-0.8)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#37acd0'}}></div>
                        <span>Weak Positive (0.4-0.6)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#e26c52'}}></div>
                        <span>Weak Negative (-0.4 to -0.6)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: '#dc2626'}}></div>
                        <span>Strong Negative (-0.8+)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Run analysis to generate correlation matrix</p>
                  </div>
                )}
              </div>

              {/* Enhanced Insights Panel */}
              <div>
                <h3 className="text-lg font-medium text-[#956346] mb-4">Statistical Insights</h3>
                <div className="space-y-4">
                  {correlationData && (
                    <>
                      <motion.div 
                        className="p-4 bg-gradient-to-r from-[#99b83b]/10 to-[#99b83b]/5 rounded-lg border border-[#99b83b]/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🌧️</span>
                          <span className="font-semibold text-[#956346]">Rainfall Impact</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          Correlation with yield: <strong>{correlationData.yield.rainfall.toFixed(2)}</strong>
                        </p>
                        <p className="text-xs text-gray-600">
                          {getCorrelationDescription('rainfall', 'yield', correlationData.yield.rainfall)}
                        </p>
                      </motion.div>

                      <motion.div 
                        className="p-4 bg-gradient-to-r from-[#f8d662]/10 to-[#f8d662]/5 rounded-lg border border-[#f8d662]/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🧪</span>
                          <span className="font-semibold text-[#956346]">Fertilizer Effect</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          Correlation with yield: <strong>{correlationData.yield.fertilizer.toFixed(2)}</strong>
                        </p>
                        <p className="text-xs text-gray-600">
                          {getCorrelationDescription('fertilizer', 'yield', correlationData.yield.fertilizer)}
                        </p>
                      </motion.div>

                      <motion.div 
                        className="p-4 bg-gradient-to-r from-[#e26c52]/10 to-[#e26c52]/5 rounded-lg border border-[#e26c52]/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🛡️</span>
                          <span className="font-semibold text-[#956346]">Pesticide Usage</span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          Correlation with yield: <strong>{correlationData.yield.pesticide.toFixed(2)}</strong>
                        </p>
                        <p className="text-xs text-gray-600">
                          {getCorrelationDescription('pesticide', 'yield', correlationData.yield.pesticide)}
                        </p>
                      </motion.div>

                      <motion.div 
                        className="p-4 bg-gradient-to-r from-[#37acd0]/10 to-[#37acd0]/5 rounded-lg border border-[#37acd0]/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">📊</span>
                          <span className="font-semibold text-[#956346]">Key Finding</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Strongest correlation: {
                            (() => {
                              let maxCorr = 0;
                              let factors = '';
                              ['rainfall', 'fertilizer', 'pesticide'].forEach(factor => {
                                if (Math.abs(correlationData.yield[factor]) > maxCorr) {
                                  maxCorr = Math.abs(correlationData.yield[factor]);
                                  factors = `${factor} & yield`;
                                }
                              });
                              return `${factors} (${maxCorr.toFixed(2)})`;
                            })()
                          }
                        </p>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Crop Comparison Chart - NEW */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
          >
            <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
              📊 Crop Yield Comparison - {selectedState ? `${selectedState} (${selectedYear || 'All Years'})` : 'Select State'}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cropComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                  <XAxis 
                    dataKey="crop" 
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
                  <Bar dataKey="yield" fill="#99b83b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
            
          {/* Input Trends Section */}
          {!showOverlayChart ? (
            <>
              {/* Rainfall Trend */}
              <motion.div 
                variants={itemVariants}
                className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
              >
                <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
                  🌧️ Rainfall Trends - {selectedState ? `${selectedState}` : 'Select State'}
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                      <XAxis dataKey="year" stroke="#956346" fontSize={12} />
                      <YAxis stroke="#956346" fontSize={12} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #956346', borderRadius: '8px', color: '#956346' }} />
                      <Line type="monotone" dataKey="rainfall" stroke="#37acd0" strokeWidth={3} dot={{ fill: '#37acd0', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Fertilizer Trend */}
              <motion.div 
                variants={itemVariants}
                className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
              >
                <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
                  🧪 Fertilizer Usage Trends - {selectedState ? `${selectedState}` : 'Select State'}
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                      <XAxis dataKey="year" stroke="#956346" fontSize={12} />
                      <YAxis stroke="#956346" fontSize={12} label={{ value: 'Fertilizer (kg/ha)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #956346', borderRadius: '8px', color: '#956346' }} />
                      <Line type="monotone" dataKey="fertilizer" stroke="#f8d662" strokeWidth={3} dot={{ fill: '#f8d662', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Pesticide Trend */}
              <motion.div 
                variants={itemVariants}
                className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
              >
                <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
                  🛡️ Pesticide Usage Trends - {selectedState ? `${selectedState}` : 'Select State'}
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                      <XAxis dataKey="year" stroke="#956346" fontSize={12} />
                      <YAxis stroke="#956346" fontSize={12} label={{ value: 'Pesticide (kg/ha)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #956346', borderRadius: '8px', color: '#956346' }} />
                      <Line type="monotone" dataKey="pesticide" stroke="#e26c52" strokeWidth={3} dot={{ fill: '#e26c52', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </>
          ) : (
            // Overlay Chart
            <motion.div 
              variants={itemVariants}
              className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20"
            >
              <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
                📈 Overlay: Yield + Input Factors - {selectedState ? `${selectedState} (${selectedCrop})` : 'Select State & Crop'}
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                    <XAxis dataKey="year" stroke="#956346" fontSize={12} />
                    <YAxis stroke="#956346" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #956346', borderRadius: '8px', color: '#956346' }} />
                    <Legend />
                    <Line type="monotone" dataKey="yield" stroke="#99b83b" strokeWidth={4} name="Yield (tons/ha)" />
                    <Line type="monotone" dataKey="rainfall" stroke="#37acd0" strokeWidth={2} name="Rainfall (mm)" strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="fertilizer" stroke="#f8d662" strokeWidth={2} name="Fertilizer (kg/ha)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="pesticide" stroke="#e26c52" strokeWidth={2} name="Pesticide (kg/ha)" strokeDasharray="7 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p><strong>Chart Guide:</strong> Solid line = Yield, Dashed lines = Input factors. Different scales normalized for comparison.</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default DescriptiveAnalysis;