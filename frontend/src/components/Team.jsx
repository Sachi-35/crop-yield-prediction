import React from "react";
import { motion } from "framer-motion";
import { Code, Database, Cpu, BarChart3, Github, Linkedin, Mail, MapPin } from "lucide-react";

const Team = () => {
  const members = [
    { 
      name: "Sachi Singh", 
      role: "Frontend Developer & UI/UX Designer", 
      img: "https://via.placeholder.com/200x200/956346/FFFFFF?text=SS",
      bio: "Passionate about creating farmer-friendly interfaces that make complex agricultural data accessible and actionable.",
      expertise: ["React Development", "Agricultural UX", "Data Visualization", "Responsive Design"],
      icon: Code,
      color: "bg-[#37acd0]",
      lightColor: "bg-[#37acd0]/10",
      borderColor: "border-[#37acd0]/30"
    },
    { 
      name: "Agricultural Data Specialist", 
      role: "Backend Developer & Data Scientist", 
      img: "https://via.placeholder.com/200x200/99b83b/FFFFFF?text=AD",
      bio: "Expert in processing vast agricultural datasets and building robust prediction models for crop yield analysis.",
      expertise: ["Python/Django", "Machine Learning", "Agricultural Analytics", "API Development"],
      icon: Database,
      color: "bg-[#99b83b]",
      lightColor: "bg-[#99b83b]/10",
      borderColor: "border-[#99b83b]/30"
    },
  ];

  // Team stats
  const teamStats = [
    { number: "2+", label: "Dedicated Developers", icon: "👥" },
    { number: "100+", label: "Hours of Research", icon: "🔬" },
    { number: "25+", label: "Years Data Analyzed", icon: "📊" },
    { number: "∞", label: "Passion for Agriculture", icon: "❤️" }
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
      rotateY: -15 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const skillVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 10 
      }
    }
  };

  return (
    <section className="relative py-20 px-6 bg-gradient-to-br from-white via-[#edebdf]/30 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-40 h-40 bg-[#f8d662]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 bg-[#99b83b]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-[#37acd0]/10 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
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
              rotate: [0, 5, -5, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-6xl mb-6"
          >
            👥
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-[#956346] mb-6 leading-tight">
            Meet the
            <span className="block text-[#37acd0]">CropVision Team</span>
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-[#37acd0] to-[#99b83b] mx-auto rounded-full mb-6"></div>
          
          <p className="text-xl text-[#956346]/80 max-w-3xl mx-auto leading-relaxed">
            Passionate developers and agricultural enthusiasts working together to revolutionize 
            farming through intelligent data analysis and farmer-friendly technology.
          </p>
        </motion.div>

        {/* Team Members */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-12 lg:grid-cols-2 mb-20 max-w-5xl mx-auto"
        >
          {members.map((member, idx) => {
            const IconComponent = member.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className={`relative group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 ${member.borderColor} overflow-hidden`}
              >
                {/* Background Decoration */}
                <div className={`absolute top-0 right-0 w-40 h-40 ${member.lightColor} rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 transition-transform duration-700`}></div>
                <div className={`absolute bottom-0 left-0 w-24 h-24 ${member.lightColor} rounded-full translate-y-12 -translate-x-12 group-hover:scale-125 transition-transform duration-700`}></div>
                
                <div className="relative z-10">
                  {/* Profile Image & Icon */}
                  <div className="flex items-start gap-6 mb-6">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <img
                        src={member.img}
                        alt={member.name}
                        className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white"
                      />
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`absolute -bottom-2 -right-2 w-10 h-10 ${member.color} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </motion.div>
                    </motion.div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#956346] mb-2">
                        {member.name}
                      </h3>
                      <p className="text-lg font-semibold text-[#37acd0] mb-3">
                        {member.role}
                      </p>
                      <p className="text-[#956346]/80 leading-relaxed">
                        {member.bio}
                      </p>
                    </div>
                  </div>

                  {/* Expertise Tags */}
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-[#956346]/60 uppercase tracking-wide mb-3">
                      Expertise
                    </h4>
                    <motion.div 
                      variants={containerVariants}
                      className="flex flex-wrap gap-2"
                    >
                      {member.expertise.map((skill, skillIdx) => (
                        <motion.span
                          key={skillIdx}
                          variants={skillVariants}
                          whileHover={{ scale: 1.05 }}
                          className={`px-3 py-2 ${member.lightColor} text-[#956346] rounded-full text-sm font-medium border ${member.borderColor} hover:shadow-md transition-all duration-300`}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>

                  {/* Social Links Placeholder */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-[#956346]/10 hover:bg-[#956346]/20 rounded-lg transition-colors duration-300"
                    >
                      <Github className="w-5 h-5 text-[#956346]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-[#37acd0]/10 hover:bg-[#37acd0]/20 rounded-lg transition-colors duration-300"
                    >
                      <Linkedin className="w-5 h-5 text-[#37acd0]" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 bg-[#99b83b]/10 hover:bg-[#99b83b]/20 rounded-lg transition-colors duration-300"
                    >
                      <Mail className="w-5 h-5 text-[#99b83b]" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-[#956346] to-[#99b83b] rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Our Development Journey
            </h3>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Building CropVision with dedication, research, and a deep commitment 
              to transforming Indian agriculture through technology.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {teamStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
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
          </div>
        </motion.div>

        {/* Join Us Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-[#37acd0]/10 rounded-2xl p-8 border-2 border-[#37acd0]/20">
            <h3 className="text-2xl md:text-3xl font-bold text-[#956346] mb-4">
              Want to Contribute?
            </h3>
            <p className="text-[#956346]/80 text-lg mb-6 max-w-2xl mx-auto">
              We welcome collaboration from developers, agricultural experts, and anyone 
              passionate about leveraging technology for sustainable farming.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-[#37acd0] hover:bg-[#37acd0]/90 text-white font-bold px-8 py-4 rounded-full text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get in Touch
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Team;