import { jest } from "@jest/globals";
import request from "supertest";

const mockSession = {
  run: jest.fn(),
  close: jest.fn(),
};

// 👉 настоящий Base64 пользователя
const auth = "Basic dGVzdEBleGFtcGxlLmNvbTpzZWNyZXQxMjM=";

// мок базы
jest.unstable_mockModule("../src/config/db.js", () => ({
  getSession: () => mockSession
}));

// реальную авторизацию НЕ мокаем!

const app = (await import("../src/app.js")).default;

describe("Brands API", () => {
  beforeEach(() => {
    mockSession.run.mockReset();
    mockSession.close.mockReset();
  });

  it("GET /brands → should return all brands", async () => {
    mockSession.run.mockResolvedValue({
      records: [
        { get: () => ({ properties: { id: "1", name: "Nike" } }) },
        { get: () => ({ properties: { id: "2", name: "Adidas" } }) }
      ]
    });

    const res = await request(app)
      .get("/brands")
      .set("Authorization", auth);

    expect(res.statusCode).toBe(200);
  });

  it("POST /brands → create brand", async () => {
    mockSession.run.mockResolvedValue({ records: [] });

    const res = await request(app)
      .post("/brands")
      .set("Authorization", auth)
      .send({ name: "Puma" });

    expect(res.statusCode).toBe(201);
  });
});
