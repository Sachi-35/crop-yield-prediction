import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

// Import assets
import team1 from "./assets/team/team1.jpg";
import team2 from "./assets/team/team2.jpg";
import team3 from "./assets/team/team3.jpg";

// Import components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Hero from "./components/Hero";
import Motivation from "./components/Motivation";
import Team from "./components/Team";
import DecisionSupport from "./components/DecisionSupport";

// Import pages
import DescriptiveAnalysis from "./pages/DescriptiveAnalysis";
import PredictiveAnalysis from "./pages/PredictiveAnalysis";
import Insights from "./pages/Insights";
import Reports from "./pages/Reports";

// Import layouts
import MainLayout from "./layouts/MainLayout";

// Enhanced hook for handling section navigation with performance optimization
const useSectionNavigation = () => {
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  
  // Debounced scroll handler for better performance
  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    
    const sections = document.querySelectorAll("section[id]");
    let currentSection = "home";
    const scrollPosition = window.scrollY + 120; // Account for navbar height
    
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && 
          scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.id;
      }
    });
    
    setActiveSection(currentSection);
    
    // Clear scrolling state after delay
    setTimeout(() => setIsScrolling(false), 150);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const targetPosition = element.offsetTop - navbarHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
      
      // Update active section immediately for better UX
      setActiveSection(sectionId);
    }
  }, []);

  return { activeSection, scrollToSection, isScrolling };
};

