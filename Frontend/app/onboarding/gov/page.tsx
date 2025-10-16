"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { Sun, Moon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { database } from "@/lib/firebase";
import Stepper, { Step } from "@/components/Stepper";
import Orb from "@/components/Orb";

export default function GovOnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [position, setPosition] = useState("");
  const [otherPosition, setOtherPosition] = useState("");
  const [otherPositionRelation, setOtherPositionRelation] = useState("");
  const [organization, setOrganization] = useState("");
  const [city, setCity] = useState("");
  const [validationError, setValidationError] = useState("");
  const [accessRequested, setAccessRequested] = useState(false);

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
    if (!position) {
      setValidationError("Please select your position/department");
      return false;
    }
    if (position === "Other" && !otherPosition.trim()) {
      setValidationError("Please specify your position");
      return false;
    }
    if (position === "Other" && !otherPositionRelation.trim()) {
      setValidationError("Please explain how your position relates to government");
      return false;
    }
    if (!organization.trim()) {
      setValidationError("Please enter your government agency");
      return false;
    }
    if (!city.trim()) {
      setValidationError("Please enter your city/municipality");
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

        // Prepare government user data
        const userData = {
          fullName,
          gender,
          mobileNumber: mobileNumber || null,
          position: position === "Other" ? otherPosition : position,
          positionRelation: position === "Other" ? otherPositionRelation : null,
          organization,
          city,
          email: user.email,
          createdAt: new Date().toISOString(),
          userType: 'government',
          accessGranted: false
        };

        // Save to Firebase Realtime Database under gov/{fullName}
        const govRef = ref(database, `gov/${fullName.replace(/\s+/g, '_')}`);
        await set(govRef, userData);

        // Create access request under req/{fullName}
        const reqRef = ref(database, `req/${fullName.replace(/\s+/g, '_')}`);
        await set(reqRef, false); // False means pending approval
        
        console.log('Government user data saved to Firebase RTDB:', userData);
        
        // Clear localStorage
        localStorage.removeItem('userType');
        
        // Mark access as requested
        setAccessRequested(true);
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
          <div className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            City<span className="text-lime-500">Sense</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Cancel</Link>
            <Link href="/contact" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Help</Link>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-lime-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-32 pb-12 px-4 relative z-10">
        <div className="w-full max-w-3xl">
          {accessRequested ? (
            // Access Request Pending Screen
            <div className={`${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'} rounded-2xl p-8 shadow-lg text-center`}>
              <div className={`inline-flex items-center justify-center w-20 h-20 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} rounded-full mb-4`}>
                <svg className={`w-10 h-10 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>Access Request Submitted! ⏳</h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Your government account has been created and is pending admin approval.
              </p>
              <div className={`${isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4 mb-6`}>
                <h3 className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-900'} mb-2`}>What happens next?</h3>
                <ul className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'} space-y-2 text-left`}>
                  <li className="flex items-start gap-2">
                    <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5`}>1.</span>
                    <span>Our admin team will review your government credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5`}>2.</span>
                    <span>You'll receive an email once your account is approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5`}>3.</span>
                    <span>After approval, you can log in and access the government dashboard</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Review typically takes 24-48 hours
                </p>
                <Link 
                  href="/"
                  className={`inline-block px-6 py-3 ${isDarkMode ? 'bg-lime-400 text-black hover:bg-lime-500' : 'bg-lime-500 text-white hover:bg-lime-600'} rounded-xl font-medium transition-colors`}
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
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
                    Let's set up your government portal access
                  </p>
                  <img 
                    style={{ 
                      height: '200px', 
                      width: '100%', 
                      objectFit: 'cover', 
                      borderRadius: '15px', 
                      marginTop: '1em' 
                    }} 
                    src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop"
                    alt="Government Building"
                  />
                </div>
              </Step>

              {/* Step 2: Personal Info */}
              <Step>
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Personal Information</h2>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Tell us about yourself</p>
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

              {/* Step 3: Position Selection */}
              <Step>
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Position/Department <span className="text-red-500">*</span>
                  </h2>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                    Select your government department or role
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {['Municipal Corporation', 'Disaster Management', 'Environment', 'Medical', 'Other'].map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => {
                            setPosition(pos);
                            if (validationError) setValidationError("");
                            // Clear other fields if not selecting "Other"
                            if (pos !== "Other") {
                              setOtherPosition("");
                              setOtherPositionRelation("");
                            }
                          }}
                          className={`p-4 rounded-xl border-2 transition-all font-medium ${
                            position === pos
                              ? 'border-lime-400 bg-lime-50 text-gray-900'
                              : isDarkMode
                                ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                    {position && (
                      <div className="text-center">
                        <p className={`text-sm ${isDarkMode ? 'text-lime-400' : 'text-lime-600'} font-medium`}>
                          ✓ {position} selected
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Step>

              {/* Step 4: Other Position Details (Conditional) */}
              {position === "Other" && (
                <Step>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Specify Your Position</h2>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Tell us more about your role</p>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="otherPosition" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          What is your position? <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="otherPosition"
                          type="text"
                          placeholder="e.g., Traffic Management Officer"
                          value={otherPosition}
                          onChange={(e) => {
                            setOtherPosition(e.target.value);
                            if (validationError) setValidationError("");
                          }}
                          className={`w-full h-12 px-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none`}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="otherPositionRelation" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          How is it related to government? <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="otherPositionRelation"
                          placeholder="e.g., I work with the city government to manage traffic flow and implement smart traffic solutions"
                          value={otherPositionRelation}
                          onChange={(e) => {
                            setOtherPositionRelation(e.target.value);
                            if (validationError) setValidationError("");
                          }}
                          rows={4}
                          className={`w-full px-4 py-3 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none resize-none`}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </Step>
              )}

              {/* Step 5: Organization & City */}
              <Step>
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Government Details</h2>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Help us verify your affiliation</p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="organization" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        Government Agency <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="organization"
                        type="text"
                        placeholder="e.g., Delhi Municipal Corporation"
                        value={organization}
                        onChange={(e) => {
                          setOrganization(e.target.value);
                          if (validationError) setValidationError("");
                        }}
                        className={`w-full h-12 px-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none`}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                        City/Municipality <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        placeholder="e.g., New Delhi"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (validationError) setValidationError("");
                        }}
                        className={`w-full h-12 px-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200'} border rounded-xl focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none`}
                        required
                      />
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 6: Contact Preferences */}
              <Step>
                <div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>Contact Information</h2>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>How can we reach you?</p>
                  <div className="space-y-4">
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
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>For urgent notifications and updates</p>
                    </div>
                  </div>
                </div>
              </Step>

              {/* Step 7: Review & Submit */}
              <Step>
                <div>
                  <div className="text-center mb-6">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>Review Your Information</h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Make sure everything is correct before submitting</p>
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
                      <div className={`flex justify-between items-center py-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Position</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {position === "Other" ? otherPosition : position}
                        </span>
                      </div>
                      {position === "Other" && (
                        <div className={`pt-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} block mb-1`}>Government Relation</span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{otherPositionRelation}</span>
                        </div>
                      )}
                      <div className={`flex justify-between items-center py-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Agency</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} text-right`}>{organization}</span>
                      </div>
                      <div className={`flex justify-between items-center py-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>City</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{city}</span>
                      </div>
                      {mobileNumber && (
                        <div className={`flex justify-between items-center py-1.5 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Mobile</span>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{mobileNumber}</span>
                        </div>
                      )}
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

                  <div className={`${isDarkMode ? 'bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-700' : 'bg-gradient-to-r from-amber-50 to-yellow-50'} rounded-xl p-4 text-center`}>
                    <p className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-gray-800'} font-medium mb-1`}>
                      ⏳ Admin Approval Required
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-amber-200/80' : 'text-gray-600'}`}>
                      After submission, an admin will review your credentials before granting access
                    </p>
                  </div>
                </div>
              </Step>
            </Stepper>
          )}
        </div>
      </div>
    </div>
  );
}
