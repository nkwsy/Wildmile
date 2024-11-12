import { Tabs } from "@mantine/core";
import Link from "next/link";
import {
  IconListDetails,
  IconPlus,
  IconMapPin,
  IconCameraBolt,
} from "@tabler/icons-react";

const defaultTabs = [
  {
    value: "deployments",
    label: "All Deployments",
    icon: IconListDetails,
    href: "/cameratrap/deployment",
  },
  {
    value: "new",
    label: "New Deployment",
    icon: IconPlus,
    href: "/cameratrap/deployment/new",
  },
  {
    value: "locations",
    label: "Locations",
    icon: IconMapPin,
    href: "/cameratrap/locations",
  },
  {
    value: "cameras",
    label: "Cameras",
    icon: IconCameraBolt,
    href: "/cameratrap/camera",
  },
];

export default function NavTabs({
  activeTab = "deployments",
  children,
  tabs = defaultTabs,
}) {
  return (
    <Tabs defaultValue={activeTab}>
      <Tabs.List>
        {tabs.map((tab) => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            leftSection={tab.icon && <tab.icon size={16} />}
            component={Link}
            href={tab.href}
          >
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value={activeTab} pt="xl">
        {children}
      </Tabs.Panel>
    </Tabs>
  );
}
