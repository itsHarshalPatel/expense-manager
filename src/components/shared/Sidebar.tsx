"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUserFriends, FaLayerGroup } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { IoMdPerson, IoMdSettings } from "react-icons/io";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: MdSpaceDashboard },
  { href: "/friend", label: "Friends", icon: FaUserFriends },
  { href: "/transaction", label: "Transactions", icon: GrTransaction },
  { href: "/group", label: "Groups", icon: FaLayerGroup },
  { href: "/profile", label: "Profile", icon: IoMdPerson },
  { href: "/setting", label: "Settings", icon: IoMdSettings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col px-3 py-6 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3">
        <p
          className="text-sm font-bold leading-none text-brand-black"
          style={{ fontFamily: "DM Serif Display, serif" }}
        >
          Vyaya
        </p>
        <p className="text-xs text-gray-400 leading-none mt-0.5">Prabandhana</p>
      </div>

      <div className="h-px bg-brand-border mx-2" />

      <nav className="flex flex-col gap-1 flex-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-app text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-black text-brand-white"
                  : "text-gray-500 hover:bg-brand-border hover:text-brand-black",
              )}
            >
              <Icon size={17} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="h-px bg-brand-border mx-2" />
      <p className="text-xs text-gray-400 px-3">v2.0.0</p>
    </div>
  );
}
