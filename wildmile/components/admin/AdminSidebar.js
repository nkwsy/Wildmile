"use client";
import { NavLink } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div>
      <NavLink
        label="User Role Management"
        component={Link}
        href="/admin/users"
        active={pathname === "/admin/users"}
      />
      <NavLink
        label="Achievement Manager"
        component={Link}
        href="/admin/achievements"
        active={pathname === "/admin/achievements"}
      />
      <NavLink
        label="Filter Defaults"
        component={Link}
        href="/admin/filters"
        active={pathname === "/admin/filters"}
      />
    </div>
  );
}
