import CreateLog from "./new";

import { getSession } from "lib/getSession";
import { cookies, headers } from "next/headers";
import { AlertLogin } from "components/alert";

export const metadata = {
  title: "B.U.R.P.  Samples",
  description: "Bugs In Urban Rivers Project.",
};
export default async function Page(props) {
  const params = await props.params;
  const session = await getSession({ headers });
  if (!session) return <AlertLogin />;

  if (params.boxId) {
    if (params.boxId === "new") {
      return <CreateLog />;
      console.log("New box");
    }
    console.log("BoxId:", params.boxId);
  }
  return (
    <div>
      <h1>BoxId</h1>
    </div>
  );
}
