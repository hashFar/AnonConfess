
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

function MyPosts() {
    const userEmail = localStorage.getItem("userEmail");

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!userEmail) {
            window.location.href = "/login";
            return;
        }

        loadMyPosts();
    }, []);

    async function loadMyPosts() {
        try {
            const response = await fetch(
                `${API}/api/posts/my-posts?email=${encodeURIComponent(userEmail)}`
            );

            if (!response.ok) throw new Error("Failed to load posts");

            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error(error);
            setMessage("Could not load your posts.");
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        localStorage.removeItem("userEmail");
        window.location.href = "/";
    }

    function editPost(post) {
        setEditingId(post.id);
        setEditContent(post.content);
        setEditCategory(post.category?.toLowerCase() || "");
    }

    async function saveEdit(postId) {
        const content = editContent.trim();

        if (!content) {
            alert("Confession cannot be empty.");
            return;
        }

        try {
            const response = await fetch(
                `${API}/api/posts/${postId}?email=${encodeURIComponent(userEmail)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content,
                        category: editCategory
                    })
                }
            );

            const result = await response.text();

            if (!response.ok) throw new Error(result);

            alert(result);
            setEditingId(null);
            await loadMyPosts();
        } catch (error) {
            alert("Could not update post: " + error.message);
        }
    }

    async function deletePost(postId) {
        if (!window.confirm("Are you sure you want to delete this confession?")) {
            return;
        }

        try {
            const response = await fetch(
                `${API}/api/posts/${postId}?email=${encodeURIComponent(userEmail)}`,
                { method: "DELETE" }
            );

            const result = await response.text();

            if (!response.ok) throw new Error(result);

            alert(result);
            await loadMyPosts();
        } catch (error) {
            alert("Could not delete post: " + error.message);
        }
    }

    return (
        <>
            <header>
                <h1 onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }}>
                    AnonConfess
                </h1>

                <nav>
                    <button onClick={() => window.location.href = "/"}>Home</button>
                    <button onClick={() => window.location.href = "/create-post"}>Post</button>
                    <button onClick={() => window.location.href = "/bookmarks"}>Bookmarks</button>
                    <button onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <h2>My Posts</h2>
                    <p>All confessions you have posted.</p>
                </section>

                <section id="myPosts">
                    {loading ? (
                        <p>Loading your posts...</p>
                    ) : message ? (
                        <p>{message}</p>
                    ) : posts.length === 0 ? (
                        <div className="empty-bookmarks">
                            <h3>No posts yet</h3>
                            <p>You haven't posted any confessions yet.</p>
                            <button onClick={() => window.location.href = "/create-post"}>
                                Create Your First Post
                            </button>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div className="post-card" key={post.id}>
                                {editingId === post.id ? (
                                    <div className="edit-post-form">
                                        <label>Category</label>

                                        <select
                                            value={editCategory}
                                            onChange={e => setEditCategory(e.target.value)}
                                        >
                                            <option value="">General</option>
                                            <option value="horror">Horror</option>
                                            <option value="advice">Advice</option>
                                            <option value="motivation">Motivation</option>
                                            <option value="funny">Funny</option>
                                        </select>

                                        <label>Confession</label>

                                        <textarea
                                            rows="6"
                                            value={editContent}
                                            onChange={e => setEditContent(e.target.value)}
                                        />

                                        <div className="edit-actions">
                                            <button
                                                className="save-edit-button"
                                                onClick={() => saveEdit(post.id)}
                                            >
                                                💾 Save
                                            </button>

                                            <button
                                                className="cancel-edit-button"
                                                onClick={() => setEditingId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="post-category">
                                            {post.category || "General"}
                                        </div>

                                        <p className="post-content">{post.content}</p>

                                        <small>
                                            {new Date(post.createdAt).toLocaleString()}
                                        </small>

                                        <div className="post-actions">
                                            <span>👍 {post.likes}</span>
                                            <span>👎 {post.dislikes}</span>
                                            <span>↗ {post.shares || 0}</span>

                                            <button
                                                className="edit-post-button"
                                                onClick={() => editPost(post)}
                                            >
                                                ✏️ Edit
                                            </button>

                                            <button
                                                className="delete-post-button"
                                                onClick={() => deletePost(post.id)}
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default MyPosts;
