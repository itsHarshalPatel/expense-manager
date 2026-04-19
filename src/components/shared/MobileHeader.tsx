"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdSpaceDashboard } from "react-icons/md";
import { FaUserFriends, FaLayerGroup } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";
import { IoMdPerson, IoMdSettings } from "react-icons/io";
import { HiMenu, HiX } from "react-icons/hi";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: MdSpaceDashboard },
  { href: "/friend", label: "Friends", icon: FaUserFriends },
  { href: "/transaction", label: "Transactions", icon: GrTransaction },
  { href: "/group", label: "Groups", icon: FaLayerGroup },
  { href: "/profile", label: "Profile", icon: IoMdPerson },
  { href: "/setting", label: "Settings", icon: IoMdSettings },
];

export default function MobileHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-brand-light border-b-2 border-brand-border">
        <div className="flex items-center gap-2">
          <div className="sidebar-logo w-8 h-8">
            <span
              className="text-white text-xs font-bold"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              EM
            </span>
          </div>
          <div>
            <p
              className="text-sm font-bold leading-none"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Expense
            </p>
            <p className="text-xs text-gray-400 leading-none">Manager</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-app hover:bg-brand-border transition-all"
        >
          <HiMenu size={22} className="text-brand-black" />
        </button>
      </div>

      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "md:hidden fixed top-0 left-0 h-full w-[280px] bg-brand-light z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b-2 border-brand-border">
          <div className="flex items-center gap-2">
            <div className="sidebar-logo w-8 h-8">
              <span
                className="text-white text-xs font-bold"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                EM
              </span>
            </div>
            <div>
              <p
                className="text-sm font-bold leading-none"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                Expense
              </p>
              <p className="text-xs text-gray-400 leading-none">Manager</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-app hover:bg-brand-border transition-all"
          >
            <HiX size={20} className="text-brand-black" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3 flex-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-app text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-black text-white"
                    : "text-gray-500 hover:bg-brand-border hover:text-brand-black",
                )}
              >
                <Icon size={17} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-brand-border">
          <p className="text-xs text-gray-400">v2.0.0</p>
        </div>
      </div>
    </>
  );
}
