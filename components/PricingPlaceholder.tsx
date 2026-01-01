import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Calculator } from 'lucide-react';

export const PricingPlaceholder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-dark-800 rounded-2xl flex items-center justify-center mb-6 text-purple-500 animate-bounce">
        <Calculator size={40} />
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">Pricing AI Coming Soon</h1>
      <p className="text-gray-400 max-w-lg mb-8 text-lg">
        We are building a powerful AI that will automatically calculate material costs 
        and estimates based on your annotations. Stay tuned!
      </p>
      <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );
};