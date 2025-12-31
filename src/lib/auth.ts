import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { createUser, getUserByEmail, updateUserLastLogin } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      try {
        // Check if user exists
        let dbUser = await getUserByEmail(user.email);

        if (!dbUser) {
          // Create new user
          dbUser = await createUser({
            email: user.email,
            name: user.name || "Utilisateur",
            avatar: user.image || null,
            provider: account?.provider || "email",
          });
        } else {
          // Update last login
          await updateUserLastLogin(dbUser.id);
        }

        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await getUserByEmail(session.user.email);
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});
