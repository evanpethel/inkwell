// server/src/services/post.service.js
import { PostRepository } from "../repositories/post.repository.js";
import { assertNonEmpty } from "../utils/validation.js";
import { SubstringSearchStrategy } from "./search/substring-search.strategy.js";
import { EventBus } from "../events/event-bus.js";

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50; // DoS guard (THREAT-MODEL.md): caps rows read per request

const searchStrategy = SubstringSearchStrategy; // swap this line to change search behavior system-wide

// Clamp, don't reject: oversized pageSize is capped; missing or invalid
// page/pageSize values fall back to safe defaults instead of reaching the database.
function normalizePagination({ page, pageSize }) {
    const requestedPage = Number(page);
    const requestedSize = Number(pageSize);
    return {
        page: Number.isInteger(requestedPage) && requestedPage >= 1 ? requestedPage : 1,
        pageSize:
            Number.isInteger(requestedSize) && requestedSize >= 1
                ? Math.min(requestedSize, MAX_PAGE_SIZE)
                : DEFAULT_PAGE_SIZE,
    };
}

export const PostService = {
    async publish({ authorId, title, body, tagNames = [] }) {
        assertNonEmpty(title, "title", "MISSING_TITLE");
        assertNonEmpty(body, "body", "MISSING_BODY");
        const post = await PostRepository.createWithTags({
            authorId,
            title,
            body,
            tagNames,
            status: "PUBLISHED",
            publishedAt: new Date(),
        });
        EventBus.emit("post.published", {
            postId: post.id,
            authorId,
            title: post.title,
            tags: tagNames,
        });
        return post;
    },

    async listPublished({ page, pageSize } = {}) {
        const safe = normalizePagination({ page, pageSize });
        const { posts, hasMore } = await PostRepository.findPublished(safe);
        return { posts, page: safe.page, hasMore };
    },

    async search({ query, page, pageSize }) {
        const safe = normalizePagination({ page, pageSize });
        return searchStrategy.search(query, safe);
    },
};