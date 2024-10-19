import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
  ],
  callbacks: {
    async signIn(creds) {
      try {
        const res = await fetch("http://docker-backend-1:8080/backend/google/signin", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: creds.user.name,
            email: creds.user.email,
            password: creds.user.id
          })
        });
        return res.ok;
      } catch (error) {
        console.log(error);
      }
      return false;
    }
  }
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
