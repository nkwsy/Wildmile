import { createRouter } from "next-connect";
import auth from "middleware/auth";
import {
  getAllLogs,
  createLog,
  getFilteredLogs,
  updateLogItems,
} from "lib/db/trash";
import { NextConnectOptions } from "config/nextconnect";

const router = createRouter(NextConnectOptions);

router
  .use(auth)
  .use(async (req, res, next) => {
    const start = Date.now();
    await next(); // call next in chain
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);
  })
  .get(async (req, res) => {
    if (req.query) {
      return res.json(await getFilteredLogs(req.query));
    }
    return res.json(await getAllLogs());
  })
  .use(async (req, res, next) => {
    // handlers after this (PUT, DELETE) all require an authenticated user
    // This middleware to check if user is authenticated before continuing
    if (!req.user) {
      res.status(401).send("unauthenticated");
    } else {
      await next();
    }
  })
  .post(async (req, res) => {
    // try {
    //   await userValidationSchema.validate(req.body, { abortEarly: false })
    // } catch (error) {
    //   return res.status(400).send(error.message)
    // }
    console.log(req.body);
    return res
      .status(201)
      .json(await updateLogItems(req.body.items, req.query.id));
  });

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});
