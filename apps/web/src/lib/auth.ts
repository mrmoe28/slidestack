import NextAuth from 'next-auth'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import Resend from 'next-auth/providers/resend'
import { db, users, accounts, sessions, verificationTokens } from '@slideshow/db'

// Skip authentication setup during build if DATABASE_URL is not available
const authConfig = db
  ? {
      adapter: DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      }),
      providers: [
        Resend({
          from: process.env.EMAIL_FROM || 'noreply@slideshow.app',
        }),
      ],
      pages: {
        signIn: '/login',
        verifyRequest: '/login/verify',
        error: '/login/error',
      },
      callbacks: {
        async session({ session, user }: any) {
          if (session.user) {
            session.user.id = user.id
          }
          return session
        },
      },
      trustHost: true,
    }
  : {
      providers: [],
      trustHost: true,
    }

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig as any)
