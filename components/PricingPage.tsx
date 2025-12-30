
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { ArrowLeft, Check, BrainCircuit, PenTool, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-dark-900 text-white overflow-y-auto custom-scrollbar relative">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>
        <div className="flex items-center gap-4">
           <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
           <h1 className="text-4xl md:text-6xl font-bold mb-6">Simple, Transparent Pricing</h1>
           <p className="text-xl text-gray-400 max-w-2xl mx-auto">
             One subscription. Complete access to professional estimation and annotation tools.
           </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
           {/* Product Content */}
           <div className="space-y-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-dark-800/50 p-8 rounded-2xl border border-white/5"
              >
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand-500/10 rounded-xl text-brand-500">
                       <PenTool size={24} />
                    </div>
                    <h2 className="text-2xl font-bold">Annotation Suite</h2>
                 </div>
                 <p className="text-gray-300 leading-relaxed text-lg">
                    Our annotation engine is built specifically for architectural accuracy. Unlike generic PDF editors, 
                    KABS allows you to set scale, manage distinct visibility layers (for electrical, plumbing, or layout), 
                    and export high-resolution documents. It is the foundation of precise project planning.
                 </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-dark-800/50 p-8 rounded-2xl border border-white/5"
              >
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                       <BrainCircuit size={24} />
                    </div>
                    <h2 className="text-2xl font-bold">Pricing AI Agent</h2>
                 </div>
                 <p className="text-gray-300 leading-relaxed text-lg mb-4">
                    The Pricing AI is not just a calculator; it is an advanced <strong>AI Agent</strong> designed to provide accurate 
                    estimates based on your uploaded PDF plans or Excel datasets.
                 </p>
                 <p className="text-gray-300 leading-relaxed text-lg">
                    By analyzing your documents, the AI identifies material requirements, understands construction contexts, 
                    and cross-references data to generate reliable estimates. Whether you are working with complex blueprints 
                    or raw data sheets, the AI Agent acts as your virtual quantity surveyor, ensuring no detail is overlooked.
                 </p>
                 <div className="mt-6 flex gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-2"><FileSpreadsheet size={16}/> Excel Analysis</span>
                    <span className="flex items-center gap-2"><PenTool size={16}/> PDF Parsing</span>
                 </div>
              </motion.div>
           </div>

           {/* Pricing Card */}
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             className="sticky top-24"
           >
              <div className="bg-gradient-to-b from-brand-900/20 to-dark-800 border border-brand-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4">
                    <span className="bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                       All Access
                    </span>
                 </div>

                 <h3 className="text-2xl font-bold text-white mb-2">Pro Subscription</h3>
                 <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-bold text-white">$10</span>
                    <span className="text-gray-400">/ month</span>
                 </div>
                 
                 <p className="text-gray-400 mb-8 border-b border-white/10 pb-8">
                    Unlock the full potential of KABS. Create unlimited projects and access our proprietary AI estimation agent.
                 </p>

                 <ul className="space-y-4 mb-10">
                    {[
                      'Unlimited PDF Projects',
                      'Advanced Vector Annotation Tools',
                      'Pricing AI Agent (PDF & Excel)',
                      'High-Res 4K Exports',
                      'Cloud Storage & Sync',
                      'Priority Email Support'
                    ].map((feature, i) => (
                       <li key={i} className="flex items-center gap-3 text-gray-200">
                          <Check size={18} className="text-brand-500 shrink-0" />
                          <span>{feature}</span>
                       </li>
                    ))}
                 </ul>

                 <Button 
                   size="lg" 
                   className="w-full text-lg py-6" 
                   onClick={() => navigate('/payment')}
                 >
                    Subscribe Now
                 </Button>
                 <p className="text-center text-xs text-gray-500 mt-4">
                    Secure payment via Stripe. Cancel anytime.
                 </p>
              </div>
           </motion.div>
        </div>
      </div>
    </div>
  );
};
