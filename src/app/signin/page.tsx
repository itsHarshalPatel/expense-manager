import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignInPage from "@/components/shared/SignInPage";

export default async function Page() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return <SignInPage />;
}
