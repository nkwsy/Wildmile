"use client";
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
  IconMapPin,
  IconCameraDollar,
  IconHomePlus,
} from "@tabler/icons-react";
import Tabs from "/components/Tabs";
import AllDeployments, { DeploymentCards } from "./AllDeployments";
export default function Page() {
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
      icon: IconHomePlus,
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
  return (
    <div>
      <h1>Camera Deployments</h1>
      <Tabs tabs={defaultTabs} activeTab="deployments">
        <AllDeployments />
      </Tabs>
    </div>
  );
}
