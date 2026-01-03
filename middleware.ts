import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Rutas que requieren autenticación
const protectedRoutes = ['/chatbot']

// Rutas de autenticación (redirigir si ya está logueado)
const authRoutes = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Obtener el token de la cookie de Supabase
  const supabaseToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = !!supabaseToken || !!refreshToken
  
  // Proteger rutas del chatbot
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Redirigir usuarios autenticados fuera de páginas de auth
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/chatbot', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/chatbot/:path*', '/auth/:path*']
}
