import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      autoIndex: false,
      maxPoolSize: 300,
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // connectTimeoutMS: 30000, // Extend the timeout to handle slow connections
      // socketTimeoutMS: 45000, // Extend the socket timeout
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("MongoDB is connected");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        cached.promise = null; // Reset promise to allow for reconnection attempts
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
