"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

export default function LoginPage() {
  const { signIn } = useAuth();
  
  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState<'consumer' | 'government'>('consumer');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Assuming username is email for Firebase auth
      await signIn(username, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header - Pill-shaped Floating Nav */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-full px-8 py-3 flex items-center gap-8">
          <div className="text-xl font-bold tracking-tight">
            City<span className="text-lime-500">Sense</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">Home</Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">Dashboard</Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder='Search...'
                className="pl-10 pr-4 py-2 w-48 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 transition-all"
              />
            </div>
            <Link href="/signup">
              <Button className="bg-lime-400 hover:bg-lime-500 text-black font-medium rounded-full px-5 py-2 text-sm transition-colors">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex pt-0">
        {/* Left Section */}
        <div className="flex-1 flex flex-col justify-between p-12 lg:p-20">
          <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            <div className="space-y-6 pt-5 text-center">
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight text-gray-900">
                POWERED BY<br />
                <span className="relative inline-block">
                  INNOVATION
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-lime-400 -z-10"></span>
                </span>
                <br />
                FOR SMARTER<br />
                CITIES.
              </h1>
              <div className="flex gap-3 mt-8 justify-center">
                <div className="w-12 h-12 rounded-full bg-lime-400 shadow-lg"></div>
                <div className="w-12 h-12 rounded-full bg-lime-500 shadow-lg"></div>
                <div className="w-12 h-12 rounded-full bg-lime-600 shadow-lg"></div>
              </div>
            </div>

            {/** Login Toggle header */}
            <div className="max-w-md mx-auto text-center">
              <p className="text-xs text-gray-600 tracking-widest font-medium">SMART CITY PLATFORM</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">Welcome Back</h2>
              <p className="text-sm text-gray-500 mt-1">Please sign in to your account</p>
            </div>
          </div>

          <div className="max-w-md mx-auto bg-black text-white rounded-2xl mt-4 p-8 space-y-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-center">About CitySense</h2>
            <p className="text-gray-300 text-sm leading-relaxed text-center">
              Join <span className="text-lime-400 font-semibold">thousands</span> of cities worldwide using 
              real-time data and AI to optimize traffic flow, reduce emissions, and improve urban living.
            </p>
            <div className="pt-4">
              <img 
                src="/images/image_1.png" 
                alt="City traffic" 
                className="rounded-xl w-full h-32 object-cover opacity-90 shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Login Card with Background */}
        <div className="flex-1 relative hidden lg:flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/image_0.png')",
              filter: "brightness(0.85) contrast(1.1)"
            }}
          >
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60"></div>
          </div>

          {/* Login Card */}
          <div className="relative z-10 bg-white rounded-3xl p-8 -mt-28 w-full max-w-md mx-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Login to your account</h2>
              <p className="text-sm text-gray-500 mt-1 capitalize">{loginType} Portal</p>
            </div>

            {/* Login Type Toggle */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-full p-2 mb-6">
              <button
                onClick={() => setLoginType('consumer')}
                className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  loginType === 'consumer'
                    ? 'bg-lime-400 text-black shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Consumer
              </button>
              <button
                onClick={() => setLoginType('government')}
                className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  loginType === 'government'
                    ? 'bg-lime-400 text-black shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Government
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Jackob blonde"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm text-gray-700">
                    Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-lime-400 rounded border-gray-300"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </Label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-sm p-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
              >
                {isLoading ? "Signing in..." : "login"}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have account?{" "}
                <Link href="/signup" className="text-gray-900 font-medium hover:underline">
                  Create account
                  <ArrowRight className="inline h-3 w-3 ml-1" />
                </Link>
              </p>
            </div>
          </div>

          {/* Pagination Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3 text-white">
            <button className="hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-lg font-medium">01/05</span>
            <button className="hover:opacity-80 transition-opacity">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
