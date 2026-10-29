import { Router } from "express";
import { PostService } from "../services/post.service.js";
import { TokenService } from "../services/token.service.js";
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

export default router;