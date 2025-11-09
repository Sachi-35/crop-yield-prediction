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

const getCorrelationColor = (value) => {
  if (value > 0.6) return "text-green-600";
  if (value > 0.3) return "text-green-400";
  if (value < -0.6) return "text-red-600";
  if (value < -0.3) return "text-red-400";
  return "text-gray-500";
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
  const [selectedState, setSelectedState] = useState("")
  const [selectedCrop, setSelectedCrop] = useState("");
  const [yearRange, setYearRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [selectedStartYear, setSelectedStartYear] = useState("");
  const [selectedEndYear, setSelectedEndYear] = useState("");
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
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
    "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
    "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
    "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
    "Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
  ];

  const crops = [
    "Rice","Wheat","Maize","Barley","Bajra","Jowar","Ragi","Small Millets",
    "Gram","Tur (Arhar)","Moong","Urad","Lentil","Peas","Groundnut","Rapeseed & Mustard",
    "Soybean","Sunflower","Sesame","Sugarcane","Cotton","Tobacco","Jute","Potato",
    "Onion","Tomato","Chilli","Cabbage","Cauliflower","Other Vegetables"
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
    if (analyticsData?.trend_data) {
      setCorrelationData(calculateCorrelations(analyticsData?.trend_data));
    }
  }, [analyticsData]);

  // Validate year range
  useEffect(() => {
    if (yearRange.start > yearRange.end) {
      setError("Start year cannot be greater than end year");
    }
  }, [yearRange]);

  // Analyze button click
  const handleAnalyze = async () => {
    setError(null);
    setAnalyticsData(null);

    // Validation
    if (!selectedState || !selectedCrop) {
      setError("⚠️ Both State and Crop selections are required");
      return;
    }

    if (!yearRange.start || !yearRange.end) {
      setError("⚠️ Please select both Start and End years");
      return;
    }

    setLoading(true);

    try {
      // short delay ensures React clears old data before fetching new
      await new Promise((resolve) => setTimeout(resolve, 50));

      const res = await fetch("http://localhost:8000/api/historical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: selectedState,
          crop: selectedCrop,
          start_year: yearRange.start,
          end_year: yearRange.end,
        }),
      });

      const json = await res.json().catch(() => {
        throw new Error("Invalid JSON response from server");
      });

      if (!res.ok) {
        const detail =
          typeof json.detail === "string"
            ? json.detail
            : JSON.stringify(json.detail || {});
        throw new Error(detail || "Failed to fetch analysis data");
      }

      if (!json.trend_data) {
        throw new Error("Invalid data format received from server");
      }

      // ✅ Sort trend data by year ascending
      json.trend_data = (json.trend_data || [])
        .map(d => ({
          year: d.Year ?? d.year,
          yield: d.Yield ?? d.yield,
          rainfall: d.Rainfall ?? d.rainfall,
          fertilizer: d.Fertilizer ?? d.fertilizer,
          pesticide: d.Pesticide ?? d.pesticide
        }))
        .filter(d => d.year && d.yield !== undefined)
        .sort((a, b) => a.year - b.year);

      console.log("Trend Data received:", json.trend_data);


      // ✅ Force charts to rerender using fresh references
      setAnalyticsData({
        trend_data: [...json.trend_data],
        correlation_data: json.correlation_data ? { ...json.correlation_data } : null,
        factor_distribution: json.factor_distribution ? [...json.factor_distribution] : null,
        timestamp: Date.now(), // 👈 Unique each time to trigger rerender
      });

      setError(null);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err.message || "An unexpected error occurred");
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const formattedTrendData = analyticsData?.trend_data
    ?.filter(d => d.year && d.yield != null && d.rainfall != null && d.fertilizer != null && d.pesticide != null)
    ?.map(d => ({
      year: +d.year,
      yield: +d.yield,
      rainfall: +d.rainfall,
      fertilizer: +d.fertilizer,
      pesticide: +d.pesticide
    })) || [];

    console.log("Formatted Trend Data:", formattedTrendData);
  
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
        </div>
      </motion.div>

      {/* JSON Preview Section */}
      {showJsonPreview && analyticsData && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4 }}
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
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData?.trend_data?.length ? analyticsData.trend_data : sampleYieldData}>
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
          </motion.div>

          {/* Correlation Charts Section */}
          <motion.div 
            variants={itemVariants}
            className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
          >
            <h2 className="text-2xl font-semibold text-[#956346] mb-6 flex items-center gap-2">
              📊 Correlation Charts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 🌧️ Rainfall vs Yield */}
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                  <XAxis
                    dataKey="rainfall"
                    name="Rainfall (mm)"
                    type="number"
                    domain={['dataMin - 100', 'dataMax + 100']}
                    stroke="#956346"
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="yield"
                    name="Yield (tonnes/ha)"
                    type="number"
                    domain={[0, 'dataMax + 0.5']}
                    stroke="#956346"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #956346",
                      borderRadius: "8px",
                      color: "#956346",
                    }}
                    formatter={(value, name) => [value.toFixed(2), name]}
                  />
                  <Scatter
                    name="Rainfall vs Yield"
                    data={analyticsData?.trend_data || sampleYieldData}
                    fill="#37acd0"
                  />
                </ScatterChart>
              </ResponsiveContainer>

              {/* 🌾 Fertilizer vs Yield */}
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                  <XAxis
                    dataKey="fertilizer"
                    name="Fertilizer (kg/ha)"
                    type="number"
                    domain={['dataMin - 10000', 'dataMax + 10000']}
                    tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'}
                    stroke="#956346"
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="yield"
                    name="Yield (tonnes/ha)"
                    type="number"
                    domain={[0, 'dataMax + 0.5']}
                    stroke="#956346"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #956346",
                      borderRadius: "8px",
                      color: "#956346",
                    }}
                    formatter={(value, name) => [value.toFixed(2), name]}
                  />
                  <Scatter
                    name="Fertilizer vs Yield"
                    data={analyticsData?.trend_data || sampleYieldData}
                    fill="#37acd0"
                  />
                </ScatterChart>
              </ResponsiveContainer>

              {/* 🧪 Pesticide vs Yield */}
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#956346" opacity={0.2} />
                  <XAxis
                    dataKey="pesticide"
                    name="Pesticide (L/ha)"
                    type="number"
                    domain={['dataMin - 10000', 'dataMax + 10000']}
                    tickFormatter={(v) => (v / 1000).toFixed(0) + 'k'}
                    stroke="#956346"
                    fontSize={12}
                  />
                  <YAxis
                    dataKey="yield"
                    name="Yield (tonnes/ha)"
                    type="number"
                    domain={[0, 'dataMax + 0.5']}
                    stroke="#956346"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #956346",
                      borderRadius: "8px",
                      color: "#956346",
                    }}
                    formatter={(value, name) => [value.toFixed(2), name]}
                  />
                  <Scatter
                    name="Pesticide vs Yield"
                    data={analyticsData?.trend_data || sampleYieldData}
                    fill="#e26c52"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Correlation Analysis */}
          {analyticsData?.correlation_data && (
            <motion.div 
              variants={itemVariants}
              className="p-6 bg-white rounded-xl shadow-lg border border-[#956346]/20 mb-8"
            >
              <h2 className="text-2xl font-semibold text-[#956346] mb-6 flex items-center gap-2">
                🔗 Correlation Analysis
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                <p className="text-base text-gray-700 mb-6">
                  This section shows how strongly different agricultural factors correlate with crop yield.
                  Values close to +1 indicate a strong positive relationship, 
                  while values near -1 indicate a negative relationship.
                </p>

                <div className="flex flex-col md:flex-row justify-around items-center text-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-[#956346]">🌧️ Rainfall</span>
                    <span
                      className={`text-2xl font-bold ${
                        getCorrelationColor(analyticsData.correlation_data.rainfall_yield)
                      }`}
                    >
                      {analyticsData.correlation_data.rainfall_yield}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-[#956346]">🌾 Fertilizer</span>
                    <span
                      className={`text-2xl font-bold ${
                        getCorrelationColor(analyticsData.correlation_data.fertilizer_yield)
                      }`}
                    >
                      {analyticsData.correlation_data.fertilizer_yield}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-[#956346]">🧪 Pesticide</span>
                    <span
                      className={`text-2xl font-bold ${
                        getCorrelationColor(analyticsData.correlation_data.pesticide_yield)
                      }`}
                    >
                      {analyticsData.correlation_data.pesticide_yield}
                    </span>
                  </div>
                </div>
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
              <ResponsiveContainer width="100%" height={400}>
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