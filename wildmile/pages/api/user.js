import { createRouter } from "next-connect";
import userValidationSchema from "validation/user";
import auth from "middleware/auth";
import { createUser, findUserByEmail, updateUserByEmail } from "lib/db/user";
import { NextConnectOptions } from "/config/nextconnect";

const router = createRouter(NextConnectOptions);

router
  .use(auth)  .use(async (req, res, next) => {
    await next();
  }).get((req, res) => {
    if (req.user) {
      console.log(`User ${req.user.email} authenticated`);
      const { email, ranger, admin, profile, _id } = req.user;
      return res.json({
        user: { email, ranger: ranger || false, admin: admin || false, profile, _id },
      });
    }
    return res.json({});
  })  .post(async (req, res) => {
    try {
      try {
        await userValidationSchema.validate(req.body, { abortEarly: false });
      } catch (error) {
        return res.status(400).send(error.message);
      }

      const existingUser = await findUserByEmail(req.body.email);
      if (!!existingUser) {
        return res.status(409).send("The email has already been used");
      }

      const user = await createUser(req.body);
      req.logIn(user, (err) => {
        if (err) {
          throw err;
        }
        console.log(`User ${user.email} authenticated`);
        res.status(201).json({
          user,
        });
      });    } catch (error) {
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
    res.status(err.statusCode || 500).end(err.message);
  },
});
