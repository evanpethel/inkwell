// server/src/services/__tests__/post.service.test.js

import { jest } from "@jest/globals";

const mockPostRepository = {
  createWithTags: jest.fn(),
  searchPublished: jest.fn(),
};

const mockEventBus = {
  emit: jest.fn(),
};

jest.unstable_mockModule("../../repositories/post.repository.js", () => ({
  PostRepository: mockPostRepository,
}));

jest.unstable_mockModule("../../events/event-bus.js", () => ({
  EventBus: mockEventBus,
}));

const { PostService } = await import("../post.service.js");

beforeEach(() => {
  jest.clearAllMocks();
});

test("publish() creates a PUBLISHED post and emits post.published", async () => {
  mockPostRepository.createWithTags.mockResolvedValue({
    id: "p1",
    title: "Hello",
    status: "PUBLISHED",
  });

  const post = await PostService.publish({
    authorId: "u1",
    title: "Hello",
    body: "World",
  });

  expect(post.status).toBe("PUBLISHED");
  expect(mockEventBus.emit).toHaveBeenCalledWith(
    "post.published",
    expect.objectContaining({ postId: "p1" })
  );
});

test("publish() rejects an empty title", async () => {
  await expect(
    PostService.publish({
      authorId: "u1",
      title: "",
      body: "World",
    })
  ).rejects.toThrow();
});

describe("PostService.search", () => {
  test("returns matching posts from the repository (row 1)", async () => {
    const fakeResult = {
      posts: [{ id: "p1", title: "On Modularity" }],
      hasMore: false,
    };
    mockPostRepository.searchPublished.mockResolvedValue(fakeResult);

    const result = await PostService.search({ query: "modularity" });

    expect(result).toEqual(fakeResult);
  });

  test("returns an empty list, not an error, when nothing matches (row 2)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({
      posts: [],
      hasMore: false,
    });

    const result = await PostService.search({ query: "zzzz" });

    expect(result.posts).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  test("passes hasMore: true through when more pages remain (row 3)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({
      posts: [{ id: "p1" }],
      hasMore: true,
    });

    const result = await PostService.search({ query: "design" });

    expect(result.hasMore).toBe(true);
  });

  test("uses page 1 and pageSize 10 when omitted (row 4, white-box branch)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({
      posts: [],
      hasMore: false,
    });

    await PostService.search({ query: "x" });

    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith({
      query: "x",
      page: 1,
      pageSize: 10,
    });
  });

  test("passes explicit page and pageSize through (row 5, white-box branch)", async () => {
    mockPostRepository.searchPublished.mockResolvedValue({
      posts: [],
      hasMore: false,
    });

    await PostService.search({ query: "x", page: 3, pageSize: 5 });

    expect(mockPostRepository.searchPublished).toHaveBeenCalledWith({
      query: "x",
      page: 3,
      pageSize: 5,
    });
  });

  test("propagates repository failures instead of swallowing them (row 6, error path)", async () => {
    mockPostRepository.searchPublished.mockRejectedValue(new Error("db down"));

    await expect(PostService.search({ query: "x" })).rejects.toThrow("db down");
  });
});