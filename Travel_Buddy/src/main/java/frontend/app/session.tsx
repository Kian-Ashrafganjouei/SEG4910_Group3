// FIXME: The authentication logic is not very well written. Fix it later if you have
// time.
"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, SessionProvider, signIn } from "next-auth/react";

const AuthenticationContext = createContext();

export const AuthenticationProvider = ({ children }) => {
  const [user, set_user] = useState(null);
  const router = useRouter();

  const login = (user) => {
    set_user(user);
    router.push("/");
  };

  const logout = () => {
    set_user(null);
    router.push("/");
  };

  return (
    <AuthenticationContext.Provider value={{ user, login, logout }}>
      <SessionProvider>
        {children}
      </SessionProvider>
    </AuthenticationContext.Provider>
  );
};

export const useAuthentication = () => {
  return useContext(AuthenticationContext);
};
