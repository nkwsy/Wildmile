import {
  TextInput,
  Button,
  Table,
  Container,
  Grid,
  GridCol,
  Paper,
  Group,
  LoadingOverlay,
  Card,
} from "@mantine/core";
import CameraAdminPage from "./CameraAdminPage";
import { AlertLogin } from "components/alert";
import { getSession } from "lib/getSession";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { AchievementManager } from "components/admin/AchievementManager";

// In your admin page component
export const metadata = {
  title: "Camera Trap Admin",
  description: "Manage camera trap users and roles.",
};

export default async function Page(props) {
  const params = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.getAll();
  console.log("token", token);
  const session = await getSession({ headers });
  if (!session) return <AlertLogin />;

  console.log("session", await session.admin);
  if (
    !session.admin &&
    !session.roles.includes("CameraAdmin") &&
    !session.roles.includes("SuperAdmin") &&
    !session.roles.includes("Admin")
  ) {
    console.log("not admin");
    return <AlertLogin />;
  }

  return (
    <Container>
      <Suspense fallback={<LoadingOverlay visible />}>
        <Card shadow="sm" p="md" withBorder>
          <CameraAdminPage />
        </Card>
        <Card shadow="sm" p="md" withBorder>
          <AchievementManager />
        </Card>
      </Suspense>
    </Container>
  );
}
