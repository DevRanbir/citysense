"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff, ArrowRight, Search, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

export default function SignupPage() {
  const { signUp, user } = useAuth();
  const router = useRouter();
  const [userType, setUserType] = useState<'consumer' | 'government'>('consumer');
  
  // Signup state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(false);

  // Auto-check verification status every 5 seconds
  useEffect(() => {
    if (verificationSent && user) {
      const checkInterval = setInterval(async () => {
        // Reload user to get latest emailVerified status
        await user.reload();
        if (user.emailVerified) {
          clearInterval(checkInterval);
          // Store user type in localStorage for onboarding
          localStorage.setItem('userType', userType);
          router.push('/onboarding');
        }
      }, 5000);

      return () => clearInterval(checkInterval);
    }
  }, [verificationSent, user, router, userType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      // Sign up without display name - will be collected during onboarding
      await signUp(email, password);
      setVerificationSent(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    setError("");

    try {
      if (user) {
        // Reload user to get latest emailVerified status
        await user.reload();
        
        if (user.emailVerified) {
          // Store user type in localStorage for onboarding
          localStorage.setItem('userType', userType);
          // Verified! Redirect to onboarding
          router.push('/onboarding');
        } else {
          setError("Email not verified yet. Please check your inbox and click the verification link.");
        }
      } else {
        setError("No user found. Please try signing up again.");
      }
    } catch (err: any) {
      setError("Failed to check verification status. Please try again.");
    } finally {
      setCheckingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header - Pill-shaped Floating Nav */}
      <header className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
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
            <Link href="/login">
              <Button className="bg-lime-400 hover:bg-lime-500 text-black font-medium rounded-full px-5 py-2 text-sm transition-colors">
                Login
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
                JOIN THE<br />
                <span className="relative inline-block">
                  FUTURE
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-lime-400 -z-10"></span>
                </span>
                <br />
                OF SMART<br />
                CITIES.
              </h1>
              <div className="flex gap-3 mt-8 justify-center">
                <div className="w-12 h-12 rounded-full bg-lime-400 shadow-lg"></div>
                <div className="w-12 h-12 rounded-full bg-lime-500 shadow-lg"></div>
                <div className="w-12 h-12 rounded-full bg-lime-600 shadow-lg"></div>
              </div>
            </div>

            {/** Signup header */}
            <div className="max-w-md mx-auto text-center">
              <p className="text-xs text-gray-600 tracking-widest font-medium">SMART CITY PLATFORM</p>
              <h2 className="text-3xl font-bold mt-2 text-gray-900">Create Account</h2>
              <p className="text-sm text-gray-500 mt-1">Sign up to get started</p>
            </div>
          </div>

        </div>

        {/* Right Section - Signup Card with Background */}
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

          {/* Signup Card */}
          <div className="relative z-10 bg-white rounded-3xl p-8 mt-20 w-full max-w-md mx-8 shadow-2xl">
            {!verificationSent ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{userType} Portal</p>
                </div>

                {/* User Type Toggle */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-full p-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setUserType('consumer')}
                    className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                      userType === 'consumer'
                        ? 'bg-lime-400 text-black shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Consumer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('government')}
                    className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                      userType === 'government'
                        ? 'bg-lime-400 text-black shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Government
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 accent-lime-400 rounded border-gray-300"
                />
                <Label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-gray-900 font-medium hover:underline">
                    Terms & Conditions
                  </Link>
                </Label>
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
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-gray-900 font-medium hover:underline">
                  Sign in
                  <ArrowRight className="inline h-3 w-3 ml-1" />
                </Link>
              </p>
            </div>
            </>
            ) : (
              /* Verification Sent Message */
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>
                <p className="text-gray-600 mb-2">
                  We've sent a verification link to
                </p>
                <p className="text-gray-900 font-medium mb-4">{email}</p>
                <p className="text-sm text-gray-500 mb-6">
                  Click the link in the email to verify your account. We'll automatically detect when you verify and redirect you to onboarding.
                </p>
                
                {/* Auto-checking indicator */}
                <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600">
                  <div className="animate-pulse w-2 h-2 bg-lime-500 rounded-full"></div>
                  <span>Auto-checking every 5 seconds...</span>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-sm p-3 mb-4 rounded-xl bg-red-50 text-red-600 border border-red-200">
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handleCheckVerification}
                    disabled={checkingVerification}
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {checkingVerification ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Checking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        I have verified
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                  >
                    Resend verification email
                  </Button>
                  
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="w-full h-12 text-gray-600 hover:text-gray-900 rounded-xl font-medium transition-colors"
                    >
                      Back to login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
