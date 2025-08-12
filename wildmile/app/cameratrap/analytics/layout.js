"use client";
import { AppShell, Burger, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import AnalyticsSidebar from "components/analytics/AnalyticsSidebar";
import AnalyticsStats from "components/analytics/AnalyticsStats";
import { HeaderNav } from "/components/nav_bar";

export default function AnalyticsLayout({ children }) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <HeaderNav />
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AnalyticsSidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <AnalyticsStats />
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
