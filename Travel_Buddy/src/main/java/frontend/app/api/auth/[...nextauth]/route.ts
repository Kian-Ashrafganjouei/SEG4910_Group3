import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: '/auth/error', // Error code passed in query string as ?error=
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("USER EMAIL", profile?.email); // Printing the email
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log("Redirect Callback", { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  debug: true,
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
