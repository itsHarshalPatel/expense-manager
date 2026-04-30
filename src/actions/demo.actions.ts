"use server";

import { prisma } from "@/lib/prisma";
import { DEMO_USER_ID } from "@/lib/demo";
import { redirect } from "next/navigation";

export async function signInAsDemo() {
  // Verify demo user exists
  const demoUser = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
  });
  if (!demoUser) {
    throw new Error(
      "Demo user not seeded. Run: npx ts-node prisma/seed-demo.ts",
    );
  }

  // Delete any existing session for demo user
  await prisma.session.deleteMany({ where: { userId: DEMO_USER_ID } });

  // Create a new session
  const expires = new Date();
  expires.setHours(expires.getHours() + 2); // 2 hour demo session

  const session = await prisma.session.create({
    data: {
      userId: DEMO_USER_ID,
      sessionToken: `demo_${crypto.randomUUID()}`,
      expires,
    },
  });

  // Set the session cookie manually via a redirect with cookie header
  // We'll use NextAuth's approach — create session and set cookie
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  cookieStore.set("authjs.session-token", session.sessionToken, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  redirect("/dashboard");
}
