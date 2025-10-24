import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell
} from "recharts";

// Helper function for correlation intensity
const getCorrelationIntensity = (value) => {
  const absValue = Math.abs(value);
  if (absValue >= 0.8) return "Strong";
  if (absValue >= 0.6) return "Moderate";
  if (absValue >= 0.4) return "Weak";
  return "Very Weak";
};

const SkeletonChart = ({ height = "h-64" }) => (
  <div className={`${height} animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent translate-x-[-100%]" />
  </div>
);

const ErrorCard = ({ message, onDismiss }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow relative mb-4"
  >
    <span className="block sm:inline">{message}</span>
    {onDismiss && (
      <button 
        onClick={onDismiss}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        <span className="text-red-500 hover:text-red-700 text-2xl">×</span>
      </button>
    )}
  </motion.div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200">
        <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-[#99b83b] rounded-full"></div>
      </div>
      <span className="ml-3 text-gray-600">Analyzing data...</span>
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
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showOverlayChart, setShowOverlayChart] = useState(false);
  const [correlationData, setCorrelationData] = useState(null);
  const [selectedView, setSelectedView] = useState("overview");
  const [error, setError] = useState(null);

  // Sample data for demonstration (fallback)
  const sampleYieldData = [
    { year: 2015, yield: 2.5, rainfall: 800, fertilizer: 120, pesticide: 15 },
    { year: 2016, yield: 2.8, rainfall: 950, fertilizer: 135, pesticide: 18 },
    { year: 2017, yield: 2.3, rainfall: 650, fertilizer: 110, pesticide: 12 },
    { year: 2018, yield: 3.1, rainfall: 1100, fertilizer: 145, pesticide: 20 },
    { year: 2019, yield: 2.9, rainfall: 980, fertilizer: 140, pesticide: 17 },
    { year: 2020, yield: 3.3, rainfall: 1200, fertilizer: 160, pesticide: 22 }
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
    "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"
  ];

  const crops = [
    "Rice", "Wheat", "Maize", "Sugarcane", "Cotton", "Groundnut", "Soybean",
    "Mustard", "Sunflower", "Bajra", "Jowar", "Ragi", "Moong", "Urad", "Arhar"
  ];

  const years = Array.from({length: 24}, (_, i) => 1997 + i);

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
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Calculate correlations
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
          const xValues = data.map(d => parseFloat(d[factor1]) || 0);
          const yValues = data.map(d => parseFloat(d[factor2]) || 0);

          const n = xValues.length;
          const sumX = xValues.reduce((a, b) => a + b, 0);
          const sumY = yValues.reduce((a, b) => a + b, 0);
          const sumXY = xValues.reduce((sum, xi, i) => sum + xi * yValues[i], 0);
          const sumX2 = xValues.reduce((sum, xi) => sum + xi * xi, 0);
          const sumY2 = yValues.reduce((sum, yi) => sum + yi * yi, 0);

          const numerator = n * sumXY - sumX * sumY;
          const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

          correlationMatrix[factor1][factor2] = denominator === 0 ? 0 : Math.round((numerator / denominator) * 100) / 100;
        }
      });
    });

    return correlationMatrix;
  };

  function getCorrelationColor(value) {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return value > 0 ? "#99b83b" : "#dc2626";
    if (absValue >= 0.6) return value > 0 ? "#f8d662" : "#ea580c";
    if (absValue >= 0.4) return value > 0 ? "#37acd0" : "#e26c52";
    return "#9ca3af";
  }

  // Update correlationData whenever analyticsData changes
  useEffect(() => {
    if (analyticsData?.yield_trends) {
      setCorrelationData(calculateCorrelations(analyticsData.yield_trends));
    }
  }, [analyticsData]);

  // Validate year range
  useEffect(() => {
    if (yearRange.start > yearRange.end) {
      setError("Start year cannot be greater than end year");
    }
  }, [yearRange]);

  // Handle analyze button click
  const handleAnalyze = async () => {
    setError(null);
    setAnalyticsData(null);

    if (!selectedState || !selectedCrop) {
      setError("⚠️ Both State and Crop selections are required");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/descriptive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          state: selectedState, 
          year: selectedYear, 
          crop: selectedCrop,
          yearRange 
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.detail || "Failed to fetch analysis data");
      }

      // Validate response data
      if (!json.yield_trends) {
        throw new Error("Invalid data format received from server");
      }

      setAnalyticsData(json);
      setError(null);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "An unexpected error occurred");
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="p-6 bg-gradient-to-br from-[#edebdf] via-white to-[#edebdf] min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <motion.div variants={cardVariants} className="mb-8 text-center">
        <h1 className="text-5xl font-bold text-[#956346] mb-3">
          Agricultural Data Insights
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Comprehensive descriptive analysis of crop performance and environmental factors
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#37acd0] to-[#99b83b] mx-auto mt-4 rounded-full"></div>
      </motion.div>

      {/* View Selection */}
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
              <option value="">All Years</option>
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
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
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

          {analyticsData && (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                className="px-4 py-3 bg-[#37acd0] text-white rounded-lg font-medium hover:bg-[#37acd0]/90 transition-all duration-200"
              >
                {showJsonPreview ? "🎯 Hide Data" : "📋 View Raw Data"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowOverlayChart(!showOverlayChart)}
                className="px-4 py-3 bg-[#e26c52] text-white rounded-lg font-medium hover:bg-[#e26c52]/90 transition-all duration-200"
              >
                {showOverlayChart ? "📊 Separate Charts" : "📈 Overlay View"}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* JSON Preview Section */}
      {showJsonPreview && analyticsData && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 p-4 bg-white rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold mb-2 text-[#956346]">Raw API Response</h3>
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(analyticsData, null, 2)}
          </pre>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <ErrorCard 
          message={error} 
          onDismiss={() => setError(null)}
        />
      )}

      {/* Loading State */}
      {loading && <LoadingSpinner />}

      {/* Charts Section - Only show if we have data and not loading/error */}
      {!loading && !error && analyticsData && (
        <>
          {/* Yield Trends Chart */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
          >
            <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
              📈 Yield Trends - {selectedState && selectedCrop ? `${selectedState} (${selectedCrop})` : 'Analysis'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.yield_trends || sampleYieldData}>
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
                  <Legend />
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
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
          >
            <h2 className="text-xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
              🌧️ Rainfall vs Yield Correlation
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={analyticsData.yield_trends || sampleYieldData}>
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

          {/* Correlation Analysis */}
          {correlationData && (
            <motion.div 
              variants={itemVariants}
              className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
            >
              <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
                📊 Correlation Analysis
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(correlationData).map((factor1) => (
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
          )}

          {/* Factor Contribution Analysis */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
          >
            <h2 className="text-2xl font-semibold text-[#956346] mb-4 flex items-center gap-2">
              📈 Factor Contribution Analysis
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={sampleFactorDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {sampleFactorDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
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

      {/* Empty State - No data yet */}
      {!loading && !error && !analyticsData && (
        <motion.div
          variants={itemVariants}
          className="text-center py-16 bg-white rounded-xl shadow-lg border border-[#956346]/20"
        >
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-semibold text-[#956346] mb-2">
            Ready to Analyze
          </h3>
          <p className="text-gray-600">
            Select a state and crop, then click "Analyze Data" to view insights
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DescriptiveAnalysis;