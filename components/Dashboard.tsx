
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool, Calculator, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] bg-dark-900 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Welcome to KABS
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          The professional platform for interior designers. Select a module to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Annotation Module */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="group relative bg-dark-800 border border-dark-700 rounded-2xl p-8 cursor-pointer overflow-hidden hover:border-brand-500/50 transition-all"
          onClick={() => navigate('/projects')}
        >
          <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center mb-6 text-brand-500 group-hover:scale-110 transition-transform">
            <PenTool size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Annotation</h2>
          <p className="text-gray-400 mb-6">
            Upload floor plans, add measurements, and annotate designs with professional tools.
          </p>
          <div className="flex items-center text-brand-500 font-medium">
            Open Projects <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Pricing AI Module */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="group relative bg-dark-800 border border-dark-700 rounded-2xl p-8 cursor-pointer overflow-hidden hover:border-purple-500/50 transition-all"
          onClick={() => navigate('/pricing-ai')}
        >
          <div className="absolute top-4 right-4 bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
            Coming Soon
          </div>
          <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
            <Calculator size={24} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pricing AI Agent</h2>
          <p className="text-gray-400 mb-6">
            Intelligent agent that estimates projects from PDF and Excel files.
          </p>
          <div className="flex items-center text-purple-500 font-medium opacity-50">
            Learn More <ArrowRight size={16} className="ml-2" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
