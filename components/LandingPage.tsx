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
import { 
  ArrowRight, 
  PenTool, 
  Smartphone, 
  Calculator,
  ChevronRight,
  Ruler,
  Facebook,
  Linkedin,
  Youtube,
  X,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Hammer,
  Monitor,
  ArrowDownRight,
  Menu,
} from 'lucide-react';
import { Button } from './ui/Button';
import { RainbowButton } from './ui/RainbowButton';
import { GradientButton } from './ui/GradientButton';
import { DynamicBorderButton } from './ui/DynamicBorderButton';
import { Footer } from './ui/FooterSection';
import { Timeline, TimelineItem } from './ui/ModernTimeline';
import { GlowCard } from './ui/spotlight-card';
import ShaderBackground from './ui/ShaderBackground';

// --- HELPER FUNCTIONS ---

// Local wrap implementation to avoid dependency issues
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

// --- HELPER COMPONENTS ---

const LogoFallback = () => (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)]">
        <span className="font-bold">K</span>
      </div>
      <span className="font-bold text-white tracking-tight text-lg shadow-black drop-shadow-md">KABS</span>
    </div>
);

// 1. BRAND LOGO (Dark Mode) with State-based Fallback
const BrandLogo = ({ className = "h-10" }: { className?: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <LogoFallback />;
  }

  return (
    <img 
      src="/logo.png" 
      alt="KABS Kitchen and Bath Systems" 
      className={`${className} w-auto object-contain invert brightness-0 invert`} 
      onError={() => setHasError(true)}
    />
  );
};

