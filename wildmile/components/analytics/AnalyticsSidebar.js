"use client";
import { NavLink } from "@mantine/core";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AnalyticsSidebar() {
  const pathname = usePathname();
  const links = [
    {
      label: "Community Observation Activity",
      href: "/cameratrap/analytics",
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
