
import React from 'react';
import { User } from '../../types';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  user: User | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <nav className="h-16 border-b border-dark-700 bg-dark-900 flex items-center justify-between px-6 z-50 relative">
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <img 
          src="/logo.png" 
          alt="KABS" 
          className="h-8 w-auto object-contain"
          onError={(e) => {
             e.currentTarget.style.display = 'none';
             document.getElementById('nav-fallback')?.classList.remove('hidden');
          }}
        />
        <div id="nav-fallback" className="hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              KABS <span className="text-gray-400 font-normal">Annotation & Pricing AI</span>
            </span>
        </div>
      </div>

      {user && (
        <div className="relative">
          <button 
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600">
              <UserIcon size={16} />
            </div>
            <span className="text-sm font-medium">{user.email.split('@')[0]}</span>
            <ChevronDown size={14} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-dark-700">
                <p className="text-xs text-gray-400">Signed in as</p>
                <p className="text-sm text-white truncate">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-dark-700 flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
