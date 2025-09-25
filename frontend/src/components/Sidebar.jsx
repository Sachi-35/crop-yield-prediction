import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [activeSection, setActiveSection] = useState("home");
  const [isScrolling, setIsScrolling] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced navigation links with landing page sections and dashboard routes
  const landingPageLinks = [
    { 
      name: "Home", 
      href: "#home", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: "Welcome to CropVision"
    },
    { 
      name: "Our Mission", 
      href: "#aim", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Why we built this platform"
    },
    { 
      name: "Decision Support", 
      href: "#decision-support", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: "AI-powered crop insights"
    },
    { 
      name: "Our Team", 
      href: "#team", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: "Meet the experts"
    },
  ];

  // Dashboard/App navigation links
  const dashboardLinks = [
    { 
      name: "Descriptive Analysis", 
      route: "/descriptive-analysis", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: "Historical data visualization"
    },
    { 
      name: "Predictive Analysis", 
      route: "/predictive-analysis", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      description: "AI-powered yield forecasting"
    },
    { 
      name: "Insights", 
      route: "/insights", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      description: "Agricultural intelligence insights"
    },
    { 
      name: "Reports", 
      route: "/reports", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: "Generate comprehensive reports"
    },
  ];

  // Check if we're on landing page or dashboard
  const isLandingPage = location.pathname === "/";
  const currentLinks = isLandingPage ? landingPageLinks : dashboardLinks;

  // Performance-optimized scroll handler (only for landing page)
  const handleScroll = useCallback(() => {
    if (!isLandingPage) return;
    
    setIsScrolling(true);
    
    const sections = document.querySelectorAll("section[id]");
    let currentSection = "home";
    const scrollPosition = window.scrollY + 120;
    
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollPosition >= sectionTop && 
          scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.id;
      }
    });
    
    setActiveSection(currentSection);
    
    // Clear scrolling state
    setTimeout(() => setIsScrolling(false), 100);
  }, [isLandingPage]);

  // Enhanced scroll listener with RAF optimization (only for landing page)
  useEffect(() => {
    if (!isLandingPage) return;
    
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
  }, [handleScroll, isLandingPage]);

  // Set active section based on current route for dashboard pages
  useEffect(() => {
    if (!isLandingPage) {
      setActiveSection(location.pathname);
    }
  }, [location.pathname, isLandingPage]);

  // Enhanced navigation handler
  const handleNavigation = useCallback((item) => {
    if (item.href) {
      // Landing page section navigation
      const element = document.querySelector(item.href);
      if (element) {
        const navbarHeight = 80;
        const targetPosition = element.offsetTop - navbarHeight;
        
        // Immediate visual feedback
        setActiveSection(item.href.substring(1));
        
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
        });
        
        // Auto-close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
          setTimeout(() => setIsOpen(false), 500);
        }
      }
    } else if (item.route) {
      // Dashboard route navigation
      navigate(item.route);
      setActiveSection(item.route);
      
      // Auto-close sidebar on mobile after navigation
      if (window.innerWidth < 1024) {
        setTimeout(() => setIsOpen(false), 300);
      }
    }
  }, [navigate, setIsOpen]);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.sidebar-container') && 
          !event.target.closest('[data-sidebar-toggle]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Sidebar animation variants
  const sidebarVariants = {
    hidden: {
      x: -320,
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4,
        staggerChildren: 0.1,
      }
    },
    exit: {
      x: -320,
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
        duration: 0.3,
      }
    }
  };

  const linkVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      }
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <AnimatePresence>
        {(isOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.div 
            className="sidebar-container fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-[#956346] via-[#956346] to-[#8a5a40] text-white shadow-2xl flex flex-col z-50"
            variants={sidebarVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Agricultural pattern overlay */}
            <div 
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23edebdf' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}
            />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Header with Logo */}
              <motion.div 
                className="p-8 border-b border-[#b58a72]/30"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  {/* Enhanced logo */}
                  <motion.div 
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#edebdf] to-[#99b83b] flex items-center justify-center shadow-lg cursor-pointer"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    onClick={() => navigate('/')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#956346]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                    </svg>
                  </motion.div>
                  
                  <div>
                    <motion.h2 
                      className="text-2xl font-bold bg-gradient-to-r from-[#edebdf] to-[#f8d662] bg-clip-text text-transparent cursor-pointer"
                      onClick={() => navigate('/')}
                      whileHover={{ scale: 1.02 }}
                    >
                      CropVision
                    </motion.h2>
                    <p className="text-sm text-[#edebdf]/70 font-medium">
                      Agricultural Intelligence
                    </p>
                  </div>
                </div>

                {/* Page indicator */}
                <div className="text-xs text-[#edebdf]/60 bg-[#b58a72]/20 px-3 py-1 rounded-full inline-block">
                  {isLandingPage ? "Landing Page" : "Dashboard"}
                </div>

                {/* Close button for mobile */}
                <motion.button
                  className="lg:hidden absolute top-6 right-6 p-2 rounded-lg bg-[#b58a72]/20 hover:bg-[#b58a72]/40 transition-colors"
                  onClick={() => setIsOpen(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close navigation"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>
              
              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-6 space-y-2">
                <motion.div
                  variants={linkVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-xs uppercase tracking-wider text-[#edebdf]/60 font-semibold mb-4 px-4">
                    {isLandingPage ? "Navigation" : "Analytics Dashboard"}
                  </p>
                </motion.div>

                {currentLinks.map((link, idx) => {
                  const isActive = isLandingPage 
                    ? activeSection === (link.href ? link.href.substring(1) : '')
                    : activeSection === link.route;
                  
                  return (
                    <motion.div
                      key={idx}
                      variants={linkVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.3 + idx * 0.1 }}
                    >
                      <motion.button
                        onClick={() => handleNavigation(link)}
                        className={`w-full group relative flex items-center space-x-4 rounded-xl px-4 py-4 transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-[#edebdf] to-[#f8d662] text-[#956346] shadow-lg"
                            : "text-[#edebdf] hover:bg-[#b58a72]/20 hover:text-white"
                        }`}
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`Navigate to ${link.name}`}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#956346] rounded-r-full"
                            layoutId="activeIndicator"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                        
                        {/* Icon container */}
                        <motion.div
                          className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                            isActive 
                              ? "bg-[#956346]/10" 
                              : "bg-[#b58a72]/20 group-hover:bg-[#99b83b]/20"
                          }`}
                          whileHover={{ scale: 1.1 }}
                        >
                          {link.icon}
                        </motion.div>
                        
                        {/* Text content */}
                        <div className="flex-1 text-left">
                          <div className={`font-semibold ${
                            isActive ? "text-[#956346]" : "text-current"
                          }`}>
                            {link.name}
                          </div>
                          <div className={`text-xs mt-0.5 ${
                            isActive 
                              ? "text-[#956346]/70" 
                              : "text-[#edebdf]/60 group-hover:text-[#edebdf]/80"
                          }`}>
                            {link.description}
                          </div>
                        </div>

                        {/* Chevron indicator */}
                        <motion.svg
                          className={`w-4 h-4 transition-transform ${
                            isActive ? "text-[#956346]" : "text-[#edebdf]/40"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ x: isActive ? 2 : 0 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </motion.svg>
                      </motion.button>
                    </motion.div>
                  );
                })}

                {/* Divider and cross-navigation */}
                {!isLandingPage && (
                  <>
                    <div className="border-t border-[#b58a72]/30 my-4"></div>
                    <motion.div
                      variants={linkVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.7 }}
                    >
                      <motion.button
                        onClick={() => navigate('/')}
                        className="w-full group flex items-center space-x-4 rounded-xl px-4 py-3 text-[#edebdf]/80 hover:bg-[#b58a72]/20 hover:text-white transition-all duration-200"
                        whileHover={{ x: 4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex-shrink-0 p-2 rounded-lg bg-[#b58a72]/20 group-hover:bg-[#99b83b]/20 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </div>
                        <span className="font-medium">Back to Home</span>
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </nav>
              
              {/* Enhanced Footer */}
              <motion.div 
                className="p-6 border-t border-[#b58a72]/30 bg-gradient-to-r from-[#8a5a40]/20 to-transparent"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {/* Status indicator */}
                <div className="flex items-center space-x-3 mb-4">
                  <motion.div
                    className="w-2 h-2 bg-[#99b83b] rounded-full"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-xs text-[#edebdf]/80 font-medium">
                    System Online
                  </span>
                </div>
                
                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#f8d662]">28</div>
                    <div className="text-xs text-[#edebdf]/60">States</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#99b83b]">30</div>
                    <div className="text-xs text-[#edebdf]/60">Crops</div>
                  </div>
                </div>
                
                <div className="text-xs text-[#edebdf]/50 text-center leading-relaxed">
                  Empowering farmers with<br />
                  <span className="text-[#f8d662] font-medium">data-driven insights</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;