"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Dumbbell,
  Apple,
  LineChart,
  User,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  GraduationCap,
} from "lucide-react";
import { handleLogout } from "@/app/lib/actions/auth.action";

export default function Sidebar({ isAdmin, isTrainer, user }: { isAdmin: boolean, isTrainer: boolean, user: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workouts", href: "/workouts", icon: Dumbbell },
    { name: "Nutrition", href: "/nutrition", icon: Apple },
    { name: "Progress", href: "/progress", icon: LineChart },
    { name: "Trainers", href: "/trainers", icon: GraduationCap },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  if (isTrainer) {
    navItems.push({ name: "My Clients", href: "/clients", icon: Users });
  }

  if (isAdmin) {
    navItems.push({ name: "Admin Panel", href: "/admin", icon: ShieldAlert });
  }

  const toggleSidebar = () => setIsOpen(!isOpen);

  const NavLinks = () => (
    <div className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-[#00ff87]/10 text-[#00ff87]"
                : "text-slate-400 hover:bg-[#1e293b] hover:text-white"
            }`}
          >
            <Icon size={20} />
            {item.name}
          </Link>
        );
      })}

      <div className="mt-8 border-t border-[#1e293b] pt-4 flex flex-col gap-2">
        {user && (
          <Link href="/profile" className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-[#1e293b] transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#00ff87] to-teal-400 font-bold text-[#0a0f1e]">
              {user.firstName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold text-white">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </Link>
        )}

        <button
          onClick={async () => {
            await handleLogout();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between bg-[#111827] p-4 lg:hidden">
        <span className="text-xl font-bold text-[#00ff87]">FitTrack</span>
        <button onClick={toggleSidebar} className="text-slate-300 hover:text-white">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-[#1e293b] bg-[#111827] transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="hidden items-center justify-center border-b border-[#1e293b] p-6 lg:flex">
          <span className="text-2xl font-bold tracking-wider text-[#00ff87]">
            FitTrack
          </span>
        </div>
        <nav className="mt-4 flex-1 overflow-y-auto">
          <NavLinks />
        </nav>
      </aside>
    </>
  );
}
