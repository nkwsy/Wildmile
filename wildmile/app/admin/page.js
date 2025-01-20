import {
  TextInput,
  Button,
  Table,
  Container,
  Group,
  LoadingOverlay,
} from "@mantine/core";
import CameraAdminPage from "./CameraAdminPage";
import { AlertLogin } from "components/alert";
import { getSession } from "lib/getSession";
import { Suspense } from "react";
import { cookies, headers } from "next/headers";

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
    <Suspense fallback={<LoadingOverlay visible />}>
      <CameraAdminPage />
    </Suspense>
  );
}
