"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      const result = await signIn("google", { callbackUrl: "/" });
      if (result?.error) {
        setError(result.error);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An unexpected error occurred");
    }
  };

  return (
    <div>
      <button onClick={handleSignIn}>Sign in with Google</button>
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default Login;
