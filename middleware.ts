import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from './lib/supabase'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk',
  '/api/cron',
])

const isOnboardingRoute = createRouteMatcher(['/get-started'])
const isApiRoute = createRouteMatcher(['/api(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  // Allow public routes
  if (isPublicRoute(request)) {
    return NextResponse.next()
  }

  // Protect non-public routes
  await auth.protect()

  // Skip onboarding checks for API routes - they handle auth independently
  if (isApiRoute(request)) {
    return NextResponse.next()
  }

  // If user is authenticated, check onboarding status for non-API routes
  if (userId && !isOnboardingRoute(request)) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', userId)
        .maybeSingle()

      // If onboarding not completed, redirect to get-started
      if (!error && data && !data.onboarding_completed) {
        const url = new URL('/get-started', request.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  // If on onboarding route and already completed, redirect to Catalog
  if (userId && isOnboardingRoute(request)) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', userId)
        .maybeSingle()

      if (!error && data && data.onboarding_completed) {
        const url = new URL('/Catalog', request.url)
        return NextResponse.redirect(url)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
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