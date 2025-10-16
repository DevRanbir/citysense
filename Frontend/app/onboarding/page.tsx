"use client";
{/** Onboarding redirection logic if user selected citizen/consumer then redirect to consumer onboarding flow or government onboarding flow */}
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';  

const OnboardingRedirect = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const userType = localStorage.getItem('userType');
      if (userType === 'consumer') {
        router.push('/onboarding/citizen');
      } else if (userType === 'government') {
        router.push('/onboarding/gov');
      }
    }
  }, [user, router]);

  return null;
};

export default OnboardingRedirect;