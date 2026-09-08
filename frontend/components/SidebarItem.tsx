"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

export interface SidebarItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  onNavigate?: () => void;
}

export default function SidebarItem({
  href,
  label,
  icon: Icon,
  onNavigate,
}: SidebarItemProps) {
  const pathname = usePathname();
 const isActive =
  href === "/page/dashboard"
    ? pathname === href
    : pathname === href || pathname?.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "group relative flex items-center h-[52px] px-4 mx-2 rounded-lg transition-colors duration-150",
        "gap-[14px]",
        isActive
          ? "bg-[#F4DEB5] font-semibold"
          : "bg-transparent hover:bg-[#F7EFE4]",
      ].join(" ")}
    >
      {/* Active left border indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 rounded-l-lg bg-[#2E6BA6]" />
      )}

      <Icon
        size={20}
        strokeWidth={2}
        className={isActive ? "text-[#6E5A3F]" : "text-[#6B6459]"}
      />
      <span
        className={
          isActive
            ? "text-[#6E5A3F] text-sm font-semibold"
            : "text-[#6B6459] text-sm font-medium"
        }
      >
        {label}
      </span>
    </Link>
  );
}