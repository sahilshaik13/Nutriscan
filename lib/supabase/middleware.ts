import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[v0] Missing Supabase environment variables')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/scan', '/onboarding']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtectedPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  // Check onboarding status for authenticated users on dashboard/scan
  if (user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/scan'))) {
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    // Redirect to onboarding if not completed
    if (!profile?.onboarding_completed) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged in users away from auth pages (but not from onboarding)
  if (request.nextUrl.pathname.startsWith('/auth/') && user) {
    // Check if user has completed onboarding
    const { data: profile } = await supabase
      .from('health_profiles')
      .select('onboarding_completed')
      .eq('user_id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
