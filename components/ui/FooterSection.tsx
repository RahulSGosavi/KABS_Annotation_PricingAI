'use client';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Facebook, Linkedin, Youtube, Hexagon, Twitter, Instagram } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FooterLink {
	title: string;
	href: string;
    action?: () => void;
	icon?: React.ElementType;
}

interface FooterSection {
	label: string;
	links: FooterLink[];
}

export function Footer() {
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const footerLinks: FooterSection[] = [
        {
            label: 'Product',
            links: [
                { title: 'Features', href: '#', action: () => scrollToSection('showcase') },
                { title: 'Pricing', href: '/pricing', action: () => navigate('/pricing') },
                { title: 'Start Project', href: '/payment', action: () => navigate('/payment') },
                { title: 'Login', href: '/login', action: () => navigate('/login') },
            ],
        },
        {
            label: 'Company',
            links: [
                { title: 'About Us', href: '#', action: () => scrollToSection('bento') },
                { title: 'Contact', href: '#', action: () => scrollToSection('contact') },
                { title: 'Privacy Policy', href: '/privacy', action: () => navigate('/privacy') },
                { title: 'Terms of Service', href: '/terms', action: () => navigate('/terms') },
            ],
        },
        {
            label: 'Connect',
            links: [
                { title: 'Facebook', href: 'https://www.facebook.com/kbglobalpartners/', icon: Facebook },
                { title: 'LinkedIn', href: 'https://www.linkedin.com/company/kabstech/', icon: Linkedin },
                { title: 'Youtube', href: 'https://www.youtube.com/@kabs3313', icon: Youtube },
            ],
        },
    ];

	return (
		<footer className="relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center border-t border-white/5 bg-[radial-gradient(35%_128px_at_50%_0%,rgba(255,255,255,0.08),transparent)] px-6 py-12 lg:py-16 overflow-hidden">
			{/* Top glow effect */}
            <div className="absolute top-0 right-1/2 left-1/2 h-px w-1/3 -translate-x-1/2 -translate-y-1/2 bg-white/20 rounded-full blur-[2px]" />

			<div className="grid w-full gap-8 xl:grid-cols-3 xl:gap-8">
				<AnimatedContainer className="space-y-4 flex flex-col items-start">
                    <div className="flex items-center gap-2" onClick={() => scrollToSection('hero')}>
                        <img 
                            src="/logo.png" 
                            alt="KABS" 
                            className="h-8 w-auto object-contain invert brightness-0 invert cursor-pointer" 
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                document.getElementById('footer-fallback')?.classList.remove('hidden');
                            }}
                        />
                        <div id="footer-fallback" className="hidden flex items-center gap-2">
                             <span className="font-bold text-xl tracking-tight text-white">KABS</span>
                        </div>
                    </div>
					<p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                        Redefining architectural annotation and cost estimation for the modern era.
					</p>
                    <p className="text-gray-500 text-xs mt-4">
						© {new Date().getFullYear()} KABS. All rights reserved.
					</p>
				</AnimatedContainer>

				<div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3 xl:col-span-2 xl:mt-0">
					{footerLinks.map((section, index) => (
						<React.Fragment key={section.label}>
                            <AnimatedContainer delay={0.1 + index * 0.1}>
                                <div className="mb-10 md:mb-0">
                                    <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">{section.label}</h3>
                                    <ul className="space-y-3 text-sm">
                                        {section.links.map((link) => (
                                            <li key={link.title}>
                                                {link.action ? (
                                                    <button
                                                        onClick={link.action}
                                                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                                                    >
                                                        {link.icon && <link.icon className="size-4" />}
                                                        <span className="group-hover:translate-x-1 transition-transform">{link.title}</span>
                                                    </button>
                                                ) : (
                                                    <a
                                                        href={link.href}
                                                        target={link.href.startsWith('http') ? "_blank" : "_self"}
                                                        rel="noopener noreferrer"
                                                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                                                    >
                                                        {link.icon && <link.icon className="size-4" />}
                                                        <span className="group-hover:translate-x-1 transition-transform">{link.title}</span>
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </AnimatedContainer>
                        </React.Fragment>
					))}
				</div>
			</div>
            
             {/* Live Status Indicator */}
             <div className="mt-12 flex items-center gap-3 bg-[#111] px-4 py-2 rounded-full border border-white/5 shadow-inner opacity-50 hover:opacity-100 transition-opacity">
                <div className="relative">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 absolute top-0 left-0 animate-ping opacity-75"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 relative block shadow-[0_0_8px_#22c55e]"></span>
                </div>
                <span className="text-xs font-bold text-gray-300 tracking-wider uppercase">System Online</span>
                <span className="text-xs text-gray-600 font-mono">v1.0.2</span>
             </div>
		</footer>
	);
}

interface ViewAnimationProps {
	delay?: number;
	className?: string;
	children?: React.ReactNode;
}

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', y: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', y: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}