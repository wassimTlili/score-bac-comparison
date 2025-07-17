'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { getUserProfile } from '@/actions/profile-actions';

/**
 * useAuthRedirect Hook
 * Handles automatic redirection based on user authentication and profile status
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireAuth - Redirect to home if not authenticated
 * @param {boolean} options.requireProfile - Redirect to stepper if no profile
 * @param {boolean} options.redirectIfHasProfile - Redirect to comparison if has profile
 * @param {string} options.redirectTo - Custom redirect destination
 * @returns {Object} - Status and loading state
 */
export function useAuthRedirect(options = {}) {
  const {
    requireAuth = false,
    requireProfile = false,
    redirectIfHasProfile = false,
    redirectTo = '/comparison'
  } = options;

  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (!isLoaded) return; // Wait for Clerk to load

      try {
        setIsRedirecting(true);

        // Check authentication requirement
        if (requireAuth && !isSignedIn) {
          console.log('🔒 Auth required but user not signed in, redirecting to home');
          router.push('/');
          return;
        }

        // If user is signed in, check profile
        if (isSignedIn && user) {
          const result = await getUserProfile();
          const hasProfile = result.success && result.profile;
          
          if (hasProfile) {
            setUserProfile(result.profile);
          }

          // Redirect if has profile but shouldn't (like stepper page)
          if (redirectIfHasProfile && hasProfile) {
            console.log('✅ User has profile, redirecting to:', redirectTo);
            router.push(redirectTo);
            return;
          }

          // Redirect if requires profile but doesn't have one
          if (requireProfile && !hasProfile) {
            console.log('⚠️ Profile required but not found, redirecting to stepper');
            router.push('/stepper');
            return;
          }
        }

        // If we reach here, no redirection needed
        setIsRedirecting(false);
        setIsReady(true);
      } catch (error) {
        console.error('❌ Error in redirect check:', error);
        setIsRedirecting(false);
        setIsReady(true);
      }
    };

    checkAndRedirect();
  }, [isLoaded, isSignedIn, user, router, requireAuth, requireProfile, redirectIfHasProfile, redirectTo]);

  return {
    isRedirecting,
    isReady,
    userProfile,
    isSignedIn,
    user,
    authState: {
      isLoaded,
      isSignedIn,
      user
    }
  };
}

/**
 * RedirectLoadingScreen Component
 * Shows a loading screen while redirecting
 */
export function RedirectLoadingScreen({ message = "جاري التحقق من حالة الحساب..." }) {
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
          {message}
        </p>
      </div>
    </div>
  );
}
