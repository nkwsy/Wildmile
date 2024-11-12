import { getSession } from "lib/getSession";
import { cookies, headers } from "next/headers";
import { AlertLogin } from "components/alert";
import DeploymentForm from "components/cameratrap/deployments/DeploymentForm";

export const metadata = {
  title: "Camera Trap Deployment",
  description: "Create or edit a camera trap deployment.",
};

export default async function Page({ params }) {
  const session = await getSession({ headers });
  if (!session) return <AlertLogin />;

  // Pass null deploymentId for new deployments
  return <DeploymentForm deploymentId={null} />;
}
