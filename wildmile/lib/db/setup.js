import mongoose from "mongoose";

const MONGODB_OPTS = {
  bufferCommands: false,
  maxPoolSize: 5,
  minPoolSize: 1,
  autoIndex: true,
  socketTimeoutMS: 30000,
  heartbeatFrequencyMS: 10000,
  serverSelectionTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
};

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected — clearing connection cache");
    cached.conn = null;
    cached.promise = null;
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
    cached.conn = null;
    cached.promise = null;
  });
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
  }

  const { readyState } = mongoose.connection;

  // 1 = connected — reuse immediately
  if (readyState === 1 && cached.conn) {
    return cached.conn;
  }

  // 2 = connecting — wait for the in-flight promise
  if (readyState === 2 && cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // 0 = disconnected, 3 = disconnecting, or no promise — start fresh
  cached.conn = null;
  cached.promise = mongoose
    .connect(MONGODB_URI, MONGODB_OPTS)
    .then((instance) => {
      console.log("MongoDB connected successfully");
      return instance;
    })
    .catch((err) => {
      console.error("MongoDB connection failed:", err.message);
      cached.promise = null;
      cached.conn = null;
      throw err;
    });

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
