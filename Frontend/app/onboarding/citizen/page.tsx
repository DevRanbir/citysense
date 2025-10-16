"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Search, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebase";
import Stepper, { Step } from "@/components/Stepper";
import Orb from "@/components/Orb";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [wantsNewsletter, setWantsNewsletter] = useState(false);
  const [wantsAlerts, setWantsAlerts] = useState(true);
  const [interests, setInterests] = useState<string[]>([]);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    // Redirect if not logged in or email not verified
    if (user === null) {
      router.push('/login');
    } else if (user && !user.emailVerified) {
      router.push('/signup');
    } else if (user && user.displayName) {
      // Already completed onboarding
      router.push('/dashboard');
    }
  }, [user, router]);

  // Validation function
  const validateForm = () => {
    if (!fullName.trim()) {
      setValidationError("Please enter your full name");
      return false;
    }
    if (!gender) {
      setValidationError("Please select your gender");
      return false;
    }
    if (interests.length === 0) {
      setValidationError("Please select at least one interest");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleComplete = async () => {
    // Validate all required fields
    if (!validateForm()) {
      return;
    }

    try {
      if (user && fullName) {
        // Update user profile with onboarding data
        await updateProfile(user, {
          displayName: fullName
        });

        // Prepare user data
        const userData = {
          fullName,
          gender,
          mobileNumber: mobileNumber || null,
          wantsNewsletter,
          wantsAlerts,
          interests,
          email: user.email,
          createdAt: new Date().toISOString(),
          userType: 'citizen'
        };

        // Save to Firebase Realtime Database under citizen/{fullName}
        const citizenRef = ref(database, `citizen/${fullName.replace(/\s+/g, '_')}`);
        await set(citizenRef, userData);
        
        console.log('User data saved to Firebase RTDB:', userData);
        
        // Clear localStorage
        localStorage.removeItem('userType');
        
        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error("Failed to complete onboarding:", err);
      setValidationError("Failed to complete onboarding. Please try again.");
    }
  };

  if (!user || !user.emailVerified) {
    return (
      <div className="min-h-screen bg-[#E8E8E8] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a1e1a]' : 'bg-[#E8E8E8]'} flex flex-col relative overflow-hidden`}>


      {/* Header - Pill-shaped Floating Nav */}
      <header className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className={`${isDarkMode ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95'} backdrop-blur-md shadow-lg rounded-full px-8 py-3 flex items-center gap-8`}>
          <div className="text-xl font-bold tracking-tight">
            City<span className="text-lime-500">Sense</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Cancel</Link>
            <Link href="/contact" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Help</Link>
          </nav>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-all`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-32 pb-12 px-4 relative z-10">
        <div className="w-full max-w-3xl">
          <Stepper
            initialStep={1}
            onFinalStepCompleted={handleComplete}
            backButtonText="Previous"
            nextButtonText="Next"
            renderStepIndicator={undefined}
          >
            {/* Step 1: Welcome */}
            <Step>
              <div className="text-center">
                <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Welcome to CitySense!
                </h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg mb-6`}>
                  Let's get you set up in just a few steps
                </p>
                <img 
                  style={{ 
                    height: '200px', 
                    width: '100%', 
                    objectFit: 'cover', 
                    borderRadius: '15px', 
                    marginTop: '1em' 
                  }} 
                  src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&auto=format&fit=crop"
                  alt="City"
                />
              </div>
            </Step>
            
            {/* Step 2: Personal Info */}
            <Step>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Tell us about yourself</h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>We'd love to know who you are!</p>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        // Clear validation error when user starts typing
                        if (validationError) setValidationError("");
                      }}
                      className={`w-full h-12 px-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Male', 'Female', 'Other'].map((genderOption) => (
                        <button
                          key={genderOption}
                          type="button"
                          onClick={() => {
                            setGender(genderOption);
                            // Clear validation error when user selects gender
                            if (validationError) setValidationError("");
                          }}
                          className={`p-3 rounded-xl border-2 transition-all font-medium ${
                            gender === genderOption
                              ? 'border-lime-400 bg-lime-50 text-gray-900'
                              : isDarkMode
                                ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {genderOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Step>
            
            {/* Step 3: Interests */}
            <Step>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                  Your Interests <span className="text-red-500">*</span>
                </h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                  What aspects of city data interest you?<br /> (Select at least one, can be changed later)
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {['Traffic', 'Air Quality', 'Public Safety', 'Urban Planning', 'Environment', 'Community'].map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => {
                          setInterests(prev => 
                            prev.includes(interest) 
                              ? prev.filter(i => i !== interest)
                              : [...prev, interest]
                          );
                          // Clear validation error when user selects an interest
                          if (validationError) setValidationError("");
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          interests.includes(interest)
                            ? 'border-lime-400 bg-lime-50 text-gray-900'
                            : isDarkMode
                              ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                  {interests.length > 0 && (
                    <div className="text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-lime-400' : 'text-lime-600'} font-medium`}>
                        ✓ {interests.length} interest{interests.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Step>
            
            {/* Step 4: Contact Preferences */}
            <Step>
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Stay Connected</h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>How would you like to receive updates?</p>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="mobileNumber" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Mobile Number <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs`}>(Optional)</span>
                    </label>
                    <input
                      id="mobileNumber"
                      type="tel"
                      placeholder="+91 xxxxx-xxxxx"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className={`w-full h-12 px-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none`}
                    />
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>We'll use this for important alerts and notifications</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-lime-400' : 'bg-white border-gray-200 hover:border-lime-300'} border rounded-xl p-4 transition-all`}>
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wantsNewsletter}
                          onChange={(e) => setWantsNewsletter(e.target.checked)}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-lime-500 focus:ring-lime-400"
                        />
                        <div className="ml-3">
                          <span className={`block font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Newsletter Subscription</span>
                          <span className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                            Get monthly updates about city improvements and new features
                          </span>
                        </div>
                      </label>
                    </div>
                    
                    <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-lime-400' : 'bg-white border-gray-200 hover:border-lime-300'} border rounded-xl p-4 transition-all`}>
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wantsAlerts}
                          onChange={(e) => setWantsAlerts(e.target.checked)}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-lime-500 focus:ring-lime-400"
                        />
                        <div className="ml-3">
                          <span className={`block font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Real-time Alerts</span>
                          <span className={`block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                            Receive notifications about traffic, air quality, and emergencies
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </Step>
            
            {/* Step 5: Review & Complete */}
            <Step>
              <div>
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${isDarkMode ? 'bg-lime-900/30' : 'bg-lime-100'} rounded-full mb-3`}>
                    <svg className={`w-7 h-7 ${isDarkMode ? 'text-lime-400' : 'text-lime-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>You're All Set!</h2>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Review your details before continuing</p>
                </div>

                <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4 mb-4`}>
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center py-1.5">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Name</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{fullName}</span>
                    </div>
                    <div className={`flex justify-between items-center py-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Gender</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{gender}</span>
                    </div>
                    {mobileNumber && (
                      <div className={`flex justify-between items-center py-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mobile</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{mobileNumber}</span>
                      </div>
                    )}
                    {interests.length > 0 && (
                      <div className={`pt-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} block mb-2`}>Interests</span>
                        <div className="flex flex-wrap gap-1.5">
                          {interests.map((interest) => (
                            <span key={interest} className={`px-2.5 py-1 ${isDarkMode ? 'bg-lime-900/30 text-lime-400' : 'bg-lime-50 text-lime-700'} rounded-md text-xs font-medium`}>
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={`pt-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Newsletter</span>
                        <span className={wantsNewsletter ? isDarkMode ? 'text-green-400 font-medium' : 'text-green-700 font-medium' : isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                          {wantsNewsletter ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alerts</span>
                        <span className={wantsAlerts ? isDarkMode ? 'text-green-400 font-medium' : 'text-green-700 font-medium' : isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                          {wantsAlerts ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Validation Error Message */}
                {validationError && (
                  <div className={`${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} border rounded-xl p-3 mb-4`}>
                    <div className="flex items-center gap-2">
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-600'} flex-shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className={`text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'} font-medium`}>{validationError}</p>
                    </div>
                  </div>
                )}

              </div>
            </Step>
          </Stepper>
        </div>
      </div>
    </div>
  );
}
