import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Leaf, Droplets, Sun, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const features = [
    {
      icon: BarChart3,
      title: "Descriptive Analysis",
      description: "Visualize crop data, explore correlations of yield with different factors, and understand patterns in yield, rainfall, and fertilizer usage.",
      color: "#956346",
      link: "/descriptive"
    },
    {
      icon: TrendingUp,
      title: "Predictive Analysis",
      description: "Leverage machine learning models to forecast crop yields, growth trends, and optimize agricultural inputs for maximum productivity.",
      color: "#37acd0",
      link: "/predictive"
    }
  ];

  const stats = [
    { icon: Leaf, label: "Crop Types", value: "22+", color: "#99b83b" },
    { icon: Droplets, label: "Data Points", value: "10K+", color: "#37acd0" },
    { icon: Sun, label: "States Covered", value: "All India", color: "#f8d662" },
    { icon: Activity, label: "ML Accuracy", value: "92%+", color: "#e26c52" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#956346' }}>
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: '#956346' }}>CropVision</h1>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6 leading-tight" style={{ color: '#956346' }}>
              CropVision: Intelligent Yield Analysis & Optimization Platform
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Harness the power of AI and Machine Learning to analyze crop patterns, predict yields, and make informed decisions for sustainable farming.
            </p>
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/descriptive"
                  className="px-8 py-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  style={{ backgroundColor: '#956346' }}
                >
                  Explore Data
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/predictive"
                  className="px-8 py-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  style={{ backgroundColor: '#956346'}}
                >
                  Get Predictions
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg"
                >
                  <stat.icon className="w-8 h-8 mb-3" style={{ color: stat.color }} />
                  <div className="text-3xl font-bold mb-1" style={{ color: '#956346' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-4xl font-bold mb-4" style={{ color: '#956346' }}>
            Powerful Analytics Tools
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the right tool for your agricultural insights
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <motion.a
              key={idx}
              href={feature.link}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all cursor-pointer"
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: feature.color + '20' }}
              >
                <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
              </div>
              <h4 className="text-2xl font-bold mb-4" style={{ color: '#956346' }}>
                {feature.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-6 flex items-center gap-2 font-semibold" style={{ color: feature.color }}>
                Learn More
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold mb-4" style={{ color: '#956346' }}>
              How Does CropVision Work?
            </h3>
            <p className="text-xl text-gray-600">
              Follow these three simple steps to get insights:
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Select Insight Type", desc: "Choose between descriptive insights or predictive forecasting" },
              { step: "02", title: "Filter Your Data", desc: "Customize data shown by state, season, crop type, and year range" },
              { step: "03", title: "Get Insights", desc: "Visualize data and patterns or receive ML-powered yield predictions" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
                className="text-center"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white"
                  style={{ backgroundColor: '#956346' }}
                >
                  {item.step}
                </div>
                <h4 className="text-xl font-bold mb-3" style={{ color: '#956346' }}>
                  {item.title}
                </h4>
                <p className="text-gray-600">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#956346' }}>
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">CropVision</span>
          </div>
          <p className="text-gray-400 mb-6">
            Empowering farmers with data-driven insights so they can make informed decisions.
          </p>
          <div className="text-sm text-gray-500">
            © 2025 CropVision
          </div>
        </div>
      </footer>
    </div>
  );
}