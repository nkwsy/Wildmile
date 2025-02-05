import mongoose from "mongoose";
import { ConnectionStates } from "mongoose";

let connection = null;
const poolSize = 1;
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
    maxPoolSize: 1,
    minPoolSize: 1,
    autoIndex: true,
    socketTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000, // Ping server every 10 seconds
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
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((client) => {
      return {
        client,
      };
    });
    console.log("db connected successfully");
  }

  // Export a module-scoped MongoClient promise. By doing this in a
  // separate module, the client can be shared across functions.
  cached.conn = await cached.promise;
  return cached.conn;
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

// import mongoose from 'mongoose';

// const { MONGODB_URI } = process.env;

// if (!MONGODB_URI) {
//   console.error('MONGODB_URI environment variable not defined.');
//   throw new Error('Please define the MONGODB_URI environment variable.');
// }

// // Global cache to prevent multiple connections in development mode
// let cached = global.mongoose;
// if (!cached) {
//   cached = global.mongoose = { conn: null, promise: null };
// }

// // Configuration to manage connection pooling and timeouts
// const options = {
//   bufferCommands: false,
//   maxPoolSize: 1,
//   minPoolSize: 1,
//   serverSelectionTimeoutMS: 5000,   // Fail fast if no server is found
//   socketTimeoutMS: 30000,          // Socket idle timeout
//   heartbeatFrequencyMS: 10000,     // Ping server every 10 seconds
//   maxIdleTimeMS: 10000,            // Reap idle connections after 10 seconds
//   waitQueueTimeoutMS: 5000,        // Timeout for connection queue
// };

// async function connectToDatabase() {
//   // Use existing connection if it's already established
//   if (cached.conn && cached.conn.readyState === 1) {
//     return cached.conn;
//   }

//   // Wait for an in-progress connection if one exists
//   if (cached.promise) {
//     cached.conn = await cached.promise;
//     return cached.conn;
//   }

//   // Create a new connection if none exist
//   console.info('MongoDB: Initiating a new connection...');

//   cached.promise = mongoose.connect(MONGODB_URI, options).then((mongooseInstance) => {
//     console.info('MongoDB: Successfully connected.');
//     return mongooseInstance;
//   }).catch(err => {
//     console.error(`MongoDB: Connection error - ${err.message}`);
//     cached.promise = null;
//     throw err;
//   });

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// export default connectToDatabase;
