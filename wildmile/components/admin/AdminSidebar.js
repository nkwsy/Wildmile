"use client";
import { NavLink } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Title } from "@mantine/core";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div>
      <Title order={4} p="md">
        Admin Settings
      </Title>
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
      <NavLink
        label="CameraTrap Analytics"
        component={Link}
        href="/admin/cameratrap-analytics"
        active={pathname === "/admin/cameratrap-analytics"}
      />
    </div>
  );
}
