import React from "react";
import { motion } from "framer-motion";

function PredictiveAnalysis() {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-[#edebdf] via-[#f8f6f0] to-[#edebdf] p-6"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute inset-0 bg-[url('data:image/svg+xml,...')] bg-repeat"
        ></div>
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

        {/* Filters Section */}
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
            
            <div className="bg-gradient-to-br from-[#37acd0]/5 to-[#37acd0]/10 rounded-2xl p-8 border border-[#37acd0]/10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4H3m16 8H1m18 4H3" />
                  </svg>
                </div>
              </div>
              
              <p className="text-gray-500 text-center text-lg mb-4">
                Advanced filtering system coming soon
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
                <div className="bg-white/50 rounded-xl p-4 text-center border border-gray-200">
                  <div className="font-medium text-[#956346] mb-1">State Selection</div>
                  <div>19+ Indian states</div>
                </div>
                <div className="bg-white/50 rounded-xl p-4 text-center border border-gray-200">
                  <div className="font-medium text-[#99b83b] mb-1">Crop Types</div>
                  <div>24+ major crops</div>
                </div>
                <div className="bg-white/50 rounded-xl p-4 text-center border border-gray-200">
                  <div className="font-medium text-[#37acd0] mb-1">Time Range</div>
                  <div>1997-2030</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Prediction Results Section */}
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
            
            <div className="bg-gradient-to-br from-[#99b83b]/5 to-[#99b83b]/10 rounded-2xl p-8 border border-[#99b83b]/10">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <p className="text-gray-500 text-center text-lg mb-4">
                Interactive prediction dashboard in development
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-[#956346] mb-3">Yield Forecasts</h4>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Machine learning predictions</li>
                    <li>• Confidence intervals</li>
                    <li>• Historical comparisons</li>
                    <li>• Trend analysis</li>
                  </ul>
                </div>
                
                <div className="bg-white/50 rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-[#99b83b] mb-3">Visual Analytics</h4>
                  <ul className="text-sm text-gray-500 space-y-2">
                    <li>• Interactive charts</li>
                    <li>• Heat maps</li>
                    <li>• Time series plots</li>
                    <li>• Correlation matrices</li>
                  </ul>
                </div>
              </div>
            </div>
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
                Interactive scenario simulation tools coming soon
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
                  <p className="text-sm text-gray-500">Adjust precipitation levels and see yield changes</p>
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
                  <p className="text-sm text-gray-500">Optimize N-P-K levels for maximum efficiency</p>
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
                  <p className="text-sm text-gray-500">Balance protection with environmental impact</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Development Status Banner */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-[#956346]/10 to-[#37acd0]/10 rounded-2xl p-6 border-2 border-dashed border-[#99b83b]/30 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-[#99b83b] to-[#37acd0] rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-[#956346]">Development in Progress</h4>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This page is currently being developed with advanced ML models and interactive features. 
            The complete predictive analysis tools will be available soon with real-time data integration.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PredictiveAnalysis;