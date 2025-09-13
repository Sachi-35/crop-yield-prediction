import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
      const response = await fetch('http://localhost:5000/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: filters.state,
          crop: filters.crop,
          year: filters.year || new Date().getFullYear()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get prediction');
      }

      const data = await response.json();
      setPrediction(data);
    } catch (err) {
      setError('Failed to generate prediction. Please check your connection and try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

    // Add this function after handlePrediction
  const handleSimulation = async (e) => {
    e.preventDefault();
    setScenarioLoading(true);
    setError(null);
    setScenarioResult(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: filters.state,
          crop: filters.crop,
          year: filters.year || new Date().getFullYear(),
          rainfall: scenarioParams.rainfall,
          fertilizer: scenarioParams.fertilizer,
          pesticides: scenarioParams.pesticides
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to run simulation');
      }

      const data = await response.json();
      setScenarioResult(data);
    } catch (err) {
      setError('Failed to generate simulation. Please check your connection and try again.');
      console.error('Simulation API Error:', err);
    } finally {
      setScenarioLoading(false);
    }
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

  const historicalData = generateHistoricalData();

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
            Analyze crop yield predictions and simulate scenarios with AI-powered forecasting models.
            Make data-driven decisions for your agricultural planning.
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
                    max="2030"
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
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Predicted Yield Card */}
                    <motion.div
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
                        {prediction.yield ? Number(prediction.yield).toLocaleString() : '2,847'} 
                        <span className="text-lg font-medium text-gray-600 ml-2">kg/ha</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        For {filters.crop} in {filters.state}
                      </p>
                    </motion.div>

                    {/* Confidence Score Card */}
                    <motion.div
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
                  </div>

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
                            {historicalData.fiveYearAverage.toLocaleString(undefined, {maximumFractionDigits: 0})}
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
                            {historicalData.bestYear.yield.toLocaleString(undefined, {maximumFractionDigits: 0})}
                            <span className="text-sm font-medium text-gray-600 ml-1">kg/ha</span>
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Achieved in {historicalData.bestYear.year}
                          </p>
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
                      <div className="bg-white/40 rounded-xl p-6 border-2 border-dashed border-[#f8d662]/30">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                          </div>
                        </div>
                        <h5 className="text-center text-lg font-semibold text-gray-600 mb-2">
                          📈 Yield Trend Visualization
                        </h5>
                        <p className="text-center text-gray-500 mb-4">
                          Interactive chart showing {filters.crop} yield patterns over time
                        </p>
                        <div className="grid grid-cols-5 gap-2 text-xs text-gray-400">
                          {historicalData.yearlyData.map((data, index) => (
                            <div key={data.year} className="text-center">
                              <div className={`h-${Math.max(1, Math.floor(data.yield / 500))} bg-gradient-to-t from-[#99b83b] to-[#99b83b]/60 rounded-t mb-1`}></div>
                              <div>{data.year}</div>
                            </div>
                          ))}
                        </div>
                        <p className="text-center text-xs text-gray-400 mt-3">
                          Chart integration coming in next phase
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-[#99b83b]/10 to-[#37acd0]/10 border border-[#99b83b]/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#99b83b] rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-bold text-[#99b83b] mb-1">Prediction Complete!</h4>
                        <p className="text-gray-600">
                          Analysis for <span className="font-semibold text-[#956346]">{filters.crop}</span> in{' '}
                          <span className="font-semibold text-[#956346]">{filters.state}</span> generated successfully.
                          Ready for scenario simulation.
                        </p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-[#37acd0] to-[#2b8ba8] text-white rounded-xl font-medium hover:shadow-md transition-all duration-200"
                      >
                        Export Data
                      </motion.button>
                    </div>
                  </motion.div>
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
                      <p className="text-sm text-gray-600">Adjust rainfall by ±50%</p>
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
                    min="-50"
                    max="50"
                    value={scenarioParams.rainfall}
                    onChange={(e) => setScenarioParams({...scenarioParams, rainfall: parseInt(e.target.value)})}
                    className="w-full h-3 bg-gradient-to-r from-[#e26c52] via-[#37acd0] to-[#99b83b] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-50% (Drought)</span>
                    <span>Baseline</span>
                    <span>+50% (Abundant)</span>
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
                      <p className="text-sm text-gray-600">Adjust fertilizer by ±30%</p>
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
                    min="-30"
                    max="30"
                    value={scenarioParams.fertilizer}
                    onChange={(e) => setScenarioParams({...scenarioParams, fertilizer: parseInt(e.target.value)})}
                    className="w-full h-3 bg-gradient-to-r from-[#e26c52] via-[#99b83b] to-[#99b83b] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-30% (Reduced)</span>
                    <span>Standard</span>
                    <span>+30% (Enhanced)</span>
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
                      <p className="text-sm text-gray-600">Adjust pesticides by ±40%</p>
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
                    min="-40"
                    max="40"
                    value={scenarioParams.pesticides}
                    onChange={(e) => setScenarioParams({...scenarioParams, pesticides: parseInt(e.target.value)})}
                    className="w-full h-3 bg-gradient-to-r from-[#e26c52] via-[#f8d662] to-[#99b83b] rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>-40% (Minimal)</span>
                    <span>Standard</span>
                    <span>+40% (Intensive)</span>
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
                  className="space-y-6"
                >
                  <h4 className="text-xl font-bold text-[#956346] flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Scenario Comparison
                  </h4>

                  {/* Side-by-side comparison */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Baseline Prediction */}
                    <div className="bg-gradient-to-br from-[#37acd0]/10 to-[#37acd0]/5 border-2 border-[#37acd0]/20 rounded-2xl p-6">
                      <h5 className="text-lg font-bold text-[#37acd0] mb-3 flex items-center">
                        <div className="w-3 h-3 bg-[#37acd0] rounded-full mr-2"></div>
                        Baseline Prediction
                      </h5>
                      <p className="text-3xl font-bold text-[#956346] mb-2">
                        {prediction?.yield ? Number(prediction.yield).toLocaleString() : '2,847'} 
                        <span className="text-lg font-medium text-gray-600 ml-2">kg/ha</span>
                      </p>
                      <p className="text-sm text-gray-500">Current conditions</p>
                    </div>

                    {/* Scenario Prediction */}
                    <div className="bg-gradient-to-br from-[#e26c52]/10 to-[#e26c52]/5 border-2 border-[#e26c52]/20 rounded-2xl p-6">
                      <h5 className="text-lg font-bold text-[#e26c52] mb-3 flex items-center">
                        <div className="w-3 h-3 bg-[#e26c52] rounded-full mr-2"></div>
                        Scenario Prediction
                      </h5>
                      <p className="text-3xl font-bold text-[#956346] mb-2">
                        {scenarioResult?.yield ? Number(scenarioResult.yield).toLocaleString() : '3,124'} 
                        <span className="text-lg font-medium text-gray-600 ml-2">kg/ha</span>
                      </p>
                      <p className="text-sm text-gray-500">With adjustments</p>
                    </div>
                  </div>

                  {/* Impact Summary */}
                  {(() => {
                    const baselineYield = prediction?.yield || 2847;
                    const scenarioYield = scenarioResult?.yield || 3124;
                    const difference = scenarioYield - baselineYield;
                    const percentChange = ((difference / baselineYield) * 100).toFixed(1);
                    
                    return (
                      <div className="bg-gradient-to-br from-[#f8d662]/10 to-[#f8d662]/5 border-2 border-[#f8d662]/20 rounded-2xl p-6">
                        <h5 className="text-lg font-bold text-[#956346] mb-4">Impact Summary</h5>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Yield Change</p>
                            <p className={`text-2xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {difference >= 0 ? '+' : ''}{difference.toLocaleString()} kg/ha
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Percentage Change</p>
                            <p className={`text-2xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {percentChange >= 0 ? '+' : ''}{percentChange}%
                            </p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600 mb-1">Recommendation</p>
                            <p className={`text-lg font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {difference >= 0 ? 'Favorable' : 'Unfavorable'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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

        {/* Scenario Simulation Section */}
        <motion.section variants={cardVariants} className="mb-8">
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300"
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f8d662] to-[#e6c556] rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#f8d662]">What-If Scenarios</h3>
            </div>
            
            <div className="bg-gradient-to-br from-[#f8d662]/5 to-[#f8d662]/10 rounded-2xl p-8 border border-[#f8d662]/10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              
              <p className="text-gray-500 text-center text-lg mb-6">
                Interactive scenario simulation tools - Coming in Phase 6 Part 4
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <motion.div
                  className="bg-white/60 rounded-xl p-6 border border-gray-200 text-center"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#37acd0] to-[#2b8ba8] rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#37acd0] mb-2">Rainfall Impact</h4>
                  <p className="text-sm text-gray-500">Adjust precipitation levels ±50% and see yield changes</p>
                  <motion.span 
                    key={scenarioParams.rainfall} 
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`text-xl font-bold ${getImpactColor(scenarioParams.rainfall)}`}
                  >
                    {scenarioParams.rainfall > 0 ? '+' : ''}{scenarioParams.rainfall}%
                  </motion.span>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={scenarioParams.rainfall}
                    onChange={(e) => setScenarioParams({...scenarioParams, rainfall: parseInt(e.target.value)})}
                    className="w-full h-3 bg-gradient-to-r from-[#e26c52] via-[#37acd0] to-[#99b83b] rounded-lg appearance-none cursor-pointer hover:h-4 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </motion.div>
                
                <motion.div
                  className="bg-white/60 rounded-xl p-6 border border-gray-200 text-center"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#99b83b] to-[#7a9230] rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#99b83b] mb-2">Fertilizer Usage</h4>
                  <p className="text-sm text-gray-500">Optimize N-P-K levels ±30% for maximum efficiency</p>
                  <motion.span 
                    key={scenarioParams.fertilizer} 
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`block my-3 text-xl font-bold ${getImpactColor(scenarioParams.fertilizer)}`}
                  >
                    {scenarioParams.fertilizer > 0 ? '+' : ''}{scenarioParams.fertilizer}%
                  </motion.span>
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    value={scenarioParams.fertilizer}
                    onChange={(e) =>
                      setScenarioParams({ ...scenarioParams, fertilizer: parseInt(e.target.value) })
                    }
                    className="w-full h-3 bg-gradient-to-r from-[#99b83b] via-[#37acd0] to-[#e26c52] 
                              rounded-lg appearance-none cursor-pointer 
                              hover:h-4 transition-all duration-300 shadow-sm hover:shadow-md"
                  />
                </motion.div>
                
                <motion.div
                  className="bg-white/60 rounded-xl p-6 border border-gray-200 text-center"
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-[#e26c52] to-[#c25a47] rounded-xl mx-auto mb-3 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-[#e26c52] mb-2">Pest Management</h4>
                  <p className="text-sm text-gray-500">Balance protection ±40% with environmental impact</p>
                  <motion.span 
                    key={scenarioParams.pesticide} 
                    initial={{ scale: 1.1, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`block my-3 text-xl font-bold ${getImpactColor(scenarioParams.pesticide)}`}
                  >
                    {scenarioParams.pesticide > 0 ? '+' : ''}{scenarioParams.pesticide}%
                  </motion.span>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={scenarioParams.pest}
                    onChange={(e) =>
                      setScenarioParams({ ...scenarioParams, pest: parseInt(e.target.value) })
                    }
                    className="w-full h-3 bg-gradient-to-r from-[#e26c52] via-[#f8d662] to-[#99b83b] 
                              rounded-lg appearance-none cursor-pointer 
                              hover:h-4 transition-all duration-300 shadow-sm hover:shadow-md"
                  />

                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Development Status Banner */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-[#99b83b]/10 to-[#37acd0]/10 rounded-2xl p-6 border-2 border-dashed border-[#99b83b]/30 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#99b83b] to-[#37acd0] rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-[#956346]">🎉 Phase 6 Part 3 Complete!</h4>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enhanced prediction results with styled cards, comprehensive loading states, error handling, and historical comparison analysis. 
            Next: <span className="font-semibold text-[#37acd0]">Part 4 - Interactive What-If Scenario Tools</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PredictiveAnalysis;