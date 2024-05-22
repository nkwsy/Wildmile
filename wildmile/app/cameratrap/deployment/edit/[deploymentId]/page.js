// import CreateLog from "./new";

import { getSession } from "lib/getSession";
import { cookies, headers } from "next/headers";
import { AlertLogin } from "components/alert";

export const metadata = {
  title: "Camera Trap Edit Deployment",
  description: "Edit a deployment of a camera trap.",
};
export default async function Page({ params }) {
  const session = await getSession({ headers });
  if (!session) return <AlertLogin />;

  if (params.boxId) {
    if (params.boxId === "new") {
      //   return <CreateLog />;
      console.log("New box");
    }
    console.log("BoxId:", params.deploymentId);
  }
  return (
    <div>
      <h1>BoxId</h1>
    </div>
  );
}
