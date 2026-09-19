import { MongoClient } from "mongodb";
import { loadEnvConfig } from "@next/env";
import { prepareCaseStudyIndex } from "./case-study-index.mjs";
loadEnvConfig(process.cwd());
if (!process.env.MONGODB_URI || !process.env.MONGODB_DB)
  throw new Error("MONGODB_URI and MONGODB_DB are required.");
const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const collection = client
    .db(process.env.MONGODB_DB)
    .collection("caseStudies");
  await prepareCaseStudyIndex(collection);
  console.log(
    "Unique case-study slug index is ready. No records were changed.",
  );
} finally {
  await client.close();
}