// 2. SCROLL REVEAL WRAPPER
const ScrollReveal = ({ children, delay = 0 }: { children?: React.ReactNode, delay?: number }) => {
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

// 3. VELOCITY SCROLL TEXT
interface ParallaxProps {
  children?: React.ReactNode;
  baseVelocity?: number;
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

// 4. SERVICE CARD
const ServiceCard = ({ 
    title, 
    subtitle, 
    icon: Icon, 
    onExpand,
    badge,
    glowColor
}: { 
    title: string, 
    subtitle: string, 
    icon: any, 
    onExpand: () => void,
    badge?: string,
    glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange'
}) => (
  <GlowCard 
    glowColor={glowColor}
    customSize
    className="h-[320px] p-0 overflow-hidden cursor-pointer group hover:scale-[1.01] transition-transform duration-300 !grid-rows-1"
  >
    {/* Background elements managed by GlowCard, additional internal overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
    
    <div className="relative z-10 flex flex-col justify-between h-full p-8" onClick={onExpand}>
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

      <div className="relative">
        <h3 className="text-2xl font-bold text-white mb-2 tracking-wide group-hover:text-brand-300 transition-colors pr-8">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300 pr-8">
          {subtitle}
        </p>
        <button 
          onClick={(e) => { e.stopPropagation(); onExpand(); }}
          className="absolute bottom-0 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-gray-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          title="View Details"
        >
          <ArrowDownRight size={20} />
        </button>
      </div>
    </div>
  </GlowCard>
);

// --- MAIN COMPONENT ---

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeModal, setActiveModal] = useState<'ipad' | 'changelog' | 'about' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const timelineItems: TimelineItem[] = [
    {
      title: "KABS Founded",
      description: "Started with a vision to digitize the interior estimation process for contractors.",
      date: "2023-01-15",
      category: "Foundation",
      status: "completed"
    },
    {
      title: "Beta Launch",
      description: "Released the first version of our Annotation Engine to select partners in Dallas, TX.",
      category: "Product",
      status: "completed"
    },
    {
      title: "Public Release 1.0",
      description: "Official launch of the platform with full PDF export capabilities and cloud storage.",
      category: "Milestone",
      status: "completed"
    },
    {
      title: "Pricing AI Integration",
      description: "Developing our proprietary AI agent to scan blueprints and automate cost estimation.",
      category: "Innovation",
      status: "current"
    },
    {
      title: "AI Automation Ecosystem",
      description: "Launching advanced AI systems designed to streamline workflows and drastically reduce time wastage for professionals.",
      category: "Growth",
      status: "upcoming"
    }
  ];

  return (
    <div 
      ref={containerRef} 
      className="h-screen w-full bg-[#050505] text-white font-sans overflow-x-hidden overflow-y-auto selection:bg-brand-500/40 custom-scrollbar relative touch-auto scroll-smooth"
    >
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between relative">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth'})}>
            <BrandLogo className="h-9 group-hover:opacity-80 transition-opacity" />
          </div>

          <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
             <button onClick={() => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth'})} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Home</button>
             <button onClick={() => scrollToSection('showcase')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Our Products</button>
             <button onClick={() => scrollToSection('bento')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">About Us</button>
             <button onClick={() => navigate('/pricing')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Pricing</button>
             <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors tracking-wide">Contact Us</button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <DynamicBorderButton
              onClick={() => navigate('/login')} 
              className="text-sm font-bold text-gray-200"
            >
              LOG IN
            </DynamicBorderButton>

            <DynamicBorderButton 
              onClick={() => navigate('/payment')}
              className="text-sm font-bold text-white"
            >
              START
            </DynamicBorderButton>
          </div>

          {/* Mobile Menu Button */}
          <button 
             className="lg:hidden p-2 text-white bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
             onClick={() => setIsMobileMenuOpen(true)}
             aria-label="Open menu"
          >
             <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section id="hero" className="relative pt-32 pb-20 px-6 min-h-[90vh] flex flex-col items-center justify-center z-10 overflow-hidden">
        {/* SHADER BACKGROUND */}
        <div className="absolute inset-0 w-full h-full z-0">
          <ShaderBackground className="w-full h-full opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" />
          <div className="absolute inset-0 bg-[#050505]/40" />
        </div>
        
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
            className="flex flex-col sm:flex-row items-center justify-center gap-8"
          >
            <RainbowButton onClick={() => navigate('/payment')}>
               Start Project <ChevronRight className="w-5 h-5 ml-2" />
            </RainbowButton>

            <RainbowButton onClick={() => scrollToSection('showcase')}>
               Explore Features
            </RainbowButton>
          </motion.div>
        </div>
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
                  glowColor="blue"
                  onExpand={() => navigate('/product-details')}
                />
             </ScrollReveal>
             <ScrollReveal delay={0.2}>
                <ServiceCard 
                  title="Pricing AI Agent" 
                  subtitle="AI agent that analyzes PDF/Excel for accurate estimation."
                  icon={Calculator}
                  glowColor="purple"
                  onExpand={() => navigate('/pricing')}
                  badge="Coming Soon"
                />
             </ScrollReveal>
             <ScrollReveal delay={0.3}>
                <ServiceCard 
                  title="Renovation" 
                  subtitle="Complete project management for Kitchen & Bath remodels."
                  icon={Hammer}
                  glowColor="orange"
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

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
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
           
           {/* Timeline Section */}
           <div className="mt-20">
               <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">Building the future of interior construction management step by step.</p>
               </div>
               <Timeline items={timelineItems} />
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <GradientButton 
              onClick={() => navigate('/payment')}
              className="min-w-[200px]"
            >
              Create Account
            </GradientButton>
            
            <GradientButton 
              variant="variant"
              onClick={() => navigate('/login')}
              className="min-w-[200px]"
            >
              Login to Dashboard
            </GradientButton>
          </div>
        </div>
      </section>

      {/* 6. REDESIGNED FOOTER */}
      <section id="contact" className="bg-[#020202]">
         <Footer />
      </section>

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

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "circle(0% at 100% 0)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 100% 0)" }}
            exit={{ opacity: 0, clipPath: "circle(0% at 100% 0)" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[60] bg-[#050505] flex flex-col items-center justify-center"
          >
             <button 
               onClick={() => setIsMobileMenuOpen(false)}
               className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white"
               aria-label="Close menu"
             >
                <X size={32} />
             </button>
             
             {/* Decorative Background */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[100px]" />
                 <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
             </div>

             <nav className="relative z-10 flex flex-col items-center gap-8">
                {[
                  { label: 'Home', action: () => containerRef.current?.scrollTo({ top: 0, behavior: 'smooth'}) },
                  { label: 'Our Products', action: () => scrollToSection('showcase') },
                  { label: 'About Us', action: () => scrollToSection('bento') },
                  { label: 'Pricing', action: () => navigate('/pricing') },
                  { label: 'Contact Us', action: () => scrollToSection('contact') },
                ].map((item, idx) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.1 }}
                    onClick={() => { item.action(); setIsMobileMenuOpen(false); }}
                    className="text-3xl font-bold text-gray-300 hover:text-brand-400 active:text-brand-500 transition-colors duration-300"
                  >
                    {item.label}
                  </motion.button>
                ))}
                
                <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.6 }}
                   className="flex flex-col gap-4 mt-8 w-64"
                >
                    <DynamicBorderButton 
                      onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} 
                      className="w-full justify-center font-bold"
                    >
                      LOG IN
                    </DynamicBorderButton>
                    <GradientButton 
                      onClick={() => { navigate('/payment'); setIsMobileMenuOpen(false); }}
                      className="w-full justify-center"
                    >
                      START PROJECT
                    </GradientButton>
                </motion.div>
             </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
