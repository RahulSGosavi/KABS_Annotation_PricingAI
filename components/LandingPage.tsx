
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  useMotionValue, 
  useVelocity, 
  useAnimationFrame,
  AnimatePresence 
} from 'framer-motion';
import { wrap } from '@motionone/utils';
import { 
  ArrowRight, 
  Layers, 
  PenTool, 
  Smartphone, 
  Calculator,
  ChevronRight,
  Ruler,
  Grid,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  X,
  History,
  Info,
  Tablet,
  ScanLine,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Box,
  Hammer,
  Palette,
  Monitor,
  Laptop,
  MousePointer2,
  Globe,
  Cpu,
  ArrowDownRight,
  Play,
  Pause,
  Maximize2,
  Volume2,
  FileText,
  Database,
  Zap,
  Clock
} from 'lucide-react';
import { Button } from './ui/Button';

// --- HELPER COMPONENTS ---

// 1. BRAND LOGO (Dark Mode)
const BrandLogo = ({ className = "h-10" }: { className?: string }) => (
  <img 
    src="/logo.png" 
    alt="KABS Kitchen and Bath Systems" 
    className={`${className} w-auto object-contain invert brightness-0 invert`} // Force white if image is dark
    onError={(e) => {
      e.currentTarget.style.display = 'none';
      const fallback = document.getElementById('logo-fallback-landing');
      if (fallback) fallback.classList.remove('hidden');
    }}
  />
);

const LogoFallback = () => (
    <div id="logo-fallback-landing" className="hidden flex items-center gap-2">
      <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)]">
        <span className="font-bold">K</span>
      </div>
      <span className="font-bold text-white tracking-tight text-lg shadow-black drop-shadow-md">KABS</span>
    </div>
)

// 2. SCROLL REVEAL WRAPPER
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

// 3. VELOCITY SCROLL TEXT (Glowing Text with Color Variation)
interface ParallaxProps {
  children: string;
  baseVelocity: number;
}

