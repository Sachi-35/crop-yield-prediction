import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Filter, 
  Calendar, 
  MapPin, 
  Wheat,
  Activity,
  PieChart,
  GitBranch
} from 'lucide-react';

const DescriptiveAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edebdf] via-white to-[#edebdf] p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#956346] mb-2 font-serif">
              Descriptive Analysis
            </h1>
            <p className="text-lg text-[#956346]/70">
              Explore 25+ years of Indian agricultural data (1997-2020)
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-[#99b83b] to-[#37acd0] mt-4 rounded-full"></div>
          </div>
          
          {/* Quick Stats */}
          <motion.div 
            className="hidden md:flex space-x-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#99b83b]/20"
            >
              <div className="text-2xl font-bold text-[#99b83b]">28</div>
              <div className="text-sm text-[#956346]/70">States</div>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#37acd0]/20"
            >
              <div className="text-2xl font-bold text-[#37acd0]">30</div>
              <div className="text-sm text-[#956346]/70">Crops</div>
            </motion.div>
            <motion.div 
              variants={itemVariants}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-[#f8d662]/20"
            >
              <div className="text-2xl font-bold text-[#956346]">24</div>
              <div className="text-sm text-[#956346]/70">Years</div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 xl:grid-cols-4 gap-6"
      >
        
        {/* Filters Section */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-1 space-y-6"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#99b83b]/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="p-2 bg-[#99b83b] rounded-lg"
              >
                <Filter className="w-5 h-5 text-white" />
              </motion.div>
              <h2 className="text-xl font-semibold text-[#956346] font-serif">Filters</h2>
            </div>

            {/* Filter Placeholders */}
            <div className="space-y-4">
              {/* State Filter */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-[#99b83b]/30 rounded-xl p-4 bg-[#99b83b]/5"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#99b83b]" />
                  <span className="font-medium text-[#956346]">State Selection</span>
                </div>
                <div className="h-10 bg-gradient-to-r from-[#99b83b]/20 to-[#37acd0]/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-[#956346]/60">Multi-select dropdown</span>
                </div>
              </motion.div>

              {/* Crop Filter */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-[#37acd0]/30 rounded-xl p-4 bg-[#37acd0]/5"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Wheat className="w-4 h-4 text-[#37acd0]" />
                  <span className="font-medium text-[#956346]">Crop Selection</span>
                </div>
                <div className="h-10 bg-gradient-to-r from-[#37acd0]/20 to-[#f8d662]/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-[#956346]/60">Crop categories</span>
                </div>
              </motion.div>

              {/* Year Range Filter */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="border-2 border-dashed border-[#f8d662]/30 rounded-xl p-4 bg-[#f8d662]/5"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#956346]" />
                  <span className="font-medium text-[#956346]">Year Range</span>
                </div>
                <div className="h-10 bg-gradient-to-r from-[#f8d662]/20 to-[#99b83b]/20 rounded-lg flex items-center justify-center">
                  <span className="text-sm text-[#956346]/60">1997 - 2020</span>
                </div>
              </motion.div>

              {/* Apply Filters Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-[#99b83b] to-[#37acd0] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Apply Filters
              </motion.button>
            </div>
          </div>

          {/* Quick Actions */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#37acd0]/20 p-6"
          >
            <h3 className="text-lg font-semibold text-[#956346] mb-4 font-serif">Quick Actions</h3>
            <div className="space-y-3">
              {['Export Data', 'Save View', 'Share Report'].map((action, index) => (
                <motion.button
                  key={action}
                  whileHover={{ x: 5 }}
                  className="w-full text-left p-3 rounded-lg bg-gradient-to-r from-[#edebdf] to-white hover:from-[#99b83b]/10 hover:to-[#37acd0]/10 transition-all duration-300 text-[#956346] border border-transparent hover:border-[#99b83b]/20"
                >
                  {action}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-2 space-y-6"
        >
          {/* Primary Chart */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#37acd0]/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  variants={pulseVariants}
                  animate="pulse"
                  className="p-2 bg-[#37acd0] rounded-lg"
                >
                  <BarChart3 className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-semibold text-[#956346] font-serif">Yield Trends</h2>
              </div>
              <div className="flex space-x-2">
                {['Bar', 'Line', 'Area'].map((type) => (
                  <button
                    key={type}
                    className="px-3 py-1 text-sm rounded-lg bg-[#edebdf] text-[#956346] hover:bg-[#99b83b] hover:text-white transition-all duration-300"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Chart Placeholder */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="h-80 border-2 border-dashed border-[#37acd0]/30 rounded-xl bg-gradient-to-br from-[#37acd0]/5 via-white to-[#99b83b]/5 flex flex-col items-center justify-center relative overflow-hidden"
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl mb-4"
              >
                📊
              </motion.div>
              <h3 className="text-lg font-semibold text-[#956346] mb-2">Interactive Chart Area</h3>
              <p className="text-sm text-[#956346]/60 text-center max-w-md">
                Time series visualization of crop yields across states and years
              </p>
              
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-[#37acd0]/20 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      scale: [0.5, 1.5, 0.5],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Secondary Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Production Distribution */}
            <motion.div
              variants={itemVariants}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#99b83b]/20 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 bg-[#99b83b] rounded-lg"
                >
                  <PieChart className="w-5 h-5 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-[#956346] font-serif">Distribution</h3>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="h-48 border-2 border-dashed border-[#99b83b]/30 rounded-xl bg-[#99b83b]/5 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="text-4xl mb-2"
                >
                  🥧
                </motion.div>
                <span className="text-sm text-[#956346]/60">Crop distribution charts</span>
              </motion.div>
            </motion.div>

            {/* Growth Metrics */}
            <motion.div
              variants={itemVariants}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#f8d662]/20 p-6"
            >
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  variants={pulseVariants}
                  animate="pulse"
                  className="p-2 bg-[#956346] rounded-lg"
                >
                  <TrendingUp className="w-5 h-5 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-[#956346] font-serif">Growth Rate</h3>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="h-48 border-2 border-dashed border-[#f8d662]/30 rounded-xl bg-[#f8d662]/5 flex flex-col items-center justify-center"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-4xl mb-2"
                >
                  📈
                </motion.div>
                <span className="text-sm text-[#956346]/60">YoY growth analysis</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Correlation Plots Section */}
        <motion.div
          variants={itemVariants}
          className="xl:col-span-1 space-y-6"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#e26c52]/20 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-[#e26c52] rounded-lg"
              >
                <GitBranch className="w-5 h-5 text-white" />
              </motion.div>
              <h2 className="text-xl font-semibold text-[#956346] font-serif">Correlations</h2>
            </div>

            {/* Correlation Matrix */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="h-64 border-2 border-dashed border-[#e26c52]/30 rounded-xl bg-gradient-to-br from-[#e26c52]/5 to-[#f8d662]/5 flex flex-col items-center justify-center mb-6 relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl mb-3"
              >
                🔗
              </motion.div>
              <h3 className="font-semibold text-[#956346] mb-2">Correlation Matrix</h3>
              <p className="text-xs text-[#956346]/60 text-center">
                Variable relationships
              </p>
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 opacity-10">
                <div className="grid grid-cols-4 grid-rows-4 h-full w-full">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="border border-[#e26c52]/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Scatter Plot */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="h-48 border-2 border-dashed border-[#37acd0]/30 rounded-xl bg-[#37acd0]/5 flex flex-col items-center justify-center relative"
            >
              <motion.div
                animate={{ x: [-5, 5, -5], y: [-3, 3, -3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-4xl mb-2"
              >
                🎯
              </motion.div>
              <span className="text-sm font-medium text-[#956346] mb-1">Scatter Plot</span>
              <span className="text-xs text-[#956346]/60">Yield vs Factors</span>
              
              {/* Animated dots */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-[#37acd0] rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      scale: [0.5, 1.2, 0.5],
                      opacity: [0.4, 0.8, 0.4],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Summary Statistics */}
          <motion.div
            variants={itemVariants}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-[#99b83b]/20 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-[#99b83b]" />
              <h3 className="text-lg font-semibold text-[#956346] font-serif">Statistics</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { label: 'Mean Yield', value: '---', color: 'bg-[#99b83b]' },
                { label: 'Std Dev', value: '---', color: 'bg-[#37acd0]' },
                { label: 'Max Yield', value: '---', color: 'bg-[#f8d662]' },
                { label: 'Growth Rate', value: '---', color: 'bg-[#e26c52]' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#edebdf]/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                    <span className="text-sm font-medium text-[#956346]">{stat.label}</span>
                  </div>
                  <span className="text-sm text-[#956346]/70 font-mono">{stat.value}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DescriptiveAnalysis;