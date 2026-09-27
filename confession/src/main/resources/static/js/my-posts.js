const userEmail = localStorage.getItem("userEmail");

if (!userEmail) {
    window.location.href = "/login.html";
}

document.getElementById("logoutButton").addEventListener("click", function () {
    localStorage.removeItem("userEmail");
    window.location.href = "/";
});


async function loadMyPosts() {

    const container = document.getElementById("myPosts");

    try {

        const response = await fetch(
            `/api/posts/my-posts?email=${encodeURIComponent(userEmail)}`
        );

        if (!response.ok) {
            throw new Error("Failed to load posts");
        }

        const posts = await response.json();

        if (posts.length === 0) {

            container.innerHTML = `
                <div class="empty-bookmarks">
                    <h3>No posts yet</h3>
                    <p>You haven't posted any confessions yet.</p>

                    <button onclick="window.location.href='/create-post.html'">
                        Create Your First Post
                    </button>
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        posts.forEach(post => {

            const card = document.createElement("div");

            card.className = "post-card";

            card.innerHTML = `
                <div class="post-category">
                    ${post.category || "General"}
                </div>

                <p class="post-content">
                    ${post.content}
                </p>

                <small>
                    ${new Date(post.createdAt).toLocaleString()}
                </small>

                <div class="post-actions">

                    <span>👍 ${post.likes}</span>
                    <span>👎 ${post.dislikes}</span>
                    <span>↗ ${post.shares || 0}</span>

                    <button
                        class="edit-post-button"
                        onclick="editPost(${post.id})">
                        ✏️ Edit
                    </button>

                    <button
                        class="delete-post-button"
                        onclick="deletePost(${post.id})">
                        🗑️ Delete
                    </button>

                </div>
            `;

            container.appendChild(card);
        });

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Could not load your posts.</p>";
    }
}


/* =========================
   EDIT POST
========================= */

async function editPost(postId) {

    try {

        const response = await fetch(
            `/api/posts/my-posts?email=${encodeURIComponent(userEmail)}`
        );

        if (!response.ok) {
            throw new Error("Failed to load post");
        }

        const posts = await response.json();

        const post = posts.find(p => p.id === postId);

        if (!post) {
            alert("Post not found.");
            return;
        }

        const card = [...document.querySelectorAll(".post-card")]
            .find(card => card.innerHTML.includes(`editPost(${postId})`));

        if (!card) {
            return;
        }

        card.innerHTML = `
            <div class="edit-post-form">

                <label>Category</label>

                <select id="edit-category-${postId}">

                    <option value="">General</option>
                    <option value="horror">Horror</option>
                    <option value="advice">Advice</option>
                    <option value="motivation">Motivation</option>
                    <option value="funny">Funny</option>

                </select>

                <label>Confession</label>

                <textarea
                    id="edit-content-${postId}"
                    rows="6"
                >${post.content}</textarea>

                <div class="edit-actions">

                    <button
                        class="save-edit-button"
                        onclick="saveEdit(${postId})">
                        💾 Save
                    </button>

                    <button
                        class="cancel-edit-button"
                        onclick="loadMyPosts()">
                        Cancel
                    </button>

                </div>

            </div>
        `;

        const categorySelect =
            document.getElementById(`edit-category-${postId}`);

        if (post.category) {
            categorySelect.value = post.category.toLowerCase();
        }

    } catch (error) {

        console.error(error);

        alert("Could not open edit mode.");
    }
}


async function saveEdit(postId) {

    const contentInput =
        document.getElementById(`edit-content-${postId}`);

    const categoryInput =
        document.getElementById(`edit-category-${postId}`);

    const content = contentInput.value.trim();

    const category = categoryInput.value;

    if (!content) {

        alert("Confession cannot be empty.");

        return;
    }

    try {

        const response = await fetch(
            `/api/posts/${postId}?email=${encodeURIComponent(userEmail)}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    content: content,
                    category: category
                })
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        alert(result);

        await loadMyPosts();

    } catch (error) {

        console.error(error);

        alert("Could not update post: " + error.message);
    }
}


/* =========================
   DELETE POST
========================= */

async function deletePost(postId) {

    const confirmed = confirm(
        "Are you sure you want to delete this confession?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `/api/posts/${postId}?email=${encodeURIComponent(userEmail)}`,
            {
                method: "DELETE"
            }
        );

        const result = await response.text();

        if (!response.ok) {
            throw new Error(result);
        }

        alert(result);

        await loadMyPosts();

    } catch (error) {

        console.error(error);

        alert("Could not delete post: " + error.message);
    }
}


loadMyPosts();