// Enhanced Landing page component with integrated sections
const LandingPage = () => {
  const { scrollToSection, activeSection } = useSectionNavigation();
  
  // Team data with agricultural roles
  const teamMembers = [
    { 
      img: team1, 
      name: "Sachi", 
      role: "Frontend Developer",
      description: "Crafting farmer-friendly interfaces"
    },
    { 
      img: team2, 
      name: "Teammate A", 
      role: "Backend Developer",
      description: "Building robust data pipelines"
    },
    { 
      img: team3, 
      name: "Teammate B", 
      role: "ML Engineer",
      description: "Developing prediction algorithms"
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#edebdf] via-white to-[#edebdf] relative overflow-hidden">
      {/* Enhanced agricultural background with multiple layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary pattern layer */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23956346' fill-opacity='0.4'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='60' cy='20' r='1'/%3E%3Ccircle cx='20' cy='60' r='1'/%3E%3Ccircle cx='60' cy='60' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
        
        {/* Secondary wheat pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2399b83b' fill-opacity='0.3'%3E%3Cpath d='M50 15c-1.5 0-2.5 1-2.5 2.5v15c0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5v-15c0-1.5-1-2.5-2.5-2.5zm-15 10c-1 0-1.5 0.5-1.5 1.5v10c0 1 0.5 1.5 1.5 1.5s1.5-0.5 1.5-1.5v-10c0-1-0.5-1.5-1.5-1.5zm30 0c-1 0-1.5 0.5-1.5 1.5v10c0 1 0.5 1.5 1.5 1.5s1.5-0.5 1.5-1.5v-10c0-1-0.5-1.5-1.5-1.5z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}
        />
      </div>
      
      {/* Floating particles for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#99b83b] rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-30, 30, -30],
              x: [-15, 15, -15],
              scale: [0.5, 1.2, 0.5],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 2.5,
            }}
          />
        ))}
      </div>
      
      {/* Progress indicator for scroll */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#99b83b] to-[#37acd0] z-50 origin-left"
        style={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      
      {/* Content with enhanced section structure */}
      <main id="main-content" className="relative z-10">
        
        {/* Enhanced Hero Section */}
        <motion.section 
          id="home"
          className="text-center py-20 bg-gradient-to-r from-[#99b83b] via-[#37acd0] to-[#956346] text-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0.5, 1.5, 0.5],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-8"
            >
              <div className="text-7xl mb-4">🌱</div>
              <h1 className="text-6xl md:text-7xl font-bold font-serif mb-6 bg-gradient-to-r from-white to-[#f8d662] bg-clip-text text-transparent drop-shadow-lg">
                CropVision
              </h1>
              <div className="w-24 h-1 bg-[#f8d662] mx-auto mb-6 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white/90">
                Agricultural Intelligence Platform
              </h2>
              <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                AI-powered decision support for sustainable farming. Empowering farmers with 
                data-driven insights to maximize yield while minimizing environmental impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                onClick={() => scrollToSection('decision-support')}
                className="bg-white text-[#956346] px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#f8d662] hover:text-[#956346] transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started →
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('aim')}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-[#956346] transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>
        </motion.section>

        {/* Enhanced Motivation & Aim Section */}
        <motion.section 
          id="aim"
          className="py-20 px-6 bg-gradient-to-br from-white via-[#edebdf] to-white"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#956346] mb-4 font-serif">
                Our Mission
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#99b83b] to-[#37acd0] mx-auto mb-6 rounded-full"></div>
              <p className="text-xl text-[#956346]/80 max-w-3xl mx-auto">
                Bridging the gap between traditional farming wisdom and modern technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 25px 50px rgba(149, 99, 70, 0.15)"
                }}
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-3xl p-8 border border-[#99b83b]/20 hover:border-[#99b83b]/40 transition-all duration-500 group"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🎯</div>
                <h3 className="text-2xl font-semibold text-[#99b83b] mb-4 font-serif">Our Motivation</h3>
                <p className="text-[#956346]/90 leading-relaxed text-lg">
                  Empowering farmers with intelligent decision-making tools that combine 25+ years of 
                  agricultural data with cutting-edge AI. We believe in sustainable farming practices 
                  that maximize yield while preserving our environment for future generations.
                </p>
                <div className="mt-6 flex items-center text-[#99b83b] font-medium">
                  <span className="w-2 h-2 bg-[#99b83b] rounded-full mr-3"></span>
                  Data-driven insights for smarter farming
                </div>
              </motion.div>

              <motion.div
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 25px 50px rgba(55, 172, 208, 0.15)"
                }}
                className="bg-white/80 backdrop-blur-sm shadow-lg rounded-3xl p-8 border border-[#37acd0]/20 hover:border-[#37acd0]/40 transition-all duration-500 group"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">🚀</div>
                <h3 className="text-2xl font-semibold text-[#37acd0] mb-4 font-serif">Our Aim</h3>
                <p className="text-[#956346]/90 leading-relaxed text-lg">
                  Provide actionable insights through interactive simulations, predictive analytics, 
                  and comprehensive crop yield forecasting. Our platform makes complex agricultural 
                  data accessible and actionable for farmers, researchers, and policymakers.
                </p>
                <div className="mt-6 flex items-center text-[#37acd0] font-medium">
                  <span className="w-2 h-2 bg-[#37acd0] rounded-full mr-3"></span>
                  Interactive simulations & predictions
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Enhanced Decision Support Section */}
        <motion.section 
          id="decision-support"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <DecisionSupport />
        </motion.section>

        {/* Enhanced Team Section */}
        <motion.section 
          id="team"
          className="py-20 px-6 bg-gradient-to-br from-[#99b83b]/10 via-white to-[#37acd0]/10"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-[#956346] mb-4 font-serif">
                Meet Our Team
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#99b83b] to-[#37acd0] mx-auto mb-6 rounded-full"></div>
              <p className="text-xl text-[#956346]/80 max-w-3xl mx-auto">
                Passionate technologists dedicated to revolutionizing agriculture through innovation
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 25px 50px rgba(149, 99, 70, 0.15)"
                  }}
                  className="bg-white/90 backdrop-blur-sm shadow-lg rounded-3xl p-8 text-center border border-[#99b83b]/20 hover:border-[#99b83b]/40 transition-all duration-500 group"
                >
                  <motion.div
                    className="relative mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gradient-to-r from-[#99b83b] to-[#37acd0] shadow-xl">
                      <img
                        src={member.img}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-[#99b83b] to-[#37acd0] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm">✓</span>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-semibold text-[#956346] mb-2 font-serif">
                    {member.name}
                  </h3>
                  <p className="text-[#37acd0] font-medium text-lg mb-3">
                    {member.role}
                  </p>
                  <p className="text-[#956346]/70 text-sm leading-relaxed">
                    {member.description}
                  </p>
                  
                  <div className="mt-6 flex justify-center space-x-3">
                    {['💼', '🔗', '📧'].map((icon, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-gradient-to-r from-[#99b83b] to-[#37acd0] rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all duration-300"
                      >
                        {icon}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Enhanced loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Auto-close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Loading screen with agricultural theme
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#edebdf] to-[#99b83b]/10">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Agricultural loading spinner */}
          <motion.div
            className="w-20 h-20 border-4 border-[#99b83b]/20 border-t-[#99b83b] rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[#956346] mb-2 font-serif">
              CropVision
            </h2>
            <p className="text-[#956346]/70 text-lg">
              Cultivating Agricultural Intelligence...
            </p>
          </motion.div>
          
          {/* Loading dots */}
          <motion.div
            className="flex justify-center space-x-2 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-[#99b83b] rounded-full"
                animate={{ y: [-5, 5, -5] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="font-inter text-[#956346] antialiased bg-[#edebdf] selection:bg-[#99b83b] selection:text-white">
      {/* Enhanced CSS Variables and Global Styles */}
      <style jsx>{`
        :root {
          --primary-brown: #956346;
          --primary-blue: #37acd0;
          --accent-coral: #e26c52;
          --accent-yellow: #f8d662;
          --neutral-cream: #edebdf;
          --accent-green: #99b83b;
          --shadow-brown: rgba(149, 99, 70, 0.1);
          --shadow-green: rgba(153, 184, 59, 0.1);
        }
        
        /* Enhanced scrollbar with agricultural theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: linear-gradient(180deg, #edebdf 0%, rgba(237, 235, 223, 0.5) 100%);
          border-radius: 10px;
          border: 1px solid rgba(153, 184, 59, 0.1);
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #99b83b 0%, #956346 100%);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 2px 4px var(--shadow-brown);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #956346 0%, #99b83b 100%);
          box-shadow: 0 4px 8px var(--shadow-green);
        }

        /* Smooth focus transitions */
        * {
          transition: box-shadow 0.2s ease-in-out, transform 0.1s ease-in-out;
        }

        /* Enhanced focus styles for accessibility */
        :focus-visible {
          outline: 3px solid #f8d662;
          outline-offset: 3px;
          border-radius: 6px;
          box-shadow: 0 0 0 6px rgba(248, 214, 98, 0.2);
        }

        /* Better link styles */
        a:focus-visible {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Enhanced typography */
        .font-serif {
          font-family: 'Georgia', 'Times New Roman', serif;
        }

        /* Custom gradient text */
        .gradient-text {
          background: linear-gradient(135deg, #956346 0%, #99b83b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Global Navigation */}
      <Navbar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Enhanced Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
      />

      {/* Main Content with Enhanced Transitions */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Landing Page */}
          <Route 
            path="/" 
            element={
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ 
                  duration: 0.6, 
                  ease: [0.25, 0.46, 0.45, 0.94] // Custom agricultural easing
                }}
              >
                <LandingPage />
              </motion.div>
            } 
          />

          {/* Dashboard Pages with Enhanced Layout */}
          <Route 
            path="/descriptive-analysis" 
            element={
              <MainLayout>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 1.05 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <DescriptiveAnalysis />
                </motion.div>
              </MainLayout>
            } 
          />

          <Route 
            path="/predictive-analysis" 
            element={
              <MainLayout>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 1.05 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <PredictiveAnalysis />
                </motion.div>
              </MainLayout>
            } 
          />

          <Route 
            path="/insights" 
            element={
              <MainLayout>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 1.05 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Insights />
                </motion.div>
              </MainLayout>
            } 
          />

          <Route 
            path="/reports" 
            element={
              <MainLayout>
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 1.05 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Reports />
                </motion.div>
              </MainLayout>
            } 
          />
        </Routes>
      </AnimatePresence>

      {/* Enhanced Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4500,
          style: {
            background: 'rgba(237, 235, 223, 0.95)',
            color: '#956346',
            border: '2px solid #99b83b',
            borderRadius: '16px',
            fontSize: '14px',
            padding: '16px 20px',
            boxShadow: '0 20px 40px var(--shadow-brown), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            fontWeight: '500',
            maxWidth: '400px',
          },
          success: {
            style: {
              border: '2px solid #99b83b',
              background: 'linear-gradient(135deg, rgba(153, 184, 59, 0.1) 0%, rgba(237, 235, 223, 0.95) 100%)',
            },
            iconTheme: {
              primary: '#99b83b',
              secondary: '#edebdf',
            },
          },
          error: {
            style: {
              border: '2px solid #e26c52',
              background: 'linear-gradient(135deg, rgba(226, 108, 82, 0.1) 0%, rgba(237, 235, 223, 0.95) 100%)',
            },
            iconTheme: {
              primary: '#e26c52',
              secondary: '#edebdf',
            },
          },
          loading: {
            style: {
              border: '2px solid #37acd0',
              background: 'linear-gradient(135deg, rgba(55, 172, 208, 0.1) 0%, rgba(237, 235, 223, 0.95) 100%)',
            },
            iconTheme: {
              primary: '#37acd0',
              secondary: '#edebdf',
            },
          },
        }}
      />

      {/* Enhanced Back to Top Button */}
      <motion.button
        className="fixed bottom-8 right-8 bg-gradient-to-r from-[#99b83b] to-[#956346] text-white p-4 rounded-full shadow-lg z-40 hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#f8d662]/50 group backdrop-blur-sm border border-white/20"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={{ opacity: 0, scale: 0.5, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ 
          scale: 1.1, 
          boxShadow: "0 25px 50px var(--shadow-brown)",
          rotate: -5
        }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 12 
        }}
        aria-label="Back to top"
      >
        <motion.svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </motion.svg>
        
        {/* Enhanced tooltip */}
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-[#956346] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-lg">
          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#956346]"></div>
          Back to top
        </div>
      </motion.button>

      {/* Enhanced Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 bg-gradient-to-r from-[#37acd0] to-[#99b83b] text-white px-6 py-3 rounded-xl font-semibold z-50 focus:outline-none focus:ring-4 focus:ring-[#f8d662]/50 focus:ring-offset-2 shadow-xl transform transition-transform focus:scale-105"
      >
        Skip to main content
      </a>

      {/* Development indicators */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 text-xs text-[#956346]/50 bg-white/80 px-3 py-2 rounded-lg backdrop-blur-sm border border-[#99b83b]/20">
          <div>Route: <span className="font-mono">{location.pathname}</span></div>
          <div>Environment: <span className="text-[#99b83b]">Development</span></div>
        </div>
      )}
    </div>
  );
}

// Enhanced Wrapper with better error handling
const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;