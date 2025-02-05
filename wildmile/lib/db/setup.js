import mongoose from "mongoose";
import { ConnectionStates } from "mongoose";

let connection = null;
const poolSize = 10;
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
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
  }

  if (connection) {
    return connection;
  }

  const opts = {
    bufferCommands: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    maxPoolSize: poolSize,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 5000,
    maxIdleTimeMS: 10000,
  };

  let client;
  let clientPromise;

  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
  }

  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = mongoose
        .connect(MONGODB_URI, opts)
        .then((client) => {
          return {
            client,
          };
        });
    }
    clientPromise = global._mongoClientPromise;
    console.log("db connected successfully");
  } else {
    // Use existing connection if it's already established
    if (cached.conn && cached.conn.readyState === 1) {
      return cached.conn;
    }

    // Wait for an in-progress connection if one exists
    if (cached.promise) {
      cached.conn = await cached.promise;
      return cached.conn;
    }
    // In production mode, it's best to not use a global variable.
    clientPromise = mongoose.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
      };
    });
    console.log("db connected successfully");
  }

  // Export a module-scoped MongoClient promise. By doing this in a
  // separate module, the client can be shared across functions.
  return clientPromise;
}

export default dbConnect;

// export default async function connectToDatabase() {
//   if (
//     !connection ||
//     (connection.connection.readyState !== ConnectionStates.connected &&
//       connection.connection.readyState !== ConnectionStates.connecting)
//   ) {
//     console.log("[MONGOOSE] Creating New Connection");

//     mongoose.connection.once("open", () => {
//       console.log(`[MONGOOSE] Connected with poolSize ${poolSize}`);
//     });

//     mongoose.connection.on("error", (err) => {
//       console.error("[MONGOOSE] Connection error:", err);
//     });

//     try {
//       connection = await mongoose.connect(env.MONGODB_URI, {
//         maxPoolSize: poolSize,
//         bufferTimeoutMS: 2500,
//       });
//     } catch (err) {
//       console.error("[MONGOOSE] Initial connection error:", err);
//     }
//   }
// }
