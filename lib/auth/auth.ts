import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import prisma from '@/lib/db/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          await prisma.loginLog.create({ data: { email, success: false } })
          return null
        }

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) {
          await prisma.loginLog.create({ data: { email, userId: user.id, role: user.role, success: false } })
          return null
        }

        await prisma.loginLog.create({ data: { email, userId: user.id, role: user.role, success: true } })

        return { id: user.id, email: user.email, role: user.role }
      },
    }),
  ],
})
