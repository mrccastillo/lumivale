import { Db, MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

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

  clientPromise ??= new MongoClient(uri).connect();

  return clientPromise;
}

export async function getMongoDb(): Promise<Db> {
  const { dbName } = getMongoConfig();
  const client = await getMongoClient();

  return client.db(dbName);
}
