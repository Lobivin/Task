import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { login } from '@/lib/api'
import jwt from 'jsonwebtoken'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const response = await login(credentials.email, credentials.password)

          if (response.status === 0 && response.data) {
            const { accessToken, refreshToken, expiresIn, refreshExpiresIn, tokenType } = response.data

            let userInfo: {
              email: string;
              name: string;
              sub?: string;
              given_name?: string;
              family_name?: string;
            } = { email: credentials.email, name: '' }

            try {
              const decodedToken = jwt.decode(accessToken) as any
              if (decodedToken) {
                userInfo = {
                  email: decodedToken.email || credentials.email,
                  name: decodedToken.name || decodedToken.preferred_username || decodedToken.given_name || '',
                  given_name: decodedToken.given_name || '',
                  family_name: decodedToken.family_name || '',
                  sub: decodedToken.sub || '1'
                }
              }
            } catch (jwtError) {
              console.warn('JWT decode hatası:', jwtError)
            }

            return {
              id: userInfo.sub || '1',
              email: userInfo.email,
              name: userInfo.name,
              accessToken,
              refreshToken,
              expiresIn,
              refreshExpiresIn,
              tokenType
            }
          }
          return null
        } catch (error: any) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.refreshToken = (user as any).refreshToken
        token.expiresIn = (user as any).expiresIn
        token.refreshExpiresIn = (user as any).refreshExpiresIn
        token.tokenType = (user as any).tokenType
        token.name = user.name
        token.email = user.email
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session) {
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.expiresIn = token.expiresIn as number
        session.refreshExpiresIn = token.refreshExpiresIn as number
        session.tokenType = token.tokenType as string
        session.user = {
          id: token.sub as string,
          email: token.email as string,
          name: token.name as string,
        }
      }
      return session
    }
  },
  events: {
    async signIn({ user }) {
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem('accessToken', (user as any).accessToken || '')
        localStorage.setItem('refreshToken', (user as any).refreshToken || '')
        localStorage.setItem('tokenType', (user as any).tokenType || 'Bearer')
        localStorage.setItem('expiresIn', (user as any).expiresIn?.toString() || '')
        localStorage.setItem('refreshExpiresIn', (user as any).refreshExpiresIn?.toString() || '')
        localStorage.setItem('userInfo', JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name
        }))
      }
    },
    async signOut() {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('tokenType')
        localStorage.removeItem('expiresIn')
        localStorage.removeItem('refreshExpiresIn')
        localStorage.removeItem('userInfo')
      }
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60,
  },
}

export default NextAuth(authOptions)