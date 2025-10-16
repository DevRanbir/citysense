"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/contexts/auth-context"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import GridMotion from "@/components/GridMotion"

import { 
  MapPin, 
  Zap, 
  Shield, 
  Clock, 
  Activity, 
  Target, 
  Building,
  Phone,
  Ambulance,
  TrendingUp,
  BarChart3,
  CheckCircle,
  Sun,
  Moon,
  CarTaxiFront,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logOut } = useAuth();
  const [isChatboxOpen, setIsChatboxOpen] = useState(false)

  // GridMotion items configuration
  const gridItems = [
    'AI Traffic',
    <div key='jsx-item-1' className="text-lime-400 font-bold">Emergency Route</div>,
    'https://images.unsplash.com/photo-1508780709619-79562169bc64?q=80&w=3870&auto=format&fit=crop',
    'Smart City',
    <div key='jsx-item-2' className="text-blue-400 font-bold">Real-time Data</div>,
    'IoT Sensors',
    <div key='jsx-item-3' className="text-purple-400 font-bold">CitySense</div>,
    'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=3870&auto=format&fit=crop',
    'Vehicle Track',
    <div key='jsx-item-4' className="text-green-400 font-bold">Route Optimize</div>,
    'Analytics',
    <div key='jsx-item-5' className="text-yellow-400 font-bold">AI Powered</div>,
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?q=80&w=3870&auto=format&fit=crop',
    'Blockchain',
    <div key='jsx-item-6' className="text-red-400 font-bold">Emergency</div>,
    'Ambulance',
    <div key='jsx-item-7' className="text-cyan-400 font-bold">Fire Rescue</div>,
    'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=3870&auto=format&fit=crop',
    'Police',
    <div key='jsx-item-8' className="text-orange-400 font-bold">Response Time</div>,
    'Traffic Light',
    <div key='jsx-item-9' className="text-pink-400 font-bold">Coordination</div>,
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=3870&auto=format&fit=crop',
    'GPS Track',
    <div key='jsx-item-10' className="text-indigo-400 font-bold">Live Monitor</div>,
    'Dashboard',
    <div key='jsx-item-11' className="text-teal-400 font-bold">24/7 Support</div>,
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=3870&auto=format&fit=crop',
  ]

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
    <SidebarProvider 
      open={isChatboxOpen} 
      onOpenChange={setIsChatboxOpen}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        .gridmotion-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          opacity: ${isDarkMode ? '0.15' : '0.08'};
        }
      `}</style>
      
      <div className={`${isDarkMode ? "dark bg-[#0a1e1a] text-white w-full" : "bg-white text-gray-900 w-full"}`} style={{ scrollBehavior: 'smooth', position: 'relative' }}>
        
        {/* GridMotion Background */}
        <div className="gridmotion-background">
          <GridMotion items={gridItems} gradientColor={isDarkMode ? '#0a1e1a' : '#ffffff'} />
        </div>

        {/* Main Content Container */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6">
            <div className="max-w-4xl mx-auto flex items-center justify-between backdrop-blur-sm border border-black/90 rounded-2xl p-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  <span className="text-xl font-medium">CitySense</span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-start gap-8">
                <Link href="/contact" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                  Ask a Question
                </Link>
                {user ? (
                  <>
                    <Link href="/dashboard" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                      Dashboard
                    </Link>
                    <button 
                      onClick={logOut}
                      className={`text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                      Login
                    </Link>
                    <Link href="/signup" className={`text-sm font-medium ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>

              {/* CTA Button & Theme Toggle */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-all`}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => setIsChatboxOpen(true)}
                  className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isDarkMode 
                      ? 'bg-lime-400 text-gray-900 hover:bg-lime-300' 
                      : 'bg-lime-500 text-white hover:bg-lime-600'
                  }`}
                >
                  Try the helper bot
                </button>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-lime-400/30 bg-lime-400/5 mb-8">
                <span className={`text-xs font-medium ${isDarkMode ? 'text-lime-400' : 'text-lime-600'}`}>
                  Starting Now in your city 🔥
                </span>
                <span className="px-3 py-0.5 rounded-full bg-lime-400 text-gray-900 text-xs font-bold">
                  Check Out!
                </span>
              </div>

              {/* Main Heading */}
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                CitySense For The CitiZens
              </h1>

              {/* Subheading */}
              <p className={`text-lg md:text-xl mb-12 max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Transforming urban chaos into coordinated intelligence — making cities not just smarter, but truly self-aware.
              </p>



              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {/* AI Card */}
                <div className={`relative p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50 border border-gray-200'} backdrop-blur-sm`}>
                  <div className="mb-4">
                    <div className={`w-16 h-16 mx-auto ${isDarkMode ? 'opacity-80' : 'opacity-90'}`}>
                      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* AI Brain Icon */}
                        <circle cx="32" cy="32" r="28" stroke="#8BC34A" strokeWidth="2" fill="none" opacity="0.3"/>
                        <circle cx="32" cy="32" r="22" stroke="#8BC34A" strokeWidth="2" fill="none" opacity="0.5"/>
                        <circle cx="32" cy="32" r="16" stroke="#8BC34A" strokeWidth="2" fill="none" opacity="0.7"/>
                        <circle cx="32" cy="32" r="4" fill="#8BC34A"/>
                        <line x1="32" y1="16" x2="32" y2="24" stroke="#8BC34A" strokeWidth="2"/>
                        <line x1="32" y1="40" x2="32" y2="48" stroke="#8BC34A" strokeWidth="2"/>
                        <line x1="16" y1="32" x2="24" y2="32" stroke="#8BC34A" strokeWidth="2"/>
                        <line x1="40" y1="32" x2="48" y2="32" stroke="#8BC34A" strokeWidth="2"/>
                        <line x1="21" y1="21" x2="26" y2="26" stroke="#8BC34A" strokeWidth="2"/>
                        <line x1="38" y1="38" x2="43" y2="43" stroke="#8BC34A" strokeWidth="2"/>
                        <line x1="43" y1="21" x2="38" y2="26" stroke="#8BC34A" strokeWidth="2"/>
                        <line x1="26" y1="38" x2="21" y2="43" stroke="#8BC34A" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Artificial Intelligence
                  </h3>
                </div>

                {/* IoT Card */}
                <div className={`relative p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50 border border-gray-200'} backdrop-blur-sm`}>
                  <div className="mb-4">
                    <div className={`w-16 h-16 mx-auto ${isDarkMode ? 'opacity-80' : 'opacity-90'}`}>
                      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* IoT Network Icon */}
                        <circle cx="32" cy="12" r="4" fill="#00BCD4"/>
                        <circle cx="12" cy="32" r="4" fill="#00BCD4"/>
                        <circle cx="52" cy="32" r="4" fill="#00BCD4"/>
                        <circle cx="20" cy="52" r="4" fill="#00BCD4"/>
                        <circle cx="44" cy="52" r="4" fill="#00BCD4"/>
                        <circle cx="32" cy="32" r="6" fill="#00BCD4"/>
                        <line x1="32" y1="16" x2="32" y2="26" stroke="#00BCD4" strokeWidth="2"/>
                        <line x1="16" y1="32" x2="26" y2="32" stroke="#00BCD4" strokeWidth="2"/>
                        <line x1="38" y1="32" x2="48" y2="32" stroke="#00BCD4" strokeWidth="2"/>
                        <line x1="28" y1="36" x2="22" y2="48" stroke="#00BCD4" strokeWidth="2"/>
                        <line x1="36" y1="36" x2="42" y2="48" stroke="#00BCD4" strokeWidth="2"/>
                        <circle cx="32" cy="32" r="10" stroke="#00BCD4" strokeWidth="1" opacity="0.3" strokeDasharray="2 2"/>
                      </svg>
                    </div>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Internet of Things
                  </h3>
                </div>

                {/* Blockchain Card */}
                <div className={`relative p-8 rounded-2xl ${isDarkMode ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-50 border border-gray-200'} backdrop-blur-sm`}>
                  <div className="mb-4">
                    <div className={`w-16 h-16 mx-auto ${isDarkMode ? 'opacity-80' : 'opacity-90'}`}>
                      <svg width="48" height="48" viewBox="0 0 256 240" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid">
                        <title>MetaMask</title>
                        <g>
                            <polygon fill="#E17726" points="250.066018 -8.89651791e-15 140.218553 81.2793133 160.645643 33.3787726"/>
                            <polygon fill="#E27625" points="6.19062016 0.0955267053 95.3715526 33.38465 114.767923 81.9132784"/>
                            <polygon fill="#E27625" points="205.859986 172.858026 254.410647 173.782023 237.442988 231.424252 178.200429 215.112736"/>
                            <polygon fill="#E27625" points="50.1391619 172.857971 77.6964289 215.11288 18.5530579 231.425317 1.68846828 173.782036"/>
                            <polygon fill="#E27625" points="112.130724 69.5516472 114.115388 133.635085 54.744344 130.933905 71.6319541 105.456448 71.8456974 105.210668"/>
                            <polygon fill="#E27625" points="143.254237 68.8369186 184.153999 105.213392 184.365514 105.45719 201.253537 130.934656 141.89632 133.635226"/>
                            <polygon fill="#E27625" points="79.4347776 173.043957 111.853145 198.302774 74.1951401 216.484384"/>
                            <polygon fill="#E27625" points="176.57078 173.040009 181.701672 216.484523 144.149363 198.301203"/>
                            <polygon fill="#D5BFB2" points="144.977922 195.921642 183.084879 214.373531 147.637779 231.220354 148.005818 220.085704"/>
                            <polygon fill="#D5BFB2" points="111.01133 195.929982 108.102093 219.90359 108.340838 231.207237 72.8105145 214.373665"/>
                            <polygon fill="#233447" points="100.007166 141.998856 109.965172 162.926822 76.0615945 152.995277"/>
                            <polygon fill="#233447" points="155.991579 142.000941 180.049716 152.994594 146.03608 162.923638"/>
                            <polygon fill="#CC6228" points="82.0263962 172.830401 76.5459821 217.870023 47.1731221 173.814952"/>
                            <polygon fill="#CC6228" points="173.976111 172.8305 208.830462 173.815081 179.347016 217.871514"/>
                            <polygon fill="#CC6228" points="202.112267 128.387342 176.746779 154.238424 157.190334 145.301352 147.82685 164.985265 141.688645 131.136429"/>
                            <polygon fill="#CC6228" points="53.8753865 128.386879 114.309585 131.136429 108.17138 164.985265 98.8061425 145.303856 79.3525107 154.238823"/>
                            <polygon fill="#E27525" points="52.165606 123.082486 80.8639084 152.203386 81.8584812 180.952278"/>
                            <polygon fill="#E27525" points="203.863346 123.029784 174.117491 181.003017 175.237428 152.202737"/>
                            <polygon fill="#E27525" points="112.906762 124.855691 114.061658 132.125682 116.915771 150.236518 115.080954 205.861884 106.405804 161.177486 106.402953 160.71542"/>
                            <polygon fill="#E27525" points="143.077997 124.755417 149.599051 160.715451 149.596194 161.177486 140.899333 205.973714 140.55515 194.76913 139.198167 149.907127"/>
                            <polygon fill="#F5841F" points="177.788479 151.045975 176.81718 176.023897 146.543342 199.61119 140.4233 195.28712 147.283427 159.951634"/>
                            <polygon fill="#F5841F" points="78.3167053 151.046455 108.716464 159.952427 115.576437 195.28712 109.456385 199.611197 79.1807344 176.021881"/>
                            <polygon fill="#C0AC9D" points="67.0180978 208.857597 105.750143 227.209502 105.586194 219.372868 108.826835 216.528328 147.160694 216.528328 150.518758 219.363342 150.271375 227.194477 188.757733 208.903978 170.030292 224.379509 147.384611 239.933315 108.516484 239.933315 85.8855503 224.315941"/>
                            <polygon fill="#161616" points="142.203502 193.479367 147.679764 197.347701 150.888964 222.952494 146.244706 219.030957 109.769299 219.030957 105.213447 223.031398 108.317268 197.349663 113.795429 193.479367"/>
                            <polygon fill="#763E1A" points="242.814251 2.24978946 256 41.8072765 247.765337 81.803692 253.629038 86.3274221 245.694407 92.3812097 251.657525 96.9865879 243.761206 104.178247 248.609106 107.688972 235.743366 122.714803 182.973386 107.350364 182.516079 107.105244 144.488982 75.0267414"/>
                            <polygon fill="#763E1A" points="13.1860054 2.24978557 111.51151 75.0267402 73.4844118 107.105244 73.0271023 107.350365 20.2567388 122.714804 7.39121291 107.688927 12.2352706 104.180751 4.34251001 96.9865923 10.2945566 92.3862179 2.24133703 86.315099 8.32629691 81.7886671 -8.89651791e-15 41.8087534"/>
                            <polygon fill="#F5841F" points="180.391638 103.990363 236.304873 120.269177 254.470245 176.254719 206.546445 176.25462 173.525532 176.671282 197.539657 129.863284"/>
                            <polygon fill="#F5841F" points="75.6080363 103.990376 58.4568191 129.863284 82.4741865 176.671282 49.4693913 176.254719 1.63053271 176.254719 19.6938968 120.269548"/>
                            <polygon fill="#F5841F" points="163.383898 33.1117385 147.744691 75.3505047 144.425852 132.411352 143.155934 150.295986 143.055195 195.983514 112.943788 195.983514 112.846176 150.381702 111.572114 132.395585 108.251786 75.3505047 92.6150854 33.1117385"/>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Blockchain
                  </h3>
                </div>
              </div>
            </div>
          </section>


          {/* Features Section */}
          <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <Badge className={`mb-4 ${isDarkMode ? 'bg-blue-900/30 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800'}`}>
                  Emergency Solutions
                </Badge>
                <h2 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Built for critical emergency response
                </h2>
                <p className={`text-lg mt-4 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Advanced mapping technology designed specifically for emergency services, 
                  with real-time coordination and intelligent route optimization.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <Card key={index} className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' : feature.color} p-6`}>
                    <CardHeader>
                      <feature.icon className={`h-12 w-12 mb-4 ${isDarkMode ? 'text-lime-400' : 'text-red-500'}`} />
                      <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <Badge className={`mb-4 ${isDarkMode ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-800'}`}>
                  Emergency Features
                </Badge>
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Saving lives through faster response
                </h2>
                <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Emergency services trust our platform to reduce response times 
                  and coordinate critical medical operations effectively.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, index) => (
                  <Card key={index} className={`text-center ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
                    <CardContent className="pt-6">
                      <stat.icon className={`h-8 w-8 mx-auto mb-2 ${isDarkMode ? 'text-lime-400' : 'text-red-500'}`} />
                      <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {additionalStats.map((stat, index) => (
                  <Card key={index} className={`text-center ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' : 'bg-white'}`}>
                    <CardContent className="pt-6">
                      <stat.icon className={`h-8 w-8 mx-auto mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          

          {/* FAQ Section */}
          <section className="py-16 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <Badge className={`mb-4 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                  FAQ
                </Badge>
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Frequently asked questions</h2>
              </div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' : 'bg-white'} p-6`}>
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className={`text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <Badge className={`mb-4 ${isDarkMode ? 'bg-red-900/30 text-red-300 border-red-700' : 'bg-red-100 text-red-800'}`}>
                  Emergency Contacts
                </Badge>
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  24/7 Emergency Support
                </h2>
                <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Our emergency response team is available around the clock to assist 
                  with critical situations and system support.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' : 'bg-white'} p-6`}>
                  <CardHeader>
                    <Building className={`h-12 w-12 mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                    <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Operations Center</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Emergency Operations HQ</p>
                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      SCC headquarters<br />
                      Chandigarh City, Sector 17<br />
                      Available 24/7 for coordination
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' : 'bg-white'} p-6`}>
                  <CardHeader>
                    <Activity className={`h-12 w-12 mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} />
                    <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Technical Support</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>24bcs11076@cuchd.in</p>
                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Technical support for system issues, training, and implementation assistance.
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-sm' : 'bg-white'} p-6`}>
                  <CardHeader>
                    <Shield className={`h-12 w-12 mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                    <CardTitle className={`text-xl ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Emergency Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>+91-9041107458</p>
                    <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Direct line to emergency coordination team for dispatch and route optimization.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className={`border-t ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50'} py-12 px-6`}>
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Shield className={`h-6 w-6 ${isDarkMode ? 'text-lime-400' : 'text-red-500'}`} />
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Smart City Copilot</span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Advanced emergency route 
                    control and traffic optimization 
                    for critical response scenarios.
                  </p>
                </div>
                
                <div>
                  <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Features</h3>
                  <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>Real-time Routing</li>
                    <li>Vehicle Tracking</li>
                    <li>Traffic Management</li>
                    <li>Emergency Analytics</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Solutions</h3>
                  <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>Ambulance Services</li>
                    <li>Fire Departments</li>
                    <li>Police Operations</li>
                    <li>Rescue Operations</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Support</h3>
                  <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <li>Documentation</li>
                    <li>24/7 Emergency Support</li>
                    <li>Training & Onboarding</li>
                    <li>System Status</li>
                  </ul>
                </div>
              </div>
              
              <div className={`border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} mt-8 pt-8 flex flex-col md:flex-row justify-between items-center`}>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  © 2024 EmergencyRoute. All rights reserved.
                </div>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-lime-400' : 'text-gray-600 hover:text-red-500'}`}>
                    Privacy Policy
                  </a>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-lime-400' : 'text-gray-600 hover:text-red-500'}`}>
                    Terms of Service
                  </a>
                  <a href="#" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-lime-400' : 'text-gray-600 hover:text-red-500'}`}>
                    Emergency Protocols
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      
      {/* Chatbox Sidebar */}
      <AppSidebar selectedLocation="Chandigarh" side="right" className="block" />
    </SidebarProvider>
  )
}
