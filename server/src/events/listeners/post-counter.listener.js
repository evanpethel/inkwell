// server/src/events/listeners/post-counter.listener.js
//
// Second EventBus listener (Workshop 9, Exercise 1): tracks a simple
// in-memory count of published posts, exposed via GET /api/stats.
// Deliberately trivial, like the logging listener — proves a second,
// independent listener can be added without touching PostService.

import { EventBus } from "../event-bus.js";

let totalPostsPublished = 0;

EventBus.on("post.published", () => {
    totalPostsPublished += 1;
});

export function getPostStats() {
    return { totalPostsPublished };
}