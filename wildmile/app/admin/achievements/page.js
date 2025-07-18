import { AchievementManager } from "components/admin/AchievementManager";
import { Card, Container, LoadingOverlay } from "@mantine/core";
import { Suspense } from "react";
import { AlertLogin } from "components/alert";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

export const metadata = {
  title: "Achievement Manager",
  description: "Manage achievements.",
};

export default async function Page() {
  const session = await getSession({ headers });
  if (
    !session ||
    (!session.admin &&
      !session.roles.includes("CameraAdmin") &&
      !session.roles.includes("SuperAdmin") &&
      !session.roles.includes("Admin"))
  ) {
    return <AlertLogin />;
  }

  return (
    <Container>
      <Suspense fallback={<LoadingOverlay visible />}>
        <Card shadow="sm" p="md" withBorder>
          <AchievementManager />
        </Card>
      </Suspense>
    </Container>
  );
}
