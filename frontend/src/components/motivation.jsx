import React from "react";
import { motion } from "framer-motion";
import { Target, Heart, TrendingUp, Users, Lightbulb, Shield, Globe, Sprout } from "lucide-react";

const Motivation = () => {
  const points = [
    {
      icon: Target,
      title: "Our Aim",
      subtitle: "Smart Agricultural Intelligence",
      desc: "Build a comprehensive decision-support platform that predicts crop yields using 25+ years of environmental, soil, and agricultural data to empower informed farming decisions.",
      color: "bg-[#37acd0]",
      lightColor: "bg-[#37acd0]/10",
      borderColor: "border-[#37acd0]/20"
    },
    {
      icon: Heart,
      title: "Our Motivation", 
      subtitle: "Addressing Real Challenges",
      desc: "Climate change, unpredictable weather patterns, and resource scarcity demand intelligent agricultural practices. We're committed to securing India's food future through data-driven innovation.",
      color: "bg-[#e26c52]",
      lightColor: "bg-[#e26c52]/10", 
      borderColor: "border-[#e26c52]/20"
    },
    {
      icon: TrendingUp,
      title: "Our Impact",
      subtitle: "Transforming Agriculture",
      desc: "Empower farmers to maximize productivity, minimize losses, and help policymakers make evidence-based decisions for sustainable agricultural growth across India.",
      color: "bg-[#99b83b]",
      lightColor: "bg-[#99b83b]/10",
      borderColor: "border-[#99b83b]/20"
    }
  ];

  // Statistics for impact showcase
  const stats = [
    { number: "25+", label: "Years of Data", icon: "📊" },
    { number: "29", label: "Indian States", icon: "🗺️" },
    { number: "20+", label: "Major Crops", icon: "🌾" },
    { number: "1000s", label: "Districts Covered", icon: "📍" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.95 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="relative py-20 px-6 bg-gradient-to-br from-[#edebdf] via-white to-[#edebdf]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_25%_25%,#99b83b_2px,transparent_2px)] bg-[length:60px_60px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-6xl mb-6"
          >
            🌱
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-[#956346] mb-6 leading-tight">
            Why We Built
            <span className="block text-[#37acd0]">CropVision</span>
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-[#99b83b] to-[#37acd0] mx-auto rounded-full mb-6"></div>
          
          <p className="text-xl text-[#956346]/80 max-w-3xl mx-auto leading-relaxed">
            Bridging the gap between traditional farming wisdom and modern data science 
            to create a sustainable agricultural future for India.
          </p>
        </motion.div>

        {/* Main Content Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-8 md:gap-12 lg:grid-cols-3 mb-20"
        >
          {points.map((point, idx) => {
            const IconComponent = point.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.03, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className={`relative group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 ${point.borderColor} overflow-hidden`}
              >
                {/* Background Decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${point.lightColor} rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700`}></div>
                <div className={`absolute bottom-0 left-0 w-20 h-20 ${point.lightColor} rounded-full translate-y-10 -translate-x-10 group-hover:scale-125 transition-transform duration-700`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`inline-flex items-center justify-center w-16 h-16 ${point.color} rounded-xl mb-6 shadow-lg`}
                  >
                    <IconComponent className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Title & Subtitle */}
                  <h3 className="text-2xl font-bold text-[#956346] mb-2">
                    {point.title}
                  </h3>
                  <h4 className="text-lg font-semibold text-[#37acd0] mb-4">
                    {point.subtitle}
                  </h4>

                  {/* Description */}
                  <p className="text-[#956346]/80 leading-relaxed text-lg">
                    {point.desc}
                  </p>

                  {/* Decorative Element */}
                  <div className={`mt-6 h-1 w-16 ${point.color} rounded-full`}></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Impact Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-r from-[#956346] to-[#37acd0] rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Powered by Comprehensive Data
            </h3>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Our platform leverages decades of agricultural, climate, and soil data 
              to provide the most accurate predictions possible.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={statVariants}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="text-4xl mb-4 group-hover:animate-bounce"
                >
                  {stat.icon}
                </motion.div>
                <div className="text-3xl md:text-4xl font-bold mb-2 text-[#f8d662]">
                  {stat.number}
                </div>
                <div className="text-white/90 font-medium text-lg">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-[#f8d662]/10 rounded-2xl p-8 border-2 border-[#f8d662]/20">
            <h3 className="text-2xl md:text-3xl font-bold text-[#956346] mb-4">
              Ready to Transform Agriculture?
            </h3>
            <p className="text-[#956346]/80 text-lg mb-6 max-w-2xl mx-auto">
              Join thousands of farmers, researchers, and policymakers who trust CropVision 
              for data-driven agricultural decisions.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#37acd0] hover:bg-[#37acd0]/90 text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Explore Our Platform
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Motivation;