"use client";

import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const router = useRouter();

  const login = (user) => {
    setSession(user);
    // FIXME: Maybe show a 'Loading... redirecting you soon.' message.
    router.push("/");
  };

  const logout = () => {
    setSession(null);
  };

  return (
    <SessionContext.Provider value={{ session, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};
