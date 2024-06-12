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

import AllDeployments, { DeploymentCards } from "./AllDeployments";
export default function Page() {
  return (
    <div>
      <h1>Camera Deployments</h1>
      <AllDeployments />
    </div>
  );
}
