import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home as HomeIcon, ArrowLeft, Leaf } from 'lucide-react';
import Home from './components/Home';
import DescriptiveAnalysis from './components/DescriptiveAnalysis';
import PredictiveAnalysis from './components/PredictiveAnalysis';

// Floating Navigation Component (shows on analysis pages)
function FloatingNav() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="fixed top-6 left-6 z-50"
    >
      <Link to="/">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/20"
          style={{ backgroundColor: 'rgba(149, 99, 70, 0.95)' }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">Back to Home</span>
        </motion.button>
      </Link>
    </motion.div>
  );
}

// CropVision Logo (shows on analysis pages)
function FloatingLogo() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed top-6 right-6 z-50"
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg border border-gray-200">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: '#956346' }}
        >
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold" style={{ color: '#956346' }}>
          CropVision
        </span>
      </div>
    </motion.div>
  );
}

// Page transition wrapper
function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Main App Component
function App() {
  return (
      <div className="min-h-screen">
        {/* Floating Navigation (Back to Home button) */}
        <FloatingNav />
        
        {/* Floating Logo on analysis pages */}
        <FloatingLogo />

        {/* Page Routes with Transitions */}
        <Routes>
          <Route
            path="/"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />
          <Route
            path="/descriptive"
            element={
              <PageTransition>
                <DescriptiveAnalysis />
              </PageTransition>
            }
          />
          <Route
            path="/predictive"
            element={
              <PageTransition>
                <PredictiveAnalysis />
              </PageTransition>
            }
          />
          {/* 404 Page */}
          <Route
            path="*"
            element={
              <PageTransition>
                <NotFound />
              </PageTransition>
            }
          />
        </Routes>
      </div>
  );
}

// 404 Not Found Page
function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-9xl mb-6"
        >
          🌾
        </motion.div>
        <h1 className="text-6xl font-bold mb-4" style={{ color: '#956346' }}>
          404
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Oops! This field is empty
        </p>
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-lg text-white font-semibold shadow-lg flex items-center gap-3 mx-auto"
            style={{ backgroundColor: '#956346' }}
          >
            <HomeIcon className="w-5 h-5" />
            Return to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}

export default App;