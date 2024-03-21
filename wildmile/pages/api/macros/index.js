import { useRouter } from "next-connect";
import auth from "/middleware/auth";
import { updateMacroSampleByID, createMacroSample } from "/lib/db/macros"; // Updated import statement

import { NextConnectOptions } from "/config/nextconnect";

const handler = useRouter(NextConnectOptions);

handler
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
    try {
      console.log("POST /api/macro/Samples req.body:", req.body);
      const Sample = await createMacroSample(req);
      console.log("POST /api/macro/Samples Sample:", Sample);
      return res.status(201).json({ success: true, data: Sample });
    } catch (error) {
      console.error("Error creating Sample:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  });

export default handler;
