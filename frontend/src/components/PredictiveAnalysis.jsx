import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { validatePrediction, validateScenarioEffect } from "../utils/validationUtils.js";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";


function PredictiveAnalysis() {
  // State management for filters and API
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    state: '',
    crop: '',
    year: ''
  });
  // Add these after your existing useState declarations
  const [scenarioParams, setScenarioParams] = useState({
    rainfall: 0,
    fertilizer: 0,
    pesticides: 0
  });
  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);

  const [rainfallChange, setRainfallChange] = useState(0);
  const [fertilizerChange, setFertilizerChange] = useState(0);
  const [pesticideChange, setPesticideChange] = useState(0);

  const [historicalData, setHistoricalData] = useState({
    fiveYearAverage: null,
    bestYear: { year: null, yield: null },
    growthRate: null,
    yearlyData: []
  });
  const [validationMessages, setValidationMessages] = useState([]);

  const trendData = historicalData?.yearlyData || [];

  // Dataset arrays - exact coverage from your data
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


  // API call function
  const handlePrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch("http://localhost:8000/api/predictive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: filters.state,
          crop: filters.crop,
          year: filters.year || new Date().getFullYear(),
          rainfall_change: scenarioParams.rainfall,
          fertilizer_change: scenarioParams.fertilizer,
          pesticide_change: scenarioParams.pesticides,
        }),
      });

      // Always safely parse JSON (even for error responses)
      const data = await response.json().catch(() => ({}));

      // --- 🧠 Handle error responses gracefully ---
      if (!response.ok) {
        if (response.status === 404) {
          setError(data.detail || "Information not available or crop not grown for the selected combination.");
          setLoading(false);
          return;
        }

        if (response.status === 503) {
          setError("Prediction service unavailable — please try again later.");
          setLoading(false);
          return;
        }

        // Any other unexpected failure
        throw new Error(`Prediction failed with status ${response.status}`);
      }

      // --- ✅ Success case: process prediction data ---
      const validation = validatePrediction(data.predicted_yield, historicalData);

      const scenarioValidation = validateScenarioEffect({
        feature: "rainfall", // you can later make this dynamic
        change: scenarioParams.rainfall,
      });

      const messages = [validation.message];

      if (!scenarioValidation.isValid) {
        Object.values(scenarioValidation.errors).forEach((error) => {
          messages.push(error);
        });
      }

      setValidationMessages(messages);
      setPrediction(data);

      // --- 📊 Fetch Historical Data after successful prediction ---
      try {
        const histResponse = await fetch("http://localhost:8000/api/historical", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            crop: filters.crop,
            state: filters.state,
            year: filters.year || new Date().getFullYear(),
          }),
        });

        if (histResponse.ok) {
          const histData = await histResponse.json();

          // 🧠 Normalize backend response to match frontend expected keys
          const normalizedData = {
            fiveYearAverage: histData.five_year_average ?? null,
            bestYear: {
              year: histData.best_year ?? null,
              yield: histData.best_yield ?? null,
            },
            growthRate: histData.growth_trend?.annual_rate ?? null,
            growthDirection: histData.growth_trend?.direction ?? null,
            percentDifference: histData.percent_difference ?? null,
            comparison: histData.comparison ?? null,
            yearlyData: (histData.yearlyData || []).map((d) => ({
              year: d.Year,
              yield: d.Yield,
            })),
          };
          setHistoricalData(normalizedData);
        } else {
          console.warn("Historical data fetch failed:", histResponse.status);
          setHistoricalData(null);
        }

      } catch (histErr) {
        console.error("Error fetching historical data:", histErr);
        setHistoricalData(null);
      }


    } catch (err) {
      console.error("API Error:", err);
      setError("Prediction Failed: " + (err.message || "Unexpected error occurred."));
    } finally {
      setLoading(false);
    }
  };

  // 🧪 Run What-If Scenario Simulation
  const handleScenarioPredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await fetch("http://localhost:8000/api/predictive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: filters.state,
          crop: filters.crop,
          year: filters.year || new Date().getFullYear(),
          rainfall_change: scenarioParams.rainfall,
          fertilizer_change: scenarioParams.fertilizer,
          pesticide_change: scenarioParams.pesticides,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Scenario prediction failed.");
      }

      // ✅ Update the prediction state to show results
      setPrediction(data);
    } catch (err) {
      console.error("Scenario Error:", err);
      setError(err.message || "Scenario simulation failed.");
    } finally {
      setLoading(false);
    }
  };


  // Add this function to handle scenario simulations
  const handleSimulation = () => {
    if (!prediction) return;
    setScenarioLoading(true);

    // Example base yield — from previous prediction result
    const baseYield = prediction?.yield || 2.147; // fallback value
    const crop = filters.crop?.toLowerCase() || "generic";

    // Example sensitivity factors by crop (you can tune these)
    const cropFactors = {
      rice: { rainfall: 0.4, fertilizer: 0.3, pesticides: 0.2 },
      wheat: { rainfall: 0.35, fertilizer: 0.25, pesticides: 0.25 },
      maize: { rainfall: 0.25, fertilizer: 0.35, pesticides: 0.3 },
      sugarcane: { rainfall: 0.45, fertilizer: 0.35, pesticides: 0.15 },
      default: { rainfall: 0.3, fertilizer: 0.3, pesticides: 0.3 },
    };

    const factors = cropFactors[crop] || cropFactors.default;

    // Calculate impact (normalized scaling)
    const rainfallImpact = (scenarioParams.rainfall / 100) * factors.rainfall;
    const fertilizerImpact = (scenarioParams.fertilizer / 100) * factors.fertilizer;
    const pesticideImpact = (scenarioParams.pesticides / 100) * factors.pesticides;

    // Combine impacts (positive or negative)
    const totalImpact = 1 + rainfallImpact + fertilizerImpact - Math.abs(pesticideImpact) * 0.5;

    // Apply change
    const newYield = baseYield * totalImpact;

    // Compute confidence and risk
    const confidence = Math.max(60, 95 - Math.abs(scenarioParams.rainfall) * 0.1);
    const risk =
      confidence > 85
        ? "Low"
        : confidence > 70
        ? "Medium"
        : "High";

    setTimeout(() => {
      setScenarioResult({
        yield: newYield,
        confidence: Math.round(confidence),
        risk: risk,
      });
      setScenarioLoading(false);
    }, 1200);
  };

  // Helper function to get parameter impact color
  const getImpactColor = (value) => {
    if (value > 10) return 'text-green-600';
    if (value > 0) return 'text-yellow-600';
    if (value === 0) return 'text-gray-500';
    if (value > -10) return 'text-orange-600';
    return 'text-red-600';
  };

  // Generate mock historical data for demonstration
  const generateHistoricalData = () => {
    if (!prediction) return null;
    
    const baseYield = prediction.yield || 2500;
    const years = Array.from({length: 5}, (_, i) => (new Date().getFullYear() - 5 + i));
    
    return {
      fiveYearAverage: baseYield * (0.85 + Math.random() * 0.3),
      bestYear: {
        year: years[Math.floor(Math.random() * years.length)],
        yield: baseYield * (1.1 + Math.random() * 0.2)
      },
      growthRate: (-5 + Math.random() * 15).toFixed(1),
      yearlyData: years.map(year => ({
        year,
        yield: baseYield * (0.8 + Math.random() * 0.4)
      }))
    };
  };

  // Risk assessment based on confidence score
  const getRiskAssessment = (confidence) => {
    if (!confidence) return { level: 'Unknown', color: 'gray', bgColor: 'gray' };
    
    if (confidence >= 0.8) return { 
      level: 'Low Risk', 
      color: '[#99b83b]', 
      bgColor: '[#99b83b]/10',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    };
    if (confidence >= 0.6) return { 
      level: 'Moderate Risk', 
      color: '[#f8d662]', 
      bgColor: '[#f8d662]/10',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    };
    return { 
      level: 'High Risk', 
      color: '[#e26c52]', 
      bgColor: '[#e26c52]/10',
      icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    };
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const pulseVariants = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  // Fetch historical data when inputs change
  useEffect(() => {
    // Only run when state and crop are selected
    if (filters.state && filters.crop) {
      const yearToUse = filters.year || new Date().getFullYear() - 1; // fallback to last year if empty

      fetch("http://localhost:8000/api/descriptive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          state: filters.state, 
          crop: filters.crop, 
          year: yearToUse 
        }),
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch historical data');
          return res.json();
        })
        .then(data => {
          const hist = data.historical_analysis || data;

          const normalized = {
            fiveYearAverage: hist.fiveYearAverage ?? hist.five_year_average ?? 0,
            bestYear: hist.bestYear ?? {
              year: hist.best_year ?? null,
              yield: hist.best_yield ?? null,
            },
            growthRate: hist.growthRate ?? hist.growth_trend?.annual_rate ?? 0,
            growthDirection: hist.growthDirection ?? hist.growth_trend?.direction ?? "",
            percentDifference: hist.percentDifference ?? hist.percent_difference ?? 0,
            comparison: hist.comparison ?? "",
            yearlyData: (hist.yearlyData || hist.yearly_data || []).map((d) => ({
              year: d.Year ?? d.year,
              yield: d.Yield ?? d.yield,
            })),
          };

          setHistoricalData(normalized);
        })
        .catch(err => {
          console.error('Historical Data Error:', err);
          setError('Information not available or crop not grown'); // friendlier message
        });
    }
  }, [filters.state, filters.crop, filters.year]);

  useEffect(() => {
  console.log("📊 Historical Data:", historicalData);
}, [historicalData]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-[#edebdf] via-[#f8f6f0] to-[#edebdf] p-6"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTU2MzQ2IiBzdHJva2Utd2lkdGg9IjEiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] bg-repeat"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Page Title */}
        <motion.section variants={itemVariants} className="text-center mb-12">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#956346] to-[#7a4d36] rounded-2xl mb-6 shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-[#956346] mb-4 font-serif">
            Predictive Analysis
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#99b83b] to-[#37acd0] mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            <span className="block whitespace-nowrap">
              Get yield predictions and simulate scenarios using AI-powered machine learning models.
            </span>
            <span className="block">
              Make smart decisions for your agricultural planning.
            </span>
          </p>
        </motion.section>

        {/* Smart Filters Section */}
        <motion.section variants={cardVariants} className="mb-8">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#37acd0] to-[#2b8ba8] rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#37acd0]">Smart Filters</h3>
            </div>
            
            <form onSubmit={handlePrediction} className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* State Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#956346] mb-2">
                    Select State *
                  </label>
                  <div className="relative">
                    <select
                      value={filters.state}
                      onChange={(e) => setFilters({...filters, state: e.target.value})}
                      className="w-full px-4 py-4 bg-gradient-to-br from-[#edebdf]/30 to-[#edebdf]/50 
                               border-2 border-[#37acd0]/20 rounded-2xl 
                               focus:ring-2 focus:ring-[#37acd0] focus:border-[#37acd0] 
                               text-gray-800 font-medium appearance-none 
                               transition-all duration-300 hover:border-[#37acd0]/40
                               shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="" className="text-gray-500">Choose your state</option>
                      {states.map(state => (
                        <option key={state} value={state} className="text-gray-800">
                          {state}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-[#37acd0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Crop Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#956346] mb-2">
                    Select Crop *
                  </label>
                  <div className="relative">
                    <select
                      value={filters.crop}
                      onChange={(e) => setFilters({...filters, crop: e.target.value})}
                      className="w-full px-4 py-4 bg-gradient-to-br from-[#edebdf]/30 to-[#edebdf]/50 
                               border-2 border-[#99b83b]/20 rounded-2xl 
                               focus:ring-2 focus:ring-[#99b83b] focus:border-[#99b83b] 
                               text-gray-800 font-medium appearance-none 
                               transition-all duration-300 hover:border-[#99b83b]/40
                               shadow-sm hover:shadow-md"
                      required
                    >
                      <option value="" className="text-gray-500">Choose your crop</option>
                      {crops.map(crop => (
                        <option key={crop} value={crop} className="text-gray-800">
                          {crop}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-[#99b83b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Year Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#956346] mb-2">
                    Year (Optional)
                  </label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => setFilters({...filters, year: e.target.value})}
                    placeholder={`e.g., ${new Date().getFullYear()}`}
                    min="1997"
                    max="2020"
                    className="w-full px-4 py-4 bg-gradient-to-br from-[#edebdf]/30 to-[#edebdf]/50 
                             border-2 border-[#f8d662]/20 rounded-2xl 
                             focus:ring-2 focus:ring-[#f8d662] focus:border-[#f8d662] 
                             text-gray-800 font-medium 
                             transition-all duration-300 hover:border-[#f8d662]/40
                             shadow-sm hover:shadow-md
                             placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Validation Messages */}
              {validationMessages.length > 0 && (
                <div className="mb-4 p-4 bg-white rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Validation Results:</h3>
                  <ul className="space-y-1">
                    {validationMessages
                      .filter(msg => msg && typeof msg === 'string')
                      .map((msg, idx) => (
                        <li key={idx} className={msg.startsWith('✅') ? 'text-green-600' : 'text-yellow-600'}>
                          {msg}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Error Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-gradient-to-r from-[#e26c52]/10 to-[#e26c52]/5 border-2 border-[#e26c52]/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-[#e26c52] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-[#e26c52] mb-1">Prediction Failed</h4>
                        <p className="text-[#e26c52]/80">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <motion.button
                  type="submit"
                  disabled={loading || !filters.state || !filters.crop}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 bg-gradient-to-r from-[#37acd0] to-[#2b8ba8] 
                           hover:from-[#37acd0]/90 hover:to-[#2b8ba8]/90 
                           disabled:from-gray-400 disabled:to-gray-500 
                           disabled:cursor-not-allowed disabled:transform-none
                           text-white rounded-2xl font-bold text-lg
                           transition-all duration-300 
                           flex items-center shadow-lg hover:shadow-xl
                           min-w-[200px] justify-center"
                >
                  {loading ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                      ></motion.div>
                      Predicting...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Get Prediction
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.section>

        {/* Enhanced Prediction Results Section */}
        <motion.section variants={cardVariants} className="mb-8">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#99b83b] to-[#7a9230] rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#99b83b]">AI Prediction Results</h3>
            </div>

            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-[#37acd0]/5 to-[#99b83b]/5 rounded-2xl p-8 border border-[#37acd0]/10"
                >
                  <div className="flex flex-col items-center justify-center py-12">
                    <motion.div
                      animate={pulseVariants}
                      className="w-20 h-20 bg-gradient-to-br from-[#37acd0] to-[#99b83b] rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                    >
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </motion.div>
                    
                    <div className="text-center mb-4">
                      <h4 className="text-xl font-bold text-[#37acd0] mb-2">
                        🌾 Analyzing Agricultural Data
                      </h4>
                      <p className="text-gray-600 text-lg">
                        Processing {filters.crop} yield patterns in {filters.state}...
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                          }}
                          className="w-3 h-3 bg-[#99b83b] rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {!loading && prediction && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >

                  {/* Main Results Grid */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.12 }
                      }
                    }}
                    initial="hidden"
                    animate="visible"
                    className="grid md:grid-cols-3 gap-6"
                  >
                    {/* Predicted Yield Card */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-gradient-to-br from-[#99b83b]/10 to-[#99b83b]/5 border-2 border-[#99b83b]/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-[#99b83b] rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-[#99b83b]">Predicted Yield</h4>
                      </div>
                      <p className="text-3xl font-bold text-[#956346] mb-2">
                        {prediction?.yield != null ? Number(prediction.yield).toLocaleString() : '2,847'}
                        <span className="text-lg font-medium text-gray-600 ml-2">kg/ha</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        For {filters.crop} in {filters.state}
                      </p>
                    </motion.div>

                    {/* Confidence Score Card */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="bg-gradient-to-br from-[#37acd0]/10 to-[#37acd0]/5 border-2 border-[#37acd0]/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-[#37acd0] rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold text-[#37acd0]">Confidence Score</h4>
                      </div>
                      <p className="text-3xl font-bold text-[#956346] mb-2">
                        {prediction.confidence ? `${(prediction.confidence * 100).toFixed(0)}%` : '87%'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Model accuracy rating
                      </p>
                    </motion.div>

                    {/* Risk Assessment Card */}
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className={`bg-gradient-to-br from-${getRiskAssessment(prediction.confidence || 0.87).bgColor} border-2 border-${getRiskAssessment(prediction.confidence || 0.87).color}/20 rounded-2xl p-6 hover:shadow-lg transition-all duration-300`}
                    >
                      <div className="flex items-center mb-4">
                        <div className={`w-10 h-10 bg-${getRiskAssessment(prediction.confidence || 0.87).color} rounded-xl flex items-center justify-center mr-3`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getRiskAssessment(prediction.confidence || 0.87).icon} />
                          </svg>
                        </div>
                        <h4 className={`text-lg font-bold text-${getRiskAssessment(prediction.confidence || 0.87).color}`}>Risk Assessment</h4>
                      </div>
                      <p className="text-3xl font-bold text-[#956346] mb-2">
                        {getRiskAssessment(prediction.confidence || 0.87).level}
                      </p>
                      <p className="text-sm text-gray-500">
                        Based on model confidence
                      </p>
                    </motion.div>
                  </motion.div>

                  {/* Historical Comparison Section */}
                  {historicalData && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-[#f8d662]/5 to-[#f8d662]/10 border border-[#f8d662]/20 rounded-2xl p-6"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f8d662] to-[#e6c556] rounded-xl flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h4 className="text-xl font-bold text-[#f8d662]">📊 Historical Comparison</h4>
                      </div>

                      <div className="grid md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                          <h5 className="font-semibold text-[#956346] mb-2">5-Year Average</h5>
                          <p className="text-2xl font-bold text-gray-800">
                            {historicalData?.fiveYearAverage != null 
                              ? historicalData.fiveYearAverage.toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                              : 'N/A'}
                            <span className="text-sm font-medium text-gray-600 ml-1">kg/ha</span>
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${
                              prediction.yield > historicalData.fiveYearAverage ? 'text-[#99b83b]' : 'text-[#e26c52]'
                            }`}>
                              {prediction.yield > historicalData.fiveYearAverage ? '↗' : '↘'} 
                              {' '}
                              {(((prediction.yield || 2847) / historicalData.fiveYearAverage - 1) * 100).toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500 ml-2">vs average</span>
                          </div>
                        </div>

                        <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                          <h5 className="font-semibold text-[#956346] mb-2">Best Year</h5>
                          <p className="text-2xl font-bold text-gray-800">
                            {historicalData?.bestYear?.yield != null 
                              ? historicalData?.bestYear?.yield.toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                              : 'N/A'}
                            <span className="text-sm font-medium text-gray-600 ml-1">kg/ha</span>
                          </p>
                          {historicalData?.bestYear?.year ? (
                            <p className="text-sm text-gray-500 mt-1">
                              Achieved in {historicalData.bestYear.year}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400 mt-1">Year unavailable</p>
                          )}
                        </div>

                        <div className="bg-white/60 rounded-xl p-4 border border-gray-200">
                          <h5 className="font-semibold text-[#956346] mb-2">Growth Trend</h5>
                          <p className="text-2xl font-bold text-gray-800">
                            {historicalData.growthRate}%
                            <span className="text-sm font-medium text-gray-600 ml-1">annually</span>
                          </p>
                          <div className="flex items-center mt-2">
                            <span className={`text-sm font-medium ${
                              parseFloat(historicalData.growthRate) > 0 ? 'text-[#99b83b]' : 'text-[#e26c52]'
                            }`}>
                              {parseFloat(historicalData.growthRate) > 0 ? '📈 Growing' : '📉 Declining'}
                            </span>
                          </div>
                        </div>
                      </div>


                      {/* Chart Placeholder */}
                      {/* Enhanced Yield Trend Visualization */}
                      {trendData.length > 0 && (
                        <div className="chart-container">
                          <h3 className="text-lg font-semibold mb-3">
                            📉 Historical Yield Trend
                          </h3>

                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={trendData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis />
                              <Tooltip />

                              <Line
                                type="monotone"
                                dataKey="yield"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}

              {!loading && !prediction && (
                <motion.div
                  key="no-results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-br from-[#99b83b]/5 to-[#99b83b]/10 rounded-2xl p-8 border border-[#99b83b]/10"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-bold text-gray-600 text-center mb-4">
                    Ready for Analysis
                  </h4>
                  <p className="text-gray-500 text-center text-lg mb-6">
                    Select your state and crop above, then click "Get Prediction" to see detailed yield forecasts and historical comparisons.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/50 rounded-xl p-6 border border-gray-200">
                      <h5 className="font-semibold text-[#956346] mb-3">📊 What You'll Get</h5>
                      <ul className="text-sm text-gray-500 space-y-2">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#99b83b] rounded-full mr-3"></span>
                          AI-powered yield predictions
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#37acd0] rounded-full mr-3"></span>
                          Confidence scoring & risk assessment
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#f8d662] rounded-full mr-3"></span>
                          Historical trend analysis
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#e26c52] rounded-full mr-3"></span>
                          Performance benchmarking
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-6 border border-gray-200">
                      <h5 className="font-semibold text-[#99b83b] mb-3">🎯 Model Features</h5>
                      <ul className="text-sm text-gray-500 space-y-2">
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#99b83b] rounded-full mr-3"></span>
                          25+ years of training data
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#37acd0] rounded-full mr-3"></span>
                          Multi-factor analysis
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#f8d662] rounded-full mr-3"></span>
                          Weather pattern integration
                        </li>
                        <li className="flex items-center">
                          <span className="w-2 h-2 bg-[#e26c52] rounded-full mr-3"></span>
                          Real-time processing
                        </li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.section>

        {/* Interactive What-If Scenarios Section */}
        <motion.section variants={cardVariants} className="mb-8">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#e26c52] to-[#c85a42] rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#e26c52]">Interactive What-If Scenarios</h3>
            </div>

            <p className="text-gray-600 mb-8 text-lg">
              Adjust environmental and agricultural inputs to simulate different scenarios and see how they impact your predicted yield.
            </p>

            {/* Scenario Controls */}
            <div className="space-y-8 mb-8">
              {/* Rainfall Adjustment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#37acd0] rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#37acd0]">Rainfall Variation</h4>
                      <p className="text-sm text-gray-600">Adjust rainfall by ±100%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${getImpactColor(scenarioParams.rainfall)}`}>
                      {scenarioParams.rainfall > 0 ? '+' : ''}{scenarioParams.rainfall}%
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={scenarioParams.rainfall}
                    onChange={(e) => setScenarioParams({...scenarioParams, rainfall: parseInt(e.target.value)})}
                    className="w-full h-3 bg-gradient-to-r from-[#e26c52] via-[#37acd0] to-[#99b83b] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-100% (Drought)</span>
                    <span>Baseline</span>
                    <span>+100% (Abundant)</span>
                  </div>
                </div>
              </div>

              {/* Fertilizer Adjustment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#99b83b] rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#99b83b]">Fertilizer Usage</h4>
                      <p className="text-sm text-gray-600">Adjust fertilizer by ±100%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${getImpactColor(scenarioParams.fertilizer)}`}>
                      {scenarioParams.fertilizer > 0 ? '+' : ''}{scenarioParams.fertilizer}%
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={scenarioParams.fertilizer}
                    onChange={(e) => setScenarioParams({...scenarioParams, fertilizer: parseInt(e.target.value)})}
                    className="w-full h-3 bg-gradient-to-r from-[#e26c52] via-[#99b83b] to-[#99b83b] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-100% (Reduced)</span>
                    <span>Standard</span>
                    <span>+100% (Enhanced)</span>
                  </div>
                </div>
              </div>

              {/* Pesticides Adjustment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-[#e26c52] rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#e26c52]">Pesticide Application</h4>
                      <p className="text-sm text-gray-600">Adjust pesticides by ±100%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${getImpactColor(scenarioParams.pesticides)}`}>
                      {scenarioParams.pesticides > 0 ? '+' : ''}{scenarioParams.pesticides}%
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={scenarioParams.pesticides}
                    onChange={(e) => setScenarioParams({...scenarioParams, pesticides: parseInt(e.target.value)})}
                    className="w-full h-3 bg-gradient-to-r from-[#e26c52] via-[#f8d662] to-[#99b83b] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-100% (Minimal)</span>
                    <span>Standard</span>
                    <span>+100% (Intensive)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulate Button */}
            <div className="flex justify-center mb-8">
              <motion.button
                onClick={handleSimulation}
                disabled={scenarioLoading || !prediction}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-gradient-to-r from-[#e26c52] to-[#c85a42] 
                        hover:from-[#e26c52]/90 hover:to-[#c85a42]/90 
                        disabled:from-gray-400 disabled:to-gray-500 
                        disabled:cursor-not-allowed
                        text-white rounded-2xl font-bold text-lg
                        transition-all duration-300 
                        flex items-center shadow-lg hover:shadow-xl
                        min-w-[200px] justify-center"
              >
                {scenarioLoading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                    ></motion.div>
                    Simulating...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Run Simulation
                  </>
                )}
              </motion.button>
            </div>

            {/* Scenario Results - Baseline vs New Prediction */}
            <AnimatePresence>
              {scenarioResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 text-center"
                >
                  <h4 className="text-2xl font-bold text-[#956346] flex items-center justify-center">
                    <svg className="w-6 h-6 mr-2 text-[#e26c52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Scenario Prediction Results
                  </h4>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Predicted Yield */}
                    <div className="bg-gradient-to-br from-[#37acd0]/10 to-[#37acd0]/5 border-2 border-[#37acd0]/20 rounded-2xl p-6">
                      <h5 className="text-lg font-bold text-[#37acd0] mb-2">Predicted Yield</h5>
                      <p className="text-3xl font-bold text-[#956346] mb-1">
                        {scenarioResult.yield ? Number(scenarioResult.yield).toFixed(3) : "2.147"} 
                        <span className="text-lg font-medium text-gray-600 ml-2">kg/ha</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        For {filters.crop} in {filters.state}
                      </p>
                    </div>

                    {/* Confidence Score */}
                    <div className="bg-gradient-to-br from-[#99b83b]/10 to-[#99b83b]/5 border-2 border-[#99b83b]/20 rounded-2xl p-6">
                      <h5 className="text-lg font-bold text-[#99b83b] mb-2">Confidence Score</h5>
                      <p className="text-3xl font-bold text-[#956346] mb-1">
                        {scenarioResult.confidence || 86}%
                      </p>
                      <p className="text-sm text-gray-500">Model accuracy rating</p>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-gradient-to-br from-[#e26c52]/10 to-[#e26c52]/5 border-2 border-[#e26c52]/20 rounded-2xl p-6">
                      <h5 className="text-lg font-bold text-[#e26c52] mb-2">Risk Assessment</h5>
                      <p className={`text-3xl font-bold ${
                        (scenarioResult.risk || "Low") === "Low"
                          ? "text-green-600"
                          : (scenarioResult.risk || "Low") === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}>
                        {scenarioResult.risk || "Low"} Risk
                      </p>
                      <p className="text-sm text-gray-500">Based on model confidence</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


            {/* No Baseline Message */}
            {!prediction && (
              <div className="text-center py-8 bg-gray-50 rounded-2xl">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-gray-600">
                  Run a baseline prediction first to enable scenario simulation
                </p>
              </div>
            )}
          </motion.div>
        </motion.section>

        {/* Development Status Banner */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-[#e1f3d8]/60 to-[#d8f1f7]/60 rounded-2xl p-6 border border-[#b3e0b7] text-center"
        >
          <h4 className="text-lg font-semibold text-[#4a6b29] mb-2">
            🌿 Data-Driven Agricultural Insights
          </h4>

          <p className="text-gray-700 max-w-2xl mx-auto">
            <span className="block whitespace-nowrap">
              Explore how rainfall, fertilizer, and pesticide changes influence crop yields across states.
            </span>
            <span className="block whitespace-nowrap">
              The model combines historical data with predictive analytics to support sustainable farming decisions.
            </span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PredictiveAnalysis;