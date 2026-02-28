import { DatabaseMigrations } from "components/admin/DatabaseMigrations";
import { Card, Container, LoadingOverlay } from "@mantine/core";
import { Suspense } from "react";
import { AlertLogin } from "components/alert";
import { getSession } from "lib/getSession";

export const metadata = {
  title: "Database Migrations",
  description: "Run database migrations and backfill operations.",
};

export default async function Page() {
  const session = await getSession();
  if (
    !session ||
    (!session.admin &&
      !session.roles?.includes("CameraAdmin") &&
      !session.roles?.includes("SuperAdmin"))
  ) {
    return <AlertLogin />;
  }

  return (
    <Container>
      <Suspense fallback={<LoadingOverlay visible />}>
        <Card shadow="sm" p="md" withBorder>
          <DatabaseMigrations />
        </Card>
      </Suspense>
    </Container>
  );
}
