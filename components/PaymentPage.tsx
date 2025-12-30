
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { CreditCard, Lock, Check, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setProcessing(false);
      // In a real app, this would update user role/subscription status in DB
      navigate('/login', { state: { paid: true } }); 
    }, 2000);
  };

  return (
    // Fixed: Changed min-h-screen to h-screen and added overflow-y-auto to enable internal scrolling
    <div className="h-screen w-full bg-dark-900 text-white overflow-y-auto custom-scrollbar relative">
      
      {/* Added Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-dark-900/50 backdrop-blur-sm px-3 py-2 rounded-lg"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>
      </div>

      <div className="min-h-full flex items-center justify-center p-4 py-20">
        <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-start">
          
          {/* Plan Summary */}
          <div className="space-y-6 md:pr-8 md:border-r border-white/10 mt-10 md:mt-0">
             <div className="bg-brand-900/20 border border-brand-500/30 p-6 rounded-2xl">
                <h2 className="text-sm font-semibold text-brand-400 tracking-wider uppercase mb-2">Pro Subscription</h2>
                <div className="flex items-end gap-2 mb-4">
                   <span className="text-4xl font-bold text-white">$10</span>
                   <span className="text-gray-400 mb-1">/ month</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  Full access to the KABS Annotation Engine and Pricing AI tools. Cancel anytime.
                </p>
                <ul className="space-y-3">
                   {['Unlimited Projects', 'PDF Export (4K)', 'Cloud Storage', 'Pricing AI Access'].map(item => (
                     <li key={item} className="flex items-center gap-3 text-sm text-gray-200">
                       <Check size={16} className="text-green-400" /> {item}
                     </li>
                   ))}
                </ul>
             </div>
             
             <div className="flex items-center gap-3 text-gray-500 text-sm">
               <ShieldCheck size={16} />
               <span>Secure 256-bit SSL Encrypted payment</span>
             </div>
          </div>

          {/* Payment Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-800 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl"
          >
             <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
               <CreditCard size={24} className="text-brand-500" /> Payment Details
             </h2>

             <form onSubmit={handlePayment} className="space-y-4">
                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Name on Card</label>
                   <input type="text" required placeholder="John Doe" className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-600" />
                </div>

                <div>
                   <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Card Number</label>
                   <div className="relative">
                      <input type="text" required placeholder="0000 0000 0000 0000" className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-600 pl-10" />
                      <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">Expiry</label>
                      <input type="text" required placeholder="MM/YY" className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-600" />
                   </div>
                   <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase">CVC</label>
                      <div className="relative">
                        <input type="text" required placeholder="123" className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-600" />
                        <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      </div>
                   </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full py-4 text-base" isLoading={processing}>
                     Pay $10.00 & Create Account
                  </Button>
                  <p className="text-center text-xs text-gray-500 mt-4">
                    By confirming, you agree to our <a href="#/terms" className="underline hover:text-white">Terms</a>.
                  </p>
                </div>
             </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
