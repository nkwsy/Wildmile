import { createRouter } from "next-connect";
import userValidationSchema from "validation/user";
import auth from "middleware/auth";
import { createUser, findUserByEmail, updateUserByEmail } from "lib/db/user";
import { NextConnectOptions } from "/config/nextconnect";

const router = createRouter(NextConnectOptions);

router
  .use(auth)
  .use(async (req, res, next) => {
    const start = Date.now();
    await next(); // call next in chain
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);
  })
  .get((req, res) => {
    if (req.user) {
      console.log("user", req.user);
      const { email, ranger, admin, profile, _id } = req.user;
      return res.json({
        user: { email, ranger: ranger || false, admin: admin || false, profile, _id },
      });
    }
    return res.json({});
  })
  .post(async (req, res) => {
    const requestId = `req_${Date.now()}`; // Simple request ID
    try {
      console.log(`[${requestId}] User creation request received`);
      console.log(`[${requestId}] Request body (sanitized): email=${req.body.email}, name=${req.body.name}`);

      try {
        await userValidationSchema.validate(req.body, { abortEarly: false });
      } catch (error) {
        console.error(`[${requestId}] Validation error: ${error.message}`);
        return res.status(400).send(error.message);
      }

      // Here you check if the email has already been used
      console.log(`[${requestId}] Checking if email exists: ${req.body.email}`);
      const existingUser = await findUserByEmail(req.body.email);
      if (!!existingUser) {
        console.log(`[${requestId}] User conflict: email ${req.body.email} already exists.`);
        return res.status(409).send("The email has already been used");
      }
      console.log(`[${requestId}] Email ${req.body.email} not found. Proceeding with user creation.`);

      console.log(`[${requestId}] Starting user creation for email: ${req.body.email}`);
      const user = await createUser(req.body); // This should remain req.body as per original before phone/zipcode
      console.log(`[${requestId}] User created successfully with ID: ${user._id}`);

      console.log(`[${requestId}] Attempting to log in user: ${user._id}`);
      req.logIn(user, (err) => {
        if (err) {
          console.error(`[${requestId}] Error during req.logIn for user ${user._id}:`, err);
          // It's important to handle the error here, perhaps by sending a response
          // For now, re-throwing will be caught by the outer catch.
          throw err;
        }
        console.log(`[${requestId}] User ${user._id} logged in successfully.`);
        // Log the signed up user in
        res.status(201).json({
          user,
        });
      });
    } catch (error) {
      // Main error handler for the POST route
      console.error(`[${requestId}] Main error handler: ${error.message}`);
      if (error.stack) {
        console.error(`[${requestId}] Main error handler stack: ${error.stack}`);
      }
      // Ensure response is sent for unhandled errors if not already sent
      if (!res.headersSent) {
        res.status(500).send("Internal Server Error");
      }
    }
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
  .put((req, res) => {
    const { email, password, name, location, picture } = req.body;
    const user = updateUserByEmail(req, req.user.email, {
      email: email,
      password: password,
      profile: {
        name: name,
        location: location,
        picture: picture,
      },
    });
    return res.json({ user });
  });

export default router.handler({
  onError: (err, req, res) => {
    const requestId = req.id || `req_${Date.now()}`; // Use req.id if available, otherwise generate
    console.error(`[${requestId}] onError: ${err.message}`);
    if (err.stack) {
      console.error(`[${requestId}] onError stack: ${err.stack}`);
    }
    res.status(err.statusCode || 500).end(err.message);
  },
});
