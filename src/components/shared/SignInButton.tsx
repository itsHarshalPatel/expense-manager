"use client";

import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="common-btn w-full justify-center"
    >
      Sign In with Google
    </button>
  );
}
