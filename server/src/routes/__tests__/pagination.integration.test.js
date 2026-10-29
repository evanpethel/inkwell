// server/src/routes/__tests__/pagination.integration.test.js

import request from "supertest";
import { app } from "../../app.js";
import { prisma } from "../../db/client.js";
import { resetDatabase, createTestUser } from "../../test-utils/fixtures.js";
import { MAX_PAGE_SIZE } from "../../services/post.service.js";

beforeEach(async () => {
    await resetDatabase();
});

afterAll(async () => {
    await prisma.$disconnect();
});

test("an oversized pageSize is clamped to the maximum, not honored (DoS guard)", async () => {
    const author = await createTestUser();
    await prisma.post.createMany({
        data: Array.from({ length: MAX_PAGE_SIZE + 5 }, (_, i) => ({
            authorId: author.id,
            title: `Post ${i}`,
            body: "Filler body.",
            status: "PUBLISHED",
            publishedAt: new Date(),
        })),
    });

    const res = await request(app).get("/api/posts?page=1&pageSize=1000000");

    expect(res.status).toBe(200);
    expect(res.body.posts).toHaveLength(MAX_PAGE_SIZE);
    expect(res.body.hasMore).toBe(true);
});