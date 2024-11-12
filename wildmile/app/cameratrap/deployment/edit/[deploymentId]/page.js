// import CreateLog from "./new";

import { getSession } from "lib/getSession";
import { cookies, headers } from "next/headers";
import { AlertLogin } from "components/alert";
import DeploymentDash from "components/cameratrap/deployments/DeploymentDash";

export const metadata = {
  title: "Camera Trap Edit Deployment",
  description: "Edit a deployment of a camera trap.",
};
export default async function Page({ params }) {
  const session = await getSession({ headers });
  if (!session) return <AlertLogin />;

  if (params.deploymentId) {
    // if (params.deploymentId === "new") {
    return <DeploymentDash deploymentId={params.deploymentId} />;
    console.log("New Deployment");
    // }

    //TODO add deployment functions
    console.log("BoxId:", params.deploymentId);
  }
  return (
    <div>
      <h1>Edit deployment</h1>
    </div>
  );
}
