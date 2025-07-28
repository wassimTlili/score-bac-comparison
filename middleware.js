import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/guide',
  '/api/test-db',
  '/api/test-auth',
  '/api/translations(.*)', // Allow public access to translations API
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/chat(.*)', // Allow public access to chat for now
  // Note: /stepper, /comparison, and other user-specific routes require authentication
])

// Define routes that should always be accessible (even for authenticated users)
const isIgnoredRoute = createRouteMatcher([
  '/api/translations(.*)', // Always allow translations API
  '/api/webhook(.*)',
  '/api/health(.*)',
  '/_next(.*)',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
])

export default clerkMiddleware((auth, req) => {
  // Skip middleware for ignored routes
  if (isIgnoredRoute(req)) return

  // Add security headers for production
  const response = NextResponse.next()
  
  // Only add security headers in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  }

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    auth().protect()
  }
  
  return response
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
