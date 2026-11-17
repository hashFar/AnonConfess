import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

function PostComments({ postId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const userEmail = localStorage.getItem("userEmail");

    async function loadComments() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API}/api/comments/${postId}`);

            if (!response.ok) {
                throw new Error("Failed to load comments");
            }

            const data = await response.json();
            setComments(data);
        } catch (err) {
            setError("Could not load comments.");
        } finally {
            setLoading(false);
        }
    }

    async function toggleComments() {
        if (isOpen) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
            await loadComments();
        }
    }

    async function addComment() {
        if (!userEmail) {
            window.location.href = "/login";
            return;
        }

        if (!content.trim()) {
            alert("Please write a comment.");
            return;
        }

        try {
            const response = await fetch(
                `${API}/api/comments?postId=${postId}&email=${encodeURIComponent(userEmail)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: content.trim() })
                }
            );

            const result = await response.text();

            if (!response.ok) throw new Error(result);

            setContent("");
            await loadComments();
        } catch (err) {
            alert("Failed to add comment: " + err.message);
        }
    }

    async function deleteComment(commentId) {
        if (!window.confirm("Delete this comment?")) return;

        try {
            const response = await fetch(
                `${API}/api/comments/${commentId}?email=${encodeURIComponent(userEmail)}`,
                { method: "DELETE" }
            );

            const result = await response.text();

            if (!response.ok) throw new Error(result);

            alert(result);
            await loadComments();
        } catch (err) {
            alert("Delete failed: " + err.message);
        }
    }

    return (
        <>
            <button onClick={toggleComments}>💬 Comment</button>

            {isOpen && (
                <div className="comments-section">
                    {loading && <p>Loading comments...</p>}
                    {error && <p>{error}</p>}

                    {!loading && !error && (
                        <>
                            {comments.length === 0 ? (
                                <p className="no-comments">No comments yet.</p>
                            ) : (
                                comments.map(comment => (
                                    <div className="comment" key={comment.id}>
                                        <p>{comment.content}</p>

                                        <small>
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </small>

                                        {userEmail === comment.userEmail && (
                                            <button
                                                className="delete-comment-button"
                                                onClick={() => deleteComment(comment.id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}

                            {userEmail ? (
                                <div className="comment-form">
                                    <textarea
                                        placeholder="Write a comment..."
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                    />

                                    <button onClick={addComment}>
                                        Add Comment
                                    </button>
                                </div>
                            ) : (
                                <p className="login-comment-message">
                                    Login to comment.
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}

export default PostComments;