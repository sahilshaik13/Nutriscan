import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?error=${encodeURIComponent(error)}`, request.url))
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!exchangeError && data.user) {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('health_profiles')
        .select('onboarding_completed')
        .eq('user_id', data.user.id)
        .single()

      const redirectPath = profile?.onboarding_completed ? '/dashboard' : '/onboarding'
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutriscan-sap.vercel.app'
      
      return NextResponse.redirect(new URL(redirectPath, appUrl))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/error?error=Email verification failed', request.url))
}
