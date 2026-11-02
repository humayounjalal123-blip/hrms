"use client";

import { usePathname } from "next/navigation";
import { PageTransition } from "@/components/motion";

/** Smooth enter/exit for public pages (dashboard has its own). */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard")) {
    return <>{children}</>;
  }
  return <PageTransition routeKey={pathname}>{children}</PageTransition>;
}
