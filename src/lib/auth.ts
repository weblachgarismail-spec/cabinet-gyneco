import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { logger } from "./logger";

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

function checkRateLimit(username: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(username);
  if (!entry) return true;
  if (now - entry.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(username);
    return true;
  }
  if (entry.count >= 5) return false;
  return true;
}

function recordAttempt(username: string) {
  const now = Date.now();
  const entry = loginAttempts.get(username);
  if (!entry || now - entry.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(username, { count: 1, lastAttempt: now });
  } else {
    entry.count++;
    entry.lastAttempt = now;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        if (!checkRateLimit(credentials.username)) {
          logger.warn("Rate limit exceeded", { username: credentials.username });
          throw new Error("RATE_LIMITED");
        }

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username },
        });

        if (!admin) {
          recordAttempt(credentials.username);
          logger.warn("Login failed: unknown user", { username: credentials.username });
          return null;
        }

        if (!admin.active) {
          logger.warn("Login failed: inactive account", { username: credentials.username });
          throw new Error("INACTIVE_ACCOUNT");
        }

        const valid = await bcrypt.compare(credentials.password, admin.password);
        if (!valid) {
          recordAttempt(credentials.username);
          logger.warn("Login failed: wrong password", { username: credentials.username });
          return null;
        }

        loginAttempts.delete(credentials.username);
        logger.info("Login successful", { username: credentials.username });

        return { id: admin.id, name: admin.username, email: admin.username, role: admin.role, displayName: admin.displayName, themeColor: admin.themeColor };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.displayName = (user as { displayName: string | null }).displayName;
        token.themeColor = (user as { themeColor: string | null }).themeColor;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
        (session.user as { displayName: string | null }).displayName = token.displayName as string | null;
        (session.user as { themeColor: string | null }).themeColor = token.themeColor as string | null;
      }
      return session;
    },
  },
  pages: { signIn: "/gestion" },
  secret: process.env.NEXTAUTH_SECRET,
};
