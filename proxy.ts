import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/auth.config'
import type { NextRequest } from 'next/server'

const { auth } = NextAuth(authConfig)

export async function proxy(request: NextRequest) {
  return auth(request as any)
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
