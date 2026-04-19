import { auth } from "@/auth";

/**
 * Call at the top of every server action.
 * Returns the userId or throws — never returns undefined.
 */
export async function requireAuth(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}
