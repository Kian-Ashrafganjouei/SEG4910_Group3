'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignInOptions } from "next-auth/react";
import { SignInResponse } from "next-auth/react";

export default function AuthError({
  error,
  signIn
}: {
  error: Error
  signIn: (options?: SignInOptions | undefined) => Promise<SignInResponse | undefined>
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('Authentication error:', error)
  }, [error])

  return (
    <div>
      <h1>Authentication Error</h1>
      <p>An error occurred during authentication: {error.message}</p>
      <button onClick={() => router.push('/')}>Go back to home</button>
    </div>
  )
}
