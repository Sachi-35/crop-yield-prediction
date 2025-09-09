import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sprout, BarChart3, Users, Target } from "lucide-react";

const Hero = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const floatingAnimation = {
    y: [-10, 10],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* Dynamic Background with your agricultural colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#99b83b] via-[#37acd0] to-[#956346]">
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 left-10 w-32 h-32 rounded-full bg-[#f8d662]/20 blur-xl"
        />
        <motion.div
          animate={{...floatingAnimation, transition: {...floatingAnimation.transition, delay: 1}}}
          className="absolute bottom-40 right-20 w-48 h-48 rounded-full bg-[#e26c52]/15 blur-2xl"
        />
        <motion.div
          animate={{...floatingAnimation, transition: {...floatingAnimation.transition, delay: 2}}}
          className="absolute top-40 right-32 w-24 h-24 rounded-full bg-[#edebdf]/30 blur-lg"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate={mounted ? "animate" : "initial"}
          className="space-y-8"
        >
          {/* Main Headline */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <motion.div
              animate={floatingAnimation}
              className="inline-block text-8xl mb-4"
            >
              🌾
            </motion.div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
              <span className="bg-gradient-to-r from-[#f8d662] to-[#edebdf] bg-clip-text text-transparent">
                CropVision
              </span>
            </h1>
            <div className="h-2 w-24 bg-[#f8d662] mx-auto rounded-full shadow-lg"></div>
          </motion.div>

          {/* Subtitle */}
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl md:text-3xl font-semibold text-[#edebdf] max-w-4xl mx-auto leading-relaxed"
          >
            Empowering India's Agriculture with
            <span className="text-[#f8d662]"> Data-Driven Intelligence</span>
          </motion.h2>

          {/* Description */}
          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Predict crop yields, optimize farming decisions, and ensure sustainable agriculture 
            with 25+ years of comprehensive agricultural data from across India.
          </motion.p>

          {/* Feature highlights */}
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-[#f8d662]/20 backdrop-blur-sm border border-[#f8d662]/30">
                <Sprout className="w-6 h-6 text-[#f8d662]" />
              </div>
              <span className="text-white/90 font-medium">25+ Years Data</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-[#37acd0]/20 backdrop-blur-sm border border-[#37acd0]/30">
                <BarChart3 className="w-6 h-6 text-[#37acd0]" />
              </div>
              <span className="text-white/90 font-medium">Smart Analytics</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-[#99b83b]/20 backdrop-blur-sm border border-[#99b83b]/30">
                <Target className="w-6 h-6 text-[#99b83b]" />
              </div>
              <span className="text-white/90 font-medium">Precise Predictions</span>
            </div>
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 rounded-full bg-[#e26c52]/20 backdrop-blur-sm border border-[#e26c52]/30">
                <Users className="w-6 h-6 text-[#e26c52]" />
              </div>
              <span className="text-white/90 font-medium">Farmer-Friendly</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(248, 214, 98, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              className="group px-8 py-4 bg-[#f8d662] text-[#956346] font-bold text-lg rounded-full shadow-xl hover:bg-[#f8d662]/90 transition-all duration-300 flex items-center gap-2"
            >
              Start Exploring
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDown className="w-5 h-5 rotate-[-90deg]" />
              </motion.div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold text-lg rounded-full backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div 
            variants={fadeInUp}
            className="pt-12 space-y-4"
          >
            <p className="text-white/70 text-sm font-medium">Trusted by farmers, researchers, and policymakers</p>
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/60">
              <span className="text-sm font-medium">🏛️ Government Data</span>
              <span className="text-sm font-medium">🔬 Research Validated</span>
              <span className="text-sm font-medium">📱 Mobile Friendly</span>
              <span className="text-sm font-medium">♿ Accessible</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center text-white/80 cursor-pointer hover:text-white transition-colors"
        >
          <span className="text-sm font-medium mb-2">Scroll to explore</span>
          <ArrowDown className="w-6 h-6" />
        </motion.div>
      </motion.div>

      {/* Accessibility improvements */}
      <div className="sr-only">
        <h1>CropVision - Agricultural Intelligence Platform</h1>
        <p>Predict crop yields and optimize farming decisions with data-driven insights</p>
      </div>
    </section>
  );
};

export default Hero;