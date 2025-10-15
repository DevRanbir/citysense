"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff, Mail, Lock, Sun, Moon, AlertCircle, Phone } from "lucide-react";
import Link from "next/link";
import { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";

export default function LoginPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { signIn, signInWithGoogle, setupRecaptcha, signInWithPhone } = useAuth();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone login state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loginMethod === 'phone' && !recaptchaVerifier) {
      try {
        const verifier = setupRecaptcha('recaptcha-container');
        setRecaptchaVerifier(verifier);
      } catch (err) {
        console.error("Failed to setup recaptcha:", err);
      }
    }
  }, [loginMethod, recaptchaVerifier, setupRecaptcha]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!showOtpInput) {
        // Send OTP
        if (!recaptchaVerifier) {
          throw new Error("Recaptcha not initialized");
        }
        
        // Format phone number with country code if not present
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
        
        const result = await signInWithPhone(formattedPhone, recaptchaVerifier);
        setConfirmationResult(result);
        setShowOtpInput(true);
        setIsLoading(false);
      } else {
        // Verify OTP
        if (!confirmationResult) {
          throw new Error("No confirmation result");
        }
        await confirmationResult.confirm(otp);
        // Success - will be handled by auth context
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with phone");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError("");
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to sign in with Google";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
      {/* Recaptcha Container */}
      <div id="recaptcha-container"></div>
      
      {/* Theme Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 ${
          isDarkMode ? "text-gray-200 hover:text-white" : "text-gray-700 hover:text-gray-900"
        }`}
      >
        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      <Card className={`w-full max-w-md ${
        isDarkMode 
          ? "bg-gray-800 border-gray-700" 
          : "bg-white border-gray-200"
      }`}>
        <CardHeader className="space-y-1">
          <CardTitle className={`text-2xl font-bold text-center ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}>
            Welcome Back
          </CardTitle>
          <CardDescription className={`text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Sign in to access your CitySense dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Login Method Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              type="button"
              variant={loginMethod === 'email' ? 'default' : 'outline'}
              className={`flex-1 ${loginMethod === 'email' ? '' : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
              onClick={() => {
                setLoginMethod('email');
                setError("");
                setShowOtpInput(false);
              }}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button
              type="button"
              variant={loginMethod === 'phone' ? 'default' : 'outline'}
              className={`flex-1 ${loginMethod === 'phone' ? '' : isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : ''}`}
              onClick={() => {
                setLoginMethod('phone');
                setError("");
                setShowOtpInput(false);
              }}
            >
              <Phone className="h-4 w-4 mr-2" />
              Phone
            </Button>
          </div>

          {/* Email Login Form */}
          {loginMethod === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email"
                  className={isDarkMode ? "text-gray-200" : "text-gray-700"}
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label 
                    htmlFor="password"
                    className={isDarkMode ? "text-gray-200" : "text-gray-700"}
                  >
                    Password
                  </Label>
                  <Link 
                    href="/forgot-password" 
                    className={`text-sm hover:underline ${
                      isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${
                  isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          )}

          {/* Phone Login Form */}
          {loginMethod === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {!showOtpInput ? (
                <>
                  {/* Phone Number Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="phone"
                      className={isDarkMode ? "text-gray-200" : "text-gray-700"}
                    >
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`} />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 1234567890"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={`pl-10 ${
                          isDarkMode 
                            ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" 
                            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                        }`}
                        required
                      />
                    </div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Include country code (e.g., +91 for India)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* OTP Field */}
                  <div className="space-y-2">
                    <Label 
                      htmlFor="otp"
                      className={isDarkMode ? "text-gray-200" : "text-gray-700"}
                    >
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`${
                        isDarkMode 
                          ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" 
                          : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                      }`}
                      maxLength={6}
                      required
                    />
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Enter the 6-digit code sent to {phoneNumber}
                    </p>
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${
                  isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
                }`}>
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : showOtpInput ? "Verify OTP" : "Send OTP"}
              </Button>

              {showOtpInput && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowOtpInput(false);
                    setOtp("");
                    setError("");
                  }}
                  className={`w-full ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600" 
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Change Phone Number
                </Button>
              )}
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className={`absolute inset-0 flex items-center ${
              isDarkMode ? "text-gray-600" : "text-gray-400"
            }`}>
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className={`px-2 ${
                isDarkMode ? "bg-gray-800 text-gray-400" : "bg-white text-gray-500"
              }`}>
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className={`w-full transition-all ${
              isDarkMode 
                ? "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600" 
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </CardContent>
        <CardFooter>
          <p className={`text-sm text-center w-full ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Don't have an account?{" "}
            <Link 
              href="/signup" 
              className={`font-medium hover:underline ${
                isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
              }`}
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
