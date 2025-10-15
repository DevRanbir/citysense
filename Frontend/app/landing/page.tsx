"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StaggeredMenu } from "@/components/StaggeredMenu"
import { PageLoader } from "@/components/page-loader"
import { useTheme } from "@/contexts/theme-context"
import PillNav from '@/components/PillNav'
import logo from '@/public/favicon.svg'
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { RiSparkling2Line } from "@remixicon/react"
import Lottie from "lottie-react"
import landingAnimation from "@/components/landing-animation.json"

import { 
  MapPin, 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  Activity, 
  Target, 
  Building,
  Phone,
  Ambulance,
  TrendingUp,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  X,
  CarTaxiFront,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"

// Helper component to sync mobile sidebar state
function SidebarSync({ isOpen }: { isOpen: boolean }) {
  const { setOpenMobile, isMobile } = useSidebar();
  
  useEffect(() => {
    if (isMobile && isOpen) {
      setOpenMobile(true);
    } else if (isMobile && !isOpen) {
      setOpenMobile(false);
    }
  }, [isOpen, isMobile, setOpenMobile]);
  
  return null;
}

export default function LandingPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showPillNav, setShowPillNav] = useState(false)
  const [isChatboxOpen, setIsChatboxOpen] = useState(false)
  const [buttonSuccess, setButtonSuccess] = useState(false)
  const [hideScrollbar, setHideScrollbar] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Handle page load animations
  useEffect(() => {
    if (isDarkMode) {
      // Dark mode: Use loading delays
      const loadTimer = setTimeout(() => {
        setIsLoaded(true);
      }, 5500);

      const titleTimer = setTimeout(() => {
        setShowTitle(true);
      }, 6000);

      const subtitleTimer = setTimeout(() => {
        setShowSubtitle(true);
      }, 6500);

      const buttonsTimer = setTimeout(() => {
        setShowButtons(true);
      }, 7000);

      const menuTimer = setTimeout(() => {
        setShowMenu(true);
      }, 7200);

      return () => {
        clearTimeout(loadTimer);
        clearTimeout(titleTimer);
        clearTimeout(subtitleTimer);
        clearTimeout(buttonsTimer);
        clearTimeout(menuTimer);
      };
    } else {
      // Light mode: Show everything immediately
      setIsLoaded(true);
      setShowTitle(true);
      setShowSubtitle(true);
      setShowButtons(true);
      setShowMenu(true);
    }
  }, [isDarkMode]);

  // Handle scroll to show/hide PillNav based on viewport position
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const viewportHeight = window.innerHeight;
          
          // Show PillNav when user scrolls past 100vh with a small buffer
          const shouldShow = scrollY > viewportHeight + 50;
          setShowPillNav(shouldShow);
          
          // Hide scrollbar only in first 100vh
          setHideScrollbar(scrollY < viewportHeight);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = [
    { value: "45%", label: "Faster response times", icon: TrendingUp },
    { value: "99.9%", label: "System uptime", icon: Activity },
    { value: "24/7", label: "Emergency support", icon: Clock },
    { value: "500+", label: "Ai prompts served", icon: Building }
  ]

  const additionalStats = [
    { value: "Many", label: "Emergency calls handled", icon: Phone },
    { value: "15sec", label: "Average route calculation", icon: Target },
    { value: "98%", label: "Accuracy rate", icon: CheckCircle },
    { value: "Most", label: "Emergency departments Linked", icon: Ambulance }
  ]

  const features = [
    {
      title: "Real-time vehicle tracking",
      description: "Monitor all emergency vehicles in real-time with GPS precision and live status updates.",
      icon: MapPin,
      color: "bg-red-50 dark:bg-red-900/20"
    },
    {
      title: "AI route optimization",
      description: "Advanced algorithms calculate the fastest routes considering traffic, road conditions, and priorities.",
      icon: Zap,
      color: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      title: "AI-Vehicle coordination",
      description: "Coordinate multiple vehicles with intelligent dispatching and resource allocation to reach their destinations efficiently.",
      icon: CarTaxiFront,
      color: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Emergency analytics",
      description: "Comprehensive analytics and reporting to improve response times and operational efficiency.",
      icon: BarChart3,
      color: "bg-green-50 dark:bg-green-900/20"
    }
  ]

  const faqs = [
    {
      question: "How fast can the system calculate emergency routes?",
      answer: "Our AI-powered system calculates optimal emergency routes within few seconds, considering real-time traffic, road conditions, and emergency priorities."
    },
    {
      question: "What types of emergency vehicles are supported?",
      answer: "Our platform supports all emergency vehicles including ambulances, fire trucks, police vehicles, and specialized rescue units with customized routing for each type."
    },
    {
      question: "Is the system available 24/7?",
      answer: "Yes, our emergency route control system operates 24/7 with 99.9% uptime and dedicated emergency support for critical situations."
    },
    {
      question: "How does the system handle multiple simultaneous emergencies?",
      answer: "Our intelligent dispatch system can coordinate multiple emergency vehicles simultaneously, optimizing resources, allocation and preventing conflicts in routing."
    }
  ]

  return (
    <PageLoader>
      <SidebarProvider 
        open={isChatboxOpen} 
        onOpenChange={setIsChatboxOpen}
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap');
          
          body::-webkit-scrollbar,
          html::-webkit-scrollbar {
            display: ${hideScrollbar ? 'none' : 'block'};
          }
          body,
          html {
            scrollbar-width: ${hideScrollbar ? 'none' : 'auto'};
            -ms-overflow-style: ${hideScrollbar ? 'none' : 'auto'};
          }
          
          @keyframes zoom-in {
            0% {
              opacity: 0;
              transform: scale(0.5);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fade-in-scale {
            0% {
              opacity: 0;
              transform: scale(0.8);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          .animate-zoom-in {
            animation: zoom-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .animate-fade-in-scale {
            animation: fade-in-scale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          
          .light-animated-button {
            display: block;
            background-color: #ef4444;
            width: 150px;
            height: 45px;
            line-height: 45px;
            color: #fff;
            cursor: pointer;
            overflow: hidden;
            border-radius: 6px;
            transition: all 0.25s cubic-bezier(0.310, -0.105, 0.430, 1.400);
            text-decoration: none;
            position: relative;
          }
          
          .light-animated-button span,
          .light-animated-button .icon {
            display: block;
            height: 100%;
            text-align: center;
            position: absolute;
            top: 0;
          }
          
          .light-animated-button span {
            width: 72%;
            line-height: inherit;
            font-size: 14px;
            text-transform: uppercase;
            font-weight: 600;
            left: 0;
            transition: all 0.25s cubic-bezier(0.310, -0.105, 0.430, 1.400);
          }
          
          .light-animated-button span:after {
            content: '';
            background-color: #dc2626;
            width: 2px;
            height: 60%;
            position: absolute;
            top: 20%;
            right: -1px;
          }
          
          .light-animated-button .icon {
            width: 28%;
            right: 0;
            transition: all 0.25s cubic-bezier(0.310, -0.105, 0.430, 1.400);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .light-animated-button .icon svg {
            width: 18px;
            height: 18px;
            transition: all 0.25s cubic-bezier(0.310, -0.105, 0.430, 1.400);
          }
          
          .light-animated-button:hover span {
            left: -72%;
            opacity: 0;
          }
          
          .light-animated-button:hover .icon {
            width: 100%;
          }
          
          .light-animated-button:hover .icon svg {
            width: 24px;
            height: 24px;
            color: #dc2626;
          }
          
          .light-animated-button:hover {
            background-color: #ffffffff;
            border: 1px solid #dc2626;
            color: #dc2626;
          }
          
          .light-animated-button:active {
            transform: translateY(1px);
          }
        `}</style>
        
        <div className={`${isDarkMode ? "dark bg-gray-900 text-white w-full" : "bg-white text-gray-900 w-full"}`} style={{ scrollBehavior: 'smooth' }}>
        

        
        {/* PillNav - Desktop: bottom right, Mobile: bottom center navbar */}
        {/* Desktop PillNav - bottom right */}
        <div className={`hidden md:block fixed bottom-6 z-50 ease-in-out transition-all duration-300 ${
          showPillNav 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        } ${
          isChatboxOpen 
            ? 'right-[28rem]' // Move left when sidebar is open (24rem sidebar width + 4rem margin)
            : 'right-5' // Normal position when sidebar is closed
        }`}>
          <PillNav
            logo={logo}
            logoAlt="Company Logo"
            items={[
              { label: 'Demo', href: '/demo' },
              { label: 'Reports', href: '/dashboard' },
              { label: 'Contact', href: '/contact' }
            ]}
            activeHref="/"
            className="custom-nav"
            ease="power2.easeOut"
            baseColor={isDarkMode ? "#ffffff" : "#EF4444"}
            pillColor={isDarkMode ? "#000000" : "#ffffffff"}
            hoveredPillTextColor={isDarkMode ? "#000000" : "#ffffff"}
            pillTextColor={isDarkMode ? "#ffffff" : "#000000c8"}
            hidden={true}
          />
        </div>

        {/* Mobile Navigation Bar - bottom center */}
        {!isChatboxOpen && (
          <div className={`md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
            showPillNav 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 translate-y-full pointer-events-none'
          }`}>
          <div className={`mx-4 mb-4 rounded-xl backdrop-blur-md border shadow-lg ${
            isDarkMode 
              ? 'bg-gray-900/90 border-gray-700' 
              : 'bg-white/90 border-gray-200'
          }`}>
            <nav className="flex justify-center items-center py-3 px-4">
              <div className="flex gap-6">
                <Link href="/demo" className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium text-xs ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/60' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}>
                  Demo
                </Link>
                
                <Link href="/dashboard" className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium text-xs ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/60' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}>
                  Reports
                </Link>
                
                <Link href="/contact" className={`px-3 py-2 rounded-lg transition-all duration-200 font-medium text-xs ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800/60' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60'
                }`}>
                  Contact
                </Link>
              </div>
            </nav>
          </div>
        </div>
        )}
  
        {/* Hero Section */}
        {isDarkMode ? (
          // Dark Mode - Video Version
          <section className="relative py-8 px-4 pt-8 min-h-screen flex items-center">
            {/* Video Background */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover z-0"
            >
              <source src="/vid.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video>
            
            {/* Overlay for better text readability */}
            <div className="absolute top-0 left-0 w-full h-full z-10 bg-black/40"></div>
            
            {/* Top Left Theme Toggle with Logo */}
            {showTitle && (
              <div className="absolute top-8 left-8 z-30 animate-fade-in-scale flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-1 text-white/70 hover:text-white transition-all duration-300 hover:scale-105"
                  aria-label="Toggle theme"
                >
                  <Sun className="w-4 h-4" />
                </button>
                <h2 
                  className="text-2xl sm:text-3xl font-bold text-white tracking-wider"
                  style={{ 
                    fontFamily: 'Major Mono Display, monospace',
                    letterSpacing: '0.1em'
                  }}
                >
                  SCC
                </h2>
              </div>
            )}

            {/* Main Content - Left Aligned */}
            <div className="absolute left-8 sm:left-16 top-1/2 transform -translate-y-1/2 z-20 text-left">
              {showTitle && (
                <div className="animate-zoom-in">
                  <h1 
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight" 
                    style={{ 
                      fontFamily: 'Major Mono Display, monospace',
                      letterSpacing: '0.05em',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      fontWeight: '400'
                    }}
                  >
                    Smart City Copilot
                  </h1>
                </div>
              )}
              {showSubtitle && (
                <div className="animate-fade-in-up max-w-md">
                  <p 
                    className="text-xs sm:text-sm text-white/70 leading-relaxed tracking-wide mb-4"
                    style={{ 
                      fontFamily: 'Major Mono Display, monospace',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Made by team <span className="font-semibold text-white">ChocoLava</span> for advanced mapping and route optimization for emergency services.
                    <br />
                    Get ambulances and fire trucks to destinations faster with AI-powered routing.
                  </p>
                </div>
              )}
            </div>

            {/* Top Right Chatbox */}
            {showMenu && (
              <div className="absolute top-8 right-8 z-30 animate-fade-in-scale">
                <button 
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsChatboxOpen(true);
                  }}
                >
                  <div className="w-3 h-3 border border-white/50"></div>
                  <span 
                    className="text-xs tracking-wider"
                    style={{ 
                      fontFamily: 'Major Mono Display, monospace',
                      letterSpacing: '0.1em'
                    }}
                  >
                    chatbox
                  </span>
                  <span className="text-white/50">›</span>
                </button>
              </div>
            )}
            
            {/* Bottom Right Navigation */}
            {showButtons && (
              <div className="absolute bottom-8 right-8 sm:right-12 z-30 animate-fade-in-up">
                <div className="flex items-center">
                  {/* Demo Button */}
                  <Link 
                    href="/demo"
                    className="group text-xs sm:text-sm font-medium tracking-wider transition-all duration-300 hover:scale-105 text-white/80 hover:text-white"
                    style={{ 
                      fontFamily: 'Major Mono Display, monospace',
                      letterSpacing: '0.1em'
                    }}
                  >
                    <div className="relative w-20 text-center">
                      <span className="block transition-all duration-300 group-hover:opacity-0 group-hover:transform group-hover:-translate-x-2">demo</span>
                      <span className="absolute top-0 right-0 w-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">view demo</span>
                    </div>
                  </Link>

                  {/* Down Arrow */}
                  <div className="animate-bounce mx-2">
                    <ArrowRight className="w-6 h-6 text-white/70 rotate-90 mr-3" />
                  </div>

                  {/* Reports Button */}
                  <Link 
                    href="/dashboard"
                    className="group text-xs sm:text-sm font-medium tracking-wider transition-all duration-300 hover:scale-105 text-white/80 hover:text-white"
                    style={{ 
                      fontFamily: 'Major Mono Display, monospace',
                      letterSpacing: '0.1em'
                    }}
                  >
                    <div className="relative w-24 text-center">
                      <span className="block transition-all duration-300 group-hover:opacity-0 group-hover:transform group-hover:-translate-x-2">reports</span>
                      <span className="absolute top-0 left-0 w-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">view reports</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}

          </section>
        ) : (
          // Light Mode - Original Lottie Version
          <section className="relative py-8 px-4 pt-8 min-h-screen flex items-center">
            {/* Top Left Theme Toggle with Logo */}
            {showTitle && (
              <div className="absolute top-8 left-8 z-30 animate-fade-in-scale flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-all duration-300 hover:scale-105"
                  aria-label="Toggle theme"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold text-red-500 tracking-wider">
                  SCC
                </h2>
              </div>
            )}

            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
                {/* Left side - Text content */}
                <div className="text-left lg:pl-20 order-2 lg:order-1 p-3">
                  {showTitle && (
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight animate-zoom-in">
                      Emergency route control
                      <br className="hidden sm:block" />
                      <span className="text-red-500"> for critical response</span>
                    </h1>
                  )}
                  {showSubtitle && (
                    <p className={`text-lg sm:text-xl md:text-xl mb-6 sm:mb-8 leading-relaxed animate-fade-in-up ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                      Made by team <span className="font-semibold text-red-500">ChocoLava</span> for advanced mapping and route optimization for emergency services.
                      <br className="hidden sm:block" />
                       Get ambulances and fire trucks to destinations faster with AI-powered routing.
                    </p>
                  )}
                  {showButtons && (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up">
                      <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6" asChild>
                        <Link href="/dashboard">View Reports</Link>
                      </Button>
                      <Button size="lg" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold py-3 px-6" asChild>
                        <Link href="/demo">View Demo</Link>
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Right side - Lottie animation */}
                <div className="relative order-1 lg:order-2 mb-6 lg:mb-0">
                  {showTitle && (
                    <div className="lottie-container w-full flex justify-center animate-fade-in-scale">
                      <Lottie
                        animationData={landingAnimation}
                        loop
                        autoplay
                        style={{ 
                          width: '100%', 
                          height: 'auto'
                        }}
                        className="max-w-[400px] sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] xl:max-w-[800px] 2xl:max-w-[900px] w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Try Chatbox Button - Fixed position for light mode */}
            {!isChatboxOpen && showMenu && (
              <div className="fixed top-4 right-4 z-50 block animate-fade-in-scale">
                <a 
                  className="light-animated-button"
                  href="#" 
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsChatboxOpen(true);
                  }}
                >
                  <span>Try Chatbox</span>
                  <div className="icon">
                    <RiSparkling2Line />
                  </div>
                </a>
              </div>
            )}
          </section>
        )}


      {/* Features Grid */}
      <section className="py-8 sm:py-12 md:py-16 px-4" id="features">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              Emergency Features
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Saving lives through
              <br className="hidden sm:block" />
               faster response
            </h2>
            <p className={`text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Emergency services trust our platform to reduce response times 
              and coordinate critical medical operations effectively.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 md:mb-16">
            {stats.map((stat, index) => (
              <Card key={index} className={`text-center ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                  <stat.icon className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 mx-auto mb-2 text-red-500" />
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 md:mb-16">
            {additionalStats.map((stat, index) => (
              <Card key={index} className={`text-center ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                  <stat.icon className="h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                  <div className={`text-xs sm:text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4" id="solutions">
        <div className="container mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Emergency Solutions
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Built for critical emergency
              <br className="hidden sm:block" />
               response
            </h2>
            <p className={`text-base sm:text-lg mt-4 max-w-2xl mx-auto px-4 sm:px-0 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Advanced mapping technology designed specifically for emergency services, 
              with real-time coordination and intelligent route optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`${feature.color} ${isDarkMode ? "bg-gray-800 border-gray-700" : ""} p-4 sm:p-6`}>
                <CardHeader>
                  <feature.icon className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 mb-3 sm:mb-4 text-red-500" />
                  <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className={`text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4" id="documentation">
        <div className="container mx-auto max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              FAQ
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold">Frequently asked questions</h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""} p-4 sm:p-6`}>
                <CardHeader className="p-0 pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg text-blue-600 dark:text-blue-400">
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className={`text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4" id="contacts">
        <div className="container mx-auto max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              Emergency Contacts
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              24/7 Emergency Support
            </h2>
            <p className={`text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Our emergency response team is available around the clock to assist 
              with critical situations and system support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">

            <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""} p-4 sm:p-2`}>
              <CardHeader>
                <Building className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 mb-3 sm:mb-4 text-blue-500" />
                <CardTitle className="text-lg sm:text-xl">Operations Center</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base sm:text-lg font-semibold mb-2">Emergency Operations HQ</p>
                <p className={`text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  SCC headquarters<br />
                  Chandigarh City, Sector 17<br />
                  Available 24/7 for coordination
                </p>
              </CardContent>
            </Card>

            <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""} p-4 sm:p-2`}>
              <CardHeader>
                <Activity className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 mb-3 sm:mb-4 text-green-500" />
                <CardTitle className="text-lg sm:text-xl">Technical Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base sm:text-lg font-semibold mb-2">24bcs11076@cuchd.in</p>
                <p className={`text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Technical support for system issues, training, and implementation assistance.
                </p>
              </CardContent>
            </Card>

            <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : ""} p-4 sm:p-2`}>
              <CardHeader>
                <Shield className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 mb-3 sm:mb-4 text-purple-500" />
                <CardTitle className="text-lg sm:text-xl">Emergency Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base sm:text-lg font-semibold mb-2">+91-9041107458</p>
                <p className={`text-sm sm:text-base ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Direct line to emergency coordination team for dispatch and route optimization.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${isDarkMode ? "border-gray-800 bg-gray-900" : "border-gray-200 bg-gray-50"} py-12`}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-red-500" />
                <span className="font-bold">Smart City Copilot</span>
              </div>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Advanced emergency route 
                control and traffic optimization 
                for critical response scenarios.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className={`space-y-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>Real-time Routing</li>
                <li>Vehicle Tracking</li>
                <li>Traffic Management</li>
                <li>Emergency Analytics</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Solutions</h3>
              <ul className={`space-y-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>Ambulance Services</li>
                <li>Fire Departments</li>
                <li>Police Operations</li>
                <li>Rescue Operations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className={`space-y-2 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                <li>Documentation</li>
                <li>24/7 Emergency Support</li>
                <li>Training & Onboarding</li>
                <li>System Status</li>
              </ul>
            </div>
          </div>
          
          <div className={`border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"} mt-8 pt-8 flex flex-col md:flex-row justify-between items-center`}>
            <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              © 2024 EmergencyRoute. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className={`text-sm hover:text-red-500 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Privacy Policy
              </a>
              <a href="#" className={`text-sm hover:text-red-500 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Terms of Service
              </a>
              <a href="#" className={`text-sm hover:text-red-500 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Emergency Protocols
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
    
    {/* Chatbox Sidebar */}
    <SidebarSync isOpen={isChatboxOpen} />
    <AppSidebar selectedLocation="Chandigarh" side="right" className="block" />
    
    </SidebarProvider>
    </PageLoader>
  )
}