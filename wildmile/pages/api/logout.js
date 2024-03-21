import { useRouter } from "next-connect";
import auth from "../../middleware/auth";
import { NextConnectOptions } from "../../config/nextconnect";

const handler = useRouter(NextConnectOptions);

handler.use(auth).get((req, res) => {
  req.logOut();
  res.status(204).end();
});

export default handler;
