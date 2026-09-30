// server/src/routes/stats.routes.js
//
// Thin route exposing the in-memory post counter maintained by
// post-counter.listener.js. Same thin-route discipline as the other
// route files: no business logic here.

import { Router } from "express";
import { getPostStats } from "../events/listeners/post-counter.listener.js";

const router = Router();

router.get("/stats", (req, res) => {
    res.status(200).json(getPostStats());
});

export default router;