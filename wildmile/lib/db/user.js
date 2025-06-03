import User from "models/User";
import getAvatar from "../avatar";

import dbConnect from "./setup";


export async function getAllUsers() {
  // For demo purpose only. You are not likely to have to return all users.
  const users = await User.find({}, [
    "-_id",
    "email",
    "admin",
    "ranger",
    "profile",
  ]);
  return users;
}

export async function createUser({
  name,
  email,
  password,
  location,
  picture = null,
}) {
  // Here you should create the user and save the salt and hashed password (some dbs may have
  // authentication methods that will do it for you so you don't have to worry about it):

  if (!picture) {
    picture = getAvatar(name);
  }
  await dbConnect()
  // Here you should insert the user into the database
  const user = await User.create({
    email: email,
    password: password,
    profile: {
      name: name,
      location: location,
      picture: picture,
    },
  });
  return user;
}

export async function convertEmailsToUserIds(emails) {
  try {
    // Fetch all users that match the emails in the array
    const users = await User.find({
      email: { $in: emails },
    }).select("_id email"); // Select only the _id and email fields

    // Create a map of email to user ID
    const emailToUserIdMap = users.reduce((acc, user) => {
      acc[user.email] = user._id.toString();
      return acc;
    }, {});

    // Transform the input emails to corresponding user IDs
    return emails.map((email) => emailToUserIdMap[email] || null); // Return null if no user found for an email
  } catch (error) {
    console.error("Failed to convert emails to user IDs:", error);
    throw error;
  }
}

export async function findUserByEmail(email) {
  await dbConnect()
  // Here you find the user based on id/email in the database
  return await User.findOne({ email: email.toLowerCase() }, [
    // "-_id",
    "-__v",
    "-createdAt",
    "-updatedAt",
  ]);
}

export async function updateUserByEmail(req, email, update) {
  await dbConnect()
  // Updating requires the _id which we filter out of results in other places so lets
  const user = await User.findOne({ email: email });

  if (update.email && update.email != user.email) {
    user.email = update.email;
  }
  if (update.password && !(await user.comparePassword(password))) {
    user.password = update.password;
  }
  if (user) {
    // Not all users have default values set so at least have empty values rather than null ones
    const profile_props = {
      name: "",
      location: "",
      picture: "",
    };
    user.profile = { ...profile_props, ...user.profile, ...update.profile };
    await user.save();
  }
  return user;
}
