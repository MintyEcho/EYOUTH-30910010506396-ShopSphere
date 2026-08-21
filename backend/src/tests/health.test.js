process.env.JWT_SECRET = "test_secret";

jest.mock("../config/prisma", () => ({
  $queryRaw: jest.fn(),
}));

jest.mock("mongoose", () => ({
  connection: { readyState: 1 },
}));

const request = require("supertest");
const app = require("../app");
const prisma = require("../config/prisma");

describe("GET /", () => {
  it("returns API running status", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "API running" });
  });
});

describe("GET /api/health", () => {
  afterEach(() => jest.clearAllMocks());

  it("returns 200 and ok when both databases are reachable", async () => {
    prisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.checks).toEqual({ postgres: "ok", mongo: "ok" });
  });

  it("returns 503 when postgres is unreachable", async () => {
    prisma.$queryRaw.mockRejectedValue(new Error("connection refused"));

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(503);
    expect(res.body.checks.postgres).toBe("error");
  });
});
