
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const LegalLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const navigate = useNavigate();
  return (
    // Fixed: Changed min-h-screen to h-screen and added overflow-y-auto to enable internal scrolling
    <div className="h-screen w-full bg-dark-900 text-white p-6 md:p-12 overflow-y-auto custom-scrollbar relative">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors sticky top-0 bg-dark-900/80 backdrop-blur-sm py-2 w-fit rounded-lg"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>
      <div className="max-w-3xl mx-auto pb-20">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout title="Privacy Policy">
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <p>At KABS Annotation & Pricing AI, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.</p>
    <h3 className="text-xl font-bold text-white mt-6">1. Information We Collect</h3>
    <p>We collect information you provide directly to us, such as your name, email address, and payment information when you register for an account.</p>
    <h3 className="text-xl font-bold text-white mt-6">2. How We Use Your Information</h3>
    <p>We use your information to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
    <h3 className="text-xl font-bold text-white mt-6">3. Data Security</h3>
    <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access.</p>
  </LegalLayout>
);

export const TermsConditions: React.FC = () => (
  <LegalLayout title="Terms & Conditions">
    <p>Last updated: {new Date().toLocaleDateString()}</p>
    <h3 className="text-xl font-bold text-white mt-6">1. Acceptance of Terms</h3>
    <p>By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>
    <h3 className="text-xl font-bold text-white mt-6">2. Subscriptions</h3>
    <p>Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis.</p>
    <h3 className="text-xl font-bold text-white mt-6">3. User Content</h3>
    <p>You retain all rights to any content you submit, post or display on or through the Service.</p>
  </LegalLayout>
);
