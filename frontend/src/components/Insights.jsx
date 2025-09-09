import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Insights = () => {
  const [formData, setFormData] = useState({
    state: "",
    crop: "",
    year: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [scenario, setScenario] = useState({
    rainfall: "",
    fertilizer: "",
    pesticides: "",
  });
  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("analysis");

  // Comprehensive Indian States
  const states = [
    "Andhra Pradesh", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu",
    "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
  ];

  // Major Indian Crops
  const crops = [
    "Rice", "Wheat", "Maize", "Sugarcane", "Barley", "Bajra", "Jowar",
    "Groundnut", "Cotton", "Gram", "Pulses", "Rapeseed", "Mustard",
    "Tea", "Coffee", "Jute", "Potato", "Onion", "Soybean", "Sunflower",
    "Turmeric", "Tomato", "Chili", "Coconut"
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScenarioChange = (e) => {
    const { name, value } = e.target;
    setScenario((prev) => ({ ...prev, [name]: value }));
  };

  // Handle main analysis submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Failed to fetch analysis. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  // Handle scenario simulation
  const handleScenarioSubmit = async (e) => {
    e.preventDefault();
    setScenarioLoading(true);
    setScenarioResult(null);

    try {
      const response = await fetch("http://localhost:5000/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...scenario,
        }),
      });
      const data = await response.json();
      setScenarioResult(data);
    } catch (error) {
      setScenarioResult({ error: "Failed to simulate scenario. Please try again." });
    } finally {
      setScenarioLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.3 }
    }
  };

  return (
    <section
      id="insights"
      className="relative min-h-screen py-20 px-6 bg-gradient-to-br from-[#edebdf] via-[#f8f6f0] to-[#edebdf]"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23956346\' fill-opacity=\'0.1\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>


      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-6xl mx-auto"
      >
        {/* Header */}
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#956346] to-[#7a4d36] rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#956346] mb-4">
            Agricultural Intelligence
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Make data-driven decisions for your crops. Analyze historical yields and simulate different scenarios 
            to optimize your agricultural outcomes.
          </p>
        </motion.div>


        {/* Tab Navigation */}
        <motion.div variants={itemVariants} className="flex justify-center mb-12">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/20">
            <button
              onClick={() => setActiveTab("analysis")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "analysis"
                  ? "bg-[#956346] text-white shadow-lg"
                  : "text-[#956346] hover:bg-[#956346]/10"
              }`}
            >
              📊 Yield Analysis
            </button>
            <button
              onClick={() => setActiveTab("scenario")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "scenario"
                  ? "bg-[#37acd0] text-white shadow-lg"
                  : "text-[#37acd0] hover:bg-[#37acd0]/10"
              }`}
            >
              🌦️ What-If Scenarios
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "analysis" && (
            <motion.div
              key="analysis"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              {/* Analysis Form */}
              <motion.div variants={itemVariants}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#956346] to-[#7a4d36] rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-[#956346]">Historical Analysis</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* State Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        🏛️ Select State
                      </label>
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#956346] focus:ring-4 focus:ring-[#956346]/10 transition-all duration-300 bg-white"
                        required
                      >
                        <option value="">Choose your state</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>

                    {/* Crop Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        🌾 Select Crop
                      </label>
                      <select
                        name="crop"
                        value={formData.crop}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#956346] focus:ring-4 focus:ring-[#956346]/10 transition-all duration-300 bg-white"
                        required
                      >
                        <option value="">Choose your crop</option>
                        {crops.map(crop => (
                          <option key={crop} value={crop}>{crop}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        📅 Analysis Year
                      </label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#956346] focus:ring-4 focus:ring-[#956346]/10 transition-all duration-300 bg-white"
                        placeholder="Enter year (e.g., 2025)"
                        min="1997"
                        max="2030"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-[#956346] to-[#7a4d36] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Analyzing Data...
                        </div>
                      ) : (
                        "🔍 Get Yield Insights"
                      )}
                    </motion.button>
                  </form>
                </div>
              </motion.div>

              {/* Results Display */}
              <motion.div variants={itemVariants}>
                <AnimatePresence>
                  {result && (
                    <motion.div
                      variants={resultVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#99b83b] to-[#7a9230] rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-[#99b83b]">Analysis Results</h3>
                      </div>

                      {result.error ? (
                        <div className="bg-[#e26c52]/10 border border-[#e26c52]/20 rounded-xl p-6">
                          <div className="flex items-center">
                            <svg className="w-6 h-6 text-[#e26c52] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[#e26c52] font-medium">{result.error}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-[#99b83b]/5 to-[#99b83b]/10 rounded-xl p-6 border border-[#99b83b]/20">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!result && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-dashed border-gray-300 text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Your analysis results will appear here</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "scenario" && (
            <motion.div
              key="scenario"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid lg:grid-cols-2 gap-12 items-start"
            >
              {/* Scenario Form */}
              <motion.div variants={itemVariants}>
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#37acd0] to-[#2b8ba8] rounded-xl flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-[#37acd0]">Scenario Simulation</h3>
                  </div>

                  {/* Base Parameters Notice */}
                  <div className="bg-[#f8d662]/10 border border-[#f8d662]/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-[#f8d662] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        Using: <strong>{formData.state || "State"}</strong> | <strong>{formData.crop || "Crop"}</strong> | <strong>{formData.year || "Year"}</strong>
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleScenarioSubmit} className="space-y-6">
                    {/* Rainfall Change */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        🌧️ Rainfall Change (%)
                      </label>
                      <input
                        type="number"
                        name="rainfall"
                        value={scenario.rainfall}
                        onChange={handleScenarioChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#37acd0] focus:ring-4 focus:ring-[#37acd0]/10 transition-all duration-300 bg-white"
                        placeholder="e.g., +15 for 15% increase, -10 for 10% decrease"
                        required
                      />
                    </div>

                    {/* Fertilizer Change */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        🧪 Fertilizer Change (%)
                      </label>
                      <input
                        type="number"
                        name="fertilizer"
                        value={scenario.fertilizer}
                        onChange={handleScenarioChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#37acd0] focus:ring-4 focus:ring-[#37acd0]/10 transition-all duration-300 bg-white"
                        placeholder="e.g., +20 for 20% more fertilizer"
                        required
                      />
                    </div>

                    {/* Pesticides Change */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        🛡️ Pesticide Change (%)
                      </label>
                      <input
                        type="number"
                        name="pesticides"
                        value={scenario.pesticides}
                        onChange={handleScenarioChange}
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#37acd0] focus:ring-4 focus:ring-[#37acd0]/10 transition-all duration-300 bg-white"
                        placeholder="e.g., +5 or -15"
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={scenarioLoading || !formData.state || !formData.crop || !formData.year}
                      className="w-full bg-gradient-to-r from-[#37acd0] to-[#2b8ba8] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      whileHover={{ scale: (scenarioLoading || !formData.state || !formData.crop || !formData.year) ? 1 : 1.02 }}
                      whileTap={{ scale: (scenarioLoading || !formData.state || !formData.crop || !formData.year) ? 1 : 0.98 }}
                    >
                      {scenarioLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                          Running Simulation...
                        </div>
                      ) : (
                        "🚀 Run What-If Scenario"
                      )}
                    </motion.button>

                    {(!formData.state || !formData.crop || !formData.year) && (
                      <p className="text-sm text-gray-500 text-center">
                        Complete the basic analysis first to run scenarios
                      </p>
                    )}
                  </form>
                </div>
              </motion.div>

              {/* Scenario Results Display */}
              <motion.div variants={itemVariants}>
                <AnimatePresence>
                  {scenarioResult && (
                    <motion.div
                      variants={resultVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20"
                    >
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#f8d662] to-[#e6c556] rounded-xl flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-[#f8d662]">Simulation Results</h3>
                      </div>

                      {scenarioResult.error ? (
                        <div className="bg-[#e26c52]/10 border border-[#e26c52]/20 rounded-xl p-6">
                          <div className="flex items-center">
                            <svg className="w-6 h-6 text-[#e26c52] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[#e26c52] font-medium">{scenarioResult.error}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-br from-[#f8d662]/5 to-[#f8d662]/10 rounded-xl p-6 border border-[#f8d662]/20">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                            {JSON.stringify(scenarioResult, null, 2)}
                          </pre>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!scenarioResult && (
                  <motion.div
                    variants={itemVariants}
                    className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-dashed border-gray-300 text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <p className="text-gray-500">Your scenario simulation results will appear here</p>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default Insights;