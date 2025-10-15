"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/theme-context";
import { useAuth } from "@/contexts/auth-context";
import { Mail, Sun, Moon, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    }`}>
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
            Reset Password
          </CardTitle>
          <CardDescription className={`text-center ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                className={`w-full ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className={`flex flex-col items-center gap-4 py-6 ${
              isDarkMode ? "bg-green-900/20 text-green-400" : "bg-green-50 text-green-600"
            } rounded-md p-6`}>
              <CheckCircle className="h-12 w-12" />
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Check your email</h3>
                <p className="text-sm">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm">
                  Click the link in the email to reset your password.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link 
            href="/login" 
            className={`flex items-center gap-2 text-sm hover:underline ${
              isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
