import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const apiURL = process.env.API_URL;
const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(
            `${apiURL}/backend/credentials/signin`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
            }
          );
    
          if (!res.ok) {
            // Extract the error message from the response
            const errorData = await res.json();
            throw new Error(errorData.error || "Login failed");
          }
    
          const user = await res.json();
          if (!user) {
            throw new Error("No user data returned");
          }
    
          return user; // Return user object for successful authentication
        } catch (error) {
          console.error("Authorization error:", error.message);
          throw new Error(error.message || "An error occurred during login");
        }
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
            `${apiURL}/backend/google/signin`,
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
          user.username = userData.username; // Set the username from backend response
          user.id = userData.id; // Set the user ID from backend response
          user.name = userData.name; // Update the session's name
          return true;
        } catch (error) {
          console.error(error);
          return false;
        }
      }
      return true; // For other providers
    },
    async jwt({ token, user }: { token: JWT; user?: any }) {
      console.log("JWT callback triggered");
      console.log("Incoming token:", token);
      if (user) {
        console.log("User data received:", user);
        token.username = user.username || user.name || "Unknown User";
        token.user_id = user.id || "Unknown ID";
        token.email = user.email || "Unknown Email";
      }
      console.log("Updated token:", token);
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }) {
      console.log("Session callback triggered");
      console.log("Incoming session:", session);
      console.log("Token data:", token);
  
      session.user.username = token.username || session.user.name || "Unknown User";
      session.user.user_id = token.user_id || "Unknown ID";
      session.user.email = token.email || "Unknown Email";
  
      console.log("Updated session:", session);
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }
      if (url === "/") {
        return `${baseUrl}/`;
      }
      return baseUrl;
    },
  },
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
