import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db, users, eq } from '@slideshow/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// Skip authentication setup during build if DATABASE_URL is not available
const authConfig = db
  ? {
      providers: [
        Credentials({
          name: 'credentials',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
          },
          async authorize(credentials) {
            try {
              const { email, password } = loginSchema.parse(credentials)

              // Find user by email
              const [user] = await db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1)

              if (!user || !user.password) {
                return null
              }

              // Verify password
              const isValidPassword = await bcrypt.compare(password, user.password)

              if (!isValidPassword) {
                return null
              }

              // Return user object
              return {
                id: user.id,
                email: user.email,
                name: user.name,
              }
            } catch {
              return null
            }
          },
        }),
      ],
      pages: {
        signIn: '/login',
        error: '/login/error',
      },
      callbacks: {
        async jwt({ token, user }: any) {
          if (user) {
            token.id = user.id
          }
          return token
        },
        async session({ session, token }: any) {
          if (session.user) {
            session.user.id = token.id
          }
          return session
        },
      },
      session: {
        strategy: 'jwt' as const,
      },
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      trustHost: true,
    }
  : {
      providers: [],
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      trustHost: true,
    }

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig as any)
