import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Customer dashboard - just requires login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Allow any logged-in user to access dashboard
    return response
  }

  // Admin routes - requires ADMIN role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fetch user role from public.User table
    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single()

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Staff routes - requires STAFF or ADMIN role
  if (request.nextUrl.pathname.startsWith('/staff')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: dbUser } = await supabase
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single()

    if (!dbUser || (dbUser.role !== 'STAFF' && dbUser.role !== 'ADMIN')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}
