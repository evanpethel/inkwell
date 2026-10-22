// server/src/routes/__tests__/auth.integration.test.js
//
// Integration test: real Routes, Services, Repositories, and the
// isolated test database, with no mocks. Checks that registration and
// login work together.

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase } from "../../test-utils/fixtures.js";

beforeEach(async () => {
    await resetDatabase();
});

afterAll(async () => {
    await prisma.$disconnect();
});

test("a user who registers can then log in with the same credentials (US-01, US-02)", async () => {
    const credentials = { email: "alice@example.com", password: "correcthorse" };

    // Act: register a real user
    const registerRes = await request(app)
        .post("/api/auth/register")
        .send({ ...credentials, displayName: "Alice" });
    expect(registerRes.status).toBe(201);

    // Act: log in as that same user
    const loginRes = await request(app)
        .post("/api/auth/login")
        .send(credentials);

    // Assert: login succeeds and returns the account that was just created
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.id).toBe(registerRes.body.user.id);
    expect(loginRes.body.user.email).toBe("alice@example.com");
    expect(loginRes.body.user).not.toHaveProperty("passwordHash");
    expect(typeof loginRes.body.accessToken).toBe("string");
    expect(typeof loginRes.body.refreshToken).toBe("string");
});