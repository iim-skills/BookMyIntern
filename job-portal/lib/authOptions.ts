import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID || 'mock_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
        otp:      { label: '2FA Code', type: 'text'     },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) throw new Error('No account found with this email.');
        const valid = await user.comparePassword(credentials.password);
        if (!valid) throw new Error('Incorrect password.');
        if (user.role !== 'admin' && !user.emailVerified)
          throw new Error('Please verify your email before signing in.');

        // ── 2FA Code Check for Recruiters/Admins ─────────────────────────────
        if ((user.role === 'recruiter' || user.role === 'admin') && user.twoFactorEnabled) {
          const otp = credentials.otp?.trim();
          if (!otp) {
            // Generate OTP
            const code = String(Math.floor(100000 + Math.random() * 900000));
            const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

            user.twoFactorCode = code;
            user.twoFactorExpiry = expiry;
            await user.save();

            const { send2FAEmail, EMAIL_ENABLED } = require('./mailer');
            if (EMAIL_ENABLED) {
              await send2FAEmail(user.email, user.name, code);
            } else {
              console.log('2FA OTP code (Mock Mode):', code);
            }
            throw new Error('2FA_REQUIRED');
          }

          if (!user.twoFactorCode || user.twoFactorCode !== otp) {
            throw new Error('Incorrect 2FA code. Please try again.');
          }

          if (!user.twoFactorExpiry || new Date() > new Date(user.twoFactorExpiry)) {
            throw new Error('2FA code has expired. Please try again.');
          }

          // Clear code
          user.twoFactorCode = null;
          user.twoFactorExpiry = null;
          await user.save();
        }

        return {
          id:    user._id.toString(),
          name:  user.name  as string,
          email: user.email as string,
          role:  user.role  as 'student' | 'recruiter' | 'admin',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        const existing = await User.findOne({ email: user.email?.toLowerCase() });
        if (!existing) {
          await User.create({
            name: user.name || 'Google User',
            email: user.email?.toLowerCase(),
            password: 'google-dummy-password-hash-placeholder',
            role: 'student',
            emailVerified: true,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if (account?.provider === 'google') {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email?.toLowerCase() });
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role;
            token.tokenVersion = dbUser.tokenVersion || 0;
          }
        } else {
          await connectDB();
          const dbUser = await User.findById(user.id).select('tokenVersion').lean();
          token.tokenVersion = dbUser?.tokenVersion || 0;
        }
      } else if (token?.id) {
        // Check if tokenVersion was revoked/changed
        await connectDB();
        const dbUser = await User.findById(token.id).select('tokenVersion').lean();
        const currentVersion = dbUser?.tokenVersion || 0;
        if (currentVersion !== token.tokenVersion) {
          token.id = undefined; // Invalidate
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (!token?.id) {
        session.user = null as any;
        return session;
      }
      session.user.id   = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  pages:   { signIn: '/login' },
  session: { strategy: 'jwt' },
  secret:  process.env.NEXTAUTH_SECRET,
};
