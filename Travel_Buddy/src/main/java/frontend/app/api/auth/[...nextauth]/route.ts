import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            "http://docker-backend-1:8080/backend/credentials/signin",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
            }
          );

          if (res.status === 400) {
            return null;
          } else if (!res.ok) {
            throw new Error("Internal server error");
          } else {
            return await res.json();
          }
        } catch (error) {
          console.log(error);
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (account.provider === "google") {
        try {
          const res = await fetch(
            "http://docker-backend-1:8080/backend/google/signin",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: user.name,
                email: user.email,
                password: user.id,
              }),
            }
          );
          if (!res.ok) {
            throw new Error("Internal server error");
          }
          const userData = await res.json();
          user.username = userData.username; // Assuming your backend returns a username
          user.id = userData.id; // Assuming your backend returns a user ID
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      }
      return true; // For other providers
    },
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username;
        token.user_id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("IN SESSION", session);
      session.user.username = token.username;
      session.user.user_id = token.user_id;
      session.user.email = token.email;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to /home after sign-in
      return url.startsWith(baseUrl) ? url : `${baseUrl}/home`;
    },
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
