
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

function Post() {
    const postId = new URLSearchParams(window.location.search).get("id");
    const userEmail = localStorage.getItem("userEmail");

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [vote, setVote] = useState("");
    const [comments, setComments] = useState([]);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comment, setComment] = useState("");

    async function loadPost() {
        if (!postId) {
            setError("Invalid confession link.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API}/api/posts/${postId}`);

            if (!response.ok) throw new Error("Post not found");

            const data = await response.json();
            setPost(data);

            if (userEmail) {
                const voteResponse = await fetch(
                    `${API}/api/posts/${postId}/vote?email=${encodeURIComponent(userEmail)}`
                );
                setVote(await voteResponse.text());
            }
        } catch (err) {
            console.error(err);
            setError("Could not load this confession.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPost();
    }, []);

    async function handleVote(type) {
        if (!userEmail) {
            window.location.href = "/login";
            return;
        }

        await fetch(
            `${API}/api/posts/${postId}/${type}?email=${encodeURIComponent(userEmail)}`,
            { method: "PUT" }
        );

        await loadPost();
    }

    async function bookmarkPost() {
        if (!userEmail) {
            window.location.href = "/login";
            return;
        }

        try {
            const response = await fetch(
                `${API}/api/bookmarks?postId=${postId}&email=${encodeURIComponent(userEmail)}`,
                { method: "POST" }
            );

            const result = await response.text();
            alert(result);
        } catch (err) {
            console.error(err);
        }
    }

    async function sharePost() {
        const shareUrl = `${window.location.origin}/post?id=${postId}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: "AnonConfess",
                    text: "Check out this anonymous confession!",
                    url: shareUrl
                });
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Confession link copied!");
            }

            await fetch(`${API}/api/posts/${postId}/share`, {
                method: "PUT"
            });

            await loadPost();
        } catch (err) {
            if (err.name !== "AbortError") {
                console.error(err);
            }
        }
    }

    async function toggleComments() {
        if (commentsOpen) {
            setCommentsOpen(false);
            return;
        }

        setCommentsOpen(true);
        await loadComments();
    }

    async function loadComments() {
        try {
            const response = await fetch(`${API}/api/comments/${postId}`);
            const data = await response.json();
            setComments(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function addComment(event) {
        event.preventDefault();

        if (!userEmail) {
            window.location.href = "/login";
            return;
        }

        const trimmedComment = comment.trim();
        if (!trimmedComment) return;

        await fetch(
            `${API}/api/comments?postId=${postId}&email=${encodeURIComponent(userEmail)}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmedComment })
            }
        );

        setComment("");
        await loadComments();
    }

    function logout() {
        localStorage.removeItem("userEmail");
        window.location.href = "/";
    }

    if (loading) return <p>Loading confession...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <header>
                <h1 onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }}>
                    AnonConfess
                </h1>

                <nav>
                    <button onClick={() => window.location.href = "/"}>Home</button>

                    {userEmail ? (
                        <>
                            <button onClick={() => window.location.href = "/create-post"}>Post</button>
                            <button onClick={() => window.location.href = "/my-posts"}>My Posts</button>
                            <button onClick={() => window.location.href = "/bookmarks"}>Bookmarks</button>
                            <button onClick={logout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => window.location.href = "/login"}>Login</button>
                            <button onClick={() => window.location.href = "/register"}>Register</button>
                        </>
                    )}
                </nav>
            </header>

            <main>
                <section className="hero">
                    <h2>Confession</h2>
                    <p>Someone shared something anonymously.</p>
                </section>

                {post && (
                    <section id="singlePost">
                        <div className="post-card">
                            <div className="post-category">
                                {post.category || "General"}
                            </div>

                            <p className="post-content">{post.content}</p>

                            <small>
                                {new Date(post.createdAt).toLocaleString()}
                            </small>

                            <div className="post-actions">
                                <button
                                    className={`vote-button like-button ${vote === "LIKE" ? "active-like" : ""}`}
                                    onClick={() => handleVote("like")}
                                >
                                    👍 {post.likes}
                                </button>

                                <button
                                    className={`vote-button dislike-button ${vote === "DISLIKE" ? "active-dislike" : ""}`}
                                    onClick={() => handleVote("dislike")}
                                >
                                    👎 {post.dislikes}
                                </button>

                                <button onClick={toggleComments}>💬 Comments</button>
                                <button onClick={bookmarkPost}>🔖 Bookmark</button>
                                <button onClick={sharePost}>↗ Share {post.shares || 0}</button>
                            </div>

                            {commentsOpen && (
                                <div className="comments-section">
                                    {comments.map(item => (
                                        <div className="comment" key={item.id}>
                                            <p>{item.content}</p>
                                            <small>
                                                {new Date(item.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                    ))}

                                    {userEmail ? (
                                        <form onSubmit={addComment}>
                                            <textarea
                                                placeholder="Write a comment..."
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                            />
                                            <button type="submit">Add Comment</button>
                                        </form>
                                    ) : (
                                        <p>Login to comment.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}

export default Post;
