import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import { FaEnvelope, FaCalendar } from "react-icons/fa6";
import SignOutButton from "@/components/shared/SignOutButton";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          transactions: true,
          friends: true,
          groups: true,
        },
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-2 py-4">
      <h1
        className="text-3xl font-bold mb-8"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        Profile
      </h1>

      {/* Avatar + name */}
      <div className="bg-brand-white rounded-app p-6 border border-brand-border mb-4">
        <div className="flex items-center gap-5">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? "Profile"}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-brand-black text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <FaEnvelope size={12} />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
              <FaCalendar size={12} />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <StatCard label="Transactions" value={user._count.transactions} />
        <StatCard label="Friends" value={user._count.friends} />
        <StatCard label="Groups" value={user._count.groups} />
      </div>

      {/* Account info */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border mb-4">
        <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">
          Account
        </h3>
        <div className="flex flex-col divide-y divide-brand-border">
          <InfoRow label="Name" value={user.name ?? "—"} />
          <InfoRow label="Email" value={user.email ?? "—"} />
          <InfoRow label="Member since" value={formatDate(user.createdAt)} />
        </div>
      </div>

      {/* Sign out */}
      <div className="bg-brand-white rounded-app p-5 border border-brand-border">
        <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-wider">
          Session
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sign out</p>
            <p className="text-xs text-gray-400">
              You will be redirected to the login page
            </p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-brand-white rounded-app p-4 border border-brand-border text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
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
