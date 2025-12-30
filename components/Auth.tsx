
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Button } from './ui/Button';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [hasPaid, setHasPaid] = useState(false);

  useEffect(() => {
    // Check if user came from payment success
    if (location.state?.paid) {
        setHasPaid(true);
        setSuccessMessage("Payment successful! Please create your account.");
        setIsLogin(false); // Default to signup for new payers
    }
  }, [location]);

  const isExemptUser = (email: string) => {
      const lower = email.toLowerCase();
      return lower.includes('admin') || lower.includes('tester') || lower.includes('kab');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // subscription check simulation
    if (!isExemptUser(email) && !hasPaid && !isLogin) {
         setError("Registration requires an active subscription. Please start from the payment page.");
         setLoading(false);
         // Optional: redirect to payment after delay
         return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Login success - in a real app check subscription DB table here.
        // For demo: standard auth success redirects to dashboard
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMessage('Registration successful! Please check your email for the confirmation link.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-dark-900 overflow-y-auto relative">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 sm:top-8 sm:left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </button>

      <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-dark-800 border border-dark-700 rounded-2xl p-6 sm:p-8 shadow-2xl my-auto mt-16 sm:mt-auto">
          <div className="text-center mb-6 sm:mb-8">
             <img 
               src="/logo.png" 
               alt="KABS Logo" 
               className="h-16 w-auto mx-auto mb-4 object-contain"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 document.getElementById('auth-fallback')?.classList.remove('hidden');
               }}
             />
             <div id="auth-fallback" className="hidden w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="text-gray-400">Enter your credentials to continue</p>
          </div>

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-2">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full py-3" isLoading={loading}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            {/* If paid, they are strictly signing up. If not, toggle. */}
            {!hasPaid && (
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="text-sm text-gray-500 hover:text-brand-500 transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}
            {!isLogin && !hasPaid && (
               <p className="text-xs text-gray-600 mt-4">
                 Note: Standard registration requires a subscription. <br/>
                 <a href="#/payment" className="text-brand-500 underline">Go to Payment</a>
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
