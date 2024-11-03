import {
  SimpleGrid,
  Text,
  Card,
  Image,
  Badge,
  Modal,
  Title,
  Container,
  TextInput,
  Textarea,
  Button,
  CardSection,
  Group,
  Chip,
  ChipGroup,
} from "@mantine/core";
import Link from "next/link";
import { IconCardGrid } from "/components/icon_card_grid";
import classes from "/styles/card.module.css";
import {
  IconTrash,
  IconPlant2,
  IconListDetails,
  IconUsers,
  IconBackhoe,
  IconCameraBolt,
  IconCameraDollar,
} from "@tabler/icons-react";

import AllDeployments, { DeploymentCards } from "./AllDeployments";
export default function Page() {
  const cards = [
    {
      icon: IconCameraDollar,
      title: "Camera Traps",
      href: "/cameratrap",
      description: "WM Camera Trap Data",
    },
    {
      icon: IconBackhoe,
      title: "New Deployment",
      href: "/cameratrap/deployment/new",
      description: "Create a new deployment",
    },
  ];
  return (
    <div>
      <h1>Camera Deployments</h1>
      <IconCardGrid cards={cards} />
      <AllDeployments />
    </div>
  );
}