function ParallaxText({ children, baseVelocity = 100 }: ParallaxProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden whitespace-nowrap flex flex-nowrap m-0 tracking-tight leading-[0.8]">
      <motion.div 
        // Updated gradient to be multi-color: Orange -> Pink -> Purple -> Cyan -> Green
        className="font-oswald font-bold uppercase text-4xl md:text-7xl text-transparent bg-clip-text bg-[linear-gradient(to_right,#fdba74,#f9a8d4,#a78bfa,#67e8f9,#86efac)] flex whitespace-nowrap gap-10" 
        style={{ x, WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
      >
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
        <span>{children} </span>
      </motion.div>
    </div>
  );
}

// 4. SERVICE CARD (Refactored layout to prevent badge clipping)
const ServiceCard = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    imageGradient, 
    onExpand,
    badge 
}: { 
    title: string, 
    subtitle: string, 
    icon: any, 
    imageGradient: string, 
    onExpand: () => void,
    badge?: string 
}) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className="relative h-[320px] rounded-2xl overflow-hidden group cursor-pointer border border-white/10 bg-[#0a0a0a]"
  >
    {/* Animated Border Glow */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
    
    {/* Background Gradient */}
    <div className={`absolute inset-0 bg-gradient-to-br ${imageGradient} opacity-30 group-hover:opacity-50 transition-opacity duration-500 blur-xl`} />
    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-500" />
    
    {/* Content Container - Uses Flexbox for safe layout */}
    <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
      
      {/* Header Row: Icon + Badge */}
      <div className="flex justify-between items-start w-full">
          <div className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:border-white/30 group-hover:bg-white/10 transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Icon className="text-white group-hover:scale-110 transition-transform" size={24} />
          </div>
          {badge && (
             <span className="bg-white/10 border border-white/20 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded-full backdrop-blur-md whitespace-nowrap">
                {badge}
             </span>
          )}
      </div>

      {/* Bottom Row: Text */}
      <div className="relative">
        <h3 className="text-2xl font-bold text-white mb-2 tracking-wide group-hover:text-brand-300 transition-colors pr-8">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300 pr-8">
          {subtitle}
        </p>
        
        {/* Expand Icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); onExpand(); }}
          className="absolute bottom-0 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-gray-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          title="View Details"
        >
          <ArrowDownRight size={20} />
        </button>
      </div>
    </div>
  </motion.div>
);

// --- MAIN COMPONENT ---

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeModal, setActiveModal] = useState<'ipad' | 'changelog' | 'about' | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFooterClick = (item: string) => {
    switch(item) {
        case 'Home':
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth'});
            break;
        case 'Our Products':
            scrollToSection('showcase');
            break;
        case 'About Us':
            scrollToSection('bento');
            break;
        case 'Pricing':
            navigate('/pricing');
            break;
        case 'Features':
            scrollToSection('showcase');
            break;
        default:
            break;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="h-screen w-full bg-[#050505] text-white font-sans overflow-x-hidden overflow-y-auto selection:bg-brand-500/40 custom-scrollbar relative touch-auto scroll-smooth"
    >
      
      {/* Background Grid - Dark Cyberpunk Style */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/80 to-[#050505]"></div>
        {/* Ambient Spotlights */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[150px]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth'})}>
            <BrandLogo className="h-9 group-hover:opacity-80 transition-opacity" />
            <LogoFallback />
          </div>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
             <button onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth'})} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Home</button>
             <button onClick={() => scrollToSection('showcase')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Our Products</button>
             <button onClick={() => scrollToSection('bento')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">About Us</button>
             <button onClick={() => navigate('/pricing')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Pricing</button>
             <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Contact Us</button>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')} 
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block tracking-wide"
            >
              LOG IN
            </button>
            <Button 
              size="sm" 
              onClick={() => navigate('/payment')}
              className="!bg-white !text-black hover:!bg-gray-200 font-bold px-6 py-2.5 shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.7)] transition-all transform hover:scale-105"
            >
              Start
            </Button>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative pt-40 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center z-10 overflow-hidden">
        {/* Lighting Effects */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
        
        <div className="text-center max-w-5xl mx-auto relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold mb-8 backdrop-blur-md shadow-lg shadow-black/50 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
            </span>
            SYSTEM OPERATIONAL • V1.0.2
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
          >
            {/* 4 Light Color Variation: Orange -> Yellow & Sky -> Pink */}
            <span className="bg-gradient-to-r from-orange-300 to-yellow-200 bg-clip-text text-transparent block drop-shadow-[0_0_25px_rgba(253,186,116,0.2)] pb-2">
              Professional Grade.
            </span>
            <span className="bg-gradient-to-r from-sky-300 to-pink-300 bg-clip-text text-transparent block drop-shadow-[0_0_25px_rgba(249,168,212,0.2)]">
              Pixel Perfect.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light"
          >
            The comprehensive platform for interior annotation and design management.
            Built for Kitchen & Bath professionals who demand accuracy.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/payment')}
              className="w-full sm:w-auto px-10 py-5 text-lg bg-brand-600 hover:bg-brand-500 text-white border border-brand-400/30 shadow-[0_0_40px_-10px_rgba(37,99,235,0.6)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.8)] transition-all group font-semibold tracking-wide"
            >
              Start Project <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={() => scrollToSection('showcase')}
              className="w-full sm:w-auto px-10 py-5 text-lg bg-white/5 hover:bg-white/10 border-white/10 text-white backdrop-blur-sm shadow-[0_0_20px_-10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] transition-all"
            >
              Explore Features
            </Button>
          </motion.div>
        </div>

        {/* 3D FLOATING INTERFACE (ANNOTATION EDITOR SIMULATION) */}
        <motion.div 
           initial={{ opacity: 0, rotateX: 25, y: 100 }}
           animate={{ opacity: 1, rotateX: 0, y: 0 }}
           transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
           className="mt-24 w-full max-w-6xl mx-auto perspective-1000 hidden md:block"
        >
           <div className="relative bg-[#0F0F0F]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_50px_-20px_rgba(0,0,0,1)] overflow-hidden aspect-[21/9] group flex flex-col">
              {/* Glow Behind */}
              <div className="absolute inset-0 bg-brand-500/5 blur-3xl -z-10" />

              {/* Interface Header */}
              <div className="h-12 bg-[#161616] border-b border-white/5 flex items-center px-6 justify-between z-20 shrink-0">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                 </div>
                 <div className="flex items-center gap-4">
                     {/* Live Badge */}
                     <div className="flex items-center gap-2 bg-brand-500/10 px-2 py-1 rounded border border-brand-500/20">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-[10px] text-brand-400 font-bold tracking-wider">EDITOR ONLINE</span>
                     </div>
                 </div>
              </div>

              {/* Interface Body */}
              <div className="flex-1 flex overflow-hidden">
                  {/* Left Sidebar (Tools & Properties) */}
                  <div className="w-64 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col gap-6 relative z-10">
                     <div className="space-y-4">
                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Active Tool</div>
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
                           <Ruler className="text-brand-500" size={20} />
                           <div>
                              <div className="text-sm font-bold text-white">Measurement</div>
                              <div className="text-xs text-gray-400">Precision: 1/16"</div>
                           </div>
                        </div>
                     </div>

                     <div className="h-px bg-white/10 w-full" />

                     <div className="space-y-4">
                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Layers</div>
                        <div className="space-y-2">
                           {[
                             { label: 'Dimensions', visible: true, color: 'bg-brand-500' },
                             { label: 'Electrical', visible: true, color: 'bg-yellow-500' },
                             { label: 'Plumbing', visible: false, color: 'bg-cyan-500' },
                             { label: 'Notes', visible: true, color: 'bg-green-500' },
                           ].map((item, i) => (
                             <div 
                               key={i}
                               className={`flex justify-between items-center p-2 rounded border transition-colors ${item.visible ? 'bg-white/5 border-white/5' : 'opacity-50 border-transparent'}`}
                             >
                                <div className="flex items-center gap-2">
                                   <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                   <span className="text-xs text-gray-300 font-medium">{item.label}</span>
                                </div>
                                <div className={`w-4 h-4 rounded border ${item.visible ? 'bg-brand-500 border-brand-500' : 'border-gray-600'} flex items-center justify-center`}>
                                   {item.visible && <CheckCircle2 size={10} className="text-white" />}
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Main Canvas (Vector Blueprint) */}
                  <div className="flex-1 bg-[#050505] relative flex items-center justify-center p-10 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                      
                      {/* Blueprint SVG */}
                      <div className="relative w-full h-full max-w-2xl aspect-[4/3] border border-white/10 bg-[#080808] rounded-xl shadow-2xl p-8 cursor-crosshair">
                          {/* Simulated Lines */}
                          <svg className="w-full h-full text-white/20" viewBox="0 0 800 600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              {/* Outer Walls */}
                              <rect x="50" y="50" width="700" height="500" rx="4" strokeWidth="4" />
                              
                              {/* Kitchen Island */}
                              <rect x="250" y="250" width="300" height="100" rx="4" stroke="#22d3ee" strokeOpacity="0.5" fill="rgba(34, 211, 238, 0.1)" />
                              
                              {/* Counter L-Shape */}
                              <path d="M50 150 L50 50 L300 50" strokeWidth="4" />
                              <rect x="54" y="54" width="246" height="60" strokeOpacity="0.5" />
                              <rect x="54" y="114" width="60" height="300" strokeOpacity="0.5" />

                              {/* Static Dimension */}
                              <path d="M50 580 L750 580" stroke="#444" strokeWidth="1" strokeDasharray="4 4" />
                              <text x="400" y="570" fill="#666" fontSize="14" textAnchor="middle" stroke="none">24' 0"</text>
                          </svg>

                          {/* Animated Cursor & Drawing Action */}
                          <motion.div
                             className="absolute top-0 left-0 w-full h-full pointer-events-none"
                             initial="start"
                             animate="draw"
                          >
                             {/* Animated Dimension Line */}
                             <motion.div 
                                className="absolute bg-brand-500 h-[2px]"
                                style={{ top: '48%', left: '37%' }}
                                animate={{ width: ['0%', '25%'] }}
                                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
                             />
                             {/* Animated Text Popup */}
                             <motion.div 
                                className="absolute bg-brand-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg z-30"
                                style={{ top: '45%', left: '50%' }}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 3.5, times: [0.4, 0.5, 0.9, 1], repeat: Infinity, repeatDelay: 0 }}
                             >
                                12' 4"
                             </motion.div>

                             {/* Cursor Movement */}
                             <motion.div
                                className="absolute z-50 text-white drop-shadow-lg"
                                animate={{ 
                                   top: ['48%', '48%', '60%'], 
                                   left: ['37%', '62%', '70%'],
                                   opacity: [1, 1, 0] 
                                }}
                                transition={{ duration: 3.5, repeat: Infinity }}
                             >
                                <MousePointer2 className="fill-black" size={24} />
                             </motion.div>
                          </motion.div>
                      </div>
                  </div>
              </div>
           </div>
        </motion.div>
      </section>

      {/* 2. VELOCITY TEXT */}
      <section className="py-12 bg-white/[0.02] border-y border-white/5 overflow-hidden backdrop-blur-sm">
        <ParallaxText baseVelocity={-1}>KITCHEN • BATH • SYSTEMS •</ParallaxText>
      </section>

      {/* 3. SHOWCASE SECTION */}
      <section id="showcase" className="py-32 px-6 bg-[#050505] relative">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/5 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                   <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">Our Expertise</h2>
                   <p className="text-gray-400 max-w-lg text-lg leading-relaxed">
                     Advanced tools rooted in real-world construction and design excellence.
                   </p>
                </div>
                <Button variant="secondary" onClick={() => navigate('/payment')} className="border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10">Start Now</Button>
             </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <ScrollReveal delay={0.1}>
                <ServiceCard 
                  title="Smart Annotation" 
                  subtitle="Mark up floor plans with intelligent vector tools designed for clarity."
                  icon={PenTool}
                  imageGradient="from-blue-600 to-indigo-900"
                  onExpand={() => navigate('/product-details')}
                />
             </ScrollReveal>
             <ScrollReveal delay={0.2}>
                <ServiceCard 
                  title="Pricing AI Agent" 
                  subtitle="AI agent that analyzes PDF/Excel for accurate estimation."
                  icon={Calculator}
                  imageGradient="from-purple-600 to-pink-900"
                  onExpand={() => navigate('/pricing')}
                  badge="Coming Soon"
                />
             </ScrollReveal>
             <ScrollReveal delay={0.3}>
                <ServiceCard 
                  title="Renovation" 
                  subtitle="Complete project management for Kitchen & Bath remodels."
                  icon={Hammer}
                  imageGradient="from-orange-600 to-red-900"
                  onExpand={() => navigate('/product-details')}
                />
             </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID (Dark Mode Bento) */}
      <section id="bento" className="py-32 px-6 bg-[#080808] border-t border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gray-800/20 via-[#080808] to-[#080808] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
           {/* About Us Header for this section context */}
           <div className="mb-12">
              <h2 className="text-3xl font-bold mb-4">About Us & Features</h2>
              <div className="max-w-4xl text-gray-300 leading-relaxed space-y-4">
                 <p className="text-lg">
                   KABS (Kitchen And Bath Systems) is a premier technology provider dedicated to modernizing the interior design 
                   and construction industry. We bridge the gap between traditional architectural drafting and modern digital estimation.
                 </p>
                 <p className="text-lg">
                   Our mission is to empower professionals with AI-driven tools that reduce errors, save time, and provide pinpoint 
                   accuracy in material planning and project execution.
                 </p>
                 <a href="https://kabstech.com/" target="_blank" rel="noreferrer" className="inline-block mt-4 text-brand-500 hover:text-white transition-colors underline underline-offset-4 font-semibold">
                   Read More about KABS Company →
                </a>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 - Large - ANNOTATION (Main Product) */}
              <motion.div 
                whileHover={{ scale: 0.99 }}
                className="md:col-span-2 bg-[#111] rounded-3xl p-10 border border-white/5 shadow-2xl relative overflow-hidden group min-h-[360px] flex flex-col justify-between"
              >
                 <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity duration-500 text-brand-500">
                    <PenTool size={140} />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 <div className="relative z-10">
                    <div className="bg-brand-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-brand-500 mb-8 border border-brand-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                       <Ruler size={28} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-bold text-white mb-4">Smart Annotation Suite</h3>
                       <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                         The industry standard for vector-based blueprint markup. Experience mathematically perfect scaling, 
                         intelligent layer management, and high-fidelity PDF exports.
                       </p>
                    </div>
                 </div>
              </motion.div>

              {/* Feature 2 - Vertical - PRICING AI (Coming Soon) */}
              <motion.div className="bg-[#111] rounded-3xl p-8 border border-white/5 flex flex-col justify-between group min-h-[360px] relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                 <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]"><Calculator size={24}/></div>
                    <span className="text-[10px] font-bold text-purple-300 bg-purple-900/40 border border-purple-500/30 px-2 py-1 rounded uppercase tracking-wider">Coming Soon</span>
                 </div>
                 <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-3">Pricing AI</h3>
                    <p className="text-gray-400 leading-relaxed">Our proprietary AI agent will scan PDFs and Excel data to generate automated estimates.</p>
                 </div>
              </motion.div>

              {/* Feature 3 */}
              <motion.div className="bg-[#111] rounded-3xl p-8 border border-white/5 flex flex-col justify-center gap-6 group relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 <div className="p-3 bg-green-500/10 w-fit rounded-xl text-green-500 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)] z-10"><Monitor size={24}/></div>
                 <div className="z-10">
                    <h3 className="text-2xl font-bold text-white mb-2">Any Device</h3>
                    <p className="text-gray-400">Works on Desktop, Tablet, and Mobile browsers.</p>
                 </div>
              </motion.div>

              {/* Feature 4 */}
              <motion.div className="md:col-span-2 bg-gradient-to-r from-brand-900/20 to-blue-900/20 rounded-3xl p-8 border border-brand-500/20 flex items-center justify-between relative overflow-hidden">
                 <div className="absolute inset-0 bg-brand-600/5 animate-pulse-slow" />
                 <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white mb-2">Vector Precision</h3>
                    <p className="text-brand-200/70">Mathematically perfect scaling for architectural plans.</p>
                 </div>
                 <PenTool className="text-brand-500 relative z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" size={40} />
              </motion.div>
           </div>
        </div>
      </section>

      {/* 5. FINAL CTA */}
      <section className="py-40 px-6 text-center bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3b82f61a_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight text-white drop-shadow-2xl">
            Ready to standardize?
          </h2>
          <p className="text-xl text-gray-400 mb-12 font-light max-w-2xl mx-auto">
            Join the KABS ecosystem and modernize your workflow with professional tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              size="lg" 
              onClick={() => navigate('/payment')}
              className="w-full sm:w-auto px-12 py-5 text-lg !bg-white !text-black hover:!bg-gray-200 font-bold shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.6)] hover:scale-105 transition-all"
            >
              Create Account
            </Button>
            <button 
              onClick={() => navigate('/login')}
              className="text-gray-400 hover:text-white flex items-center gap-2 font-medium transition-colors text-base px-6 py-4 hover:bg-white/5 rounded-lg"
            >
              Login to Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 6. REDESIGNED FOOTER */}
      <footer id="contact" className="relative pt-20 pb-10 px-6 bg-[#020202]">
        {/* Top Gradient Border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.5)]"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
            
            {/* Column 1: Brand */}
            <div className="md:col-span-5 flex flex-col items-start">
               <div className="mb-6 flex items-center gap-3">
                 <BrandLogo className="h-10" />
                 <LogoFallback />
               </div>
               <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-sm font-light tracking-wide">
                 Redefining architectural annotation and cost estimation for the <span className="text-blue-200 font-normal">modern era</span>.
               </p>
               <div className="flex gap-4">
                  {[
                    { Icon: Facebook, href: "https://www.facebook.com/kbglobalpartners/", color: "hover:bg-blue-600 hover:border-blue-500" },
                    { Icon: Youtube, href: "https://www.youtube.com/@kabs3313", color: "hover:bg-red-600 hover:border-red-500" },
                    { Icon: Linkedin, href: "https://www.linkedin.com/company/kabstech/", color: "hover:bg-blue-700 hover:border-blue-600" }
                  ].map(({ Icon, href, color }, idx) => (
                    <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 rounded-xl bg-[#111] border border-white/10 ${color} transition-all duration-300 flex items-center justify-center text-gray-400 hover:text-white shadow-lg hover:shadow-xl hover:-translate-y-1`}>
                      <Icon size={20} />
                    </a>
                  ))}
               </div>
            </div>

            {/* Column 2: Product */}
            <div className="md:col-span-3 md:col-start-7">
               <h4 className="text-white font-bold text-lg mb-8 tracking-widest uppercase border-b border-white/10 pb-2 inline-block">Platform</h4>
               <ul className="space-y-4">
                  {['Home', 'Our Products', 'About Us', 'Pricing', 'Features'].map((item) => (
                    <li key={item}>
                      <button 
                        onClick={() => handleFooterClick(item)} 
                        className="group flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors duration-300 text-base"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-cyan-400 transition-colors"></span>
                        <span className="group-hover:translate-x-1 transition-transform">{item}</span>
                      </button>
                    </li>
                  ))}
               </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="md:col-span-3">
               <h4 className="text-white font-bold text-lg mb-8 tracking-widest uppercase border-b border-white/10 pb-2 inline-block">Contact</h4>
               <ul className="space-y-6">
                  <li className="flex items-start gap-4 group cursor-pointer">
                     <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/10 group-hover:border-blue-500/50 transition-all">
                       <MapPin size={20} />
                     </div>
                     <div>
                       <span className="block text-white font-medium mb-1">Headquarters</span>
                       <span className="text-gray-400 text-sm group-hover:text-blue-200 transition-colors">123 Design District<br/>Dallas, TX 75207</span>
                     </div>
                  </li>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@kabstech.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 group cursor-pointer">
                     <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/10 group-hover:border-blue-500/50 transition-all">
                       <Mail size={20} />
                     </div>
                     <div>
                        <span className="block text-white font-medium mb-1">Email Us</span>
                        <span className="text-gray-400 text-sm group-hover:text-blue-200 transition-colors">contact@kabstech.com</span>
                     </div>
                  </a>
                  <li className="flex items-center gap-4 group cursor-pointer">
                     <div className="w-10 h-10 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500/10 group-hover:border-blue-500/50 transition-all">
                       <Phone size={20} />
                     </div>
                     <div>
                        <span className="block text-white font-medium mb-1">Support</span>
                        <span className="text-gray-400 text-sm group-hover:text-blue-200 transition-colors">(555) 123-4567</span>
                     </div>
                  </li>
               </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="text-sm text-gray-500 font-mono flex flex-col md:flex-row gap-4 items-center">
               <span>© {new Date().getFullYear()} KABS Kitchen & Bath Systems.</span>
               <span className="hidden md:inline text-white/10">|</span>
               <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
               <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms of Service</button>
             </div>
             
             {/* Live Status Indicator */}
             <div className="flex items-center gap-3 bg-[#111] px-4 py-2 rounded-full border border-white/5 shadow-inner">
                <div className="relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 absolute top-0 left-0 animate-ping opacity-75"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 relative block shadow-[0_0_8px_#22c55e]"></span>
                </div>
                <span className="text-xs font-bold text-gray-300 tracking-wider uppercase">System Online</span>
                <span className="text-xs text-gray-600 font-mono">v1.0.2</span>
             </div>
          </div>
        </div>
      </footer>

      {/* CONTENT MODALS */}
      <AnimatePresence>
        {activeModal && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                 initial={{ opacity: 0 }} 
                 animate={{ opacity: 1 }} 
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/80 backdrop-blur-md"
                 onClick={() => setActiveModal(null)}
              />
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg p-8 shadow-2xl"
              >
                 <button 
                   onClick={() => setActiveModal(null)} 
                   className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"
                 >
                   <X size={20} />
                 </button>

                 <div className="pt-2 text-center">
                    {activeModal === 'ipad' && (
                       <div>
                          <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                             <Smartphone size={40} />
                          </div>
                          <h2 className="text-3xl font-bold mb-4 text-white">Anywhere Access</h2>
                          <p className="text-gray-400 text-base mb-8 leading-relaxed">
                             KABS is built with web technologies that run on iPad Pro, Android Tablets, and Desktop browsers.
                             Full mobile app coming late 2024.
                          </p>
                          <Button onClick={() => navigate('/payment')} className="w-full">Get Started</Button>
                       </div>
                    )}
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Counter Component for Number Animation
function Counter({ value, prefix = "" }: { value: number, prefix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevValue = useRef(0);
  
  // Simple easing counter effect
  useAnimationFrame((t) => {
      if (!nodeRef.current) return;
      // Animate from 0 to value over 2 seconds
      const progress = Math.min(t / 2000, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const current = Math.floor(prevValue.current + (value - prevValue.current) * ease);
      
      nodeRef.current.textContent = prefix + current.toLocaleString();
  });

  return <span ref={nodeRef}>{prefix}0</span>;
}
