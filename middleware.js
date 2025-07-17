import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/guide',
  '/api/test-db',
  '/api/test-auth',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)',
  '/api/chat(.*)', // Allow public access to chat for now
  // Note: /stepper, /comparison, and other user-specific routes require authentication
])

// Define routes that should always be accessible (even for authenticated users)
const isIgnoredRoute = createRouteMatcher([
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

  // Protect non-public routes
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
