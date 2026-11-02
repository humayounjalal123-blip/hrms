"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookMarked,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  School,
  Settings,
  Users,
  UserCog,
  FileText,
  Headphones,
  Video,
} from "lucide-react";
import { Logo } from "../Logo";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import { Role } from "@/lib/types";
import clsx from "clsx";
import { motion } from "framer-motion";

type NavKey =
  | "home"
  | "progress"
  | "revision"
  | "assessments"
  | "schedule"
  | "meetings"
  | "listen"
  | "classes"
  | "students"
  | "teachers"
  | "users"
  | "reports"
  | "settings";

type NavItem = {
  href: string;
  key: NavKey;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", key: "home", icon: Home, roles: ["student", "teacher", "admin"] },
  { href: "/dashboard/progress", key: "progress", icon: BarChart3, roles: ["student"] },
  { href: "/dashboard/revision", key: "revision", icon: BookMarked, roles: ["student", "teacher", "admin"] },
  { href: "/dashboard/assessments", key: "assessments", icon: ClipboardCheck, roles: ["student", "teacher"] },
  { href: "/dashboard/schedule", key: "schedule", icon: CalendarDays, roles: ["student", "teacher"] },
  { href: "/dashboard/meetings", key: "meetings", icon: Video, roles: ["student", "teacher", "admin"] },
  { href: "/dashboard/listen", key: "listen", icon: Headphones, roles: ["student", "teacher", "admin"] },
  { href: "/dashboard/classes", key: "classes", icon: School, roles: ["teacher", "admin"] },
  { href: "/dashboard/students", key: "students", icon: GraduationCap, roles: ["teacher", "admin"] },
  { href: "/dashboard/teachers", key: "teachers", icon: Users, roles: ["admin"] },
  { href: "/dashboard/users", key: "users", icon: UserCog, roles: ["admin"] },
  { href: "/dashboard/reports", key: "reports", icon: FileText, roles: ["student", "teacher", "admin"] },
  { href: "/dashboard/settings", key: "settings", icon: Settings, roles: ["student", "teacher", "admin"] },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  if (!user) return null;

  const items = navItems.filter((item) => item.roles.includes(user.role));
  const roleLabel =
    user.role === "student"
      ? t.roles.student
      : user.role === "teacher"
        ? t.roles.teacher
        : t.roles.admin;

  return (
    <aside className="flex h-full w-[17.5rem] flex-col border-e border-primary/10 bg-white/75 backdrop-blur-2xl">
      <div className="border-b border-primary/10 px-5 py-5">
        <Logo href="/dashboard" showSubtitle />
      </div>

      <div className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-arch-fade p-3.5 text-white pattern-arch shadow-nav">
          <div className="pointer-events-none absolute -end-6 -top-6 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-green-100/80">
            {t.common.workspace}
          </p>
          <p className="mt-1.5 truncate text-sm font-semibold">{user.name}</p>
          <p className="mt-0.5 inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[11px] text-green-50">
            {roleLabel}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item, index) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const label = t.dash.nav[item.key];
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.25 }}
            >
              <motion.div whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={clsx(
                    "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-sm font-medium transition duration-200",
                    active
                      ? "text-white"
                      : "text-ink-soft hover:bg-gold-soft/60 hover:text-primary"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-2xl bg-primary shadow-glow"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  {active && (
                    <motion.span
                      layoutId="sidebar-gold-bar"
                      className="absolute inset-y-2 start-1 z-10 w-1 rounded-full bg-gold"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span
                    className={clsx(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-xl transition",
                      active
                        ? "bg-white/15 ring-1 ring-gold/40"
                        : "bg-primary-mist group-hover:bg-white group-hover:shadow-sm"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="relative z-10 truncate">{label}</span>
                </Link>
              </motion.div>
            </motion.div>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-primary/10 p-3">
        <LanguageSwitcher variant="compact" className="w-full [&>button]:w-full [&>button]:justify-center" />
        <button
          onClick={() => {
            logout();
            router.push("/login");
          }}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-rose-50 hover:text-rose-700"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <LogOut className="h-4 w-4" />
          </span>
          {t.common.logout}
        </button>
      </div>
    </aside>
  );
}

export function MobileTopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-primary/10 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
      <button
        onClick={onMenu}
        className="rounded-2xl border border-primary/15 bg-primary-mist/70 p-2 text-primary transition hover:bg-primary-soft"
        aria-label="Open menu"
      >
        <LayoutDashboard className="h-5 w-5" />
      </button>
      <Logo showSubtitle={false} href="/dashboard" />
      <LanguageSwitcher variant="compact" />
    </div>
  );
}
