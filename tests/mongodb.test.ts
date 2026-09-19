import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ connect: vi.fn(), close: vi.fn(), options: vi.fn() }));

vi.mock("mongodb", () => ({
  MongoClient: class {
    constructor(uri: string, options: unknown) { mocks.options(uri, options); }
    connect = mocks.connect;
    close = mocks.close;
  },
}));

beforeEach(() => {
  delete (globalThis as typeof globalThis & { lumivaleMongoClientPromise?: unknown }).lumivaleMongoClientPromise;
  vi.resetModules();
  mocks.options.mockReset();
  mocks.connect.mockReset();
  mocks.close.mockReset().mockResolvedValue(undefined);
  vi.stubEnv("MONGODB_URI", "mongodb://localhost:27017");
  vi.stubEnv("MONGODB_DB", "test");
});

afterEach(() => {
  delete (globalThis as typeof globalThis & { lumivaleMongoClientPromise?: unknown }).lumivaleMongoClientPromise;
  vi.unstubAllEnvs();
});

describe("MongoDB connection recovery", () => {
  test("shares a connection across concurrent requests", async () => {
    const connectedClient = {};
    mocks.connect.mockResolvedValue(connectedClient);
    const { getMongoClient } = await import("@/lib/mongodb");
    expect(await Promise.all([getMongoClient(), getMongoClient()])).toEqual([
      connectedClient, connectedClient,
    ]);
    expect(mocks.connect).toHaveBeenCalledTimes(1);
  });

  test("reuses the same pool after a module reload and bounds idle connections", async () => {
    const client = {};
    mocks.connect.mockResolvedValue(client);
    const first = await import("@/lib/mongodb");
    await first.getMongoClient();
    vi.resetModules();
    const reloaded = await import("@/lib/mongodb");
    expect(await reloaded.getMongoClient()).toBe(client);
    expect(mocks.connect).toHaveBeenCalledTimes(1);
    expect(mocks.options).toHaveBeenCalledWith(expect.any(String), {
      maxPoolSize: 10, minPoolSize: 0, maxIdleTimeMS: 30_000, waitQueueTimeoutMS: 10_000,
    });
  });

  test("retries after a connection failure and reuses the recovered connection", async () => {
    const failure = new Error("TLS handshake failed");
    const connectedClient = {};
    mocks.connect.mockRejectedValueOnce(failure).mockResolvedValueOnce(connectedClient);
    const { getMongoClient } = await import("@/lib/mongodb");
    await expect(getMongoClient()).rejects.toBe(failure);
    expect(mocks.close).toHaveBeenCalledTimes(1);
    await expect(getMongoClient()).resolves.toBe(connectedClient);
    await expect(getMongoClient()).resolves.toBe(connectedClient);
    expect(mocks.connect).toHaveBeenCalledTimes(2);
  });

  test("preserves the connection error if cleanup also fails", async () => {
    const failure = new Error("TLS handshake failed");
    mocks.connect.mockRejectedValueOnce(failure).mockResolvedValueOnce({});
    mocks.close.mockRejectedValueOnce(new Error("Already disconnected"));
    const { getMongoClient } = await import("@/lib/mongodb");
    await expect(getMongoClient()).rejects.toBe(failure);
    await expect(getMongoClient()).resolves.toEqual({});
  });
});
