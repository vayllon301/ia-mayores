import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas que requieren autenticación (se verifican en el cliente)
const protectedRoutes = ['/chatbot']

// Rutas de autenticación
const authRoutes = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Nota: Supabase guarda la sesión en localStorage en el cliente,
  // no en cookies, por lo que el middleware del servidor no puede
  // verificar la autenticación directamente. La verificación real
  // se hace en el cliente en las páginas protegidas.
  
  // Permitir que todas las rutas pasen - la verificación se hace en el cliente
  // Esto evita redirecciones innecesarias cuando el usuario ya está autenticado
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/chatbot/:path*', '/auth/:path*']
}
