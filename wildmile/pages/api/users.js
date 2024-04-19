import { createRouter } from "next-connect";
import auth from "../../middleware/auth";
import { getAllUsers } from "../../lib/db/user";
import { NextConnectOptions } from "../../config/nextconnect";

const router = createRouter(NextConnectOptions);

router
  .use(auth)
  .use(async (req, event, next) => {
    const start = Date.now();
    await next(); // call next in chain
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);
  })
  .get(async (req, res) => {
    // For demo purpose only. You will never have an endpoint which returns all users.
    // Remove this in production
    res.json({ users: await getAllUsers() });
  });

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});
