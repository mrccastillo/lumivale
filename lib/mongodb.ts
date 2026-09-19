import { Db, MongoClient } from "mongodb";

// Survives Next.js development module reloads. Each process owns one pool.
const mongoGlobal = globalThis as typeof globalThis & {
  lumivaleMongoClientPromise?: Promise<MongoClient>;
};

function getMongoConfig() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  if (!dbName) {
    throw new Error("MONGODB_DB is not configured.");
  }

  return { dbName, uri };
}

export async function getMongoClient() {
  const { uri } = getMongoConfig();

  if (!mongoGlobal.lumivaleMongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 30_000,
      waitQueueTimeoutMS: 10_000,
    });
    const pending = client.connect().catch(async (error: unknown) => {
      await client.close().catch(() => undefined);
      // Failed connections remain retryable without clearing a newer pool.
      if (mongoGlobal.lumivaleMongoClientPromise === pending) {
        delete mongoGlobal.lumivaleMongoClientPromise;
      }
      throw error;
    });
    mongoGlobal.lumivaleMongoClientPromise = pending;
  }

  return mongoGlobal.lumivaleMongoClientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const { dbName } = getMongoConfig();
  const client = await getMongoClient();

  return client.db(dbName);
}
