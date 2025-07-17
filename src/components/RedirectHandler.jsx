'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getUserProfile } from '@/actions/profile-actions';

/**
 * RedirectHandler Component
 * Handles automatic redirection based on user authentication and profile status
 * 
 * Logic:
 * 1. If user is logged in AND has profile → redirect to /comparison
 * 2. If user is logged in BUT no profile → redirect to /stepper  
 * 3. If user is not logged in → stay on current page
 * 
 * Usage: <RedirectHandler excludePages={['/stepper', '/comparison']} />
 */
export default function RedirectHandler({ 
  children, 
  excludePages = [], 
  redirectTo = '/comparison',
  stepperRedirectTo = '/stepper'
}) {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isChecking, setIsChecking] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!isLoaded) return; // Wait for Clerk to load

      try {
        // Get current path
        const currentPath = window.location.pathname;
        
        // Skip redirection for excluded pages
        if (excludePages.includes(currentPath)) {
          setIsChecking(false);
          return;
        }

        if (isSignedIn && user) {
          console.log('🔍 User is signed in, checking profile...');
          
          // Check if user has completed profile
          const result = await getUserProfile();
          
          if (result.success && result.profile) {
            console.log('✅ User has profile, redirecting to:', redirectTo);
            setUserProfile(result.profile);
            
            // Only redirect if we're not already on the target page
            if (currentPath !== redirectTo) {
              router.push(redirectTo);
              return;
            }
          } else {
            console.log('⚠️ User has no profile, redirecting to stepper');
            
            // User is logged in but has no profile - redirect to stepper
            if (currentPath !== stepperRedirectTo) {
              router.push(stepperRedirectTo);
              return;
            }
          }
        } else {
          console.log('👤 User not signed in, staying on current page');
        }
      } catch (error) {
        console.error('❌ Error in redirect handler:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkUserAndRedirect();
  }, [isLoaded, isSignedIn, user, router, excludePages, redirectTo, stepperRedirectTo]);

  // Show loading while checking
  if (isChecking && isLoaded) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-400 animate-spin animation-delay-150"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">جاري التحقق من حالة الحساب</h2>
          <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce animation-delay-400"></div>
          </div>
          <p className="text-gray-400 max-w-md mx-auto mt-4">
            نحن نتحقق من حالة حسابك وملفك الشخصي...
          </p>
        </div>
      </div>
    );
  }

  // Return children when no redirection is needed
  return children;
}

/**
 * Hook to get current user profile status
 */
export function useUserProfileStatus() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [profileStatus, setProfileStatus] = useState({
    isLoading: true,
    hasProfile: false,
    profile: null
  });

  useEffect(() => {
    const checkProfile = async () => {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        try {
          const result = await getUserProfile();
          setProfileStatus({
            isLoading: false,
            hasProfile: result.success && !!result.profile,
            profile: result.profile
          });
        } catch (error) {
          console.error('Error checking profile:', error);
          setProfileStatus({
            isLoading: false,
            hasProfile: false,
            profile: null
          });
        }
      } else {
        setProfileStatus({
          isLoading: false,
          hasProfile: false,
          profile: null
        });
      }
    };

    checkProfile();
  }, [isLoaded, isSignedIn, user]);

  return {
    ...profileStatus,
    isSignedIn,
    user
  };
}
