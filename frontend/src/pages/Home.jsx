
import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import PostCard from "../components/PostCard";

const API = import.meta.env.VITE_API_BASE_URL;

function Home() {
    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [loading, setLoading] = useState(true);

    async function loadPosts(category = selectedCategory) {
        setLoading(true);

        try {
            const response = await fetch(`${API}/api/posts`);

            if (!response.ok) {
                throw new Error("Failed to load posts");
            }

            const data = await response.json();
            setPosts(data);
        } catch (error) {
            console.error("POST ERROR:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadPosts();
    }, []);

    function handleCategoryChange(category) {
        setSelectedCategory(category);
        loadPosts(category);
    }

    function getUserEmail() {
        const email = localStorage.getItem("userEmail");

        if (!email) {
            alert("Please login first.");
            window.location.href = "/login";
            return null;
        }

        return email;
    }

    async function handleLike(postId) {
        const email = getUserEmail();
        if (!email) return;

        try {
            const response = await fetch(
                `${API}/api/posts/${postId}/like?email=${encodeURIComponent(email)}`,
                { method: "PUT" }
            );

            if (!response.ok) throw new Error("Like failed");

            await loadPosts();
        } catch (error) {
            console.error("LIKE ERROR:", error);
            alert("Could not like this post.");
        }
    }

    async function handleDislike(postId) {
        const email = getUserEmail();
        if (!email) return;

        try {
            const response = await fetch(
                `${API}/api/posts/${postId}/dislike?email=${encodeURIComponent(email)}`,
                { method: "PUT" }
            );

            if (!response.ok) throw new Error("Dislike failed");

            await loadPosts();
        } catch (error) {
            console.error("DISLIKE ERROR:", error);
            alert("Could not dislike this post.");
        }
    }

    async function handleBookmark(postId) {
        const email = getUserEmail();
        if (!email) return;

        try {
            const response = await fetch(
                `${API}/api/bookmarks?email=${encodeURIComponent(email)}&postId=${postId}`,
                { method: "POST" }
            );

            const result = await response.text();

            if (!response.ok) throw new Error(result);

            alert(result);
        } catch (error) {
            console.error("BOOKMARK ERROR:", error);
            alert("Could not bookmark this post.");
        }
    }

    async function handleShare(postId) {
        try {
            const response = await fetch(
                `${API}/api/posts/${postId}/share`,
                { method: "PUT" }
            );

            if (!response.ok) throw new Error("Share failed");

            await navigator.clipboard.writeText(window.location.href);

            await loadPosts();

            alert("Post link copied!");
        } catch (error) {
            console.error("SHARE ERROR:", error);
            alert("Could not share this post.");
        }
    }

    async function handleReport(postId) {
        const email = getUserEmail();
        if (!email) return;

        const reason = prompt("Why are you reporting this post?");

        if (!reason || !reason.trim()) return;

        try {
            const response = await fetch(
                `${API}/api/reports?email=${encodeURIComponent(email)}&postId=${postId}&reason=${encodeURIComponent(reason.trim())}`,
                { method: "POST" }
            );

            const result = await response.text();

            if (!response.ok) throw new Error(result);

            alert(result);
        } catch (error) {
            console.error("REPORT ERROR:", error);
            alert("Could not report this post.");
        }
    }

    const filteredPosts = posts.filter(post => {
        const matchesCategory =
            selectedCategory === "all" ||
            post.category?.toLowerCase() === selectedCategory;

        const matchesSearch =
            post.content?.toLowerCase().includes(search.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    return (
        <>
            <Navbar />

            <main>
                <section className="hero">
                    <h2>Say it anonymously.</h2>
                    <p>
                        Share your thoughts, stories, fears and confessions.
                    </p>
                </section>

                <SearchBar
                    search={search}
                    setSearch={setSearch}
                    onSearch={() => {}}
                />

                <CategoryFilter
                    onCategoryChange={handleCategoryChange}
                />

                <section id="posts">
                    {loading ? (
                        <p>Loading posts...</p>
                    ) : filteredPosts.length === 0 ? (
                        <p>No posts found.</p>
                    ) : (
                        filteredPosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={handleLike}
                                onDislike={handleDislike}
                                onBookmark={handleBookmark}
                                onShare={handleShare}
                                onReport={handleReport}
                            />
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Home;
