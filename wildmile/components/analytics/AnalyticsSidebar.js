"use client";
import { NavLink } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AnalyticsSidebar() {
  const pathname = usePathname();
  const links = [
    {
      label: "Total Images with Observations",
      href: "/cameratrap/analytics",
    },
    {
      label: "Community Observation Activity",
      href: "/cameratrap/analytics/community-observation-activity",
    },
    {
      label: "Monthly User Activity",
      href: "/cameratrap/analytics/monthly-user-activity",
    },
  ];
  return (
    <div>
      {links.map((link) => (
        <NavLink
          key={link.href}
          label={link.label}
          component={Link}
          href={link.href}
          active={pathname === link.href}
        />
      ))}
    </div>
  );
}
