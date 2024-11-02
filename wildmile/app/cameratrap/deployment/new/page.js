// import CreateLog from "./new";

import { getSession } from "lib/getSession";
import { cookies, headers } from "next/headers";
import { AlertLogin } from "components/alert";
import DeploymentForm from "components/cameratrap/DeploymentForm";

export const metadata = {
  title: "Camera Trap Edit Deployment",
  description: "Edit a deployment of a camera trap.",
};
export default async function Page({ params }) {
  const session = await getSession({ headers });
  if (!session) return <AlertLogin />;

  return <DeploymentForm />;
}
