// server/src/routes/post.routes.js
import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/posts", requireAuth, async (req, res, next) => {
    try {
        const { title, body, tagNames } = req.body;
        const post = await PostService.publish({
            authorId: req.user.id, // set by requireAuth from the verified JWT
            title,
            body,
            tagNames,
        });
        res.status(201).json(post);
    } catch (err) {
        next(err);
    }
});

router.get("/posts", async (req, res, next) => {
    try {
        const { page, pageSize, search } = req.query;
        const result = search
            ? await PostService.search({ query: search, page, pageSize })
            : await PostService.listPublished({ page, pageSize });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
});

router.delete("/posts/:id", requireAuth, async (req, res, next) => {
    try {
        const post = await PostService.getById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found." } });
        }
        // A01's fix: only the owner may delete their own post.
        if (post.authorId !== req.user.id) {
            return res.status(403).json({ error: { code: "FORBIDDEN", message: "You can only delete your own posts." } });
        }
        await PostService.delete(req.params.id);
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

export default router;