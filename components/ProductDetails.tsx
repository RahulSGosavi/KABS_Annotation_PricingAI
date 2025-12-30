
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { ArrowLeft, PenTool, Calculator, Layers, MousePointer2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProductDetails: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    // Fixed: Changed min-h-screen to h-screen and added overflow-y-auto to enable internal scrolling
    // because body has overflow: hidden globally
    <div className="h-screen w-full bg-dark-900 text-white overflow-y-auto custom-scrollbar relative">
      {/* Header / Nav */}
      <nav className="sticky top-0 z-50 bg-dark-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>
        <div className="flex items-center gap-4">
           <span className="text-sm text-gray-500 hidden sm:inline">Already a subscriber?</span>
           <Button onClick={() => navigate('/login')}>Login</Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-24"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">
              How It Works
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              A deep dive into the KABS ecosystem. From precise annotation to automated pricing intelligence.
            </p>
          </motion.div>

          {/* Section 1: Annotation */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-12 items-center">
             <div className="order-2 md:order-1 relative">
                <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full" />
                <div className="relative bg-dark-800 border border-white/10 rounded-2xl p-8 aspect-video flex items-center justify-center overflow-hidden">
                   {/* Mock UI */}
                   <div className="w-full h-full bg-dark-900 rounded border border-white/5 relative p-4">
                      <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white"><PenTool size={16}/></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-500 rounded-lg flex items-center justify-center">
                        <span className="bg-dark-900 px-2 py-1 text-xs text-blue-500 border border-blue-500">12' 4"</span>
                      </div>
                      <MousePointer2 className="absolute bottom-10 right-10 text-white fill-black" />
                   </div>
                </div>
             </div>
             <div className="order-1 md:order-2">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20">
                  <PenTool size={24} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Precision Annotation</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Upload any standard PDF floor plan. Our vector-based engine allows you to scale, measure, and mark up drawings with architectural precision.
                </p>
                <ul className="space-y-3">
                  {['Intelligent Snapping', 'Layer Management', 'Cloud Sync', 'PDF Export'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 size={18} className="text-blue-500" /> {item}
                    </li>
                  ))}
                </ul>
             </div>
          </motion.div>

          {/* Section 2: Pricing AI */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-12 items-center">
             <div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6 border border-purple-500/20">
                  <Calculator size={24} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Pricing AI Agent</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Our advanced AI Agent analyzes uploaded PDF or Excel files to provide accurate estimation information. 
                  It acts as an intelligent assistant, identifying data points to help you build reliable quotes.
                </p>
                <ul className="space-y-3">
                  {['PDF & Excel Analysis', 'Context Awareness', 'Accurate Estimates', 'Data Extraction'].map(item => (
                    <li key={item} className="flex items-center gap-3 text-gray-300">
                      <CheckCircle2 size={18} className="text-purple-500" /> {item}
                    </li>
                  ))}
                </ul>
             </div>
             <div className="relative">
                <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />
                <div className="relative bg-dark-800 border border-white/10 rounded-2xl p-8 aspect-video flex flex-col justify-center gap-4">
                   <div className="flex justify-between items-center bg-dark-900 p-4 rounded-lg border border-white/5">
                      <span className="text-gray-400">Hardwood Flooring</span>
                      <span className="text-white font-mono">$4,250.00</span>
                   </div>
                   <div className="flex justify-between items-center bg-dark-900 p-4 rounded-lg border border-white/5">
                      <span className="text-gray-400">Labor (Install)</span>
                      <span className="text-white font-mono">$1,800.00</span>
                   </div>
                   <div className="h-px bg-white/10 my-2" />
                   <div className="flex justify-between items-center px-4">
                      <span className="text-purple-400 font-bold">Total Estimate</span>
                      <span className="text-purple-400 font-mono font-bold text-xl">$6,050.00</span>
                   </div>
                </div>
             </div>
          </motion.div>

           {/* Section 3: Tools */}
           <motion.div variants={itemVariants} className="bg-dark-800/50 border border-white/5 rounded-3xl p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Comprehensive Toolset</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 {[
                   { icon: MousePointer2, label: 'Smart Select', desc: 'Auto-grouping objects' },
                   { icon: Layers, label: 'Multi-Layer', desc: 'Separate electrical & plumbing' },
                   { icon: Calculator, label: 'Cost Calc', desc: 'Real-time updates' },
                   { icon: PenTool, label: 'Vector Pen', desc: 'Bezier curve support' }
                 ].map((tool, i) => (
                   <div key={i} className="p-6 bg-dark-900 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                      <tool.icon className="w-8 h-8 mx-auto mb-4 text-gray-300" />
                      <h3 className="font-bold text-white mb-1">{tool.label}</h3>
                      <p className="text-xs text-gray-500">{tool.desc}</p>
                   </div>
                 ))}
              </div>
           </motion.div>

           {/* CTA */}
           <motion.div variants={itemVariants} className="text-center pb-20">
              <h3 className="text-2xl font-bold mb-6">Ready to streamline your workflow?</h3>
              <Button size="lg" onClick={() => navigate('/payment')}>
                 Start Subscription
              </Button>
           </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
