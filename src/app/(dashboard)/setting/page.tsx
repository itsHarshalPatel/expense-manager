import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/shared/SignOutButton";

export default async function SettingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Settings
      </h1>

      {/* Account */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border mb-4">
        <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">
          Account
        </h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Signed in as</p>
            <p className="text-xs text-gray-400">{session.user.email}</p>
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* App info */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border mb-4">
        <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">
          App
        </h3>
        <div className="flex flex-col divide-y divide-brand-border">
          <InfoRow label="Version" value="2.0.0" />
          <InfoRow label="Stack" value="Next.js 14 + Supabase" />
          <InfoRow label="Auth" value="Google OAuth" />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-brand-white rounded-app p-5 border border-red-200">
        <h3 className="text-sm font-bold mb-4 text-red-400 uppercase tracking-wider">
          Danger Zone
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-gray-400">
              Permanently delete your account and all data
            </p>
          </div>
          <button
            disabled
            className="px-4 py-2 rounded-app border-2 border-red-200 text-red-400 text-sm font-medium cursor-not-allowed opacity-50"
          >
            Coming soon
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
