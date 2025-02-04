"use client";

import { Tabs } from "@mantine/core";
import { IconStars, IconTrophy } from "@tabler/icons-react";

export function UserInfoTabs({ children, stats }) {
  return (
    <Tabs defaultValue="stats">
      <Tabs.List>
        <Tabs.Tab value="stats" icon={<IconStars size={14} />}>
          Statistics
        </Tabs.Tab>
        <Tabs.Tab value="achievements" icon={<IconTrophy size={14} />}>
          Achievements
        </Tabs.Tab>
      </Tabs.List>

      {children}
    </Tabs>
  );
}
