
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
                            <PostCard key={post.id} post={post} />
                        ))
                    )}
                </section>
            </main>
        </>
    );
}

export default Home;
