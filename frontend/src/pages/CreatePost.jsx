
import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

function CreatePost() {
    const userEmail = localStorage.getItem("userEmail");

    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [message, setMessage] = useState("");
    const [messageColor, setMessageColor] = useState("");

    if (!userEmail) {
        window.location.href = "/login";
        return null;
    }

    function handleLogout() {
        localStorage.removeItem("userEmail");
        window.location.href = "/";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedContent = content.trim();

        if (!trimmedContent) {
            setMessage("Please write something first.");
            setMessageColor("#ef4444");
            return;
        }

        try {
            const response = await fetch(
                `${API}/api/posts?email=${encodeURIComponent(userEmail)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        content: trimmedContent,
                        category: category || null
                    })
                }
            );

            const result = await response.text();

            if (!response.ok) {
                throw new Error(result);
            }

            setMessage("Post created successfully! Redirecting...");
            setMessageColor("#22c55e");

            setTimeout(() => {
                window.location.href = "/";
            }, 1000);

        } catch (error) {
            console.error(error);
            setMessage("Failed to create post: " + error.message);
            setMessageColor("#ef4444");
        }
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
                    <button onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            <main>
                <section className="auth-container create-post-container">
                    <h2>Share Your Confession</h2>
                    <p>Your identity will not be shown publicly.</p>

                    <form onSubmit={handleSubmit}>
                        <textarea
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                        />

                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="">General</option>
                            <option value="Horror">Horror</option>
                            <option value="Advice">Advice</option>
                            <option value="Motivation">Motivation</option>
                            <option value="Funny">Funny</option>
                        </select>

                        <button type="submit">Post Confession</button>
                    </form>

                    <p style={{ color: messageColor }}>{message}</p>
                </section>
            </main>
        </>
    );
}

export default CreatePost;
