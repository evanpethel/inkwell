import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PostCard } from "./PostCard";

export function Feed() {
    const [posts, setPosts] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch("/api/posts?page=1")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load posts");
                return res.json();
            })
            .then((data) => setPosts(data.posts))
            .catch(() => setError(true));
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Feed</h1>
            {error && (
                <p role="alert" className="text-sm text-red-600">
                    Could not load posts. Please try again later.
                </p>
            )}
            {!error && posts === null && <p className="text-gray-500">Loading posts…</p>}
            {posts !== null && posts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">No posts yet.</p>
                    <Link to="/write" className="text-indigo-600 underline">Write the first one</Link>
                </div>
            )}
            {posts !== null && posts.length > 0 && (
                <ul className="space-y-6">
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </ul>
            )}
        </div>
    );
}