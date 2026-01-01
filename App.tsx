
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import { User } from './types';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { EditorPage } from './components/Editor/EditorPage';
import { PricingPlaceholder } from './components/PricingPlaceholder';
import { Navbar } from './components/Layout/Navbar';
import { LandingPage } from './components/LandingPage';
import { ProductDetails } from './components/ProductDetails';
import { PricingPage } from './components/PricingPage';
import { PaymentPage } from './components/PaymentPage';
import { PrivacyPolicy, TermsConditions } from './components/LegalPages';

// Layout wrapper for pages requiring Navbar
const Layout: React.FC<{ children: React.ReactNode, user: User | null }> = ({ children, user }) => {
  const location = useLocation();
  const isEditor = location.pathname.includes('/editor/');
  
  if (isEditor) {
    // EditorPage handles its own full-screen layout and scrolling/panning
    return <div className="h-screen w-screen overflow-hidden bg-dark-900 text-white font-sans">{children}</div>;
  }

  // Standard Layout for Dashboard/Projects (Enables Scrolling)
  return (
    <div className="h-screen flex flex-col bg-dark-900 text-white font-sans overflow-hidden">
      <Navbar user={user} />
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="min-h-full flex flex-col">
          {children}
          <footer className="py-6 text-center text-gray-600 text-sm border-t border-dark-800 mt-auto">
            &copy; {new Date().getFullYear()} KABS Annotation & Pricing AI
          </footer>
        </div>
      </main>
    </div>
  );
};

const ProtectedRoute: React.FC<{ user: User | null; children: React.ReactNode }> = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        
        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <Layout user={user}><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/projects" element={
          <ProtectedRoute user={user}>
            <Layout user={user}><ProjectList user={user!} /></Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/editor/:id" element={
          <ProtectedRoute user={user}>
             <Layout user={user}><EditorPage user={user!} /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/pricing-ai" element={
          <ProtectedRoute user={user}>
             <Layout user={user}><PricingPlaceholder /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
