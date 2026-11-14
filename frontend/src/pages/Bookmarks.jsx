
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

function Bookmarks() {
    const userEmail = localStorage.getItem("userEmail");

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userEmail) {
            window.location.href = "/login";
            return;
        }

        loadBookmarks();
    }, []);

    async function loadBookmarks() {
        try {
            const response = await fetch(
                `${API}/api/bookmarks?email=${encodeURIComponent(userEmail)}`
            );

            if (!response.ok) {
                throw new Error("Failed to load bookmarks");
            }

            const data = await response.json();
            setPosts(data);
        } catch (err) {
            console.error(err);
            setError("Could not load bookmarks. Make sure Spring Boot is running.");
        } finally {
            setLoading(false);
        }
    }

    async function removeBookmark(postId) {
        try {
            const response = await fetch(
                `${API}/api/bookmarks?email=${encodeURIComponent(userEmail)}&postId=${postId}`,
                { method: "DELETE" }
            );

            const result = await response.text();

            if (!response.ok) {
                throw new Error(result);
            }

            alert(result);
            await loadBookmarks();
        } catch (err) {
            console.error(err);
            alert("Failed to remove bookmark");
        }
    }

    function logout() {
        localStorage.removeItem("userEmail");
        window.location.href = "/";
    }

    return (
        <>
            <header>
                <h1
                    onClick={() => window.location.href = "/"}
                    style={{ cursor: "pointer" }}
                >
                    AnonConfess
                </h1>

                <nav>
                    <button onClick={() => window.location.href = "/"}>
                        Home
                    </button>

                    <button onClick={() => window.location.href = "/create-post"}>
                        Post
                    </button>

                    <button onClick={logout}>Logout</button>
                </nav>
            </header>

            <main>
                <section className="hero">
                    <h2>Your Bookmarks</h2>
                    <p>Confessions you've saved.</p>
                </section>

                <section id="bookmarks">
                    {loading ? (
                        <p>Loading bookmarks...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : posts.length === 0 ? (
                        <div className="empty-bookmarks">
                            <h3>No bookmarks yet</h3>
                            <p>Save confessions you want to read later.</p>

                            <button onClick={() => window.location.href = "/"}>
                                Explore Confessions
                            </button>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div className="post-card" key={post.id}>
                                <div className="post-category">
                                    {post.category || "General"}
                                </div>

                                <p className="post-content">{post.content}</p>

                                <small>
                                    {new Date(post.createdAt).toLocaleString()}
                                </small>

                                <div className="post-actions">
                                    <button onClick={() => removeBookmark(post.id)}>
                                        🔖 Remove Bookmark
                                    </button>

                                    <button onClick={() => window.location.href = "/"}>
                                        ← Back to Posts
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Bookmarks;
