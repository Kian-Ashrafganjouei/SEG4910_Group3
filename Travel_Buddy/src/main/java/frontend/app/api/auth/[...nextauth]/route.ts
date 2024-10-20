import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          const res = await fetch("http://docker-backend-1:8080/backend/credentials/signin", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password
            })
          });

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
      }
    })
  ],
  pages: {
    signIn: "/signin"
  },
  callbacks: {
    async signIn(credentials) {
      try {
        const res = await fetch("http://docker-backend-1:8080/backend/google/signin", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: credentials.user.name,
            email: credentials.user.email,
            password: credentials.user.id
          })
        });
        if (!res.ok) {
          throw new Error("Internal server error");
        } else {
          return true;
        }
      } catch (error) {
        console.log(error);
      }
      return false;
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
      session.user.username = token.username;
      session.user.user_id = token.user_id;
      session.user.email = token.email;
      return session;
    }
  }
};

const handler = NextAuth(options);

export { handler as GET, handler as POST };
